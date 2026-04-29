import db from '../models/index';
import { emitToDoctor } from '../socket';
import { Sequelize } from 'sequelize';
import notificationService from './notificationService';

const createReview = ({ bookingId, patientId, rating, comment }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!bookingId || !rating || !patientId) {
                return resolve({ errCode: 1, errMessage: 'Missing bookingId, patientId or rating' });
            }
            const r = Number(rating);
            if (!Number.isInteger(r) || r < 1 || r > 5) {
                return resolve({ errCode: 2, errMessage: 'Rating must be between 1 and 5' });
            }
            const booking = await db.Booking.findOne({ where: { id: bookingId }, raw: true });
            if (!booking) return resolve({ errCode: 3, errMessage: 'Booking not found' });
            if (booking.statusId !== 'S3') {
                return resolve({ errCode: 4, errMessage: 'Only completed bookings can be reviewed' });
            }
            if (Number(booking.patientId) !== Number(patientId)) {
                return resolve({ errCode: 6, errMessage: 'You are not the owner of this booking' });
            }
            const existing = await db.Review.findOne({ where: { bookingId } });
            if (existing) return resolve({ errCode: 5, errMessage: 'This booking was already reviewed' });

            const autoApprove = process.env.REVIEW_AUTO_APPROVE !== 'false';
            const review = await db.Review.create({
                bookingId,
                patientId: booking.patientId,
                doctorId: booking.doctorId,
                rating: r,
                comment: comment || '',
                isApproved: autoApprove
            });

            emitToDoctor(booking.doctorId, 'review:new', {
                reviewId: review.id,
                bookingId,
                rating: r,
                comment: review.comment,
                createdAt: review.createdAt
            });

            notificationService.createNotification({
                userId: booking.doctorId,
                type: 'review_new',
                title: 'Danh gia moi',
                body: `${r} sao${comment ? ': ' + String(comment).slice(0, 80) : ''}`,
                link: '/system/my-reviews',
                data: { reviewId: review.id, bookingId, rating: r },
                roleHint: 'R2'
            });

            resolve({ errCode: 0, errMessage: 'Review created', data: review });
        } catch (e) {
            reject(e);
        }
    });
};

const getReviewsByDoctor = ({ doctorId, limit, offset }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId) return resolve({ errCode: 1, errMessage: 'Missing doctorId' });
            const lim = Math.min(parseInt(limit, 10) || 10, 50);
            const off = parseInt(offset, 10) || 0;

            const { rows, count } = await db.Review.findAndCountAll({
                where: { doctorId, isApproved: true },
                order: [['createdAt', 'DESC']],
                limit: lim,
                offset: off,
                include: [
                    {
                        model: db.User,
                        as: 'patientData',
                        attributes: ['id', 'firstName', 'lastName']
                    }
                ],
                raw: false,
                nest: true
            });

            const agg = await db.Review.findOne({
                where: { doctorId, isApproved: true },
                attributes: [
                    [Sequelize.fn('AVG', Sequelize.col('rating')), 'avgRating'],
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalCount']
                ],
                raw: true
            });

            const avgRating = agg && agg.avgRating ? Number(Number(agg.avgRating).toFixed(2)) : 0;
            const totalCount = agg && agg.totalCount ? Number(agg.totalCount) : 0;

            resolve({
                errCode: 0,
                data: { items: rows, count, avgRating, totalCount }
            });
        } catch (e) {
            reject(e);
        }
    });
};

const getReviewByBooking = ({ bookingId }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!bookingId) return resolve({ errCode: 1, errMessage: 'Missing bookingId' });
            const review = await db.Review.findOne({ where: { bookingId }, raw: true });
            resolve({ errCode: 0, data: review || null });
        } catch (e) {
            reject(e);
        }
    });
};

// Admin APIs
const listAllReviews = ({ status, doctorId, limit, offset }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const where = {};
            if (status === 'pending') where.isApproved = false;
            else if (status === 'approved') where.isApproved = true;
            if (doctorId) where.doctorId = doctorId;
            const lim = Math.min(parseInt(limit, 10) || 50, 200);
            const off = parseInt(offset, 10) || 0;
            const { rows, count } = await db.Review.findAndCountAll({
                where,
                order: [['createdAt', 'DESC']],
                limit: lim,
                offset: off,
                include: [
                    { model: db.User, as: 'patientData', attributes: ['id', 'firstName', 'lastName', 'email'] },
                    { model: db.User, as: 'doctorData', attributes: ['id', 'firstName', 'lastName'] }
                ],
                raw: false,
                nest: true
            });
            resolve({ errCode: 0, data: { items: rows, count } });
        } catch (e) { reject(e); }
    });
};

const moderateReview = ({ id, isApproved, note }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) return resolve({ errCode: 1, errMessage: 'Thieu id' });
            await db.Review.update(
                { isApproved: !!isApproved, moderationNote: note || null },
                { where: { id } }
            );
            resolve({ errCode: 0 });
        } catch (e) { reject(e); }
    });
};

const replyReview = ({ id, doctorId, reply }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id || !doctorId) return resolve({ errCode: 1, errMessage: 'Thieu id hoac doctorId' });
            const r = await db.Review.findOne({ where: { id } });
            if (!r) return resolve({ errCode: 2, errMessage: 'Danh gia khong ton tai' });
            if (Number(r.doctorId) !== Number(doctorId)) {
                return resolve({ errCode: 3, errMessage: 'Khong co quyen tra loi danh gia nay' });
            }
            const text = (reply || '').trim();
            await r.update({
                doctorReply: text || null,
                doctorReplyAt: text ? new Date() : null
            });
            resolve({ errCode: 0, data: r });
        } catch (e) { reject(e); }
    });
};

module.exports = {
    createReview,
    getReviewsByDoctor,
    getReviewByBooking,
    listAllReviews,
    moderateReview,
    replyReview
};
