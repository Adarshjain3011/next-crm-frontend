'use client';

import { Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const GeneratePDFButton = ({ invoiceRef, invoiceId }) => {
  const extractData = (element) => {
    const getValue = (selector) => {
      const el = element.querySelector(selector);
      return el ? el.value || '' : '';
    };

    const getItems = () => {
      const items = [];
      const rows = element.querySelectorAll('.grid-cols-7');
      rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        if (inputs.length >= 5) {
          items.push({
            description: inputs[0].value || '',
            hsn: inputs[1].value || '',
            unit: inputs[2].value || '',
            quantity: inputs[3].value || '',
            rate: inputs[4].value || '',
            amount: inputs[5].value || ''
          });
        }
      });
      return items;
    };

    return {
      invoiceNumber: getValue('input[placeholder="e.g., INV001"]'),
      invoiceDate: getValue('input[type="date"]'),
      buyerName: getValue('input[placeholder="Customer Name"]'),
      buyerAddress: getValue('textarea[placeholder="Billing Address"]'),
      items: getItems(),
      totalAmount: getValue('input[placeholder="Total Amount"]')
    };
  };

  const generatePDF = (data) => {
    const doc = new jsPDF();
    
    // Add company header
    doc.setFontSize(20);
    doc.text('GST TAX INVOICE', 105, 20, { align: 'center' });
    
    // Add invoice details
    doc.setFontSize(12);
    doc.text(`Invoice Number: ${data.invoiceNumber}`, 20, 40);
    doc.text(`Date: ${data.invoiceDate}`, 20, 50);
    
    // Add buyer details
    doc.text('Buyer Details:', 20, 70);
    doc.setFontSize(11);
    doc.text(`Name: ${data.buyerName}`, 20, 80);
    doc.text(`Address: ${data.buyerAddress}`, 20, 90);
    
    // Add items table
    const startY = 110;
    const headers = ['Description', 'HSN', 'Unit', 'Qty', 'Rate', 'Amount'];
    const itemsData = data.items.map(item => [
      item.description,
      item.hsn,
      item.unit,
      item.quantity,
      item.rate,
      item.amount
    ]);

    // Table header
    let currentY = startY;
    doc.setFillColor(240, 240, 240);
    doc.rect(20, currentY - 5, 170, 10, 'F');
    headers.forEach((header, i) => {
      doc.text(header, 25 + (i * 28), currentY);
    });
    
    // Table content
    currentY += 10;
    itemsData.forEach(row => {
      row.forEach((cell, i) => {
        doc.text(String(cell), 25 + (i * 28), currentY);
      });
      currentY += 10;
    });
    
    // Add total
    doc.setFontSize(12);
    doc.text(`Total Amount: ${data.totalAmount}`, 150, currentY + 20);

    return doc;
  };

  const handlePreview = async () => {
    if (!invoiceRef?.current) return;

    try {
      const data = extractData(invoiceRef.current);
      const doc = generatePDF(data);
      const pdfBlob = doc.output('blob');
      
      // Open PDF in new tab
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Error generating PDF preview:', error);
      toast.error("Failed to generate PDF preview");
    }
  };

  const handleGenerateAndUpload = async () => {
    if (!invoiceRef?.current) return;

    try {
      const data = extractData(invoiceRef.current);
      const doc = generatePDF(data);
      const pdfBlob = doc.output('blob');
      
      // Upload PDF
      const formData = new FormData();
      formData.append('file', pdfBlob, 'invoice.pdf');
      formData.append('invoiceId', invoiceId);

      const res = await axios.post('invoice/upload', formData);

      if (res.data?.url) {
        toast.success('PDF generated and uploaded successfully!');
      } else {
        toast.error('PDF upload failed!');
      }
    } catch (error) {
      console.error('Error generating/uploading PDF:', error);
    }
  };

  const handleDownload = async () => {
    try {
      const pdfBlob = await generatePDF();
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceData.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handlePreview} className="flex gap-2 items-center flex-1">
        <Eye size={18} />
        Preview PDF
      </Button>
      <Button onClick={handleGenerateAndUpload} className="flex gap-2 items-center flex-1">
        <Download size={18} />
        Generate & Upload
      </Button>
    </div>
  );
};

export default GeneratePDFButton;
