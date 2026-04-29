import db from '../models/index';
import { emitToAdmin, emitToDoctor, emitToPatient } from '../socket';

const sanitizeData = (d) => {
    if (!d) return null;
    if (typeof d === 'string') return d;
    try { return JSON.stringify(d); } catch (e) { return null; }
};

const parseData = (raw) => {
    if (!raw) return null;
    try { return typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (e) { return raw; }
};

const createNotification = async ({ userId, type, title, body, link, data, roleHint }) => {
    if (!userId || !type) return null;
    try {
        const record = await db.Notification.create({
            userId,
            type,
            title: title || null,
            body: body || null,
            link: link || null,
            data: sanitizeData(data),
            isRead: false
        });
        const json = record.toJSON();
        json.data = parseData(json.data);

        const event = 'notification:new';
        if (roleHint === 'R1') {
            emitToAdmin(event, json);
        } else if (roleHint === 'R2') {
            emitToDoctor(userId, event, json);
        } else if (roleHint === 'R3') {
            emitToPatient(userId, event, json);
        } else {
            emitToDoctor(userId, event, json);
            emitToPatient(userId, event, json);
        }
        return json;
    } catch (e) {
        console.log('[notify] create error:', e.message);
        return null;
    }
};

const notifyAllAdmins = async ({ type, title, body, link, data }) => {
    try {
        const admins = await db.User.findAll({ where: { roleId: 'R1' }, attributes: ['id'], raw: true });
        const out = [];
        for (const a of admins) {
            const n = await createNotification({ userId: a.id, type, title, body, link, data, roleHint: 'R1' });
            if (n) out.push(n);
        }
        return out;
    } catch (e) {
        console.log('[notify] notifyAllAdmins error:', e.message);
        return [];
    }
};

const getNotifications = ({ userId, limit, unreadOnly }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!userId) return resolve({ errCode: 1, errMessage: 'Missing userId' });
            const where = { userId };
            if (unreadOnly) where.isRead = false;
            const rows = await db.Notification.findAll({
                where,
                order: [['createdAt', 'DESC']],
                limit: Math.min(Number(limit) || 30, 100),
                raw: true
            });
            const unreadCount = await db.Notification.count({ where: { userId, isRead: false } });
            const data = rows.map(r => ({ ...r, data: parseData(r.data) }));
            resolve({ errCode: 0, data, unreadCount });
        } catch (e) { reject(e); }
    });
};

const markAsRead = ({ id, userId }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id || !userId) return resolve({ errCode: 1, errMessage: 'Missing id/userId' });
            const n = await db.Notification.findOne({ where: { id, userId } });
            if (!n) return resolve({ errCode: 2, errMessage: 'Not found' });
            await n.update({ isRead: true });
            resolve({ errCode: 0 });
        } catch (e) { reject(e); }
    });
};

const markAllRead = ({ userId }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!userId) return resolve({ errCode: 1, errMessage: 'Missing userId' });
            await db.Notification.update({ isRead: true }, { where: { userId, isRead: false } });
            resolve({ errCode: 0 });
        } catch (e) { reject(e); }
    });
};

const deleteNotification = ({ id, userId }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id || !userId) return resolve({ errCode: 1, errMessage: 'Missing id/userId' });
            const n = await db.Notification.findOne({ where: { id, userId } });
            if (!n) return resolve({ errCode: 2, errMessage: 'Not found' });
            await n.destroy();
            resolve({ errCode: 0 });
        } catch (e) { reject(e); }
    });
};

module.exports = {
    createNotification,
    notifyAllAdmins,
    getNotifications,
    markAsRead,
    markAllRead,
    deleteNotification
};
