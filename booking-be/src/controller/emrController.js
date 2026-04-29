import emrService from '../servies/emrService';

const saveEmr = async (req, res) => {
    try {
        const body = req.body || {};
        if (req.user?.roleId === 'R2') {
            body.doctorId = req.user.id;
        }
        const result = await emrService.saveEmr(body);
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const getEmrByBookingId = async (req, res) => {
    try {
        const result = await emrService.getEmrByBookingId({
            bookingId: req.query.bookingId,
            requester: req.user
        });
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const getPatientEmrHistory = async (req, res) => {
    try {
        const result = await emrService.getPatientEmrHistory({
            patientId: req.query.patientId,
            requester: req.user
        });
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

module.exports = {
    saveEmr,
    getEmrByBookingId,
    getPatientEmrHistory
};
