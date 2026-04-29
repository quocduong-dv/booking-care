import db from '../models/index';
import { Op } from 'sequelize';
import notificationService from './notificationService';

const createMedicine = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data?.name) return resolve({ errCode: 1, errMessage: 'Missing name' });
            const exists = await db.Medicine.findOne({ where: { name: data.name } });
            if (exists) return resolve({ errCode: 2, errMessage: 'Medicine already exists' });
            const m = await db.Medicine.create({
                name: data.name,
                unit: data.unit || null,
                price: data.price || 0,
                stockQty: Number(data.stockQty) || 0,
                minStock: Number(data.minStock) || 0,
                usage: data.usage || null,
                note: data.note || null,
                isActive: data.isActive !== false
            });
            resolve({ errCode: 0, data: m });
        } catch (e) { reject(e); }
    });
};

const getMedicines = ({ q, limit, activeOnly }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const where = {};
            if (activeOnly) where.isActive = true;
            if (q) where.name = { [Op.like]: `%${q}%` };
            const rows = await db.Medicine.findAll({
                where,
                order: [['name', 'ASC']],
                limit: Math.min(Number(limit) || 200, 500),
                raw: true
            });
            resolve({ errCode: 0, data: rows });
        } catch (e) { reject(e); }
    });
};

const updateMedicine = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data?.id) return resolve({ errCode: 1, errMessage: 'Missing id' });
            const m = await db.Medicine.findOne({ where: { id: data.id } });
            if (!m) return resolve({ errCode: 2, errMessage: 'Not found' });
            await m.update({
                name: data.name ?? m.name,
                unit: data.unit ?? m.unit,
                price: data.price ?? m.price,
                stockQty: data.stockQty != null ? Number(data.stockQty) : m.stockQty,
                minStock: data.minStock != null ? Number(data.minStock) : m.minStock,
                usage: data.usage ?? m.usage,
                note: data.note ?? m.note,
                isActive: data.isActive ?? m.isActive
            });
            resolve({ errCode: 0, data: m });
        } catch (e) { reject(e); }
    });
};

const deleteMedicine = ({ id }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) return resolve({ errCode: 1, errMessage: 'Missing id' });
            const m = await db.Medicine.findOne({ where: { id } });
            if (!m) return resolve({ errCode: 2, errMessage: 'Not found' });
            await m.destroy();
            resolve({ errCode: 0 });
        } catch (e) { reject(e); }
    });
};

const adjustStock = ({ id, delta, reason, userId }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id || delta == null) return resolve({ errCode: 1, errMessage: 'Missing id or delta' });
            const m = await db.Medicine.findOne({ where: { id } });
            if (!m) return resolve({ errCode: 2, errMessage: 'Not found' });
            const prevQty = Number(m.stockQty) || 0;
            const newQty = prevQty + Number(delta);
            if (newQty < 0) return resolve({ errCode: 3, errMessage: 'Stock would go negative' });
            await m.update({ stockQty: newQty });

            try {
                await db.MedicineStockMovement.create({
                    medicineId: m.id,
                    delta: Number(delta),
                    prevQty,
                    newQty,
                    reason: reason || null,
                    userId: userId || null
                });
            } catch (e) { /* movement log is best-effort */ }

            const minStock = Number(m.minStock) || 0;
            if (Number(delta) < 0 && newQty <= minStock && prevQty > minStock) {
                notificationService.notifyAllAdmins({
                    type: 'medicine_low',
                    title: 'Thuoc sap het',
                    body: `"${m.name}" con ${newQty} ${m.unit || ''} (toi thieu ${minStock}).`,
                    link: '/system/manage-medicine',
                    data: { medicineId: m.id, stockQty: newQty, minStock }
                }).catch(() => {});
            }

            resolve({ errCode: 0, data: m });
        } catch (e) { reject(e); }
    });
};

const getStockMovements = ({ medicineId, limit = 100 }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const where = {};
            if (medicineId) where.medicineId = medicineId;
            const rows = await db.MedicineStockMovement.findAll({
                where,
                include: [
                    { model: db.Medicine, as: 'medicineData', attributes: ['id', 'name', 'unit'] },
                    { model: db.User, as: 'userData', attributes: ['id', 'firstName', 'lastName', 'email'] }
                ],
                order: [['createdAt', 'DESC']],
                limit: Math.min(Number(limit) || 100, 500)
            });
            resolve({ errCode: 0, data: rows });
        } catch (e) { reject(e); }
    });
};

module.exports = {
    createMedicine,
    getMedicines,
    updateMedicine,
    deleteMedicine,
    adjustStock,
    getStockMovements
};
