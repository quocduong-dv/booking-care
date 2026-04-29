import appointmentService from "../servies/appointmentService";

// #7
let getAllAppointments = async (req, res) => {
    try {
        let infor = await appointmentService.getAllAppointments(
            req.query.date, req.query.doctorId, req.query.statusId,
            {
                q: req.query.q,
                dateFrom: req.query.dateFrom,
                dateTo: req.query.dateTo,
                paymentStatus: req.query.paymentStatus
            }
        );
        return res.status(200).json(infor)
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server...'
        })
    }
}

// #8
let updateAppointmentStatus = async (req, res) => {
    try {
        let infor = await appointmentService.updateAppointmentStatus(req.body);
        return res.status(200).json(infor)
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server...'
        })
    }
}

// #9
let getFollowUpAppointments = async (req, res) => {
    try {
        let infor = await appointmentService.getFollowUpAppointments(
            req.query.date, req.query.doctorId
        );
        return res.status(200).json(infor)
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server...'
        })
    }
}

// #10
let createFollowUpAppointment = async (req, res) => {
    try {
        let infor = await appointmentService.createFollowUpAppointment(req.body);
        return res.status(200).json(infor)
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server...'
        })
    }
}

// #11
let sendFollowUpReminder = async (req, res) => {
    try {
        let infor = await appointmentService.sendFollowUpReminder(req.body);
        return res.status(200).json(infor)
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server...'
        })
    }
}

// #12 - Doctor/Admin creates appointment directly (no OTP), auto-email patient
let doctorCreateAppointment = async (req, res) => {
    try {
        const body = { ...req.body };
        if (req.user?.roleId === 'R2') {
            body.doctorId = req.user.id;
        }
        const result = await appointmentService.doctorCreateAppointment(body);
        return res.status(200).json(result);
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server...'
        })
    }
}

let markNoShow = async (req, res) => {
    try {
        const result = await appointmentService.markNoShow(req.body || {});
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from the server...' });
    }
};

let getNoShowStats = async (req, res) => {
    try {
        const result = await appointmentService.getNoShowStats({
            period: req.query.period,
            startDate: req.query.startDate,
            endDate: req.query.endDate
        });
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from the server...' });
    }
};

module.exports = {
    getAllAppointments,
    updateAppointmentStatus,
    getFollowUpAppointments,
    createFollowUpAppointment,
    sendFollowUpReminder,
    doctorCreateAppointment,
    markNoShow,
    getNoShowStats
}
