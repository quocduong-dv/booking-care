import paymentService from '../servies/paymentService';

const createPaymentUrl = async (req, res) => {
    try {
        const { bookingId, amount, orderInfo, locale, bankCode } = req.body;
        const ipAddr =
            req.headers['x-forwarded-for'] ||
            req.connection?.remoteAddress ||
            req.socket?.remoteAddress ||
            req.ip ||
            '127.0.0.1';
        const result = await paymentService.createPaymentUrl({
            bookingId,
            amount,
            orderInfo,
            locale,
            bankCode,
            ipAddr
        });
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const vnpayReturn = async (req, res) => {
    try {
        const result = await paymentService.handleVnpayReturn(req.query);
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const vnpayIpn = async (req, res) => {
    try {
        const result = await paymentService.handleVnpayIpn(req.query);
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
    }
};

const getPaymentHistory = async (req, res) => {
    try {
        const { patientId, doctorId, status, from, to, limit } = req.query;
        const result = await paymentService.getPaymentHistory({
            patientId,
            doctorId,
            status,
            from,
            to,
            limit
        });
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const markRefunded = async (req, res) => {
    try {
        const { paymentId } = req.body;
        const result = await paymentService.markPaymentRefunded(paymentId);
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

module.exports = {
    createPaymentUrl,
    vnpayReturn,
    vnpayIpn,
    getPaymentHistory,
    markRefunded
};
