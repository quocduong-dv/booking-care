import db from '../models/index';
import { Op } from 'sequelize';
import notificationService from './notificationService';

const addToWaitlist = ({ patientId, doctorId, preferredDate, preferredTimeType, note }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!patientId || !doctorId) {
                return resolve({ errCode: 1, errMessage: 'Thieu patientId hoac doctorId' });
            }
            const existing = await db.Waitlist.findOne({
                where: {
                    patientId,
                    doctorId,
                    status: 'waiting',
                    preferredDate: preferredDate || null,
                    preferredTimeType: preferredTimeType || null
                }
            });
            if (existing) {
                return resolve({ errCode: 2, errMessage: 'Ban da co trong danh sach cho' });
            }
            const w = await db.Waitlist.create({
                patientId,
                doctorId,
                preferredDate: preferredDate || null,
                preferredTimeType: preferredTimeType || null,
                note: note || null,
                status: 'waiting'
            });
            notificationService.createNotification({
                userId: doctorId,
                type: 'waitlist_join',
                title: 'Co benh nhan cho slot',
                body: preferredDate ? `Ngay ${preferredDate}` : 'Khong chi dinh ngay',
                link: '/system/doctor-waitlist',
                data: { waitlistId: w.id, patientId },
                roleHint: 'R2'
            }).catch(() => { });
            resolve({ errCode: 0, data: w });
        } catch (e) { reject(e); }
    });
};

const getMyWaitlist = ({ patientId }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!patientId) return resolve({ errCode: 1, errMessage: 'Thieu patientId' });
            const rows = await db.Waitlist.findAll({
                where: { patientId },
                order: [['createdAt', 'DESC']],
                include: [
                    { model: db.User, as: 'doctorData', attributes: ['id', 'firstName', 'lastName'] }
                ],
                raw: false,
                nest: true
            });
            resolve({ errCode: 0, data: rows });
        } catch (e) { reject(e); }
    });
};

const getWaitlistsByDoctor = ({ doctorId, status }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId) return resolve({ errCode: 1, errMessage: 'Thieu doctorId' });
            const where = { doctorId };
            if (status) where.status = status;
            const rows = await db.Waitlist.findAll({
                where,
                order: [['createdAt', 'ASC']],
                include: [
                    { model: db.User, as: 'patientData', attributes: ['id', 'firstName', 'lastName', 'email', 'phonenumber'] }
                ],
                raw: false,
                nest: true
            });
            resolve({ errCode: 0, data: rows });
        } catch (e) { reject(e); }
    });
};

const removeFromWaitlist = ({ id, requesterId, requesterRole }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) return resolve({ errCode: 1, errMessage: 'Thieu id' });
            const w = await db.Waitlist.findOne({ where: { id } });
            if (!w) return resolve({ errCode: 2, errMessage: 'Khong tim thay' });
            if (requesterRole === 'R3' && Number(w.patientId) !== Number(requesterId)) {
                return resolve({ errCode: 4, errMessage: 'Khong co quyen' });
            }
            await w.destroy();
            resolve({ errCode: 0 });
        } catch (e) { reject(e); }
    });
};

// Called when a booking is cancelled (S4) to notify a matching waitlist entry.
const notifyOnSlotOpen = async ({ doctorId, date }) => {
    try {
        if (!doctorId) return;
        const where = { doctorId, status: 'waiting' };
        const rows = await db.Waitlist.findAll({
            where,
            order: [['createdAt', 'ASC']],
            limit: 5,
            raw: true
        });
        for (const w of rows) {
            if (w.preferredDate && date && String(w.preferredDate) !== String(date)) continue;
            await notificationService.createNotification({
                userId: w.patientId,
                type: 'waitlist_slot',
                title: 'Co slot trong',
                body: `Bac si co slot trong${date ? ' ngay ' + date : ''}. Vao dat lich ngay.`,
                link: `/detail-doctor/${doctorId}`,
                data: { waitlistId: w.id, doctorId, date: date || null },
                roleHint: 'R3'
            });
            await db.Waitlist.update(
                { status: 'notified', notifiedAt: new Date() },
                { where: { id: w.id } }
            );
            return w;
        }
        return null;
    } catch (e) {
        console.log('[waitlist] notifyOnSlotOpen error', e.message);
        return null;
    }
};

module.exports = {
    addToWaitlist,
    getMyWaitlist,
    getWaitlistsByDoctor,
    removeFromWaitlist,
    notifyOnSlotOpen
};
