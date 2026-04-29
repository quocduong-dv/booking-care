jest.mock('../models/index', () => ({
    Booking: {
        findOne: jest.fn(),
        update: jest.fn().mockResolvedValue(undefined)
    },
    User: {
        findOne: jest.fn(),
        increment: jest.fn().mockResolvedValue(undefined)
    }
}));

const db = require('../models/index');
const loyaltyService = require('../servies/loyaltyService').default;

beforeEach(() => jest.clearAllMocks());

describe('awardForCompletedBooking', () => {
    test('awards floor(amount/10000) points', async () => {
        db.Booking.findOne.mockResolvedValueOnce({
            id: 1, patientId: 42, amount: 250000, pointsEarned: 0
        });
        await loyaltyService.awardForCompletedBooking(1);
        expect(db.Booking.update).toHaveBeenCalledWith({ pointsEarned: 25 }, { where: { id: 1 } });
        expect(db.User.increment).toHaveBeenCalledWith('loyaltyPoints', { by: 25, where: { id: 42 } });
    });

    test('skips when booking already awarded', async () => {
        db.Booking.findOne.mockResolvedValueOnce({
            id: 1, patientId: 42, amount: 250000, pointsEarned: 25
        });
        await loyaltyService.awardForCompletedBooking(1);
        expect(db.Booking.update).not.toHaveBeenCalled();
        expect(db.User.increment).not.toHaveBeenCalled();
    });

    test('skips when amount is zero', async () => {
        db.Booking.findOne.mockResolvedValueOnce({
            id: 1, patientId: 42, amount: 0, pointsEarned: 0
        });
        await loyaltyService.awardForCompletedBooking(1);
        expect(db.User.increment).not.toHaveBeenCalled();
    });

    test('skips when booking not found', async () => {
        db.Booking.findOne.mockResolvedValueOnce(null);
        await loyaltyService.awardForCompletedBooking(999);
        expect(db.Booking.update).not.toHaveBeenCalled();
    });
});
