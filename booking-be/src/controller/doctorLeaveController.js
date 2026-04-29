import doctorLeaveService from "../servies/doctorLeaveService";

// #22
let getAllDoctorLeaves = async (req, res) => {
    try {
        let infor = await doctorLeaveService.getAllDoctorLeaves(
            req.query.doctorId, req.query.status, req.query.month, req.query.year
        );
        return res.status(200).json(infor)
    } catch (e) {
        console.error('[doctorLeave]', e?.name, '-', e?.message || e)
        return res.status(200).json({ errCode: -1, errMessage: e?.message || 'Error from the server...' })
    }
}

// #23
let createDoctorLeave = async (req, res) => {
    try {
        let infor = await doctorLeaveService.createDoctorLeave(req.body);
        return res.status(200).json(infor)
    } catch (e) {
        console.error('[doctorLeave]', e?.name, '-', e?.message || e)
        return res.status(200).json({ errCode: -1, errMessage: e?.message || 'Error from the server...' })
    }
}

// #24
let approveDoctorLeave = async (req, res) => {
    try {
        let infor = await doctorLeaveService.approveDoctorLeave(req.body.leaveId);
        return res.status(200).json(infor)
    } catch (e) {
        console.error('[doctorLeave]', e?.name, '-', e?.message || e)
        return res.status(200).json({ errCode: -1, errMessage: e?.message || 'Error from the server...' })
    }
}

// #25
let rejectDoctorLeave = async (req, res) => {
    try {
        let infor = await doctorLeaveService.rejectDoctorLeave(req.body.leaveId);
        return res.status(200).json(infor)
    } catch (e) {
        console.error('[doctorLeave]', e?.name, '-', e?.message || e)
        return res.status(200).json({ errCode: -1, errMessage: e?.message || 'Error from the server...' })
    }
}

// #26
let deleteDoctorLeave = async (req, res) => {
    try {
        let infor = await doctorLeaveService.deleteDoctorLeave(req.body.id);
        return res.status(200).json(infor)
    } catch (e) {
        console.error('[doctorLeave]', e?.name, '-', e?.message || e)
        return res.status(200).json({ errCode: -1, errMessage: e?.message || 'Error from the server...' })
    }
}

// #27
let getDoctorWorkSchedule = async (req, res) => {
    try {
        let infor = await doctorLeaveService.getDoctorWorkSchedule(
            req.query.doctorId, req.query.weekStart
        );
        return res.status(200).json(infor)
    } catch (e) {
        console.error('[doctorLeave]', e?.name, '-', e?.message || e)
        return res.status(200).json({ errCode: -1, errMessage: e?.message || 'Error from the server...' })
    }
}

// #28
let saveDoctorWorkSchedule = async (req, res) => {
    try {
        let infor = await doctorLeaveService.saveDoctorWorkSchedule(req.body);
        return res.status(200).json(infor)
    } catch (e) {
        console.error('[doctorLeave]', e?.name, '-', e?.message || e)
        return res.status(200).json({ errCode: -1, errMessage: e?.message || 'Error from the server...' })
    }
}

// #29
let deleteDoctorWorkSchedule = async (req, res) => {
    try {
        let infor = await doctorLeaveService.deleteDoctorWorkSchedule(req.body.id);
        return res.status(200).json(infor)
    } catch (e) {
        console.error('[doctorLeave]', e?.name, '-', e?.message || e)
        return res.status(200).json({ errCode: -1, errMessage: e?.message || 'Error from the server...' })
    }
}

module.exports = {
    getAllDoctorLeaves,
    createDoctorLeave,
    approveDoctorLeave,
    rejectDoctorLeave,
    deleteDoctorLeave,
    getDoctorWorkSchedule,
    saveDoctorWorkSchedule,
    deleteDoctorWorkSchedule
}
