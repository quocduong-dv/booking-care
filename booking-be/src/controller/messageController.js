import messageService from '../servies/messageService';

const sendMessage = async (req, res) => {
    try {
        const authRole = req.user?.roleId === 'R2' ? 'doctor' : (req.user?.roleId === 'R3' ? 'patient' : null);
        const result = await messageService.sendMessage({
            ...req.body,
            senderId: req.user?.id,
            senderRole: authRole
        });
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const getMessages = async (req, res) => {
    try {
        const result = await messageService.getMessages({
            bookingId: req.query.bookingId,
            userId: req.user?.id
        });
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const getUnreadByDoctor = async (req, res) => {
    try {
        const result = await messageService.getUnreadByDoctor({ doctorId: req.user?.id });
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

module.exports = {
    sendMessage,
    getMessages,
    getUnreadByDoctor
};
