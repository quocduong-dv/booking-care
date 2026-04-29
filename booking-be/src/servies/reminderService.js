import db from '../models/index';
import { Op } from 'sequelize';
import nodemailer from 'nodemailer';
import { buildReminderEmail, defaultFrom } from './emailTemplates';
import notificationService from './notificationService';

const getTransporter = () => nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_APP,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

const formatTomorrowDDMMYYYY = (offset = 1) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${d.getFullYear()}`;
};

const sendPatient24hReminders = async () => {
    const targetDate = formatTomorrowDDMMYYYY(1);
    const bookings = await db.Booking.findAll({
        where: {
            date: targetDate,
            statusId: 'S2',
            reminderSentAt: { [Op.is]: null }
        },
        include: [
            { model: db.User, as: 'patientData', attributes: ['firstName', 'lastName', 'email', 'language'] },
            { model: db.Allcode, as: 'timeTypeDataPatient', attributes: ['valueVi', 'valueEn'] }
        ],
        raw: false
    });

    if (bookings.length === 0) {
        return { sent: 0, skipped: 0, target: targetDate };
    }

    const doctorIds = [...new Set(bookings.map(b => b.doctorId))];
    const doctors = await db.User.findAll({
        where: { id: doctorIds },
        attributes: ['id', 'firstName', 'lastName'],
        raw: true
    });
    const doctorMap = {};
    doctors.forEach(d => {
        doctorMap[d.id] = `${d.lastName || ''} ${d.firstName || ''}`.trim();
    });

    const transporter = getTransporter();
    let sent = 0;
    let skipped = 0;

    for (const b of bookings) {
        const email = b.patientData?.email;
        if (!email) { skipped++; continue; }
        try {
            const lang = b.patientData?.language || 'vi';
            const timeLabel = lang === 'en'
                ? (b.timeTypeDataPatient?.valueEn || b.timeType)
                : (b.timeTypeDataPatient?.valueVi || b.timeType);
            const { subject, html } = buildReminderEmail({
                lang,
                patientName: b.patientData.firstName || (lang === 'en' ? 'there' : 'bạn'),
                doctorName: doctorMap[b.doctorId] || (lang === 'en' ? 'Doctor' : 'Bác sĩ'),
                date: targetDate,
                time: timeLabel
            });
            await transporter.sendMail({
                from: defaultFrom(),
                to: email,
                subject,
                html,
                textEncoding: 'base64',
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
            // reminderSentAt is in DB but not on the Booking model; raw update bypasses that.
            await db.Booking.update(
                { reminderSentAt: new Date() },
                { where: { id: b.id } }
            );
            sent++;
            if (b.patientId) {
                await notificationService.createNotification({
                    userId: b.patientId,
                    type: 'appointment_reminder',
                    title: 'Nhac lich kham ngay mai',
                    body: `Lich hen voi BS ${doctorMap[b.doctorId] || ''} luc ${timeLabel} ngay ${targetDate}`,
                    link: '/patient/history',
                    data: { bookingId: b.id, date: targetDate },
                    roleHint: 'R3'
                });
            }
        } catch (e) {
            console.error('[reminder] failed for booking', b.id, e.message);
            skipped++;
        }
    }

    console.log(`[reminder] patient 24h: ${sent} sent, ${skipped} skipped, target=${targetDate}`);
    return { sent, skipped, target: targetDate };
};

module.exports = {
    sendPatient24hReminders
};
