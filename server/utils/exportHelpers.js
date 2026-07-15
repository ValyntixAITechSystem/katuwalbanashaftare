import { Parser } from 'json2csv';
import * as XLSX from 'xlsx';

export const exportToCSV = (data, fields) => {
  try {
    const parser = new Parser({ fields });
    return parser.parse(data);
  } catch (error) {
    throw new Error('Failed to export to CSV');
  }
};

export const exportToExcel = (data, sheetName = 'Sheet1') => {
  try {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    return workbook;
  } catch (error) {
    throw new Error('Failed to export to Excel');
  }
};

export const exportToJSON = (data) => {
  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    throw new Error('Failed to export to JSON');
  }
};

export const generateReportFileName = (type, format) => {
  const date = new Date().toISOString().split('T')[0];
  return `${type}_report_${date}.${format}`;
};