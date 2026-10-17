/**
 * Universal Table Export & Print Utility
 * Supports CSV, Excel, PDF, and Print formatting for any data table
 */

export function exportToCsv({ filename = 'export', columns = [], data = [], renderCell }) {
    if (!data.length) return;

    const headers = columns.map((c) => `"${(c.label || c.key || '').replace(/"/g, '""')}"`).join(',');
    const rows = data.map((item) => {
        return columns
            .map((c) => {
                let val = renderCell ? renderCell(item, c.key) : item[c.key];
                if (val === null || val === undefined) val = '';
                if (typeof val === 'object') {
                    val = String(item[c.key] ?? '');
                }
                val = String(val).replace(/<[^>]*>?/gm, '').replace(/"/g, '""');
                return `"${val}"`;
            })
            .join(',');
    });

    const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function exportToExcel({ filename = 'export', columns = [], data = [], renderCell }) {
    if (!data.length) return;

    let tableHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]>
        <xml>
            <x:ExcelWorkbook>
                <x:ExcelWorksheets>
                    <x:ExcelWorksheet>
                        <x:Name>${filename}</x:Name>
                        <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
                    </x:ExcelWorksheet>
                </x:ExcelWorksheets>
            </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
            th { background-color: #f47721; color: #ffffff; font-weight: bold; border: 1px solid #cbd5e1; padding: 10px; }
            td { border: 1px solid #e2e8f0; padding: 8px; }
        </style>
    </head>
    <body>
        <table>
            <thead>
                <tr>
                    ${columns.map((c) => `<th>${c.label || c.key}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${data
                    .map(
                        (item) => `
                    <tr>
                        ${columns
                            .map((c) => {
                                let val = renderCell ? renderCell(item, c.key) : item[c.key];
                                if (val === null || val === undefined) val = '';
                                if (typeof val === 'object') val = String(item[c.key] ?? '');
                                val = String(val).replace(/<[^>]*>?/gm, '');
                                return `<td>${val}</td>`;
                            })
                            .join('')}
                    </tr>`
                    )
                    .join('')}
            </tbody>
        </table>
    </body>
    </html>`;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function printTable({ title = 'Report', columns = [], data = [], renderCell, isPdf = false }) {
    if (typeof window === 'undefined') return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Please allow popups to print or export PDF.');
        return;
    }

    const html = `<!DOCTYPE html>
    <html>
    <head>
        <title>${title} - ${isPdf ? 'PDF Report' : 'Print View'}</title>
        <style>
            * { box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                margin: 0;
                padding: 24px;
                color: #0f172a;
                background: #fff;
            }
            .report-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 2px solid #f47721;
                padding-bottom: 16px;
                margin-bottom: 20px;
            }
            .brand-title {
                margin: 0;
                font-size: 22px;
                font-weight: 800;
                color: #0f172a;
            }
            .brand-subtitle {
                margin: 4px 0 0;
                font-size: 12px;
                color: #64748b;
            }
            .meta-info {
                text-align: right;
                font-size: 11px;
                color: #64748b;
            }
            .meta-info strong {
                color: #f47721;
                font-size: 13px;
                display: block;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
                font-size: 12px;
            }
            th {
                background: #f8fafc;
                color: #1e293b;
                font-weight: 700;
                text-align: left;
                padding: 10px 12px;
                border: 1px solid #cbd5e1;
                text-transform: uppercase;
                font-size: 10px;
                letter-spacing: 0.05em;
            }
            td {
                padding: 8px 12px;
                border: 1px solid #e2e8f0;
                vertical-align: middle;
            }
            tr:nth-child(even) td {
                background-color: #f8fafc;
            }
            .footer {
                margin-top: 24px;
                padding-top: 12px;
                border-top: 1px solid #e2e8f0;
                display: flex;
                justify-content: space-between;
                font-size: 11px;
                color: #94a3b8;
            }
            @media print {
                @page { margin: 1.2cm; size: auto; }
                body { padding: 0; }
                .no-print { display: none !important; }
            }
        </style>
    </head>
    <body>
        <div class="report-header">
            <div>
                <h1 class="brand-title">${title}</h1>
                <p class="brand-subtitle">DreamsPOS Retail & Inventory Intelligence</p>
            </div>
            <div class="meta-info">
                <strong>TAX INVOICE / DIRECTORY</strong>
                <span>Date: ${new Date().toLocaleDateString()}</span> • 
                <span>Time: ${new Date().toLocaleTimeString()}</span>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    ${columns.map((c) => `<th>${c.label || c.key}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${data
                    .map(
                        (item) => `
                    <tr>
                        ${columns
                            .map((c) => {
                                let val = renderCell ? renderCell(item, c.key) : item[c.key];
                                if (val === null || val === undefined) val = '—';
                                if (typeof val === 'object') val = String(item[c.key] ?? '—');
                                val = String(val).replace(/<[^>]*>?/gm, '');
                                return `<td>${val || '—'}</td>`;
                            })
                            .join('')}
                    </tr>`
                    )
                    .join('')}
            </tbody>
        </table>

        <div class="footer">
            <span>Total Records: <b>${data.length}</b></span>
            <span>Generated via DreamsPOS • All Rights Reserved</span>
        </div>

        <script>
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                    ${isPdf ? '' : 'setTimeout(function() { window.close(); }, 750);'}
                }, 250);
            };
        </script>
    </body>
    </html>`;

    printWindow.document.write(html);
    printWindow.document.close();
}

