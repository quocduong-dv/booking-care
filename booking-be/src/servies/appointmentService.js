import db from "../models/index";
import { emitToAdmin, emitToDoctor, emitToPatient, emitToBooking } from '../socket';
import nodemailer from 'nodemailer';
import {
    buildDoctorCreatedEmail,
    buildFollowUpEmail,
    defaultFrom
} from './emailTemplates';
import notificationService from './notificationService';
import loyaltyService from './loyaltyService';
import waitlistService from './waitlistService';
require('dotenv').config();

const getDoctorPrice = async (doctorId) => {
    try {
        const di = await db.Doctor_Infor.findOne({
            where: { doctorId },
            attributes: ['priceId'],
            include: [{ model: db.Allcode, as: 'priceTypeData', attributes: ['valueVi'] }],
            raw: false, nest: true
        });
        if (di && di.priceTypeData && di.priceTypeData.valueVi) {
            const parsed = parseInt(di.priceTypeData.valueVi);
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    } catch (e) { return 0; }
};

const sendDoctorCreatedEmail = async ({ to, lang, patientName, doctorName, date, timeLabel, reason }) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: process.env.EMAIL_APP, pass: process.env.EMAIL_APP_PASSWORD }
    });
    const { subject, html } = buildDoctorCreatedEmail({
        lang, patientName, doctorName, date, timeLabel, reason
    });
    await transporter.sendMail({
        from: defaultFrom(),
        to,
        subject,
        html,
        textEncoding: 'base64',
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
};

const parseDateToMs = (raw) => {
    if (!raw) return null;
    if (typeof raw === 'number') return String(raw);
    const s = String(raw).trim();
    if (/^\d+$/.test(s)) return s; // already timestamp
    // DD/MM/YYYY or D/M/YYYY
    const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) {
        const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
        d.setHours(0, 0, 0, 0);
        return String(d.getTime());
    }
    // YYYY-MM-DD fallback (HTML date input)
    const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (iso) {
        const d = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
        d.setHours(0, 0, 0, 0);
        return String(d.getTime());
    }
    const p = Date.parse(s);
    return isNaN(p) ? s : String(new Date(p).setHours(0, 0, 0, 0));
};

const doctorCreateAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { email, fullName, phoneNumber, gender, address, birthday,
                doctorId, timeType, reason } = data;
            const lang = data.language === 'en' ? 'en' : 'vi';
            const rawDate = data.date;
            if (!email || !fullName || !doctorId || !rawDate || !timeType) {
                return resolve({ errCode: 1, errMessage: 'Thieu thong tin bat buoc' });
            }
            const date = parseDateToMs(rawDate);

            const doctor = await db.User.findOne({
                where: { id: doctorId },
                attributes: ['id', 'firstName', 'lastName', 'roleId'],
                raw: true
            });
            if (!doctor || doctor.roleId !== 'R2') {
                return resolve({ errCode: 2, errMessage: 'Bac si khong ton tai' });
            }

            const [user] = await db.User.findOrCreate({
                where: { email },
                defaults: {
                    email,
                    roleId: 'R3',
                    firstName: fullName,
                    gender: gender || null,
                    address: address || null,
                    phonenumber: phoneNumber || null
                }
            });

            const existing = await db.Booking.findOne({
                where: {
                    patientId: user.id,
                    date,
                    timeType,
                    doctorId,
                    statusId: { [db.Sequelize.Op.in]: ['S1', 'S2'] }
                }
            });
            if (existing) {
                return resolve({ errCode: 3, errMessage: 'Benh nhan da co lich trung khung gio nay' });
            }

            const amount = await getDoctorPrice(doctorId);
            const booking = await db.Booking.create({
                statusId: 'S2',
                doctorId,
                patientId: user.id,
                date,
                timeType
            });
            // Extended columns are in DB but not declared on the Booking model;
            // use raw update so Sequelize doesn't silently drop them.
            await db.Booking.update(
                {
                    amount,
                    paymentStatus: 'pending',
                    paymentMethod: 'cash',
                    reason: reason || null,
                    phoneNumber: phoneNumber || null,
                    birthday: birthday ? String(birthday) : null
                },
                { where: { id: booking.id } }
            );

            const timeCode = await db.Allcode.findOne({
                where: { keyMap: timeType, type: 'TIME' },
                attributes: ['valueVi', 'valueEn'],
                raw: true
            });
            const timeLabel = timeCode
                ? (lang === 'en' ? (timeCode.valueEn || timeCode.valueVi) : timeCode.valueVi)
                : timeType;
            const doctorName = lang === 'en'
                ? `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim()
                : `${doctor.lastName || ''} ${doctor.firstName || ''}`.trim();

            try {
                await sendDoctorCreatedEmail({
                    to: email,
                    lang,
                    patientName: fullName,
                    doctorName,
                    date,
                    timeLabel,
                    reason
                });
            } catch (mailErr) {
                console.error('[doctorCreateAppointment] email send failed', mailErr.message);
            }

            const payload = {
                bookingId: booking.id,
                doctorId,
                patientId: user.id,
                patientName: fullName,
                date,
                timeType,
                amount,
                createdAt: new Date(),
                createdByDoctor: true
            };
            emitToAdmin('booking:new', payload);
            emitToDoctor(doctorId, 'booking:new', payload);
            emitToPatient(user.id, 'booking:new', payload);

            notificationService.createNotification({
                userId: doctorId,
                type: 'booking_new',
                title: 'Lich hen moi',
                body: `BN ${fullName} - ${date} ${timeType}`,
                link: '/doctor/manage-patient',
                data: { bookingId: booking.id, date, timeType },
                roleHint: 'R2'
            });
            notificationService.createNotification({
                userId: user.id,
                type: 'booking_new',
                title: 'Lich kham da duoc tao',
                body: `Bac si da tao lich kham ngay ${date} ${timeType}`,
                link: '/patient/history',
                data: { bookingId: booking.id, date, timeType },
                roleHint: 'R3'
            });
            notificationService.notifyAllAdmins({
                type: 'booking_new',
                title: 'Lich hen moi',
                body: `${fullName} - ${date} ${timeType}`,
                link: '/system/manage-appointment',
                data: { bookingId: booking.id }
            });

            resolve({ errCode: 0, errMessage: 'Tao lich kham thanh cong', bookingId: booking.id });
        } catch (e) {
            reject(e);
        }
    });
};

// #7 - GET all appointments (admin view)
let getAllAppointments = (date, doctorId, statusId, opts = {}) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { Op } = require('sequelize');
            let whereClause = {};
            if (date) whereClause.date = date;
            if (doctorId) whereClause.doctorId = doctorId;
            if (statusId) whereClause.statusId = statusId;
            if (opts.dateFrom || opts.dateTo) {
                whereClause.createdAt = {};
                if (opts.dateFrom) whereClause.createdAt[Op.gte] = new Date(Number(opts.dateFrom));
                if (opts.dateTo) whereClause.createdAt[Op.lte] = new Date(Number(opts.dateTo));
            }
            if (opts.paymentStatus) whereClause.paymentStatus = opts.paymentStatus;

            let data = await db.Booking.findAll({
                where: whereClause,
                include: [
                    {
                        model: db.User, as: 'patientData',
                        attributes: ['firstName', 'email', 'address'],
                        include: [
                            { model: db.Allcode, as: 'genderData', attributes: ['valueVi', 'valueEn'] }
                        ]
                    },
                    { model: db.Allcode, as: 'timeTypeDataPatient', attributes: ['valueVi', 'valueEn'] }
                ],
                raw: true,
                nest: true
            });

            // attach doctorData separately (Booking doesn't have doctorData association by default)
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    let doctor = await db.User.findOne({
                        where: { id: data[i].doctorId },
                        attributes: ['firstName', 'lastName'],
                        raw: true
                    });
                    data[i].doctorData = doctor || {};
                }
            }

            if (opts.q && data.length > 0) {
                const needle = String(opts.q).toLowerCase();
                data = data.filter(item => {
                    const patient = item.patientData || {};
                    const doctor = item.doctorData || {};
                    const hay = [
                        patient.firstName, patient.email, patient.address,
                        doctor.firstName, doctor.lastName,
                        item.id, item.date
                    ].filter(Boolean).map(s => String(s).toLowerCase()).join(' ');
                    return hay.includes(needle);
                });
            }

            resolve({
                errCode: 0,
                errMessage: 'ok',
                data: data
            })
        } catch (e) {
            reject(e);
        }
    })
}

// #8 - PUT update appointment status
let updateAppointmentStatus = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.appointmentId || !data.statusId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter'
                })
            } else {
                let appointment = await db.Booking.findOne({
                    where: { id: data.appointmentId },
                    raw: true
                })
                if (appointment) {
                    let previousStatus = appointment.statusId;
                    const updateFields = { statusId: data.statusId };
                    if (data.statusId === 'S4') {
                        if (data.cancellationReason) {
                            updateFields.cancellationReason = data.cancellationReason;
                        }
                        if (appointment.paymentStatus === 'paid' && previousStatus !== 'S4') {
                            let payment = await db.Payment.findOne({
                                where: { bookingId: appointment.id, status: 'success' },
                                raw: false
                            });
                            if (payment) {
                                payment.status = 'refunded';
                                payment.refundedAt = new Date();
                                await payment.save();
                            }
                            updateFields.paymentStatus = 'refunded';
                        }
                    }
                    // Extended columns live only in DB; bulk update bypasses model schema.
                    await db.Booking.update(updateFields, { where: { id: appointment.id } });
                    // Reflect updates on local plain object for downstream emit + notification code.
                    Object.assign(appointment, updateFields);

                    if (data.statusId === 'S3' && previousStatus !== 'S3') {
                        await loyaltyService.awardForCompletedBooking(appointment.id);
                    }
                    if (data.statusId === 'S4' && previousStatus !== 'S4') {
                        waitlistService.notifyOnSlotOpen({
                            doctorId: appointment.doctorId,
                            date: appointment.date
                        }).catch(() => { });
                    }
                    const evt = {
                        bookingId: appointment.id,
                        statusId: appointment.statusId,
                        paymentStatus: appointment.paymentStatus,
                        cancellationReason: appointment.cancellationReason
                    };
                    emitToAdmin('booking:statusChanged', evt);
                    emitToDoctor(appointment.doctorId, 'booking:statusChanged', evt);
                    emitToPatient(appointment.patientId, 'booking:statusChanged', evt);
                    emitToBooking(appointment.id, 'booking:statusChanged', evt);

                    const statusLabel = {
                        S1: 'Cho xac nhan',
                        S2: 'Da xac nhan',
                        S3: 'Da kham xong',
                        S4: 'Da huy'
                    };
                    const labelText = statusLabel[appointment.statusId] || appointment.statusId;
                    notificationService.createNotification({
                        userId: appointment.patientId,
                        type: appointment.statusId === 'S4' ? 'booking_cancelled' : 'booking_status',
                        title: appointment.statusId === 'S4' ? 'Lich hen da huy' : `Lich hen: ${labelText}`,
                        body: appointment.cancellationReason
                            ? `Ly do: ${appointment.cancellationReason}`
                            : `Lich hen #${appointment.id} - ${labelText}`,
                        link: '/patient/history',
                        data: { bookingId: appointment.id, statusId: appointment.statusId },
                        roleHint: 'R3'
                    });

                    resolve({
                        errCode: 0,
                        errMessage: 'Update appointment status succeed!'
                    })
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: 'Appointment not found!'
                    })
                }
            }
        } catch (e) {
            reject(e);
        }
    })
}

// #9 - GET follow-up appointments
let getFollowUpAppointments = (date, doctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let whereClause = {};
            if (date) whereClause.followUpDate = date;
            if (doctorId) whereClause.doctorId = doctorId;

            let data = await db.FollowUpAppointment.findAll({
                where: whereClause,
                include: [
                    {
                        model: db.User, as: 'patientData',
                        attributes: ['firstName', 'email', 'phoneNumber']
                    },
                    {
                        model: db.User, as: 'doctorData',
                        attributes: ['firstName', 'lastName']
                    }
                ],
                raw: true,
                nest: true
            });

            resolve({
                errCode: 0,
                errMessage: 'ok',
                data: data
            })
        } catch (e) {
            reject(e);
        }
    })
}

// #10 - POST create follow-up appointment
let createFollowUpAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.patientId || !data.doctorId || !data.followUpDate) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter'
                })
            } else {
                await db.FollowUpAppointment.create({
                    patientId: data.patientId,
                    doctorId: data.doctorId,
                    previousDate: data.previousDate,
                    followUpDate: data.followUpDate,
                    note: data.note
                })
                resolve({
                    errCode: 0,
                    errMessage: 'Create follow-up appointment succeed!'
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

// #11 - POST send follow-up reminder email
let sendFollowUpReminder = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email || !data.patientName || !data.followUpDate) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter'
                })
            } else {
                const transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 465,
                    secure: true,
                    auth: {
                        user: process.env.EMAIL_APP,
                        pass: process.env.EMAIL_APP_PASSWORD,
                    },
                });

                const { subject, html } = buildFollowUpEmail({
                    lang: data.language,
                    patientName: data.patientName,
                    followUpDate: data.followUpDate
                });

                await transporter.sendMail({
                    from: defaultFrom(),
                    to: data.email,
                    subject,
                    html,
                    textEncoding: 'base64',
                    headers: { 'Content-Type': 'text/html; charset=utf-8' }
                });

                resolve({
                    errCode: 0,
                    errMessage: 'Send follow-up reminder succeed!'
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

const markNoShow = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { bookingId, reason } = data || {};
            if (!bookingId) return resolve({ errCode: 1, errMessage: 'Thieu bookingId' });
            const booking = await db.Booking.findOne({ where: { id: bookingId }, raw: true });
            if (!booking) return resolve({ errCode: 2, errMessage: 'Booking khong ton tai' });
            if (booking.statusId === 'S4') return resolve({ errCode: 3, errMessage: 'Lich hen da huy, khong the danh dau' });
            const updateFields = {
                statusId: 'S4',
                noShow: true,
                cancellationReason: reason || 'Benh nhan khong den'
            };
            if (booking.paymentStatus === 'paid') {
                const payment = await db.Payment.findOne({ where: { bookingId: booking.id, status: 'success' }, raw: false });
                if (payment) {
                    payment.status = 'refunded';
                    payment.refundedAt = new Date();
                    await payment.save();
                }
                updateFields.paymentStatus = 'refunded';
            }
            await db.Booking.update(updateFields, { where: { id: booking.id } });
            Object.assign(booking, updateFields);

            const evt = { bookingId: booking.id, statusId: 'S4', noShow: true };
            emitToAdmin('booking:statusChanged', evt);
            emitToDoctor(booking.doctorId, 'booking:statusChanged', evt);
            emitToPatient(booking.patientId, 'booking:statusChanged', evt);
            emitToBooking(booking.id, 'booking:statusChanged', evt);

            notificationService.createNotification({
                userId: booking.patientId,
                type: 'booking_cancelled',
                title: 'Lich hen da bi danh dau khong den',
                body: reason || 'Benh nhan khong den theo lich',
                link: '/patient/history',
                data: { bookingId: booking.id, noShow: true },
                roleHint: 'R3'
            });

            waitlistService.notifyOnSlotOpen({
                doctorId: booking.doctorId,
                date: booking.date
            }).catch(() => { });

            resolve({ errCode: 0, errMessage: 'Da danh dau no-show' });
        } catch (e) { reject(e); }
    });
};

const getNoShowStats = ({ period, startDate, endDate }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { Op } = require('sequelize');
            const where = {};
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate) where.createdAt[Op.gte] = new Date(Number(startDate) || startDate);
                if (endDate) where.createdAt[Op.lte] = new Date(Number(endDate) || endDate);
            }
            const rows = await db.Booking.findAll({
                where,
                attributes: ['id', 'doctorId', 'statusId', 'noShow'],
                raw: true
            });
            const byDoctor = {};
            for (const r of rows) {
                const d = r.doctorId;
                if (!byDoctor[d]) byDoctor[d] = { doctorId: d, total: 0, noShow: 0, cancelled: 0, completed: 0 };
                byDoctor[d].total += 1;
                if (r.noShow) byDoctor[d].noShow += 1;
                else if (r.statusId === 'S4') byDoctor[d].cancelled += 1;
                else if (r.statusId === 'S3') byDoctor[d].completed += 1;
            }
            const doctorIds = Object.keys(byDoctor).map(Number);
            if (doctorIds.length > 0) {
                const doctors = await db.User.findAll({
                    where: { id: doctorIds },
                    attributes: ['id', 'firstName', 'lastName'],
                    raw: true
                });
                for (const doc of doctors) {
                    if (byDoctor[doc.id]) {
                        byDoctor[doc.id].doctorName = `${doc.lastName || ''} ${doc.firstName || ''}`.trim();
                    }
                }
            }
            const data = Object.values(byDoctor).map(d => ({
                ...d,
                noShowRate: d.total ? Number((d.noShow / d.total * 100).toFixed(2)) : 0,
                cancelRate: d.total ? Number((d.cancelled / d.total * 100).toFixed(2)) : 0
            })).sort((a, b) => b.noShow - a.noShow);
            resolve({ errCode: 0, data });
        } catch (e) { reject(e); }
    });
};

module.exports = {
    getAllAppointments,
    updateAppointmentStatus,
    getFollowUpAppointments,
    createFollowUpAppointment,
    sendFollowUpReminder,
    doctorCreateAppointment,
    markNoShow,
    getNoShowStats
}
