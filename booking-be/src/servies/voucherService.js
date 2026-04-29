import db from '../models/index';

// Validate voucher for a given order amount. Does NOT increment usedCount.
// Returns { errCode, discount, voucher } where errCode=0 means valid.
const validateVoucher = async ({ code, amount }) => {
    if (!code) return { errCode: 1, errMessage: 'Ma giam gia trong' };
    const voucher = await db.Voucher.findOne({ where: { code: String(code).trim() }, raw: true });
    if (!voucher) return { errCode: 2, errMessage: 'Ma giam gia khong ton tai' };
    if (!voucher.isActive) return { errCode: 3, errMessage: 'Ma giam gia da bi tat' };
    const now = Date.now();
    if (voucher.startDate && new Date(voucher.startDate).getTime() > now) {
        return { errCode: 4, errMessage: 'Ma giam gia chua bat dau' };
    }
    if (voucher.endDate && new Date(voucher.endDate).getTime() < now) {
        return { errCode: 5, errMessage: 'Ma giam gia da het han' };
    }
    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
        return { errCode: 6, errMessage: 'Ma giam gia da het luot su dung' };
    }
    const orderAmount = Number(amount) || 0;
    if (voucher.minOrderAmount && orderAmount < Number(voucher.minOrderAmount)) {
        return { errCode: 7, errMessage: `Don toi thieu ${voucher.minOrderAmount} VND` };
    }
    let discount = 0;
    if (voucher.type === 'percent') {
        discount = Math.floor(orderAmount * Number(voucher.value) / 100);
        if (voucher.maxDiscount) discount = Math.min(discount, Number(voucher.maxDiscount));
    } else {
        discount = Number(voucher.value);
    }
    discount = Math.max(0, Math.min(discount, orderAmount));
    return { errCode: 0, discount, voucher };
};

// Consume a voucher (increment usedCount). Called inside booking creation after validate.
const consumeVoucher = async (code) => {
    if (!code) return;
    await db.Voucher.increment('usedCount', { by: 1, where: { code } });
};

const createVoucher = async (data) => {
    if (!data.code || !data.type || data.value === undefined) {
        return { errCode: 1, errMessage: 'Thieu truong bat buoc' };
    }
    const existing = await db.Voucher.findOne({ where: { code: data.code }, raw: true });
    if (existing) return { errCode: 2, errMessage: 'Ma da ton tai' };
    const row = await db.Voucher.create({
        code: String(data.code).trim().toUpperCase(),
        description: data.description || null,
        type: data.type === 'percent' ? 'percent' : 'fixed',
        value: data.value,
        maxDiscount: data.maxDiscount || null,
        minOrderAmount: data.minOrderAmount || 0,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        usageLimit: data.usageLimit || null,
        usedCount: 0,
        isActive: data.isActive !== false
    });
    return { errCode: 0, voucher: row };
};

const updateVoucher = async (data) => {
    if (!data.id) return { errCode: 1, errMessage: 'Thieu id' };
    const row = await db.Voucher.findOne({ where: { id: data.id }, raw: false });
    if (!row) return { errCode: 2, errMessage: 'Khong tim thay voucher' };
    ['description', 'type', 'value', 'maxDiscount', 'minOrderAmount', 'startDate', 'endDate', 'usageLimit', 'isActive']
        .forEach((k) => { if (Object.prototype.hasOwnProperty.call(data, k)) row[k] = data[k]; });
    await row.save();
    return { errCode: 0 };
};

const deleteVoucher = async (id) => {
    if (!id) return { errCode: 1, errMessage: 'Thieu id' };
    await db.Voucher.destroy({ where: { id } });
    return { errCode: 0 };
};

const listVouchers = async ({ activeOnly } = {}) => {
    const where = activeOnly ? { isActive: true } : {};
    const rows = await db.Voucher.findAll({ where, order: [['id', 'DESC']], raw: true });
    return { errCode: 0, data: rows };
};

export default {
    validateVoucher,
    consumeVoucher,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    listVouchers
};
