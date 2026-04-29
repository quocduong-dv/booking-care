// Mock db before importing service
jest.mock('../models/index', () => ({
    Voucher: {
        findOne: jest.fn(),
        increment: jest.fn().mockResolvedValue(undefined),
        create: jest.fn(),
        findAll: jest.fn(),
        destroy: jest.fn()
    }
}));

const db = require('../models/index');
const voucherService = require('../servies/voucherService').default;

beforeEach(() => {
    jest.clearAllMocks();
});

describe('voucherService.validateVoucher', () => {
    test('returns error when code missing', async () => {
        const r = await voucherService.validateVoucher({});
        expect(r.errCode).toBe(1);
    });

    test('returns error when voucher not found', async () => {
        db.Voucher.findOne.mockResolvedValueOnce(null);
        const r = await voucherService.validateVoucher({ code: 'NOPE', amount: 100000 });
        expect(r.errCode).toBe(2);
    });

    test('returns error when voucher inactive', async () => {
        db.Voucher.findOne.mockResolvedValueOnce({ code: 'X', isActive: false });
        const r = await voucherService.validateVoucher({ code: 'X', amount: 100000 });
        expect(r.errCode).toBe(3);
    });

    test('returns error when expired', async () => {
        db.Voucher.findOne.mockResolvedValueOnce({
            code: 'X', isActive: true,
            endDate: new Date(Date.now() - 86400000).toISOString()
        });
        const r = await voucherService.validateVoucher({ code: 'X', amount: 100000 });
        expect(r.errCode).toBe(5);
    });

    test('enforces min order amount', async () => {
        db.Voucher.findOne.mockResolvedValueOnce({
            code: 'X', isActive: true, minOrderAmount: 500000
        });
        const r = await voucherService.validateVoucher({ code: 'X', amount: 100000 });
        expect(r.errCode).toBe(7);
    });

    test('fixed discount clamps to order amount', async () => {
        db.Voucher.findOne.mockResolvedValueOnce({
            code: 'X', isActive: true, type: 'fixed', value: 500000
        });
        const r = await voucherService.validateVoucher({ code: 'X', amount: 100000 });
        expect(r.errCode).toBe(0);
        expect(r.discount).toBe(100000);
    });

    test('percent discount respects maxDiscount cap', async () => {
        db.Voucher.findOne.mockResolvedValueOnce({
            code: 'X', isActive: true, type: 'percent', value: 50, maxDiscount: 30000
        });
        const r = await voucherService.validateVoucher({ code: 'X', amount: 100000 });
        expect(r.errCode).toBe(0);
        expect(r.discount).toBe(30000);
    });

    test('usage limit reached blocks voucher', async () => {
        db.Voucher.findOne.mockResolvedValueOnce({
            code: 'X', isActive: true, usageLimit: 10, usedCount: 10
        });
        const r = await voucherService.validateVoucher({ code: 'X', amount: 100000 });
        expect(r.errCode).toBe(6);
    });
});

describe('voucherService.consumeVoucher', () => {
    test('increments usedCount', async () => {
        await voucherService.consumeVoucher('ABC');
        expect(db.Voucher.increment).toHaveBeenCalledWith('usedCount', { by: 1, where: { code: 'ABC' } });
    });

    test('noop when code empty', async () => {
        await voucherService.consumeVoucher('');
        expect(db.Voucher.increment).not.toHaveBeenCalled();
    });
});
