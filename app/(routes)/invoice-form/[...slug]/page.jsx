'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Download, Printer, Loader2 } from 'lucide-react';
import { html2pdf } from 'html2pdf.js';
import { useRouter, useParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { initializeInvoiceForm, updateInvoice, clearInvoice, resetToOrderData, setError, setOrderData, setLoading } from '@/app/store/slice/invoiceSlice';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { PageLoader } from '@/components/ui/loader';
import { useLoading } from '@/app/hooks/useLoading';
import { InlineLoader } from '@/components/ui/loader';

import {


  getInvoiceDetails,
  createNewInvoice,
  updateInvoiceData,
  getAllOrders,
  deleteInvoiceData

} from '@/lib/api';

import { handleAxiosError } from '@/lib/handleAxiosError';
import GeneratePDFButton from '@/components/invoice/GeneratePdfButton';
import { payment_status } from '@/lib/data';

export default function InvoiceFormPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch();
  const { orderData, invoiceData, isLoading, error } = useSelector((state) => state.invoice);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [invoiceDataState, setInvoiceDataState] = useState({
    items: [],
    transportCharges: 0,
    installationCharges: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    totalAmount: 0,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    paymentStatus:'',
    buyerWorkOrderDate: '',

  });
  const [taxData, setTaxData] = useState({
    "cgstAmount": false,
    "sgstAmount": false,
    "igstAmount": false,
  });
  const [changedFields, setChangedFields] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const invoiceRef = useRef(null);
  const [dataFetched, setDataFetched] = useState(false);

  const { isLoading: isSavingDraft, withLoading: withSavingDraft } = useLoading();
  const { isLoading: isUpdating, withLoading: withUpdating } = useLoading();
  const { isLoading: isDeleting, withLoading: withDeleting } = useLoading();

  // Reset states when unmounting or changing routes
  useEffect(() => {
    return () => {
      dispatch(clearInvoice());
      setIsInitialLoading(false);
      setDataFetched(false);
      setInvoiceDataState({
        items: [],
        transportCharges: 0,
        installationCharges: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        totalAmount: 0,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        buyerWorkOrderDate: ''
      });
      setChangedFields({});
      setHasChanges(false);
      setOriginalData(null);
    };
  }, [dispatch]);

  // Single effect for initial data fetching
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!params?.slug?.[0]) {
        console.error("No order ID found in URL");
        router.push('/order-dashboard');
        return;
      }

      try {
        const orderId = params.slug[0];
        setIsInitialLoading(true);
        dispatch(setLoading());

        // Always fetch fresh order data
        const orders = await getAllOrders();
        if (!isMounted) return;

        const order = orders.find(o => o._id === orderId);
        if (!order) {
          throw new Error("Order not found");
        }

        // Set order data
        dispatch(setOrderData(order));

        try {
          // Always fetch fresh invoice data
          const invoiceResponse = await getInvoiceDetails({
            orderId: order._id,
            clientId: order.clientId._id
          });

          if (!isMounted) return;

          dispatch(initializeInvoiceForm({
            savedInvoice: invoiceResponse,
            order: order
          }));
        } catch (invoiceError) {
          if (!isMounted) return;
          dispatch(initializeInvoiceForm({
            savedInvoice: null,
            order: order
          }));
        }

        if (isMounted) {
          setDataFetched(true);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Error fetching data:", error);
        dispatch(setError(error.message || "Failed to load data"));
        toast.error(error.message || "Failed to load data");
        router.push('/order-dashboard');
      } finally {
        if (isMounted) {
          setIsInitialLoading(false);
        }
      }
    };

    // Always fetch fresh data when component mounts
    fetchData();

    return () => {
      isMounted = false;
    };
  }, [params, router, dispatch]);

  // Handle navigation away
  useEffect(() => {
    const handleRouteChange = () => {
      dispatch(clearInvoice());
    };

    // Add listener for route changes
    window.addEventListener('beforeunload', handleRouteChange);

    return () => {
      window.removeEventListener('beforeunload', handleRouteChange);
    };
  }, [dispatch]);

  // Update local state when Redux state changes
  useEffect(() => {
    if (invoiceData && !isInitialLoading) {
      const formattedData = {
        ...invoiceData,
        invoiceDate: invoiceData.invoiceDate ? new Date(invoiceData.invoiceDate).toISOString().split('T')[0] : '',
        dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate).toISOString().split('T')[0] : '',
        buyerWorkOrderDate: invoiceData.buyerWorkOrderDate ? new Date(invoiceData.buyerWorkOrderDate).toISOString().split('T')[0] : '',
        items: invoiceData.items || []
      };

      setInvoiceDataState(formattedData);
      setOriginalData(formattedData);
      setChangedFields({});
      setHasChanges(false);
    }
  }, [invoiceData, isInitialLoading]);

  // Track specific field changes
  const handleInputChange = (field, value) => {
    setInvoiceDataState(prev => {
      const newState = {
        ...prev,
        [field]: value
      };
      return newState;
    });

    // Track this specific change
    setChangedFields(prev => {
      // Only track if value is different from original
      if (originalData[field] !== value) {
        return {
          ...prev,
          [field]: value
        };
      } else {
        // If value is same as original, remove from changed fields
        const { [field]: removed, ...rest } = prev;
        return rest;
      }
    });
  };

  // Track item changes specifically
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoiceDataState.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    setInvoiceDataState(prev => ({
      ...prev,
      items: updatedItems
    }));

    // Track item changes
    if (JSON.stringify(originalData.items[index]?.[field]) !== JSON.stringify(value)) {
      setChangedFields(prev => ({
        ...prev,
        items: {
          ...(prev.items || {}),
          [index]: {
            ...(prev.items?.[index] || {}),
            [field]: value
          }
        }
      }));
    }
  };

  // Check for changes
  useEffect(() => {
    const hasFieldChanges = Object.keys(changedFields).length > 0;
    setHasChanges(hasFieldChanges);

  }, [changedFields]);

  // Calculate total amount
  const calculateTotalAmount = useCallback(() => {
    if (!invoiceDataState?.items) return 0;

    const itemsTotal = invoiceDataState.items.reduce((sum, item) => {
      return sum + (Number(item.amount) || 0);
    }, 0);

    const transportCharges = Number(invoiceDataState.transportCharges) || 0;
    const installationCharges = Number(invoiceDataState.installationCharges) || 0;
    const cgstAmount = Number(invoiceDataState.cgstAmount) || 0;
    const sgstAmount = Number(invoiceDataState.sgstAmount) || 0;
    const igstAmount = Number(invoiceDataState.igstAmount) || 0;

    return itemsTotal + transportCharges + installationCharges + cgstAmount + sgstAmount + igstAmount;
  }, [invoiceDataState]);

  // Update total amount whenever relevant fields change
  useEffect(() => {
    const newTotalAmount = calculateTotalAmount();
    if (newTotalAmount !== invoiceDataState.totalAmount) {
      setInvoiceDataState(prev => ({
        ...prev,
        totalAmount: newTotalAmount,
        taxableAmount: prev.items?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0
      }));
    }
  }, [
    invoiceDataState.items,
    invoiceDataState.transportCharges,
    invoiceDataState.installationCharges,
    invoiceDataState.cgstAmount,
    invoiceDataState.sgstAmount,
    invoiceDataState.igstAmount
  ]);

  // Add new useEffect to update tax checkboxes when invoiceDataState changes
  useEffect(() => {
    if (invoiceDataState) {
      setTaxData({
        "cgstAmount": Number(invoiceDataState.cgstAmount) > 0,
        "sgstAmount": Number(invoiceDataState.sgstAmount) > 0,
        "igstAmount": Number(invoiceDataState.igstAmount) > 0,
      });
    }
  }, [invoiceDataState]);

  const handleCheckBoxChange = (event) => {
    const { name, checked } = event.target;

    // Update tax checkbox state
    setTaxData(prev => ({
      ...prev,
      [name]: checked
    }));

    // Calculate tax amount based on items total only
    const itemsTotal = invoiceDataState.items?.reduce((sum, item) => {
      return sum + (Number(item.amount) || 0);
    }, 0) || 0;

    const taxAmount = (itemsTotal) * 9 / 100;
    const newValue = checked ? taxAmount : 0;

    // Update invoice data state
    setInvoiceDataState(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Track this specific change
    setChangedFields(prev => {
      // Compare with original value
      if (originalData[name] !== newValue) {
        return {
          ...prev,
          [name]: newValue,
          taxCalculation: {
            ...(prev.taxCalculation || {}),
            [name]: {
              applied: checked,
              baseAmount: itemsTotal,
              rate: 9,
              calculatedTax: taxAmount
            }
          }
        };
      } else {
        // If value matches original, remove from changed fields
        const { [name]: removed, ...rest } = prev;
        return rest;
      }
    });

  };

  const handleSubmit = async () => {
    try {
      if (invoiceDataState._id) {
        // If invoice exists, update it
        await handleUpdateChanges();
      } else {
        // If invoice doesn't exist, create new one
        const result = await createNewInvoice(invoiceDataState);

        dispatch(updateInvoice(result));
        toast.success("Invoice created successfully");
        // Refresh the page to show the new invoice with its ID
        window.location.reload();

      }
    } catch (error) {
      console.error("Error submitting invoice:", error);
      handleAxiosError(error);
    }
  };

  const handleResetForm = () => {
    if (window.confirm("Are you sure you want to reset the form? This will clear all your changes and load fresh data from the order.")) {
      dispatch(resetToOrderData());
    }
  };

  // Show loading state
  if (isInitialLoading || isLoading) {
    return <PageLoader text="Loading invoice data..." />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => router.push('/order-dashboard')}>Go Back</Button>
      </div>
    );
  }

  // No data state
  if (!orderData || !invoiceData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-amber-500 mb-4">No invoice data available</p>
        <Button onClick={() => router.push('/order-dashboard')}>Go Back</Button>
      </div>
    );
  }

  const { slug } = useParams();

  // calculate total amount with the items and tranport and installation 
  let totalAmountIncludingTax = invoiceDataState.transportCharges + invoiceDataState.installationCharges;

  invoiceDataState.items.forEach((data) => (
    totalAmountIncludingTax = totalAmountIncludingTax + Number(data.amount)
  ));

  totalAmountIncludingTax = totalAmountIncludingTax + Number(invoiceDataState.cgstAmount) + Number(invoiceDataState.sgstAmount) + Number(invoiceDataState.igstAmount);

  const handleSaveDraft = async () => {
    await withSavingDraft(async () => {
      try {
        if (invoiceExists) {
          // Update existing invoice
          await updateInvoiceData(invoiceDataState);
        } else {
          // Create new invoice as draft
          const result = await createNewInvoice(invoiceDataState);
          if (result) {
            dispatch(updateInvoice(result));
            // Refresh the page to show the new invoice with its ID
            window.location.reload();
          }
        }
        toast.success("Draft saved successfully");
      } catch (error) {
        console.error("Error saving draft:", error);
        handleAxiosError(error);
      }
    });
  };

  const handleUpdateChanges = async () => {
    if (invoiceDataState === undefined) {
      toast.error("Please create the invoice first");
      return;
    }
    await withUpdating(async () => {
      try {
        const updatePayload = {
          invoiceId: invoiceDataState._id,
          updates: changedFields
        };
        const response = await updateInvoiceData(updatePayload);
        if (response) {
          setOriginalData(invoiceDataState);
          setChangedFields({});
          setHasChanges(false);
          dispatch(updateInvoice(invoiceDataState));
          toast.success("Invoice updated successfully");
        }
      } catch (error) {
        console.error("Error updating invoice:", error);
        toast.error("Failed to update invoice");
      }
    });
  };

  const handleDeleteInvoice = async () => {

    if (!invoiceDataState._id) {
      toast.error("No invoice to delete");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this invoice? This action cannot be undone.");
    if (!confirmed) return;

    await withDeleting(async () => {
      try {
        await deleteInvoiceData(invoiceDataState._id);
        toast.success("Invoice deleted successfully");
        // Redirect to order dashboard
        router.push('/order-dashboard');
      } catch (error) {
        console.error("Error deleting invoice:", error);
        handleAxiosError(error);
      }
    });
  };

  // Map items from the provided data
  const itemsData = invoiceData?.items?.map((item) => ({
    description: item.description || '',
    hsn: item.hsn || '',
    unit: item.unit || '',
    quantity: item.quantity || 1,
    rate: item.rate || 0,
    amount: item.amount || 0,
  })) || [];

  // Check if invoice exists (has an _id)
  const invoiceExists = invoiceDataState._id ? true : false;

  return (
    <div className="p-6 space-y-6 print-area" ref={invoiceRef}>
      <Card>
        <CardHeader className="relative">
          <CardTitle className="text-center text-xl font-bold uppercase">
            GST TAX INVOICE
          </CardTitle>

          <button
            onClick={handleDeleteInvoice}
            className="absolute top-2 right-2 flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 text-sm rounded-md transition"
            style={{ display: invoiceExists ? 'flex' : 'none' }}
          >
            <Trash2 className="text-lg" />
            Delete Invoice
          </button>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label>Client ID</Label>
            <Input
              placeholder="Client ID"
              value={invoiceDataState.clientId}
              onChange={(e) => handleInputChange('clientId', e.target.value)}
              readOnly={true}  // or false

            />
          </div>
          <div>
            <Label>Order ID</Label>
            <Input
              placeholder="Order ID"
              value={invoiceDataState.orderId}
              onChange={(e) => handleInputChange('orderId', e.target.value)}
              readOnly={true}  // or false
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
              value={invoiceDataState.invoiceNumber}
              onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
            />
          </div>
          <div>
            <Label>Invoice Date</Label>
            <Input
              type="date"
              value={invoiceDataState.invoiceDate}
              onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
            />
          </div>
          <div>
            <Label>Due Date</Label>
            <Input
              type="date"
              value={invoiceDataState.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
            />
          </div>
          <div>
            <Label>Buyer Work Order Date</Label>
            <Input
              type="date"
              value={invoiceDataState.buyerWorkOrderDate}
              onChange={(e) => handleInputChange('buyerWorkOrderDate', e.target.value)}
            />
          </div>
          <div>
            <Label>Buyer Name</Label>
            <Input
              placeholder="Customer Name"
              value={invoiceDataState.buyerName}
              onChange={(e) => handleInputChange('buyerName', e.target.value)}
            />
          </div>
          <div>
            <Label>Buyer Address</Label>
            <Textarea
              placeholder="Billing Address"
              value={invoiceDataState.buyerAddress}
              onChange={(e) => handleInputChange('buyerAddress', e.target.value)}
            />
          </div>
          <div>
            <Label>Buyer GSTIN</Label>
            <Input
              placeholder="Buyer GSTIN Number"
              value={invoiceDataState.buyerGSTIN}
              onChange={(e) => handleInputChange('buyerGSTIN', e.target.value)}
            />
          </div>
          <div>
            <Label>PAN</Label>
            <Input
              placeholder="Buyer PAN Number"
              value={invoiceDataState.panNo}
              onChange={(e) => handleInputChange('panNo', e.target.value)}
            />
          </div>
          <div>
            <Label>State Code</Label>
            <Input
              placeholder="State Code"
              value={invoiceDataState.stateCode}
              onChange={(e) => handleInputChange('stateCode', e.target.value)}
            />
          </div>
          <div>
            <Label>State Name</Label>
            <Input
              placeholder="State Name"
              value={invoiceDataState.stateName}
              onChange={(e) => handleInputChange('stateName', e.target.value)}
            />
          </div>
          <div>
            <Label>Vehicle No</Label>
            <Input
              placeholder="KA 03 AN 0300"
              value={invoiceDataState.vehicleNo}
              onChange={(e) => handleInputChange('vehicleNo', e.target.value)}
            />
          </div>
          <div>
            <Label>Transporter Name</Label>
            <Input
              placeholder="Transporter Name"
              value={invoiceDataState.transporterName}
              onChange={(e) => handleInputChange('transporterName', e.target.value)}
            />
          </div>
          <div>
            <Label>e-Way Bill Number</Label>
            <Input
              placeholder="e-Way Bill Number"
              value={invoiceDataState.ewayBillNumber}
              onChange={(e) => handleInputChange('ewayBillNumber', e.target.value)}
            />
          </div>
          <div>
            <Label>Shipping Address</Label>
            <Input
              placeholder="Shipping Address"
              value={invoiceDataState.shippingAddress}
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
          {(invoiceDataState.items || []).map((item, index) => (
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
              <Button variant="ghost" onClick={() => handleItemChange(index, 'amount', 0)}>
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
          <Button onClick={() => handleItemChange(invoiceDataState.items.length, 'amount', 0)} variant="outline">
            <Trash2 size={16} className="mr-2" /> Remove Item
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
              value={invoiceDataState.transportCharges}
              onChange={(e) => handleInputChange('transportCharges', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <Label>Installation Charges</Label>
            <Input
              type="number"
              placeholder="Installation Charges"
              value={invoiceDataState.installationCharges}
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
            <Input value={invoiceDataState.taxableAmount} disabled />
          </div>

          {/* cgst amount */}
          <div className='flex flex-col'>
            <div className='flex gap-6 p-2'>
              <Label>CGST (9%)</Label>
              <Input type="checkbox" name="cgstAmount" className="w-4 h-4" checked={taxData.cgstAmount} onChange={handleCheckBoxChange} />
            </div>
            <Input value={invoiceDataState.cgstAmount} disabled />
          </div>

          {/* sgst amount*/}
          <div className='flex flex-col'>
            <div className='flex gap-6 p-2'>
              <Label>SGST (9%)</Label>
              <Input type="checkbox" name="sgstAmount" className="w-4 h-4" checked={taxData.sgstAmount} onChange={handleCheckBoxChange} />
            </div>
            <Input value={invoiceDataState.sgstAmount} disabled />
          </div>

          {/* igst amount */}
          <div className='flex flex-col'>
            <div className='flex gap-6 p-2'>
              <Label>Igst Amount</Label>
              <Input type="checkbox" name="igstAmount" className="w-4 h-4" checked={taxData.igstAmount} onChange={handleCheckBoxChange} />
            </div>
            <Input value={invoiceDataState.igstAmount} disabled />
          </div>

          <div className="col-span-3">
            <Label>Total Amount</Label>
            <Input value={invoiceDataState.totalAmount} className="text-lg font-semibold" disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Terms & Notes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">

          {/*  payments status  */}

          <div className="flex flex-col gap-2">
            <label htmlFor="paymentStatus" className="text-sm font-medium text-gray-700">
              Payment Status
            </label>

            <select
              name="paymentStatus"
              id="paymentStatus"
              className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                bg-white text-gray-800"
              value={invoiceDataState.paymentStatus}
                onChange={(e) => handleInputChange('paymentStatus',e.target.value)}
            >
              {payment_status.map((status, index) => (
                <option key={index} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* payment terms  */}

          <div>
            <Label>Payment Terms</Label>
            <Textarea
              rows={3}
              placeholder="Payment Terms"
              value={invoiceDataState.paymentTerms}
              onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
            />
          </div>

          {/* notes  */}

          <div>
            <Label>Notes</Label>
            <Textarea
              rows={3}
              placeholder="Additional Notes"
              value={invoiceDataState.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 pt-4">
        <div className="flex flex-col justify-between gap-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleResetForm}
          >
            Reset to Order Data
          </Button>

          <div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
            >
              {isSavingDraft ? (<><InlineLoader className="mr-2" /> Saving...</>) : (invoiceExists ? 'Save Draft' : 'Create Draft')}
            </Button>
          </div>
        </div>
        <Button className="w-full" onClick={() => window.print()}>
          <Printer className="mr-2" size={18} /> Print
        </Button>

        {/* Show different buttons based on invoice existence */}
        {invoiceExists ? (
          // Invoice exists - show update and delete buttons
          <div className="space-y-2">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSubmit}
              disabled={isUpdating}
            >
              {isUpdating ? (<><InlineLoader className="mr-2" /> Updating...</>) : 'Update Invoice'}
            </Button>

          </div>
        ) : (
          // Invoice doesn't exist - show create button
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={handleSubmit}
          >
            Create Invoice
          </Button>
        )}

        {/* Show update changes button only if there are changes and invoice exists */}
        {hasChanges && invoiceExists && (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              Changes pending in: {Object.keys(changedFields).join(', ')}
            </div>
            <Button
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
              onClick={handleUpdateChanges}
              disabled={isUpdating}
            >
              {isUpdating ? (<><InlineLoader className="mr-2" /> Updating...</>) : 'Update Changes'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}


