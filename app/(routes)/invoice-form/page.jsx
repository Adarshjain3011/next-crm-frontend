'use client';

import { useRef, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Download, Printer } from 'lucide-react';
import { html2pdf } from 'html2pdf.js';

import { createNewInvoice } from '@/lib/api';

import { handleAxiosError } from '@/lib/handleAxiosError';

import { user_role } from '@/lib/data';

import RoleGuard from '@/components/auth/RoleGuard';
import { useRole } from '@/app/hooks/useRole';

export default function InvoiceFormPage() {
  const invoiceRef = useRef(null);
  const orderData = useSelector((state) => state.invoice.data);

  const { isAdmin, isSales } = useRole();

  const [invoiceData, setInvoiceData] = useState({
    clientId: '',
    orderId: '',
    invoiceNumber: '',
    invoiceDate: '',
    dueDate: '',
    buyerWorkOrderDate: '',
    buyerName: '',
    buyerAddress: '',
    buyerGSTIN: '',
    panNo: '',
    stateCode: '29',
    stateName: '',
    vehicleNo: '',
    transporterName: '',
    shippingAddress: '',
    ewayBillNumber: '',
    items: [{ description: '', hsn: '', unit: '', quantity: 1, rate: 0, amount: 0 }],
    transportCharges: 0,
    installationCharges: 0,
    taxableAmount: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    gstAmount: 0,
    totalAmount: 0,
    paymentTerms: '',
    paymentStatus: 'Pending',
    notes: '',
  });

  useEffect(() => {
    if (orderData) {
      setInvoiceData(prev => ({
        ...prev,
        clientId: orderData.clientId?._id || '',
        orderId: orderData._id || '',
        buyerName: orderData.clientId?.name || '',
        buyerAddress: orderData.clientId?.address || '',
        buyerGSTIN: orderData.clientId?.gstin || '',
        transportCharges: orderData.transport || 0,
        installationCharges: orderData.installation || 0,
        items: orderData.vendorAssignments?.map(assignment => ({
          description: assignment.itemRef || '',
          hsn: '',
          unit: '',
          quantity: assignment.assignedQty || 0,
          rate: assignment.orderValue / assignment.assignedQty || 0,
          amount: assignment.orderValue || 0
        })) || [{ description: '', hsn: '', unit: '', quantity: 1, rate: 0, amount: 0 }]
      }));
    }
  }, [orderData]);

  const handleInputChange = (field, value) => {

    setInvoiceData((prev) => ({ ...prev, [field]: value }));

  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoiceData.items];
    updatedItems[index][field] = value;
    updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;
    setInvoiceData((prev) => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setInvoiceData((prev) => ({
      ...prev,
      items: [...prev.items, { description: '', hsn: '', unit: '', quantity: 1, rate: 0, amount: 0 }],
    }));
  };

  const removeItem = (index) => {
    const updatedItems = [...invoiceData.items];
    updatedItems.splice(index, 1);
    setInvoiceData((prev) => ({ ...prev, items: updatedItems }));
  };

  const calculateTotals = () => {
    const taxableAmount = invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
    const cgstAmount = taxableAmount * 0.09;
    const sgstAmount = taxableAmount * 0.09;
    const gstAmount = cgstAmount + sgstAmount;
    const totalAmount = taxableAmount + gstAmount + invoiceData.transportCharges + invoiceData.installationCharges;

    setInvoiceData((prev) => ({
      ...prev,
      taxableAmount,
      cgstAmount,
      sgstAmount,
      gstAmount,
      totalAmount,
    }));
  };

  const handleDownload = () => {
    const element = invoiceRef.current;
    html2pdf().from(element).save('invoice.pdf');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = async () => {
    console.log('Invoice Data:', invoiceData);

    try {

      const result = await createNewInvoice(invoiceData);

      console.log("Invoice created successfully:", result);

    } catch (error) {

      console.error("Error creating invoice:", error);

      handleAxiosError(error);

    }
  };

  return (

    <RoleGuard allowedRoles={[user_role.admin,user_role.sales]}>

      <div className="p-6 space-y-6" ref={invoiceRef}>
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl font-bold uppercase">GST TAX INVOICE</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <Label>Client ID</Label>
              <Input
                placeholder="Client ID"
                value={invoiceData.clientId}
                onChange={(e) => handleInputChange('clientId', e.target.value)}
              />
            </div>
            <div>
              <Label>Order ID</Label>
              <Input
                placeholder="Order ID"
                value={invoiceData.orderId}
                onChange={(e) => handleInputChange('orderId', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <Label>Invoice Number</Label>
              <Input
                placeholder="e.g., INV001"
                value={invoiceData.invoiceNumber}
                onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
              />
            </div>
            <div>
              <Label>Invoice Date</Label>
              <Input
                type="date"
                value={invoiceData.invoiceDate}
                onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
              />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={invoiceData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
              />
            </div>
            <div>
              <Label>Buyer Work Order Date</Label>
              <Input
                type="date"
                value={invoiceData.buyerWorkOrderDate}
                onChange={(e) => handleInputChange('buyerWorkOrderDate', e.target.value)}
              />
            </div>
            <div>
              <Label>Buyer Name</Label>
              <Input
                placeholder="Customer Name"
                value={invoiceData.buyerName}
                onChange={(e) => handleInputChange('buyerName', e.target.value)}
              />
            </div>
            <div>
              <Label>Buyer Address</Label>
              <Textarea
                placeholder="Billing Address"
                value={invoiceData.buyerAddress}
                onChange={(e) => handleInputChange('buyerAddress', e.target.value)}
              />
            </div>
            <div>
              <Label>Buyer GSTIN</Label>
              <Input
                placeholder="Buyer GSTIN Number"
                value={invoiceData.buyerGSTIN}
                onChange={(e) => handleInputChange('buyerGSTIN', e.target.value)}
              />
            </div>
            <div>
              <Label>PAN</Label>
              <Input
                placeholder="Buyer PAN Number"
                value={invoiceData.panNo}
                onChange={(e) => handleInputChange('panNo', e.target.value)}
              />
            </div>
            <div>
              <Label>State Code</Label>
              <Input
                placeholder="State Code"
                value={invoiceData.stateCode}
                onChange={(e) => handleInputChange('stateCode', e.target.value)}
              />
            </div>
            <div>
              <Label>State Name</Label>
              <Input
                placeholder="State Name"
                value={invoiceData.stateName}
                onChange={(e) => handleInputChange('stateName', e.target.value)}
              />
            </div>
            <div>
              <Label>Vehicle No</Label>
              <Input
                placeholder="KA 03 AN 0300"
                value={invoiceData.vehicleNo}
                onChange={(e) => handleInputChange('vehicleNo', e.target.value)}
              />
            </div>
            <div>
              <Label>Transporter Name</Label>
              <Input
                placeholder="Transporter Name"
                value={invoiceData.transporterName}
                onChange={(e) => handleInputChange('transporterName', e.target.value)}
              />
            </div>
            <div>
              <Label>e-Way Bill Number</Label>
              <Input
                placeholder="e-Way Bill Number"
                value={invoiceData.ewayBillNumber}
                onChange={(e) => handleInputChange('ewayBillNumber', e.target.value)}
              />
            </div>
            <div>

              <Label>Shipping Address</Label>
              <Input
                placeholder="Shipping Address"
                value={invoiceData.shippingAddress}
                onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
              />
            </div>

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            {invoiceData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-7 gap-4 items-end mb-4">
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                />
                <Input
                  placeholder="HSN"
                  value={item.hsn}
                  onChange={(e) => handleItemChange(index, 'hsn', e.target.value)}
                />
                <Input
                  placeholder="Unit"
                  value={item.unit}
                  onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                />
                <Input
                  type="number"
                  placeholder="Rate"
                  value={item.rate}
                  onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value))}
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={item.amount}
                  disabled
                />
                <Button variant="ghost" onClick={() => removeItem(index)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            <Button onClick={addItem} variant="outline">
              <Plus size={16} className="mr-2" /> Add Item
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Charges</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <Label>Transport Charges</Label>
              <Input
                type="number"
                placeholder="Transport Charges"
                value={invoiceData.transportCharges}
                onChange={(e) => handleInputChange('transportCharges', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label>Installation Charges</Label>
              <Input
                type="number"
                placeholder="Installation Charges"
                value={invoiceData.installationCharges}
                onChange={(e) => handleInputChange('installationCharges', parseFloat(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div>
              <Label>Taxable Amount</Label>
              <Input value={invoiceData.taxableAmount.toFixed(2)} disabled />
            </div>
            <div>
              <Label>CGST (9%)</Label>
              <Input value={invoiceData.cgstAmount.toFixed(2)} disabled />
            </div>
            <div>
              <Label>SGST (9%)</Label>
              <Input value={invoiceData.sgstAmount.toFixed(2)} disabled />
            </div>
            <div>
              <Label>GST Amount</Label>
              <Input value={invoiceData.gstAmount.toFixed(2)} disabled />
            </div>
            <div className="col-span-3">
              <Label>Total Amount</Label>
              <Input value={invoiceData.totalAmount.toFixed(2)} className="text-lg font-semibold" disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Terms & Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label>Payment Terms</Label>
              <Textarea
                rows={3}
                placeholder="Payment Terms"
                value={invoiceData.paymentTerms}
                onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                rows={3}
                placeholder="Additional Notes"
                value={invoiceData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 pt-4">
          <Button className="w-full" onClick={handleDownload}>
            <Download className="mr-2" size={18} /> Download PDF
          </Button>
          <Button className="w-full" onClick={handlePrint}>
            <Printer className="mr-2" size={18} /> Print
          </Button>
          <Button className="w-full" onClick={handleSubmit}>
            Submit Invoice
          </Button>
        </div>
      </div>

    </RoleGuard>

  );
}

