import reviewService from '../servies/reviewService';

const createReview = async (req, res) => {
    try {
        const result = await reviewService.createReview({
            ...req.body,
            patientId: req.user?.id
        });
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const getReviewsByDoctor = async (req, res) => {
    try {
        const result = await reviewService.getReviewsByDoctor({
            doctorId: req.query.doctorId,
            limit: req.query.limit,
            offset: req.query.offset
        });
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const getReviewByBooking = async (req, res) => {
    try {
        const result = await reviewService.getReviewByBooking({ bookingId: req.query.bookingId });
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const listAllReviews = async (req, res) => {
    try {
        const result = await reviewService.listAllReviews({
            status: req.query.status,
            doctorId: req.query.doctorId,
            limit: req.query.limit,
            offset: req.query.offset
        });
        return res.status(200).json(result);
    } catch (e) {
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const moderateReview = async (req, res) => {
    try {
        const result = await reviewService.moderateReview(req.body || {});
        return res.status(200).json(result);
    } catch (e) {
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const replyReview = async (req, res) => {
    try {
        const result = await reviewService.replyReview({
            id: req.body?.id,
            reply: req.body?.reply,
            doctorId: req.user?.id
        });
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

module.exports = {
    createReview,
    getReviewsByDoctor,
    getReviewByBooking,
    listAllReviews,
    moderateReview,
    replyReview
};
