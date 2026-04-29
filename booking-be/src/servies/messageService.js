import db from '../models/index';
import { emitToBooking, emitToDoctor, emitToPatient } from '../socket';
import { Sequelize, Op } from 'sequelize';

const sendMessage = ({ bookingId, senderId, senderRole, content }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!bookingId || !senderId || !senderRole || !content) {
                return resolve({ errCode: 1, errMessage: 'Missing required fields' });
            }
            if (senderRole !== 'patient' && senderRole !== 'doctor') {
                return resolve({ errCode: 2, errMessage: 'Invalid senderRole' });
            }
            const booking = await db.Booking.findOne({ where: { id: bookingId }, raw: true });
            if (!booking) return resolve({ errCode: 3, errMessage: 'Booking not found' });

            if (senderRole === 'patient' && Number(senderId) !== Number(booking.patientId)) {
                return resolve({ errCode: 4, errMessage: 'Sender is not the booking patient' });
            }
            if (senderRole === 'doctor' && Number(senderId) !== Number(booking.doctorId)) {
                return resolve({ errCode: 4, errMessage: 'Sender is not the booking doctor' });
            }

            const msg = await db.Message.create({
                bookingId,
                senderId,
                senderRole,
                content,
                isRead: false
            });

            const payload = {
                id: msg.id,
                bookingId: msg.bookingId,
                senderId: msg.senderId,
                senderRole: msg.senderRole,
                content: msg.content,
                isRead: msg.isRead,
                createdAt: msg.createdAt
            };

            emitToBooking(bookingId, 'chat:new', payload);
            if (senderRole === 'patient') {
                emitToDoctor(booking.doctorId, 'chat:new', payload);
            } else {
                emitToPatient(booking.patientId, 'chat:new', payload);
            }

            resolve({ errCode: 0, data: payload });
        } catch (e) {
            reject(e);
        }
    });
};

const getMessages = ({ bookingId, userId }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!bookingId) return resolve({ errCode: 1, errMessage: 'Missing bookingId' });

            const messages = await db.Message.findAll({
                where: { bookingId },
                order: [['createdAt', 'ASC']],
                raw: true
            });

            if (userId) {
                await db.Message.update(
                    { isRead: true },
                    {
                        where: {
                            bookingId,
                            senderId: { [Op.ne]: Number(userId) },
                            isRead: false
                        }
                    }
                );
            }

            resolve({ errCode: 0, data: messages });
        } catch (e) {
            reject(e);
        }
    });
};

const getUnreadByDoctor = ({ doctorId }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId) return resolve({ errCode: 1, errMessage: 'Missing doctorId' });

            const rows = await db.Message.findAll({
                attributes: [
                    'bookingId',
                    [Sequelize.fn('COUNT', Sequelize.col('Message.id')), 'unreadCount']
                ],
                where: {
                    isRead: false,
                    senderRole: 'patient'
                },
                include: [
                    {
                        model: db.Booking,
                        as: 'bookingData',
                        attributes: [],
                        where: { doctorId },
                        required: true
                    }
                ],
                group: ['bookingId'],
                raw: true
            });

            const byBooking = rows.map(r => ({
                bookingId: r.bookingId,
                unreadCount: Number(r.unreadCount)
            }));
            const total = byBooking.reduce((sum, r) => sum + r.unreadCount, 0);

            resolve({ errCode: 0, data: { total, byBooking } });
        } catch (e) {
            reject(e);
        }
    });
};

module.exports = {
    sendMessage,
    getMessages,
    getUnreadByDoctor
};
