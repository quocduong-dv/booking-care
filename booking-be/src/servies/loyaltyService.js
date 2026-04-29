import db from '../models/index';

const POINTS_PER_UNIT_VND = Number(process.env.LOYALTY_POINTS_UNIT || 10000);

// Award loyalty points when a booking completes (S3). Idempotent — if
// booking.pointsEarned > 0, skip to avoid double-award on repeated S3 transitions.
const awardForCompletedBooking = async (bookingId) => {
    try {
        const booking = await db.Booking.findOne({ where: { id: bookingId }, raw: true });
        if (!booking) return;
        if (Number(booking.pointsEarned) > 0) return;
        if (!booking.patientId) return;
        const base = Math.max(0, Number(booking.amount) || 0);
        if (base <= 0) return;
        const points = Math.floor(base / POINTS_PER_UNIT_VND);
        if (points <= 0) return;
        await db.Booking.update({ pointsEarned: points }, { where: { id: bookingId } });
        await db.User.increment('loyaltyPoints', { by: points, where: { id: booking.patientId } });
    } catch (e) {
        console.log('[loyalty] award failed:', e.message);
    }
};

const getPointsForUser = async (userId) => {
    const user = await db.User.findOne({
        where: { id: userId },
        attributes: ['id', 'loyaltyPoints'],
        raw: true
    });
    if (!user) return { errCode: 1, errMessage: 'User not found' };
    return { errCode: 0, points: Number(user.loyaltyPoints) || 0 };
};

export default { awardForCompletedBooking, getPointsForUser, POINTS_PER_UNIT_VND };
