import waitlistService from '../servies/waitlistService';

const addToWaitlist = async (req, res) => {
    try {
        const result = await waitlistService.addToWaitlist({
            ...req.body,
            patientId: req.user?.id
        });
        return res.status(200).json(result);
    } catch (e) {
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const getMyWaitlist = async (req, res) => {
    try {
        const result = await waitlistService.getMyWaitlist({ patientId: req.user?.id });
        return res.status(200).json(result);
    } catch (e) {
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const getWaitlistsByDoctor = async (req, res) => {
    try {
        let doctorId = req.query.doctorId;
        if (req.user && req.user.roleId === 'R2') doctorId = req.user.id;
        const result = await waitlistService.getWaitlistsByDoctor({
            doctorId,
            status: req.query.status
        });
        return res.status(200).json(result);
    } catch (e) {
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const removeFromWaitlist = async (req, res) => {
    try {
        const result = await waitlistService.removeFromWaitlist({
            id: req.body?.id || req.query?.id,
            requesterId: req.user?.id,
            requesterRole: req.user?.roleId
        });
        return res.status(200).json(result);
    } catch (e) {
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

module.exports = {
    addToWaitlist,
    getMyWaitlist,
    getWaitlistsByDoctor,
    removeFromWaitlist
};
