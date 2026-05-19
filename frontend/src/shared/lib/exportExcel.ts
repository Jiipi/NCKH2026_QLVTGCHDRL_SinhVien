type ExcelCell = string | number | boolean | null | undefined;

export interface ExcelSheet {
  name: string;
  rows: ExcelCell[][];
}

function escapeHtml(value: ExcelCell) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizeSheetName(name: string) {
  return (name || 'Sheet1').replace(/[\\/?*[\]:]/g, ' ').slice(0, 31).trim() || 'Sheet1';
}

export function downloadExcelWorkbook(sheets: ExcelSheet[], filename: string) {
  const workbookHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <style>
          table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px; }
          th { background: #eef2ff; color: #111827; font-weight: 700; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 8px; mso-number-format:"\\@"; }
          .title { background: #111827; color: #ffffff; font-size: 16px; font-weight: 700; }
        </style>
      </head>
      <body>
        ${sheets.map((sheet) => `
          <table>
            <tr><th class="title" colspan="${Math.max(...sheet.rows.map(row => row.length), 1)}">${escapeHtml(normalizeSheetName(sheet.name))}</th></tr>
            ${sheet.rows.map((row, rowIndex) => `
              <tr>
                ${row.map((cell) => rowIndex === 0
                  ? `<th>${escapeHtml(cell)}</th>`
                  : `<td>${escapeHtml(cell)}</td>`
                ).join('')}
              </tr>
            `).join('')}
          </table>
          <br />
        `).join('')}
      </body>
    </html>
  `;

  const safeFilename = filename.endsWith('.xls') ? filename : `${filename}.xls`;
  const blob = new Blob(['\ufeff', workbookHtml], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = safeFilename;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
