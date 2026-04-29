import db from '../models/index';
import { emitToDoctorQueue, emitToBooking, emitToPatient } from '../socket';
import { Op } from 'sequelize';

const getQueueByDoctor = ({ doctorId, date }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId) return resolve({ errCode: 1, errMessage: 'Missing doctorId' });
            const where = { doctorId };
            if (date) where.date = date;
            where.statusId = { [Op.in]: ['S2', 'S3'] };
            const items = await db.Booking.findAll({
                where,
                order: [
                    ['queueNumber', 'ASC'],
                    ['createdAt', 'ASC']
                ],
                include: [
                    {
                        model: db.User, as: 'patientData',
                        attributes: ['id', 'firstName', 'email', 'phonenumber']
                    },
                    { model: db.Allcode, as: 'timeTypeDataPatient', attributes: ['valueVi', 'valueEn'] }
                ],
                raw: false,
                nest: true
            });
            resolve({ errCode: 0, data: items });
        } catch (e) {
            reject(e);
        }
    });
};

const assignQueueNumbers = ({ doctorId, date }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId || !date) return resolve({ errCode: 1, errMessage: 'Missing doctorId or date' });
            const bookings = await db.Booking.findAll({
                where: { doctorId, date, statusId: 'S2' },
                order: [['createdAt', 'ASC']],
                raw: true
            });
            let n = 1;
            for (const b of bookings) {
                if (!b.queueNumber) {
                    const updateFields = { queueNumber: n };
                    if (!b.servedStatus) updateFields.servedStatus = 'waiting';
                    // queueNumber/servedStatus are DB-only; raw update bypasses model schema.
                    await db.Booking.update(updateFields, { where: { id: b.id } });
                    b.queueNumber = n;
                    if (!b.servedStatus) b.servedStatus = 'waiting';
                }
                n = Math.max(n, (b.queueNumber || 0)) + 1;
            }
            emitToDoctorQueue(doctorId, 'queue:refreshed', { doctorId, date });
            resolve({ errCode: 0, errMessage: 'Queue assigned', count: bookings.length });
        } catch (e) {
            reject(e);
        }
    });
};

const callNextPatient = ({ doctorId, date }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId) return resolve({ errCode: 1, errMessage: 'Missing doctorId' });

            const inProgress = await db.Booking.findOne({
                where: { doctorId, servedStatus: 'in_progress', ...(date ? { date } : {}) },
                raw: true
            });
            if (inProgress) {
                const nextStatusId = inProgress.statusId === 'S2' ? 'S3' : inProgress.statusId;
                await db.Booking.update(
                    { servedStatus: 'done', statusId: nextStatusId },
                    { where: { id: inProgress.id } }
                );
                inProgress.servedStatus = 'done';
                inProgress.statusId = nextStatusId;
                emitToBooking(inProgress.id, 'queue:done', { bookingId: inProgress.id });
                emitToPatient(inProgress.patientId, 'queue:done', { bookingId: inProgress.id });
            }

            const nextBooking = await db.Booking.findOne({
                where: {
                    doctorId,
                    servedStatus: 'waiting',
                    statusId: 'S2',
                    ...(date ? { date } : {})
                },
                order: [['queueNumber', 'ASC'], ['createdAt', 'ASC']],
                raw: true
            });

            if (!nextBooking) {
                emitToDoctorQueue(doctorId, 'queue:empty', { doctorId });
                return resolve({ errCode: 2, errMessage: 'No patient waiting', finishedPrevious: !!inProgress });
            }

            const calledAt = new Date();
            await db.Booking.update(
                { servedStatus: 'in_progress', calledAt },
                { where: { id: nextBooking.id } }
            );
            nextBooking.servedStatus = 'in_progress';
            nextBooking.calledAt = calledAt;

            const callEvent = {
                bookingId: nextBooking.id,
                queueNumber: nextBooking.queueNumber,
                patientId: nextBooking.patientId,
                calledAt: nextBooking.calledAt
            };
            emitToDoctorQueue(doctorId, 'queue:called', callEvent);
            emitToBooking(nextBooking.id, 'queue:called', callEvent);
            emitToPatient(nextBooking.patientId, 'queue:called', callEvent);

            resolve({ errCode: 0, errMessage: 'Called next patient', data: nextBooking });
        } catch (e) {
            reject(e);
        }
    });
};

const getPatientQueueStatus = ({ bookingId }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!bookingId) return resolve({ errCode: 1, errMessage: 'Missing bookingId' });
            const booking = await db.Booking.findOne({ where: { id: bookingId }, raw: true });
            if (!booking) return resolve({ errCode: 2, errMessage: 'Booking not found' });

            const ahead = await db.Booking.count({
                where: {
                    doctorId: booking.doctorId,
                    date: booking.date,
                    servedStatus: 'waiting',
                    statusId: 'S2',
                    queueNumber: { [Op.lt]: booking.queueNumber || 999999 }
                }
            });

            const current = await db.Booking.findOne({
                where: { doctorId: booking.doctorId, date: booking.date, servedStatus: 'in_progress' },
                attributes: ['id', 'queueNumber'],
                raw: true
            });

            resolve({
                errCode: 0,
                data: {
                    bookingId: booking.id,
                    patientId: booking.patientId,
                    doctorId: booking.doctorId,
                    statusId: booking.statusId,
                    queueNumber: booking.queueNumber,
                    servedStatus: booking.servedStatus,
                    peopleAhead: ahead,
                    currentCalling: current ? current.queueNumber : null
                }
            });
        } catch (e) {
            reject(e);
        }
    });
};

const maskName = (user) => {
    if (!user) return 'An danh';
    const first = user.firstName || '';
    const last = user.lastName || '';
    const initial = first ? first.charAt(0).toUpperCase() + '.' : '';
    return `${last} ${initial}`.trim() || 'An danh';
};

const getKioskQueue = ({ doctorId, date }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId) return resolve({ errCode: 1, errMessage: 'Missing doctorId' });
            const where = { doctorId };
            if (date) where.date = date;
            where.statusId = { [Op.in]: ['S2', 'S3'] };

            const rows = await db.Booking.findAll({
                where,
                order: [['queueNumber', 'ASC'], ['createdAt', 'ASC']],
                include: [
                    { model: db.User, as: 'patientData', attributes: ['firstName', 'lastName'] }
                ],
                raw: false,
                nest: true
            });

            const current = rows.find(r => r.servedStatus === 'in_progress');
            const waiting = rows
                .filter(r => r.servedStatus === 'waiting' && r.statusId === 'S2')
                .slice(0, 5)
                .map(r => ({
                    queueNumber: r.queueNumber,
                    patient: maskName(r.patientData)
                }));
            const done = rows.filter(r => r.servedStatus === 'done').length;

            const doctor = await db.User.findOne({
                where: { id: doctorId },
                attributes: ['id', 'firstName', 'lastName'],
                raw: true
            });

            resolve({
                errCode: 0,
                data: {
                    doctorId: Number(doctorId),
                    doctorName: doctor ? `${doctor.lastName || ''} ${doctor.firstName || ''}`.trim() : '',
                    current: current ? {
                        queueNumber: current.queueNumber,
                        patient: maskName(current.patientData),
                        calledAt: current.calledAt
                    } : null,
                    waiting,
                    doneCount: done,
                    totalWaiting: rows.filter(r => r.servedStatus === 'waiting' && r.statusId === 'S2').length
                }
            });
        } catch (e) { reject(e); }
    });
};

module.exports = {
    getQueueByDoctor,
    assignQueueNumbers,
    callNextPatient,
    getPatientQueueStatus,
    getKioskQueue
};
