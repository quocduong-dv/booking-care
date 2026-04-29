import queueService from '../servies/queueService';

const getQueueByDoctor = async (req, res) => {
    try {
        const result = await queueService.getQueueByDoctor({
            doctorId: req.query.doctorId,
            date: req.query.date
        });
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const assignQueueNumbers = async (req, res) => {
    try {
        const result = await queueService.assignQueueNumbers(req.body);
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const callNextPatient = async (req, res) => {
    try {
        const result = await queueService.callNextPatient(req.body);
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const getPatientQueueStatus = async (req, res) => {
    try {
        const result = await queueService.getPatientQueueStatus({ bookingId: req.query.bookingId });
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const getKioskQueue = async (req, res) => {
    try {
        const result = await queueService.getKioskQueue({
            doctorId: req.query.doctorId,
            date: req.query.date
        });
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

module.exports = {
    getQueueByDoctor,
    assignQueueNumbers,
    callNextPatient,
    getPatientQueueStatus,
    getKioskQueue
};
