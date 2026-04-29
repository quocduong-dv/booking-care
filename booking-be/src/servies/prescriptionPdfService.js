import PDFDocument from 'pdfkit';
import db from '../models/index';

// Streams a PDF of a prescription to the given response. Uses built-in Helvetica
// (so Vietnamese diacritics may render as boxes). Keep text ASCII-safe where possible.
const streamPrescriptionPdf = async (prescriptionId, res) => {
    const rec = await db.Prescription.findOne({
        where: { id: prescriptionId },
        include: [
            { model: db.PrescriptionDetail, as: 'medicines', attributes: ['name', 'dosage', 'usage', 'quantity', 'unit'] },
            { model: db.User, as: 'doctorData', attributes: ['firstName', 'lastName', 'email'] }
        ],
        raw: false
    });
    if (!rec) {
        res.status(404).send('Prescription not found');
        return;
    }
    const data = rec.get({ plain: true });
    const doctorName = data.doctorData
        ? `${data.doctorData.lastName || ''} ${data.doctorData.firstName || ''}`.trim()
        : '';

    const doc = new PDFDocument({ size: 'A4', margin: 48 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="prescription-${data.id}.pdf"`);
    doc.pipe(res);

    doc.fontSize(20).text('BookingCare - Don thuoc dien tu', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#666').text(`Ma don: ${data.id}`, { align: 'center' });
    doc.fillColor('#000');
    doc.moveDown(1);

    const row = (label, value) => {
        doc.fontSize(11).font('Helvetica-Bold').text(label, { continued: true });
        doc.font('Helvetica').text(`  ${value || '-'}`);
    };
    row('Ngay ke don:', data.date || new Date(data.createdAt).toLocaleDateString('vi-VN'));
    row('Bac si:', doctorName);
    row('Benh nhan:', data.patientName || '-');
    row('Chan doan:', data.diagnosis || '-');
    doc.moveDown(0.8);

    doc.fontSize(13).font('Helvetica-Bold').text('Danh sach thuoc');
    doc.moveDown(0.3);

    const startX = doc.x;
    const cols = [
        { label: '#', w: 30 },
        { label: 'Ten thuoc', w: 170 },
        { label: 'Lieu', w: 70 },
        { label: 'Cach dung', w: 130 },
        { label: 'SL', w: 40 },
        { label: 'DV', w: 60 }
    ];
    let y = doc.y;
    doc.fontSize(10).font('Helvetica-Bold');
    let x = startX;
    cols.forEach(c => { doc.text(c.label, x, y, { width: c.w }); x += c.w; });
    y += 16;
    doc.moveTo(startX, y - 2).lineTo(startX + cols.reduce((a, c) => a + c.w, 0), y - 2).stroke();
    doc.font('Helvetica');
    const meds = data.medicines || [];
    if (meds.length === 0) {
        doc.text('(Khong co thuoc)', startX, y);
        y += 14;
    } else {
        meds.forEach((m, i) => {
            let xc = startX;
            const cells = [
                String(i + 1),
                m.name || '',
                m.dosage || '',
                m.usage || '',
                String(m.quantity || ''),
                m.unit || ''
            ];
            cols.forEach((c, idx) => { doc.text(cells[idx], xc, y, { width: c.w }); xc += c.w; });
            y += 18;
        });
    }
    doc.y = y;
    doc.moveDown(1);

    if (data.note) {
        doc.fontSize(11).font('Helvetica-Bold').text('Ghi chu:');
        doc.font('Helvetica').text(data.note);
        doc.moveDown(0.5);
    }

    doc.moveDown(2);
    doc.fontSize(10).fillColor('#666');
    doc.text(`Xuat tu BookingCare - ${new Date().toLocaleString('vi-VN')}`, { align: 'right' });

    doc.end();
};

export default { streamPrescriptionPdf };
