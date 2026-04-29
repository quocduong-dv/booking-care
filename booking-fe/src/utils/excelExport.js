import * as XLSX from 'xlsx';

const toCell = (row, col) => {
    const v = typeof col.get === 'function' ? col.get(row) : row[col.key];
    if (v === null || v === undefined) return '';
    return v;
};

export const exportToExcel = (filename, rows, columns, sheetName = 'Sheet1') => {
    if (!rows || rows.length === 0) {
        alert('Khong co du lieu de xuat');
        return;
    }
    const cols = columns || Object.keys(rows[0]).map(k => ({ key: k, label: k }));
    const header = cols.map(c => c.label);
    const body = rows.map(row => cols.map(c => toCell(row, c)));
    const aoa = [header, ...body];

    const ws = XLSX.utils.aoa_to_sheet(aoa);

    const colWidths = cols.map((c, idx) => {
        let max = String(c.label || '').length;
        body.forEach(r => {
            const s = r[idx] === null || r[idx] === undefined ? '' : String(r[idx]);
            if (s.length > max) max = s.length;
        });
        return { wch: Math.min(Math.max(max + 2, 10), 40) };
    });
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const fname = filename.toLowerCase().endsWith('.xlsx') ? filename : `${filename}.xlsx`;
    XLSX.writeFile(wb, fname);
};

export const printTable = (title, rows, columns) => {
    if (!rows || rows.length === 0) {
        alert('Khong co du lieu de in');
        return;
    }
    const cols = columns || Object.keys(rows[0]).map(k => ({ key: k, label: k }));
    const thead = cols.map(c => `<th>${c.label}</th>`).join('');
    const tbody = rows.map(row =>
        '<tr>' + cols.map(c => {
            const v = typeof c.get === 'function' ? c.get(row) : row[c.key];
            return `<td>${v === null || v === undefined ? '' : String(v).replace(/</g, '&lt;')}</td>`;
        }).join('') + '</tr>'
    ).join('');
    const html = `
    <html><head><meta charset="utf-8"><title>${title}</title>
    <style>
    body{font-family:Arial,Helvetica,sans-serif;padding:20px;}
    h2{margin:0 0 16px 0;text-align:center;}
    table{width:100%;border-collapse:collapse;font-size:12px;}
    th,td{border:1px solid #333;padding:6px 8px;text-align:left;}
    th{background:#e5e7eb;}
    .meta{color:#555;font-size:11px;margin-bottom:8px;text-align:right;}
    @media print{.meta{color:#000;}}
    </style></head><body>
    <h2>${title}</h2>
    <div class="meta">Xuat luc: ${new Date().toLocaleString('vi-VN')}</div>
    <table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>
    <script>window.onload=()=>{window.print();}</script>
    </body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
};
