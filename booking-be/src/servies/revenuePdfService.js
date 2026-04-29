import PDFDocument from 'pdfkit';
import dashboardService from './dashboardService';

const fmtVnd = (n) => (Number(n) || 0).toLocaleString('vi-VN') + ' VND';

const streamRevenuePdf = async ({ period, startDate, endDate }, res) => {
    const result = await dashboardService.getAllDoctorRevenueSummary(period, startDate, endDate);
    const rows = (result && result.errCode === 0 && result.data) ? result.data : [];

    const doc = new PDFDocument({ size: 'A4', margin: 48 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="revenue-${period || 'custom'}.pdf"`);
    doc.pipe(res);

    doc.fontSize(20).text('BookingCare - Bao cao doanh thu', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#666')
        .text(`Ky: ${period || 'custom'}  |  ${startDate || '-'} -> ${endDate || '-'}`, { align: 'center' });
    doc.fillColor('#000');
    doc.moveDown(1);

    const cols = [
        { label: '#', w: 30 },
        { label: 'Bac si', w: 200 },
        { label: 'So lich', w: 70 },
        { label: 'Hoan thanh', w: 90 },
        { label: 'Doanh thu', w: 110 }
    ];
    const startX = doc.x;
    let y = doc.y;
    doc.fontSize(11).font('Helvetica-Bold');
    let x = startX;
    cols.forEach(c => { doc.text(c.label, x, y, { width: c.w }); x += c.w; });
    y += 18;
    doc.moveTo(startX, y - 2).lineTo(startX + cols.reduce((a, c) => a + c.w, 0), y - 2).stroke();
    doc.font('Helvetica').fontSize(10);

    let totalRevenue = 0;
    let totalBookings = 0;
    rows.forEach((r, i) => {
        const cells = [
            String(i + 1),
            r.doctorName || `#${r.doctorId || ''}`,
            String(r.totalBookings || r.bookingCount || 0),
            String(r.completedBookings || 0),
            fmtVnd(r.revenue || r.totalRevenue || 0)
        ];
        let xc = startX;
        cols.forEach((c, idx) => { doc.text(cells[idx], xc, y, { width: c.w }); xc += c.w; });
        y += 16;
        totalRevenue += Number(r.revenue || r.totalRevenue || 0);
        totalBookings += Number(r.totalBookings || r.bookingCount || 0);
        if (y > 760) { doc.addPage(); y = 48; }
    });

    if (rows.length === 0) {
        doc.text('(Khong co du lieu)', startX, y);
        y += 18;
    }

    doc.moveDown(1);
    doc.y = Math.max(doc.y, y + 16);
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text(`Tong so booking: ${totalBookings}`);
    doc.text(`Tong doanh thu: ${fmtVnd(totalRevenue)}`);

    doc.moveDown(2);
    doc.font('Helvetica').fontSize(9).fillColor('#666');
    doc.text(`Xuat tu BookingCare - ${new Date().toLocaleString('vi-VN')}`, { align: 'right' });

    doc.end();
};

export default { streamRevenuePdf };
