import db from '../models/index';

const sanitizeVitalSigns = (raw) => {
    if (!raw) return null;
    if (typeof raw === 'string') return raw;
    try { return JSON.stringify(raw); } catch (e) { return null; }
};

const saveEmr = ({
    bookingId, patientId, doctorId,
    chiefComplaint, symptoms, diagnosis, treatment,
    vitalSigns, notes, description, files
}) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!bookingId) return resolve({ errCode: 1, errMessage: 'Missing bookingId' });

            const booking = await db.Booking.findOne({ where: { id: bookingId }, raw: true });
            if (!booking) return resolve({ errCode: 2, errMessage: 'Booking not found' });

            const resolvedPatientId = patientId || booking.patientId;
            const resolvedDoctorId = doctorId || booking.doctorId;

            const payload = {
                bookingId,
                patientId: resolvedPatientId,
                doctorId: resolvedDoctorId,
                chiefComplaint: chiefComplaint || null,
                symptoms: symptoms || null,
                diagnosis: diagnosis || null,
                treatment: treatment || null,
                vitalSigns: sanitizeVitalSigns(vitalSigns),
                notes: notes || null,
                description: description || null,
                files: files || null
            };

            const existing = await db.History.findOne({ where: { bookingId } });
            let record;
            if (existing) {
                await existing.update(payload);
                record = existing;
            } else {
                record = await db.History.create(payload);
            }

            resolve({ errCode: 0, data: record.toJSON() });
        } catch (e) {
            reject(e);
        }
    });
};

const getEmrByBookingId = ({ bookingId, requester }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!bookingId) return resolve({ errCode: 1, errMessage: 'Missing bookingId' });

            const booking = await db.Booking.findOne({ where: { id: bookingId }, raw: true });
            if (!booking) return resolve({ errCode: 2, errMessage: 'Booking not found' });

            if (requester && requester.roleId !== 'R1') {
                if (requester.roleId === 'R2' && String(booking.doctorId) !== String(requester.id)) {
                    return resolve({ errCode: 3, errMessage: 'Forbidden' });
                }
                if (requester.roleId === 'R3' && String(booking.patientId) !== String(requester.id)) {
                    return resolve({ errCode: 3, errMessage: 'Forbidden' });
                }
            }

            const emr = await db.History.findOne({
                where: { bookingId },
                include: [
                    { model: db.User, as: 'doctorData', attributes: ['id', 'firstName', 'lastName'] },
                    { model: db.User, as: 'patientData', attributes: ['id', 'firstName', 'lastName', 'email'] }
                ],
                raw: false,
                nest: true
            });

            resolve({ errCode: 0, data: emr ? emr.toJSON() : null, booking });
        } catch (e) {
            reject(e);
        }
    });
};

const getPatientEmrHistory = ({ patientId, requester }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!patientId) return resolve({ errCode: 1, errMessage: 'Missing patientId' });

            if (requester && requester.roleId === 'R3' && String(requester.id) !== String(patientId)) {
                return resolve({ errCode: 3, errMessage: 'Forbidden' });
            }

            const rows = await db.History.findAll({
                where: { patientId },
                order: [['createdAt', 'DESC']],
                include: [
                    { model: db.User, as: 'doctorData', attributes: ['id', 'firstName', 'lastName'] },
                    { model: db.Booking, as: 'bookingData', attributes: ['id', 'date', 'timeType', 'statusId'] }
                ],
                raw: false,
                nest: true
            });

            if (requester && requester.roleId === 'R2') {
                const filtered = rows
                    .map(r => r.toJSON())
                    .filter(r => String(r.doctorId) === String(requester.id));
                return resolve({ errCode: 0, data: filtered });
            }

            resolve({ errCode: 0, data: rows.map(r => r.toJSON()) });
        } catch (e) {
            reject(e);
        }
    });
};

module.exports = {
    saveEmr,
    getEmrByBookingId,
    getPatientEmrHistory
};
