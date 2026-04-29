import db from '../models/index';
import notificationService from './notificationService';

const createLabResult = ({ bookingId, patientId, doctorId, testType, testDate, resultText, fileUrl, fileName, notes }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!patientId || !testType) {
                return resolve({ errCode: 1, errMessage: 'Thieu patientId hoac testType' });
            }
            if (bookingId) {
                const booking = await db.Booking.findOne({ where: { id: bookingId }, raw: true });
                if (!booking) return resolve({ errCode: 2, errMessage: 'Booking khong ton tai' });
            }
            const patient = await db.User.findOne({ where: { id: patientId }, raw: true });
            if (!patient) return resolve({ errCode: 3, errMessage: 'Benh nhan khong ton tai' });

            const lab = await db.LabResult.create({
                bookingId: bookingId || null,
                patientId,
                doctorId: doctorId || null,
                testType,
                testDate: testDate || null,
                resultText: resultText || null,
                fileUrl: fileUrl || null,
                fileName: fileName || null,
                notes: notes || null
            });

            notificationService.createNotification({
                userId: patientId,
                type: 'lab_result',
                title: 'Ket qua xet nghiem moi',
                body: `${testType}${testDate ? ' - ' + testDate : ''}`,
                link: '/patient/history',
                data: { labResultId: lab.id, bookingId: bookingId || null },
                roleHint: 'R3'
            }).catch(() => { });

            resolve({ errCode: 0, data: lab });
        } catch (e) { reject(e); }
    });
};

const getLabResultsByPatient = ({ patientId, requesterId, requesterRole }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!patientId) return resolve({ errCode: 1, errMessage: 'Thieu patientId' });
            if (requesterRole === 'R3' && Number(patientId) !== Number(requesterId)) {
                return resolve({ errCode: 4, errMessage: 'Khong co quyen' });
            }
            const rows = await db.LabResult.findAll({
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

const getLabResultsByBooking = ({ bookingId, requesterId, requesterRole }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!bookingId) return resolve({ errCode: 1, errMessage: 'Thieu bookingId' });
            const booking = await db.Booking.findOne({ where: { id: bookingId }, raw: true });
            if (!booking) return resolve({ errCode: 2, errMessage: 'Booking khong ton tai' });
            if (requesterRole === 'R3' && Number(booking.patientId) !== Number(requesterId)) {
                return resolve({ errCode: 4, errMessage: 'Khong co quyen' });
            }
            if (requesterRole === 'R2' && Number(booking.doctorId) !== Number(requesterId)) {
                return resolve({ errCode: 4, errMessage: 'Khong co quyen' });
            }
            const rows = await db.LabResult.findAll({
                where: { bookingId },
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

const deleteLabResult = ({ id }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) return resolve({ errCode: 1, errMessage: 'Thieu id' });
            const r = await db.LabResult.findOne({ where: { id } });
            if (!r) return resolve({ errCode: 2, errMessage: 'Khong tim thay' });
            await r.destroy();
            resolve({ errCode: 0 });
        } catch (e) { reject(e); }
    });
};

module.exports = {
    createLabResult,
    getLabResultsByPatient,
    getLabResultsByBooking,
    deleteLabResult
};
