import Papa from 'papaparse';

// Export contacts to CSV
export const exportToCSV = (data, filename = 'export.csv') => {
  const csv = Papa.unparse(data);
  downloadFile(csv, filename, 'text/csv');
};

// Export contacts to Excel
export const exportToExcel = async (data, filename = 'export.xlsx') => {
  const ExcelJS = (await import('exceljs')).default;
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data');
  
  if (data.length === 0) {
    throw new Error('No data to export');
  }
  
  // Add headers
  const headers = Object.keys(data[0]);
  worksheet.addRow(headers);
  
  // Style headers
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };
  
  // Add data
  data.forEach(row => {
    const values = headers.map(header => row[header]);
    worksheet.addRow(values);
  });
  
  // Auto-size columns
  worksheet.columns.forEach(column => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, cell => {
      const length = cell.value ? cell.value.toString().length : 10;
      if (length > maxLength) {
        maxLength = length;
      }
    });
    column.width = Math.min(maxLength + 2, 50);
  });
  
  // Generate buffer and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  downloadBlob(blob, filename);
};

// Export to JSON
export const exportToJSON = (data, filename = 'export.json') => {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, 'application/json');
};

// Export campaign report
export const exportCampaignReport = async (campaign, format = 'csv') => {
  const reportData = {
    campaignName: campaign.name,
    createdAt: new Date(campaign.createdAt).toLocaleString(),
    status: campaign.status,
    totalRecipients: campaign.totalRecipients || 0,
    sent: campaign.stats?.sent || 0,
    delivered: campaign.stats?.delivered || 0,
    opened: campaign.stats?.opened || 0,
    clicked: campaign.stats?.clicked || 0,
    bounced: campaign.stats?.bounced || 0,
    failed: campaign.stats?.failed || 0,
    unsubscribed: campaign.stats?.unsubscribed || 0,
    openRate: campaign.stats?.openRate || 0,
    clickRate: campaign.stats?.clickRate || 0,
    bounceRate: campaign.stats?.bounceRate || 0,
  };
  
  const filename = `campaign-report-${campaign.id}-${Date.now()}`;
  
  switch (format) {
    case 'excel':
      await exportToExcel([reportData], `${filename}.xlsx`);
      break;
    case 'json':
      exportToJSON(reportData, `${filename}.json`);
      break;
    default:
      exportToCSV([reportData], `${filename}.csv`);
  }
};

// Export analytics data
export const exportAnalytics = async (data, format = 'csv', filename = 'analytics') => {
  const timestamp = new Date().toISOString().split('T')[0];
  const fullFilename = `${filename}-${timestamp}`;
  
  switch (format) {
    case 'excel':
      await exportToExcel(data, `${fullFilename}.xlsx`);
      break;
    case 'json':
      exportToJSON(data, `${fullFilename}.json`);
      break;
    default:
      exportToCSV(data, `${fullFilename}.csv`);
  }
};

// Helper to download file
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
};

// Helper to download blob
const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Format data for export
export const formatForExport = (data, fields = null) => {
  if (!fields) {
    return data;
  }
  
  return data.map(item => {
    const formatted = {};
    fields.forEach(field => {
      formatted[field] = item[field] !== undefined ? item[field] : '';
    });
    return formatted;
  });
};

// Export with filters applied
export const exportFiltered = async (data, filters, format = 'csv') => {
  let filtered = [...data];
  
  // Apply filters
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(item => 
      Object.values(item).some(val => 
        val?.toString().toLowerCase().includes(search)
      )
    );
  }
  
  if (filters.dateRange) {
    const { start, end } = filters.dateRange;
    filtered = filtered.filter(item => {
      const date = new Date(item.createdAt || item.date);
      return date >= start && date <= end;
    });
  }
  
  const filename = `filtered-export-${Date.now()}`;
  
  switch (format) {
    case 'excel':
      await exportToExcel(filtered, `${filename}.xlsx`);
      break;
    case 'json':
      exportToJSON(filtered, `${filename}.json`);
      break;
    default:
      exportToCSV(filtered, `${filename}.csv`);
  }
};
