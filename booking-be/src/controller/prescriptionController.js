import prescriptionService from "../servies/prescriptionService";
import prescriptionPdfService from "../servies/prescriptionPdfService";

// #17
let getAllPrescriptions = async (req, res) => {
    try {
        let infor = await prescriptionService.getAllPrescriptions(
            req.query.doctorId, req.query.patientId, req.query.date
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

// #18
let createPrescription = async (req, res) => {
    try {
        let infor = await prescriptionService.createPrescription(req.body);
        return res.status(200).json(infor)
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server...'
        })
    }
}

// #19
let getPrescriptionDetail = async (req, res) => {
    try {
        let infor = await prescriptionService.getPrescriptionDetail(req.query.id);
        return res.status(200).json(infor)
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server...'
        })
    }
}

// #20
let deletePrescription = async (req, res) => {
    try {
        let infor = await prescriptionService.deletePrescription(req.body.id);
        return res.status(200).json(infor)
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server...'
        })
    }
}

// #21
let getPatientPrescriptionHistory = async (req, res) => {
    try {
        let infor = await prescriptionService.getPatientPrescriptionHistory(req.query.patientId);
        return res.status(200).json(infor)
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server...'
        })
    }
}

// #22
let sendPrescriptionEmail = async (req, res) => {
    try {
        let infor = await prescriptionService.sendPrescriptionEmail(req.body);
        return res.status(200).json(infor)
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server...'
        })
    }
}

let downloadPrescriptionPdf = async (req, res) => {
    try {
        const id = req.query.id || req.params.id;
        if (!id) return res.status(400).send('Missing id');
        await prescriptionPdfService.streamPrescriptionPdf(id, res);
    } catch (e) {
        console.log(e);
        if (!res.headersSent) res.status(500).send('PDF error');
    }
};

module.exports = {
    getAllPrescriptions,
    createPrescription,
    getPrescriptionDetail,
    deletePrescription,
    getPatientPrescriptionHistory,
    sendPrescriptionEmail,
    downloadPrescriptionPdf
}
