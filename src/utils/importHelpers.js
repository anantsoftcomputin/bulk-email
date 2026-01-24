import Papa from 'papaparse';

// Parse CSV file
export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve({
          data: results.data,
          fields: results.meta.fields,
          errors: results.errors,
        });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

// Parse Excel file
export const parseExcel = async (file) => {
  const ExcelJS = (await import('exceljs')).default;
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(e.target.result);
        
        const worksheet = workbook.getWorksheet(1);
        const data = [];
        const fields = [];
        
        // Get headers from first row
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell) => {
          fields.push(cell.value);
        });
        
        // Get data rows
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // Skip header
          
          const rowData = {};
          row.eachCell((cell, colNumber) => {
            const field = fields[colNumber - 1];
            rowData[field] = cell.value;
          });
          
          data.push(rowData);
        });
        
        resolve({ data, fields, errors: [] });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
};

// Parse JSON file
export const parseJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const arrayData = Array.isArray(data) ? data : [data];
        const fields = arrayData.length > 0 ? Object.keys(arrayData[0]) : [];
        
        resolve({ data: arrayData, fields, errors: [] });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};

// Validate imported data
export const validateImportData = (data, requiredFields = ['email']) => {
  const errors = [];
  const validRows = [];
  const invalidRows = [];
  
  data.forEach((row, index) => {
    const rowErrors = [];
    
    // Check required fields
    requiredFields.forEach(field => {
      if (!row[field] || !row[field].toString().trim()) {
        rowErrors.push(`Missing ${field}`);
      }
    });
    
    // Validate email format
    if (row.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.email)) {
        rowErrors.push('Invalid email format');
      }
    }
    
    if (rowErrors.length > 0) {
      invalidRows.push({
        row: index + 1,
        data: row,
        errors: rowErrors,
      });
    } else {
      validRows.push(row);
    }
  });
  
  return {
    valid: validRows,
    invalid: invalidRows,
    totalRows: data.length,
    validCount: validRows.length,
    invalidCount: invalidRows.length,
  };
};

// Map imported fields to contact fields
export const mapImportFields = (data, fieldMapping) => {
  return data.map(row => {
    const mapped = {};
    
    Object.entries(fieldMapping).forEach(([importField, contactField]) => {
      if (row[importField] !== undefined) {
        mapped[contactField] = row[importField];
      }
    });
    
    return mapped;
  });
};

// Detect duplicate contacts
export const detectDuplicates = (contacts, existingEmails = []) => {
  const emailSet = new Set(existingEmails.map(e => e.toLowerCase()));
  const duplicates = [];
  const unique = [];
  
  contacts.forEach(contact => {
    const email = contact.email?.toLowerCase();
    
    if (emailSet.has(email)) {
      duplicates.push(contact);
    } else {
      emailSet.add(email);
      unique.push(contact);
    }
  });
  
  return { unique, duplicates };
};

// Generate import summary
export const generateImportSummary = (result) => {
  return {
    totalImported: result.validCount,
    failed: result.invalidCount,
    duplicates: result.duplicates?.length || 0,
    successRate: result.totalRows > 0 
      ? ((result.validCount / result.totalRows) * 100).toFixed(1)
      : 0,
  };
};
