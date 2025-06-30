import React, { useState } from "react";
import * as XLSX from "xlsx";

function ExcelReader({data,setData}) {
  // const [data, setData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      // Skip header rows (like pandas skiprows=7)
      const allRows = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
        range: 7,
      });

      const filtered = [];

      for (let row of allRows) {
        const slno = row["Sl.no."];

        if (slno === "" || slno === null || slno === undefined) {
          break; // stop reading once Sl.no. is empty
        }

        filtered.push({
          "Sl.no.": slno,
          "Particular": row["Particular"] || "",
          "Ref Image": row["Ref Image"] || "",
          "Qty": row["Qty"] || 0,
          "Unit": row["Unit"] || "",
          "Unit Price": row["Unit Price"] || 0,
          "Amount": row["Amount"] || 0,
        });
      }

      setData(filtered);
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="p-4 max-w-sm mx-auto bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-2">
        Upload Excel File
      </h3>

      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        className="block w-full text-sm text-gray-700 dark:text-gray-200 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      {data && (
        <div className="mt-4 bg-gray-100 dark:bg-gray-900 p-2 rounded text-xs text-gray-800 dark:text-gray-100 max-h-48 overflow-auto">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>

  );
}

export default ExcelReader;

