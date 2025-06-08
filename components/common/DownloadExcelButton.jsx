
'use client'

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const DownloadExcelButton = ({ data, filename = "data.xlsx", sheetName = "Sheet1" }) => {
  const handleDownload = () => {
    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Write the workbook to binary buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Create a Blob and download
    const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(dataBlob, filename);
  };

  return (
    <button onClick={handleDownload} className="bg-blue-500 text-white px-4 py-2 rounded">
      Download Excel
    </button>
  );
};

export default DownloadExcelButton;


