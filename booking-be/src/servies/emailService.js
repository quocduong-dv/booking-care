require('dotenv').config();
import nodemailer from 'nodemailer';
import {
    buildBookingConfirmation,
    buildRemedyEmail,
    defaultFrom
} from './emailTemplates';

const getTransporter = () => nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_APP,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

let sendSimpleEmail = async (dataSend) => {
    const { subject, html } = buildBookingConfirmation({
        lang: dataSend.language,
        patientName: dataSend.patientName,
        time: dataSend.time,
        doctorName: dataSend.doctorName,
        date: dataSend.date,
        redirectLink: dataSend.redirectLink
    });

    try {
        const info = await getTransporter().sendMail({
            from: defaultFrom(),
            to: dataSend.receiverEmail,
            subject,
            html,
            textEncoding: 'base64',
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

let sendAttachment = async (dataSend) => {
    const { subject, html } = buildRemedyEmail({
        lang: dataSend.language,
        patientName: dataSend.patientName,
        doctorName: dataSend.doctorName,
        date: dataSend.date
    });

    const attachments = [];
    if (dataSend.imgBase64) {
        const base64Payload = dataSend.imgBase64.includes('base64,')
            ? dataSend.imgBase64.split('base64,')[1]
            : dataSend.imgBase64;
        attachments.push({
            filename: `remedy-${dataSend.patientId || 'patient'}-${Date.now()}.png`,
            content: base64Payload,
            encoding: 'base64'
        });
    }

    await getTransporter().sendMail({
        from: defaultFrom(),
        to: dataSend.email,
        subject,
        html,
        attachments,
        textEncoding: 'base64',
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
};

module.exports = {
    sendSimpleEmail,
    sendAttachment
};
