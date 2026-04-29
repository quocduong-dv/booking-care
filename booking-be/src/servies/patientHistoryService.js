import db from '../models/index';

const getPatientBookings = ({ patientId }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!patientId) return resolve({ errCode: 1, errMessage: 'Missing patientId' });

            const bookings = await db.Booking.findAll({
                where: { patientId },
                order: [['createdAt', 'DESC']],
                include: [
                    { model: db.Allcode, as: 'timeTypeDataPatient', attributes: ['valueVi', 'valueEn'] },
                    { model: db.Review, as: 'reviewData', attributes: ['id', 'rating', 'comment', 'createdAt'] }
                ],
                raw: false,
                nest: true
            });

            const doctorIds = [...new Set(bookings.map(b => b.doctorId))];
            const doctors = await db.User.findAll({
                where: { id: doctorIds },
                attributes: ['id', 'firstName', 'lastName', 'image'],
                raw: true
            });
            const doctorMap = {};
            doctors.forEach(d => { doctorMap[d.id] = d; });

            const data = bookings.map(b => {
                const j = b.toJSON();
                j.doctorData = doctorMap[j.doctorId] || null;
                return j;
            });

            resolve({ errCode: 0, data });
        } catch (e) {
            reject(e);
        }
    });
};

const getPatientBookingDetail = ({ bookingId, patientId }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!bookingId || !patientId) {
                return resolve({ errCode: 1, errMessage: 'Missing bookingId or patientId' });
            }
            const booking = await db.Booking.findOne({
                where: { id: bookingId, patientId },
                include: [
                    { model: db.Allcode, as: 'timeTypeDataPatient', attributes: ['valueVi', 'valueEn'] },
                    { model: db.Review, as: 'reviewData' }
                ],
                raw: false,
                nest: true
            });
            if (!booking) return resolve({ errCode: 2, errMessage: 'Booking not found' });

            const doctor = await db.User.findOne({
                where: { id: booking.doctorId },
                attributes: ['id', 'firstName', 'lastName', 'image'],
                raw: true
            });
            const payment = await db.Payment.findOne({
                where: { bookingId },
                order: [['createdAt', 'DESC']],
                raw: true
            });
            const prescription = await db.Prescription.findOne({
                where: {
                    patientId: booking.patientId,
                    doctorId: booking.doctorId,
                    date: booking.date
                },
                raw: true
            }).catch(() => null);

            const data = booking.toJSON();
            data.doctorData = doctor || null;
            data.paymentData = payment || null;
            data.prescriptionData = prescription || null;

            resolve({ errCode: 0, data });
        } catch (e) {
            reject(e);
        }
    });
};

module.exports = {
    getPatientBookings,
    getPatientBookingDetail
};
