import db from '../models/index';
import crypto from 'crypto';
import { emitToAdmin, emitToDoctor, emitToPatient, emitToBooking } from '../socket';
import notificationService from './notificationService';
require('dotenv').config();

const notifyPaymentSuccess = (booking, payment) => {
    if (!booking) return;
    const amountText = `${Number(payment?.amount || 0).toLocaleString('vi-VN')} VND`;
    if (booking.patientId) {
        notificationService.createNotification({
            userId: booking.patientId,
            type: 'payment_success',
            title: 'Thanh toan thanh cong',
            body: `Lich hen #${booking.id} - ${amountText}`,
            link: '/patient/history',
            data: { bookingId: booking.id, paymentId: payment?.id },
            roleHint: 'R3'
        });
    }
    if (booking.doctorId) {
        notificationService.createNotification({
            userId: booking.doctorId,
            type: 'payment_success',
            title: 'Benh nhan da thanh toan',
            body: `Lich #${booking.id} - ${amountText}`,
            data: { bookingId: booking.id, paymentId: payment?.id },
            roleHint: 'R2'
        });
    }
    notificationService.notifyAllAdmins({
        type: 'payment_success',
        title: 'Thanh toan thanh cong',
        body: `Lich #${booking.id} - ${amountText}`,
        data: { bookingId: booking.id, paymentId: payment?.id }
    });
};

const stringifyNoEncode = (obj) => {
    return Object.keys(obj)
        .map((k) => `${k}=${obj[k]}`)
        .join('&');
};

const VNP_TMN_CODE = process.env.VNP_TMN_CODE || '';
const VNP_HASH_SECRET = process.env.VNP_HASH_SECRET || '';
const VNP_URL = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const VNP_RETURN_URL = process.env.VNP_RETURN_URL || `${process.env.URL_REACT}/payment/vnpay-return`;
const VNP_VERSION = '2.1.0';
const VNP_COMMAND = 'pay';
const VNP_CURR_CODE = 'VND';
const VNP_LOCALE_DEFAULT = 'vn';

const sortObject = (obj) => {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
        sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
    }
    return sorted;
};

const formatVnpDate = (date) => {
    const pad = (n) => (n < 10 ? '0' + n : '' + n);
    return (
        date.getFullYear().toString() +
        pad(date.getMonth() + 1) +
        pad(date.getDate()) +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds())
    );
};

const createPaymentUrl = ({ bookingId, amount, ipAddr, orderInfo, locale, bankCode }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!bookingId || !amount || amount <= 0) {
                return resolve({ errCode: 1, errMessage: 'Missing bookingId or invalid amount' });
            }
            if (!VNP_TMN_CODE || !VNP_HASH_SECRET) {
                return resolve({ errCode: 2, errMessage: 'VNPay credentials are not configured (VNP_TMN_CODE / VNP_HASH_SECRET)' });
            }

            const createDate = formatVnpDate(new Date());
            const txnRef = `${bookingId}-${Date.now()}`;

            let vnp_Params = {
                vnp_Version: VNP_VERSION,
                vnp_Command: VNP_COMMAND,
                vnp_TmnCode: VNP_TMN_CODE,
                vnp_Locale: locale || VNP_LOCALE_DEFAULT,
                vnp_CurrCode: VNP_CURR_CODE,
                vnp_TxnRef: txnRef,
                vnp_OrderInfo: orderInfo || `Thanh toan lich kham #${bookingId}`,
                vnp_OrderType: 'other',
                vnp_Amount: Math.round(Number(amount)) * 100,
                vnp_ReturnUrl: VNP_RETURN_URL,
                vnp_IpAddr: ipAddr || '127.0.0.1',
                vnp_CreateDate: createDate
            };
            if (bankCode) vnp_Params.vnp_BankCode = bankCode;

            vnp_Params = sortObject(vnp_Params);
            const signData = stringifyNoEncode(vnp_Params);
            const hmac = crypto.createHmac('sha512', VNP_HASH_SECRET);
            const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
            vnp_Params.vnp_SecureHash = signed;
            const paymentUrl = `${VNP_URL}?${stringifyNoEncode(vnp_Params)}`;

            const payment = await db.Payment.create({
                bookingId,
                amount,
                currency: VNP_CURR_CODE,
                method: 'vnpay',
                status: 'pending',
                txnRef,
                paymentUrl
            });

            resolve({ errCode: 0, paymentUrl, txnRef, paymentId: payment.id });
        } catch (e) {
            reject(e);
        }
    });
};

const verifyVnpayParams = (vnp_Params) => {
    const params = { ...vnp_Params };
    const secureHash = params.vnp_SecureHash;
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;
    const sorted = sortObject(params);
    const signData = stringifyNoEncode(sorted);
    const hmac = crypto.createHmac('sha512', VNP_HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    return secureHash === signed;
};

const handleVnpayReturn = (vnp_Params) => {
    return new Promise(async (resolve, reject) => {
        try {
            const isValid = verifyVnpayParams(vnp_Params);
            if (!isValid) {
                return resolve({ errCode: 97, errMessage: 'Invalid signature' });
            }
            const txnRef = vnp_Params.vnp_TxnRef;
            const responseCode = vnp_Params.vnp_ResponseCode;
            const transactionNo = vnp_Params.vnp_TransactionNo;
            const bankCode = vnp_Params.vnp_BankCode;

            const payment = await db.Payment.findOne({ where: { txnRef }, raw: false });
            if (!payment) {
                return resolve({ errCode: 1, errMessage: 'Payment not found' });
            }

            if (responseCode === '00') {
                payment.status = 'success';
                payment.transactionId = transactionNo || null;
                payment.bankCode = bankCode || null;
                payment.responseCode = responseCode;
                payment.paidAt = new Date();
                payment.rawResponse = JSON.stringify(vnp_Params);
                await payment.save();

                const booking = await db.Booking.findOne({ where: { id: payment.bookingId }, raw: true });
                if (booking) {
                    const nextStatusId = booking.statusId === 'S1' ? 'S2' : booking.statusId;
                    await db.Booking.update(
                        { paymentStatus: 'paid', paymentMethod: 'vnpay', statusId: nextStatusId },
                        { where: { id: booking.id } }
                    );
                    booking.paymentStatus = 'paid';
                    booking.paymentMethod = 'vnpay';
                    booking.statusId = nextStatusId;
                    const eventPayload = {
                        paymentId: payment.id,
                        bookingId: booking.id,
                        doctorId: booking.doctorId,
                        amount: Number(payment.amount),
                        transactionId: payment.transactionId,
                        paidAt: payment.paidAt
                    };
                    emitToAdmin('payment:success', eventPayload);
                    emitToDoctor(booking.doctorId, 'payment:success', eventPayload);
                    emitToPatient(booking.patientId, 'payment:success', eventPayload);
                    emitToBooking(booking.id, 'booking:statusChanged', { bookingId: booking.id, statusId: booking.statusId, paymentStatus: 'paid' });
                    notifyPaymentSuccess(booking, payment);
                }
                return resolve({ errCode: 0, errMessage: 'Payment success', payment });
            } else {
                payment.status = 'failed';
                payment.responseCode = responseCode;
                payment.rawResponse = JSON.stringify(vnp_Params);
                await payment.save();
                return resolve({ errCode: Number(responseCode) || 99, errMessage: 'Payment failed', payment });
            }
        } catch (e) {
            reject(e);
        }
    });
};

const handleVnpayIpn = (vnp_Params) => {
    return new Promise(async (resolve, reject) => {
        try {
            const isValid = verifyVnpayParams(vnp_Params);
            if (!isValid) {
                return resolve({ RspCode: '97', Message: 'Invalid signature' });
            }
            const txnRef = vnp_Params.vnp_TxnRef;
            const amount = Number(vnp_Params.vnp_Amount) / 100;
            const responseCode = vnp_Params.vnp_ResponseCode;

            const payment = await db.Payment.findOne({ where: { txnRef }, raw: false });
            if (!payment) {
                return resolve({ RspCode: '01', Message: 'Order not found' });
            }
            if (Number(payment.amount) !== amount) {
                return resolve({ RspCode: '04', Message: 'Amount invalid' });
            }
            if (payment.status === 'success') {
                return resolve({ RspCode: '02', Message: 'Order already confirmed' });
            }

            if (responseCode === '00') {
                payment.status = 'success';
                payment.transactionId = vnp_Params.vnp_TransactionNo || null;
                payment.bankCode = vnp_Params.vnp_BankCode || null;
                payment.responseCode = responseCode;
                payment.paidAt = new Date();
                payment.rawResponse = JSON.stringify(vnp_Params);
                await payment.save();

                const booking = await db.Booking.findOne({ where: { id: payment.bookingId }, raw: true });
                if (booking) {
                    const nextStatusId = booking.statusId === 'S1' ? 'S2' : booking.statusId;
                    await db.Booking.update(
                        { paymentStatus: 'paid', paymentMethod: 'vnpay', statusId: nextStatusId },
                        { where: { id: booking.id } }
                    );
                    booking.paymentStatus = 'paid';
                    booking.paymentMethod = 'vnpay';
                    booking.statusId = nextStatusId;
                    const eventPayload = {
                        paymentId: payment.id,
                        bookingId: booking.id,
                        doctorId: booking.doctorId,
                        amount: Number(payment.amount),
                        transactionId: payment.transactionId,
                        paidAt: payment.paidAt
                    };
                    emitToAdmin('payment:success', eventPayload);
                    emitToDoctor(booking.doctorId, 'payment:success', eventPayload);
                    emitToPatient(booking.patientId, 'payment:success', eventPayload);
                    emitToBooking(booking.id, 'booking:statusChanged', { bookingId: booking.id, statusId: booking.statusId, paymentStatus: 'paid' });
                    notifyPaymentSuccess(booking, payment);
                }
            } else {
                payment.status = 'failed';
                payment.responseCode = responseCode;
                payment.rawResponse = JSON.stringify(vnp_Params);
                await payment.save();
            }
            resolve({ RspCode: '00', Message: 'Confirm Success' });
        } catch (e) {
            reject(e);
        }
    });
};

const getPaymentHistory = ({ patientId, doctorId, status, from, to, limit = 100 }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const where = {};
            if (patientId) where.patientId = patientId;
            if (doctorId) where.doctorId = doctorId;
            if (status) where.status = status;
            const payments = await db.Payment.findAll({
                where,
                order: [['createdAt', 'DESC']],
                limit: Number(limit) || 100,
                include: [
                    { model: db.Booking, as: 'bookingData' }
                ]
            });
            resolve({ errCode: 0, data: payments });
        } catch (e) {
            reject(e);
        }
    });
};

const markPaymentRefunded = (paymentId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const payment = await db.Payment.findOne({ where: { id: paymentId }, raw: false });
            if (!payment) return resolve({ errCode: 1, errMessage: 'Payment not found' });
            payment.status = 'refunded';
            payment.refundedAt = new Date();
            await payment.save();
            resolve({ errCode: 0, errMessage: 'Marked refunded' });
        } catch (e) {
            reject(e);
        }
    });
};

module.exports = {
    createPaymentUrl,
    handleVnpayReturn,
    handleVnpayIpn,
    getPaymentHistory,
    markPaymentRefunded
};
