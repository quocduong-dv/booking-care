import db from '../models/index';
import { Op } from 'sequelize';

const getAuditLogs = async (req, res) => {
    try {
        const { action, userId, from, to, limit = 100 } = req.query;
        const where = {};
        if (action) where.action = action;
        if (userId) where.userId = userId;
        if (from || to) {
            where.createdAt = {};
            if (from) where.createdAt[Op.gte] = new Date(Number(from));
            if (to) where.createdAt[Op.lte] = new Date(Number(to));
        }
        const rows = await db.AuditLog.findAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: Math.min(Number(limit), 500),
            raw: true
        });
        return res.status(200).json({ errCode: 0, data: rows });
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

module.exports = { getAuditLogs };
