import patientHistoryService from '../servies/patientHistoryService';

const getPatientBookings = async (req, res) => {
    try {
        const result = await patientHistoryService.getPatientBookings({ patientId: req.user?.id });
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const getPatientBookingDetail = async (req, res) => {
    try {
        const result = await patientHistoryService.getPatientBookingDetail({
            bookingId: req.query.bookingId,
            patientId: req.user?.id
        });
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

module.exports = {
    getPatientBookings,
    getPatientBookingDetail
};
