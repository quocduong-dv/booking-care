import labResultService from '../servies/labResultService';

const createLabResult = async (req, res) => {
    try {
        const body = req.body || {};
        if (req.user && req.user.roleId === 'R2') {
            body.doctorId = req.user.id;
        }
        const result = await labResultService.createLabResult(body);
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const getLabResultsByPatient = async (req, res) => {
    try {
        const patientId = req.query.patientId || req.user?.id;
        const result = await labResultService.getLabResultsByPatient({
            patientId,
            requesterId: req.user?.id,
            requesterRole: req.user?.roleId
        });
        return res.status(200).json(result);
    } catch (e) {
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const getLabResultsByBooking = async (req, res) => {
    try {
        const result = await labResultService.getLabResultsByBooking({
            bookingId: req.query.bookingId,
            requesterId: req.user?.id,
            requesterRole: req.user?.roleId
        });
        return res.status(200).json(result);
    } catch (e) {
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const deleteLabResult = async (req, res) => {
    try {
        const result = await labResultService.deleteLabResult({ id: req.body?.id || req.query?.id });
        return res.status(200).json(result);
    } catch (e) {
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

module.exports = {
    createLabResult,
    getLabResultsByPatient,
    getLabResultsByBooking,
    deleteLabResult
};
