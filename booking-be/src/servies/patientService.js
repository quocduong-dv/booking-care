import { reject } from "lodash";
import db from "../models/index";
require('dotenv').config();
import emailService from './emailService';
import { v4 as uuidv4 } from 'uuid';
import { emitToAdmin, emitToDoctor, emitToPatient } from '../socket';
import notificationService from './notificationService';
import voucherService from './voucherService';

let buildUrlEmail = (doctorId, token) => {


    let result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`
    return result;
}

let getDoctorPrice = async (doctorId) => {
    try {
        let doctorInfor = await db.Doctor_Infor.findOne({
            where: { doctorId: doctorId },
            attributes: ['priceId'],
            include: [
                { model: db.Allcode, as: 'priceTypeData', attributes: ['valueVi', 'valueEn'] }
            ],
            raw: false,
            nest: true
        });
        if (doctorInfor && doctorInfor.priceTypeData && doctorInfor.priceTypeData.valueVi) {
            let parsed = parseInt(doctorInfor.priceTypeData.valueVi);
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    } catch (e) {
        return 0;
    }
}

let postBookAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email || !data.doctorId || !data.timeType || !data.date || !data.fullName
                || !data.selectedGender || !data.address) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })

            } else {
                let token = uuidv4();
                let baseAmount = await getDoctorPrice(data.doctorId);
                let discountAmount = 0;
                let voucherCode = null;
                if (data.voucherCode) {
                    const v = await voucherService.validateVoucher({ code: data.voucherCode, amount: baseAmount });
                    if (v.errCode === 0) {
                        discountAmount = v.discount;
                        voucherCode = String(data.voucherCode).trim().toUpperCase();
                    }
                }
                let amount = Math.max(0, baseAmount - discountAmount);
                let paymentMethod = data.paymentMethod === 'vnpay' ? 'vnpay' : 'cash';
                let paymentStatus = 'pending';

                await emailService.sendSimpleEmail({
                    receiverEmail: data.email,
                    patientName: data.fullName,
                    time: data.timeOnly || data.timeString,
                    date: data.date,
                    doctorName: data.doctorName,
                    language: data.language,
                    redirectLink: buildUrlEmail(data.doctorId, token)
                })
                //upsert patient
                const patientLang = data.language === 'en' ? 'en' : 'vi';
                let user = await db.User.findOrCreate({
                    where: { email: data.email },
                    defaults: {
                        email: data.email,
                        roleId: 'R3',
                        gender: data.selectedGender,
                        address: data.address,
                        firstName: data.fullName,
                        phonenumber: data.phoneNumber,
                        language: patientLang
                    },
                });
                if (user && user[0] && user[0].language !== patientLang) {
                    user[0].language = patientLang;
                    await user[0].save();
                }
                //create a booking record
                let bookingId = null;
                if (user && user[0]) {
                    let [bookingRecord] = await db.Booking.findOrCreate({
                        where: {
                            patientId: user[0].id,
                            date: data.date,
                            timeType: data.timeType,
                            doctorId: data.doctorId
                        },
                        defaults: {
                            statusId: 'S1',
                            doctorId: data.doctorId,
                            patientId: user[0].id,
                            date: data.date,
                            timeType: data.timeType,
                            token: token,
                            amount: amount,
                            paymentStatus: paymentStatus,
                            paymentMethod: paymentMethod,
                            reason: data.reason || null,
                            phoneNumber: data.phoneNumber || null,
                            birthday: data.birthday ? String(data.birthday) : null,
                            voucherCode: voucherCode,
                            discountAmount: discountAmount,
                            insuranceNumber: data.insuranceNumber || null
                        },
                    })
                    bookingId = bookingRecord ? bookingRecord.id : null;
                    if (bookingId && voucherCode) {
                        try { await voucherService.consumeVoucher(voucherCode); } catch (e) { }
                    }
                }
                if (bookingId) {
                    const payload = {
                        bookingId,
                        doctorId: data.doctorId,
                        patientName: data.fullName,
                        date: data.date,
                        timeType: data.timeType,
                        amount,
                        paymentMethod,
                        createdAt: new Date()
                    };
                    emitToAdmin('booking:new', payload);
                    emitToDoctor(data.doctorId, 'booking:new', payload);

                    notificationService.createNotification({
                        userId: data.doctorId,
                        type: 'booking_new',
                        title: 'Lich hen moi',
                        body: `BN ${data.fullName} - ${data.date} ${data.timeType}`,
                        link: '/doctor/manage-patient',
                        data: { bookingId, date: data.date, timeType: data.timeType },
                        roleHint: 'R2'
                    });
                    notificationService.notifyAllAdmins({
                        type: 'booking_new',
                        title: 'Lich dat moi',
                        body: `${data.fullName} - ${data.date} ${data.timeType}`,
                        link: '/system/manage-appointment',
                        data: { bookingId }
                    });
                }
                resolve({
                    errCode: 0,
                    errMessage: 'Save infor doctor succeed!',
                    bookingId: bookingId,
                    amount: amount,
                    baseAmount: baseAmount,
                    discountAmount: discountAmount,
                    voucherCode: voucherCode,
                    paymentMethod: paymentMethod
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}
let postVerifyBookAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.token || !data.doctorId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                let appointment = await db.Booking.findOne({
                    where: {
                        doctorId: data.doctorId,
                        token: data.token,
                        statusId: 'S1'
                    },
                    raw: false
                })
                if (appointment) {
                    appointment.statusId = 'S2';
                    await appointment.save();
                    emitToAdmin('booking:statusChanged', { bookingId: appointment.id, statusId: 'S2' });
                    emitToDoctor(appointment.doctorId, 'booking:statusChanged', { bookingId: appointment.id, statusId: 'S2' });
                    emitToPatient(appointment.patientId, 'booking:statusChanged', { bookingId: appointment.id, statusId: 'S2' });

                    if (appointment.patientId) {
                        notificationService.createNotification({
                            userId: appointment.patientId,
                            type: 'booking_status',
                            title: 'Lich hen da xac nhan',
                            body: `Lich hen #${appointment.id} da duoc xac nhan`,
                            link: '/patient/history',
                            data: { bookingId: appointment.id, statusId: 'S2' },
                            roleHint: 'R3'
                        });
                    }
                    resolve({
                        errCode: 0,
                        errMessage: "Update the appointment succeed !"
                    })
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: "Appointment has been activated or does not exits "
                    })


                }
            }
        } catch (e) {
            reject(e)
        }
    })
}
module.exports = {
    postBookAppointment: postBookAppointment,
    postVerifyBookAppointment: postVerifyBookAppointment
}