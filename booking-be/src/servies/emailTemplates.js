// Shared, responsive, UTF-8 safe email layout + content builders.
// All email senders (booking confirm, remedy, reminder, doctor-created, follow-up)
// render through renderEmail() so styling and localization stay consistent.

const BRAND_NAME = process.env.EMAIL_BRAND_NAME || 'BookingCare';
const BRAND_COLOR = process.env.EMAIL_BRAND_COLOR || '#0d6efd';
const SUPPORT_EMAIL = process.env.EMAIL_APP || 'support@bookingcare.vn';
const SITE_URL = process.env.SITE_URL || 'https://bookingcare.vn';

const escapeHtml = (value) => {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

const t = (lang, vi, en) => (lang === 'en' ? en : vi);

// Convert a timestamp / DD-MM-YYYY / numeric-string date into a readable label.
const formatDateLabel = (raw, lang = 'vi') => {
    if (!raw && raw !== 0) return '';
    let d;
    const s = String(raw).trim();
    if (/^\d+$/.test(s)) {
        d = new Date(Number(s));
    } else {
        const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
        if (m) {
            d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
        } else {
            const p = Date.parse(s);
            d = isNaN(p) ? null : new Date(p);
        }
    }
    if (!d || isNaN(d.getTime())) return escapeHtml(raw);

    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    if (lang === 'en') {
        const weekdaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return `${weekdaysEn[d.getDay()]}, ${mm}/${dd}/${yyyy}`;
    }
    const weekdaysVi = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return `${weekdaysVi[d.getDay()]}, ${dd}/${mm}/${yyyy}`;
};

// Core layout — inline styles only (email clients ignore <style> blocks).
const renderEmail = ({ lang = 'vi', preheader = '', title, intro, rows = [], cta, note }) => {
    const safeLang = lang === 'en' ? 'en' : 'vi';
    const footerLine = t(safeLang,
        `Email tự động từ ${BRAND_NAME}. Vui lòng không trả lời email này.`,
        `Automated message from ${BRAND_NAME}. Please do not reply to this email.`);
    const supportLine = t(safeLang,
        `Cần hỗ trợ? Liên hệ <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND_COLOR};text-decoration:none;">${SUPPORT_EMAIL}</a>`,
        `Need help? Contact <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND_COLOR};text-decoration:none;">${SUPPORT_EMAIL}</a>`);

    const rowsHtml = rows.map(r => `
        <tr>
            <td style="padding:10px 0;border-bottom:1px solid #eef2f7;font-size:14px;color:#6b7280;width:40%;vertical-align:top;">${escapeHtml(r.label)}</td>
            <td style="padding:10px 0;border-bottom:1px solid #eef2f7;font-size:15px;color:#111827;font-weight:600;">${r.value}</td>
        </tr>
    `).join('');

    const ctaHtml = cta ? `
        <tr><td align="center" style="padding:24px 0 8px;">
            <a href="${escapeHtml(cta.href)}" target="_blank"
               style="display:inline-block;padding:12px 28px;background:${BRAND_COLOR};color:#ffffff;
                      text-decoration:none;border-radius:6px;font-weight:600;font-size:15px;">
                ${escapeHtml(cta.label)}
            </a>
        </td></tr>` : '';

    const noteHtml = note ? `
        <tr><td style="padding:16px 0 0;font-size:13px;color:#6b7280;line-height:1.6;">${note}</td></tr>` : '';

    return `<!DOCTYPE html>
<html lang="${safeLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${escapeHtml(title || BRAND_NAME)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f6fb;padding:24px 12px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
           style="max-width:600px;width:100%;background:#ffffff;border-radius:10px;overflow:hidden;
                  box-shadow:0 2px 8px rgba(16,24,40,0.06);">
      <tr>
        <td style="background:${BRAND_COLOR};padding:20px 28px;color:#ffffff;">
          <div style="font-size:20px;font-weight:700;letter-spacing:0.3px;">${escapeHtml(BRAND_NAME)}</div>
          <div style="font-size:13px;opacity:0.85;margin-top:2px;">${t(safeLang, 'Chăm sóc sức khỏe thông minh', 'Smart healthcare booking')}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:28px;">
          <h1 style="margin:0 0 12px;font-size:20px;color:#111827;font-weight:700;line-height:1.35;">
            ${escapeHtml(title || '')}
          </h1>
          <p style="margin:0 0 18px;font-size:15px;color:#374151;line-height:1.6;">${intro || ''}</p>
          ${rows.length ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="border-top:1px solid #eef2f7;margin-top:4px;">${rowsHtml}</table>` : ''}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${ctaHtml}
            ${noteHtml}
          </table>
        </td>
      </tr>
      <tr>
        <td style="background:#f9fafb;padding:18px 28px;font-size:12px;color:#6b7280;line-height:1.6;border-top:1px solid #eef2f7;">
          <div>${footerLine}</div>
          <div style="margin-top:4px;">${supportLine}</div>
          <div style="margin-top:8px;color:#9ca3af;">
            &copy; ${new Date().getFullYear()} ${escapeHtml(BRAND_NAME)} &middot;
            <a href="${escapeHtml(SITE_URL)}" style="color:#9ca3af;text-decoration:underline;">${escapeHtml(SITE_URL.replace(/^https?:\/\//, ''))}</a>
          </div>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
};

// ---------- Per-email builders ----------

// 1. Booking confirmation (patient-initiated, needs click-to-confirm)
const buildBookingConfirmation = ({ lang, patientName, time, doctorName, date, redirectLink }) => {
    const safeLang = lang === 'en' ? 'en' : 'vi';
    const title = t(safeLang,
        `Xác nhận lịch khám với ${doctorName}`,
        `Confirm your appointment with ${doctorName}`);
    const intro = t(safeLang,
        `Xin chào <b>${escapeHtml(patientName)}</b>,<br>Cảm ơn bạn đã đặt lịch khám qua ${BRAND_NAME}. Vui lòng xác nhận thông tin bên dưới để hoàn tất đặt lịch.`,
        `Hello <b>${escapeHtml(patientName)}</b>,<br>Thank you for booking with ${BRAND_NAME}. Please review and confirm the details below to finalize your appointment.`);
    const rows = [
        { label: t(safeLang, 'Bác sĩ', 'Doctor'), value: escapeHtml(doctorName) },
        { label: t(safeLang, 'Thời gian', 'Time'), value: escapeHtml(time) }
    ];
    if (date) {
        rows.push({ label: t(safeLang, 'Ngày khám', 'Date'), value: escapeHtml(formatDateLabel(date, safeLang)) });
    }
    const cta = redirectLink ? {
        href: redirectLink,
        label: t(safeLang, 'Xác nhận đặt lịch', 'Confirm appointment')
    } : null;
    const note = t(safeLang,
        'Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.',
        'If you did not make this booking, please ignore this email.');
    const subject = t(safeLang,
        `[${BRAND_NAME}] Xác nhận lịch khám với ${doctorName}`,
        `[${BRAND_NAME}] Confirm appointment with ${doctorName}`);
    const preheader = t(safeLang, 'Xác nhận lịch khám của bạn', 'Confirm your appointment');
    return {
        subject,
        html: renderEmail({ lang: safeLang, preheader, title, intro, rows, cta, note })
    };
};

// 2. Remedy / prescription delivery (with attachment)
const buildRemedyEmail = ({ lang, patientName, doctorName, date }) => {
    const safeLang = lang === 'en' ? 'en' : 'vi';
    const title = t(safeLang, 'Đơn thuốc và kết quả khám', 'Your prescription and visit summary');
    const intro = t(safeLang,
        `Xin chào <b>${escapeHtml(patientName || '')}</b>,<br>Bác sĩ đã hoàn tất buổi khám và gửi đơn thuốc kèm theo email này.`,
        `Hello <b>${escapeHtml(patientName || '')}</b>,<br>Your doctor has completed the consultation. The prescription is attached to this email.`);
    const rows = [];
    if (doctorName) rows.push({ label: t(safeLang, 'Bác sĩ', 'Doctor'), value: escapeHtml(doctorName) });
    if (date) rows.push({ label: t(safeLang, 'Ngày khám', 'Visit date'), value: escapeHtml(formatDateLabel(date, safeLang)) });
    const note = t(safeLang,
        'Vui lòng kiểm tra tệp đính kèm để xem chi tiết đơn thuốc. Dùng thuốc theo đúng hướng dẫn của bác sĩ.',
        'Please check the attachment for your prescription. Follow the dosage instructions prescribed by your doctor.');
    const subject = t(safeLang,
        `[${BRAND_NAME}] Đơn thuốc sau buổi khám`,
        `[${BRAND_NAME}] Prescription from your visit`);
    const preheader = t(safeLang, 'Đơn thuốc của bạn đã sẵn sàng', 'Your prescription is ready');
    return {
        subject,
        html: renderEmail({ lang: safeLang, preheader, title, intro, rows, note })
    };
};

// 3. 24h reminder (cron job)
const buildReminderEmail = ({ lang, patientName, doctorName, date, time }) => {
    const safeLang = lang === 'en' ? 'en' : 'vi';
    const title = t(safeLang, 'Nhắc lịch khám ngày mai', 'Reminder: your appointment tomorrow');
    const intro = t(safeLang,
        `Xin chào <b>${escapeHtml(patientName || '')}</b>,<br>Đây là email nhắc bạn về lịch khám sắp tới. Vui lòng đến đúng giờ.`,
        `Hello <b>${escapeHtml(patientName || '')}</b>,<br>This is a reminder for your upcoming appointment. Please arrive on time.`);
    const rows = [
        { label: t(safeLang, 'Bác sĩ', 'Doctor'), value: escapeHtml(doctorName || '') },
        { label: t(safeLang, 'Ngày', 'Date'), value: escapeHtml(formatDateLabel(date, safeLang)) },
        { label: t(safeLang, 'Giờ', 'Time'), value: escapeHtml(time || '') }
    ];
    const note = t(safeLang,
        'Nếu bạn không thể tham dự, vui lòng huỷ lịch qua trang Lịch sử khám để bác sĩ sắp xếp khung giờ khác.',
        'If you cannot attend, please cancel via your appointment history so the doctor can offer your slot to another patient.');
    const subject = t(safeLang,
        `[${BRAND_NAME}] Nhắc lịch khám ${formatDateLabel(date, safeLang)}`,
        `[${BRAND_NAME}] Appointment reminder for ${formatDateLabel(date, safeLang)}`);
    const preheader = t(safeLang, 'Nhắc lịch khám sắp tới', 'Upcoming appointment reminder');
    return {
        subject,
        html: renderEmail({ lang: safeLang, preheader, title, intro, rows, note })
    };
};

// 4. Doctor-created appointment (doctor books for patient)
const buildDoctorCreatedEmail = ({ lang, patientName, doctorName, date, timeLabel, reason }) => {
    const safeLang = lang === 'en' ? 'en' : 'vi';
    const title = t(safeLang, 'Bạn có lịch khám mới', 'A new appointment has been scheduled');
    const intro = t(safeLang,
        `Xin chào <b>${escapeHtml(patientName || '')}</b>,<br>Bác sĩ <b>${escapeHtml(doctorName || '')}</b> đã tạo lịch khám cho bạn trên ${BRAND_NAME}.`,
        `Hello <b>${escapeHtml(patientName || '')}</b>,<br>Dr. <b>${escapeHtml(doctorName || '')}</b> has scheduled an appointment for you on ${BRAND_NAME}.`);
    const rows = [
        { label: t(safeLang, 'Bác sĩ', 'Doctor'), value: escapeHtml(doctorName || '') },
        { label: t(safeLang, 'Ngày', 'Date'), value: escapeHtml(formatDateLabel(date, safeLang)) },
        { label: t(safeLang, 'Giờ', 'Time'), value: escapeHtml(timeLabel || '') }
    ];
    if (reason) rows.push({ label: t(safeLang, 'Lý do khám', 'Reason'), value: escapeHtml(reason) });
    const note = t(safeLang,
        'Lịch hẹn đã được xác nhận. Nếu không thể tham dự, vui lòng liên hệ lại với bác sĩ hoặc huỷ lịch qua trang cá nhân.',
        'Your appointment is confirmed. If you cannot attend, please contact the doctor or cancel from your account.');
    const subject = t(safeLang,
        `[${BRAND_NAME}] Lịch khám mới với bác sĩ ${doctorName}`,
        `[${BRAND_NAME}] New appointment with Dr. ${doctorName}`);
    const preheader = t(safeLang, 'Lịch khám mới đã được tạo', 'A new appointment has been created');
    return {
        subject,
        html: renderEmail({ lang: safeLang, preheader, title, intro, rows, note })
    };
};

// 5. Follow-up reminder
const buildFollowUpEmail = ({ lang, patientName, followUpDate }) => {
    const safeLang = lang === 'en' ? 'en' : 'vi';
    const title = t(safeLang, 'Nhắc lịch tái khám', 'Follow-up appointment reminder');
    const intro = t(safeLang,
        `Xin chào <b>${escapeHtml(patientName || '')}</b>,<br>Đây là email nhắc lịch tái khám của bạn trên ${BRAND_NAME}.`,
        `Hello <b>${escapeHtml(patientName || '')}</b>,<br>This is a reminder for your follow-up appointment on ${BRAND_NAME}.`);
    const rows = [
        { label: t(safeLang, 'Ngày tái khám', 'Follow-up date'), value: escapeHtml(formatDateLabel(followUpDate, safeLang)) }
    ];
    const note = t(safeLang,
        'Vui lòng đến đúng giờ. Nếu cần thay đổi lịch, hãy liên hệ với bác sĩ qua ứng dụng.',
        'Please arrive on time. Contact your doctor through the app if you need to reschedule.');
    const subject = t(safeLang,
        `[${BRAND_NAME}] Nhắc lịch tái khám`,
        `[${BRAND_NAME}] Follow-up appointment reminder`);
    const preheader = t(safeLang, 'Nhắc lịch tái khám sắp tới', 'Upcoming follow-up reminder');
    return {
        subject,
        html: renderEmail({ lang: safeLang, preheader, title, intro, rows, note })
    };
};

// 6. Prescription email (full detail with medicine table)
const buildPrescriptionEmail = ({ lang, prescription }) => {
    const safeLang = lang === 'en' ? 'en' : 'vi';
    const patientName = prescription.patientName || '';
    const doctorName = prescription.doctorData
        ? `${prescription.doctorData.lastName || ''} ${prescription.doctorData.firstName || ''}`.trim()
        : '';
    const medicines = prescription.medicines || [];

    const title = t(safeLang,
        `Đơn thuốc từ bác sĩ ${doctorName}`,
        `Prescription from Dr. ${doctorName}`);
    const intro = t(safeLang,
        `Xin chào <b>${escapeHtml(patientName)}</b>,<br>Bác sĩ đã kê đơn thuốc cho bạn sau buổi khám. Vui lòng xem chi tiết bên dưới và dùng thuốc theo đúng hướng dẫn.`,
        `Hello <b>${escapeHtml(patientName)}</b>,<br>Your doctor has issued the following prescription. Please follow the dosage instructions carefully.`);

    const rows = [
        { label: t(safeLang, 'Bệnh nhân', 'Patient'), value: escapeHtml(patientName) },
        { label: t(safeLang, 'Bác sĩ', 'Doctor'), value: escapeHtml(doctorName) },
        { label: t(safeLang, 'Ngày kê đơn', 'Issue date'), value: escapeHtml(formatDateLabel(prescription.date, safeLang)) }
    ];
    if (prescription.diagnosis) {
        rows.push({ label: t(safeLang, 'Chẩn đoán', 'Diagnosis'), value: escapeHtml(prescription.diagnosis) });
    }

    const medicineRows = medicines.map((m, i) => `
        <tr>
            <td style="padding:8px;border-bottom:1px solid #eef2f7;font-size:14px;color:#374151;text-align:center;">${i + 1}</td>
            <td style="padding:8px;border-bottom:1px solid #eef2f7;font-size:14px;color:#111827;font-weight:600;">${escapeHtml(m.name || '')}</td>
            <td style="padding:8px;border-bottom:1px solid #eef2f7;font-size:14px;color:#374151;">${escapeHtml(m.dosage || '')}</td>
            <td style="padding:8px;border-bottom:1px solid #eef2f7;font-size:14px;color:#374151;">${escapeHtml(m.usage || '')}</td>
            <td style="padding:8px;border-bottom:1px solid #eef2f7;font-size:14px;color:#374151;text-align:center;">${escapeHtml(String(m.quantity || ''))} ${escapeHtml(m.unit || '')}</td>
        </tr>`).join('');

    const medicineTable = `
        <div style="margin-top:18px;font-size:15px;color:#111827;font-weight:700;">${t(safeLang, 'Danh sách thuốc', 'Medicines')}</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
               style="margin-top:8px;border-collapse:collapse;border:1px solid #eef2f7;">
            <tr style="background:#f9fafb;">
                <th style="padding:8px;border-bottom:1px solid #eef2f7;font-size:13px;color:#6b7280;text-align:center;width:40px;">#</th>
                <th style="padding:8px;border-bottom:1px solid #eef2f7;font-size:13px;color:#6b7280;text-align:left;">${t(safeLang, 'Tên thuốc', 'Medicine')}</th>
                <th style="padding:8px;border-bottom:1px solid #eef2f7;font-size:13px;color:#6b7280;text-align:left;">${t(safeLang, 'Liều dùng', 'Dosage')}</th>
                <th style="padding:8px;border-bottom:1px solid #eef2f7;font-size:13px;color:#6b7280;text-align:left;">${t(safeLang, 'Cách dùng', 'Usage')}</th>
                <th style="padding:8px;border-bottom:1px solid #eef2f7;font-size:13px;color:#6b7280;text-align:center;">${t(safeLang, 'Số lượng', 'Qty')}</th>
            </tr>
            ${medicineRows || `<tr><td colspan="5" style="padding:12px;text-align:center;color:#6b7280;">${t(safeLang, 'Không có thuốc', 'No medicines')}</td></tr>`}
        </table>`;

    const noteBlock = prescription.note
        ? `<div style="margin-top:14px;padding:10px 12px;background:#fffbe6;border-left:3px solid #f59e0b;border-radius:4px;font-size:14px;color:#92400e;">
             <b>${t(safeLang, 'Ghi chú', 'Note')}:</b> ${escapeHtml(prescription.note)}
           </div>`
        : '';

    const note = `${medicineTable}${noteBlock}
        <div style="margin-top:18px;font-size:13px;color:#6b7280;line-height:1.6;">
            ${t(safeLang,
                'Vui lòng tuân thủ hướng dẫn sử dụng thuốc. Liên hệ bác sĩ nếu có bất kỳ dấu hiệu bất thường nào.',
                'Follow the dosage instructions carefully. Contact your doctor if you notice any adverse effects.')}
        </div>`;

    const subject = t(safeLang,
        `[${BRAND_NAME}] Đơn thuốc từ bác sĩ ${doctorName}`,
        `[${BRAND_NAME}] Prescription from Dr. ${doctorName}`);
    const preheader = t(safeLang, 'Đơn thuốc của bạn', 'Your prescription');

    return {
        subject,
        html: renderEmail({ lang: safeLang, preheader, title, intro, rows, note })
    };
};

const defaultFrom = () => `"${BRAND_NAME}" <${SUPPORT_EMAIL}>`;

module.exports = {
    BRAND_NAME,
    SUPPORT_EMAIL,
    defaultFrom,
    renderEmail,
    formatDateLabel,
    buildBookingConfirmation,
    buildRemedyEmail,
    buildReminderEmail,
    buildDoctorCreatedEmail,
    buildFollowUpEmail,
    buildPrescriptionEmail
};
