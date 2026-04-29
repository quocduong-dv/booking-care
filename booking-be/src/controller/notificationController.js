import notificationService from '../servies/notificationService';

const getNotifications = async (req, res) => {
    try {
        const result = await notificationService.getNotifications({
            userId: req.user?.id,
            limit: req.query.limit,
            unreadOnly: req.query.unreadOnly === 'true' || req.query.unreadOnly === '1'
        });
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const markAsRead = async (req, res) => {
    try {
        const result = await notificationService.markAsRead({
            id: req.body?.id,
            userId: req.user?.id
        });
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const markAllRead = async (req, res) => {
    try {
        const result = await notificationService.markAllRead({
            userId: req.user?.id
        });
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const deleteNotification = async (req, res) => {
    try {
        const result = await notificationService.deleteNotification({
            id: req.body?.id,
            userId: req.user?.id
        });
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllRead,
    deleteNotification
};
