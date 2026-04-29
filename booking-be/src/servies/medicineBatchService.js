import db from '../models/index';
import { Op } from 'sequelize';

const addBatch = ({ medicineId, batchNo, expiryDate, manufactureDate, quantity, note, userId }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!medicineId || !batchNo || !expiryDate || quantity == null) {
                return resolve({ errCode: 1, errMessage: 'Thieu medicineId, batchNo, expiryDate hoac quantity' });
            }
            const qty = Number(quantity);
            if (qty <= 0) return resolve({ errCode: 2, errMessage: 'Quantity phai > 0' });
            const med = await db.Medicine.findOne({ where: { id: medicineId } });
            if (!med) return resolve({ errCode: 3, errMessage: 'Thuoc khong ton tai' });

            const batch = await db.MedicineBatch.create({
                medicineId,
                batchNo,
                expiryDate,
                manufactureDate: manufactureDate || null,
                quantity: qty,
                note: note || null
            });

            const prevQty = Number(med.stockQty) || 0;
            const newQty = prevQty + qty;
            await med.update({ stockQty: newQty });

            try {
                await db.MedicineStockMovement.create({
                    medicineId,
                    delta: qty,
                    prevQty,
                    newQty,
                    reason: `Nhap lo ${batchNo} (HSD ${expiryDate})`,
                    userId: userId || null
                });
            } catch (e) { }

            resolve({ errCode: 0, data: batch });
        } catch (e) { reject(e); }
    });
};

const getBatchesByMedicine = ({ medicineId }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!medicineId) return resolve({ errCode: 1, errMessage: 'Thieu medicineId' });
            const rows = await db.MedicineBatch.findAll({
                where: { medicineId },
                order: [['expiryDate', 'ASC']],
                raw: true
            });
            resolve({ errCode: 0, data: rows });
        } catch (e) { reject(e); }
    });
};

const deleteBatch = ({ id, userId }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) return resolve({ errCode: 1, errMessage: 'Thieu id' });
            const b = await db.MedicineBatch.findOne({ where: { id } });
            if (!b) return resolve({ errCode: 2, errMessage: 'Lo khong ton tai' });
            const med = await db.Medicine.findOne({ where: { id: b.medicineId } });
            if (med) {
                const prevQty = Number(med.stockQty) || 0;
                const newQty = Math.max(0, prevQty - Number(b.quantity));
                await med.update({ stockQty: newQty });
                try {
                    await db.MedicineStockMovement.create({
                        medicineId: b.medicineId,
                        delta: -Number(b.quantity),
                        prevQty,
                        newQty,
                        reason: `Xoa lo ${b.batchNo}`,
                        userId: userId || null
                    });
                } catch (e) { }
            }
            await b.destroy();
            resolve({ errCode: 0 });
        } catch (e) { reject(e); }
    });
};

const getExpiringSoon = ({ days = 30 }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const limit = new Date();
            limit.setDate(limit.getDate() + Number(days));
            const iso = limit.toISOString().slice(0, 10);
            const rows = await db.MedicineBatch.findAll({
                where: {
                    expiryDate: { [Op.lte]: iso },
                    quantity: { [Op.gt]: 0 }
                },
                include: [
                    { model: db.Medicine, as: 'medicineData', attributes: ['id', 'name', 'unit'] }
                ],
                order: [['expiryDate', 'ASC']],
                raw: false,
                nest: true
            });
            resolve({ errCode: 0, data: rows });
        } catch (e) { reject(e); }
    });
};

module.exports = {
    addBatch,
    getBatchesByMedicine,
    deleteBatch,
    getExpiringSoon
};
