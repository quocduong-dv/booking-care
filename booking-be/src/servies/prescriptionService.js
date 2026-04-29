import db from "../models/index";
import nodemailer from 'nodemailer';
import { buildPrescriptionEmail, defaultFrom } from './emailTemplates';
require('dotenv').config();

// #17 - Danh sách đơn thuốc
let getAllPrescriptions = (doctorId, patientId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            let whereClause = {};
            if (doctorId) whereClause.doctorId = doctorId;
            if (patientId) whereClause.patientId = patientId;
            if (date) whereClause.date = date;

            let data = await db.Prescription.findAll({
                where: whereClause,
                include: [
                    {
                        model: db.PrescriptionDetail, as: 'medicines',
                        attributes: ['name', 'dosage', 'usage', 'quantity', 'unit']
                    },
                    {
                        model: db.User, as: 'doctorData',
                        attributes: ['firstName', 'lastName']
                    }
                ],
                order: [['createdAt', 'DESC']],
                raw: false
            });

            let result = data.map(item => {
                let plain = item.get({ plain: true });
                return {
                    id: plain.id,
                    date: plain.date,
                    patientName: plain.patientName,
                    doctorName: plain.doctorData
                        ? `${plain.doctorData.lastName || ''} ${plain.doctorData.firstName || ''}`.trim()
                        : '',
                    diagnosis: plain.diagnosis,
                    medicineCount: plain.medicines ? plain.medicines.length : 0,
                    medicines: plain.medicines || [],
                    note: plain.note
                };
            });

            resolve({
                errCode: 0,
                errMessage: 'ok',
                data: result
            })
        } catch (e) {
            reject(e);
        }
    })
}

// #18 - Tạo đơn thuốc
let createPrescription = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.doctorId || !data.patientName || !data.diagnosis || !data.date) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter'
                })
            } else {
                let prescription = await db.Prescription.create({
                    doctorId: data.doctorId,
                    patientId: data.patientId || null,
                    patientName: data.patientName,
                    patientEmail: data.patientEmail,
                    patientPhone: data.patientPhone,
                    diagnosis: data.diagnosis,
                    note: data.note,
                    date: data.date
                });

                if (data.medicines && data.medicines.length > 0) {
                    let medicineData = data.medicines.map(med => ({
                        prescriptionId: prescription.id,
                        name: med.name,
                        dosage: med.dosage,
                        usage: med.usage,
                        quantity: med.quantity,
                        unit: med.unit
                    }));
                    await db.PrescriptionDetail.bulkCreate(medicineData);
                }

                resolve({
                    errCode: 0,
                    errMessage: 'Create prescription succeed!'
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

// #19 - Chi tiết 1 đơn thuốc
let getPrescriptionDetail = (prescriptionId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!prescriptionId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter: id'
                })
            } else {
                let data = await db.Prescription.findOne({
                    where: { id: prescriptionId },
                    include: [
                        {
                            model: db.PrescriptionDetail, as: 'medicines',
                            attributes: ['name', 'dosage', 'usage', 'quantity', 'unit']
                        },
                        {
                            model: db.User, as: 'doctorData',
                            attributes: ['firstName', 'lastName']
                        }
                    ],
                    raw: false
                });

                if (data) {
                    resolve({
                        errCode: 0,
                        errMessage: 'ok',
                        data: data.get({ plain: true })
                    })
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: 'Prescription not found!'
                    })
                }
            }
        } catch (e) {
            reject(e);
        }
    })
}

// #20 - Xóa đơn thuốc
let deletePrescription = (prescriptionId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!prescriptionId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter: id'
                })
            } else {
                let prescription = await db.Prescription.findOne({
                    where: { id: prescriptionId }
                })
                if (prescription) {
                    await db.PrescriptionDetail.destroy({
                        where: { prescriptionId: prescriptionId }
                    });
                    await db.Prescription.destroy({
                        where: { id: prescriptionId }
                    });
                    resolve({
                        errCode: 0,
                        errMessage: 'Delete prescription succeed!'
                    })
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: 'Prescription not found!'
                    })
                }
            }
        } catch (e) {
            reject(e);
        }
    })
}

// #21 - Lịch sử đơn thuốc bệnh nhân
let getPatientPrescriptionHistory = (patientId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!patientId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter: patientId'
                })
            } else {
                let data = await db.Prescription.findAll({
                    where: { patientId: patientId },
                    include: [
                        {
                            model: db.PrescriptionDetail, as: 'medicines',
                            attributes: ['name', 'dosage', 'usage', 'quantity', 'unit']
                        },
                        {
                            model: db.User, as: 'doctorData',
                            attributes: ['firstName', 'lastName']
                        }
                    ],
                    order: [['date', 'DESC']],
                    raw: false
                });

                let result = data.map(item => {
                    let plain = item.get({ plain: true });
                    return {
                        date: plain.date,
                        doctorName: plain.doctorData
                            ? `${plain.doctorData.lastName || ''} ${plain.doctorData.firstName || ''}`.trim()
                            : '',
                        diagnosis: plain.diagnosis,
                        medicines: plain.medicines || []
                    };
                });

                resolve({
                    errCode: 0,
                    errMessage: 'ok',
                    data: result
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

// #22 - Gui don thuoc qua email cho benh nhan
let sendPrescriptionEmail = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { prescriptionId, language } = data || {};
            if (!prescriptionId) {
                return resolve({ errCode: 1, errMessage: 'Missing prescriptionId' });
            }

            const prescription = await db.Prescription.findOne({
                where: { id: prescriptionId },
                include: [
                    {
                        model: db.PrescriptionDetail, as: 'medicines',
                        attributes: ['name', 'dosage', 'usage', 'quantity', 'unit']
                    },
                    {
                        model: db.User, as: 'doctorData',
                        attributes: ['firstName', 'lastName']
                    }
                ],
                raw: false
            });
            if (!prescription) {
                return resolve({ errCode: 2, errMessage: 'Prescription not found' });
            }
            const plain = prescription.get({ plain: true });

            let targetEmail = plain.patientEmail;
            if (!targetEmail && plain.patientId) {
                const patient = await db.User.findOne({
                    where: { id: plain.patientId }, attributes: ['email'], raw: true
                });
                targetEmail = patient ? patient.email : null;
            }
            if (!targetEmail) {
                return resolve({ errCode: 3, errMessage: 'Benh nhan khong co email' });
            }

            const { subject, html } = buildPrescriptionEmail({
                lang: language === 'en' ? 'en' : 'vi',
                prescription: plain
            });

            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: { user: process.env.EMAIL_APP, pass: process.env.EMAIL_APP_PASSWORD }
            });

            await transporter.sendMail({
                from: defaultFrom(),
                to: targetEmail,
                subject,
                html,
                textEncoding: 'base64',
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });

            resolve({ errCode: 0, errMessage: 'Sent', to: targetEmail });
        } catch (e) {
            reject(e);
        }
    });
};

module.exports = {
    getAllPrescriptions,
    createPrescription,
    getPrescriptionDetail,
    deletePrescription,
    getPatientPrescriptionHistory,
    sendPrescriptionEmail
}
