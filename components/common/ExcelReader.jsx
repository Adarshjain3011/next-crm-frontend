import React, { useState } from "react";
import * as XLSX from "xlsx";

function ExcelReader() {
  const [data, setData] = useState([]);

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

      console.log("ALL ROWS:", allRows); // check what columns actually come

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
    <div className="p-4">
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default ExcelReader;

