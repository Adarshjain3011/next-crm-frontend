import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    orderData: null,      // Original order reference
    invoiceData: null,    // Current invoice data
    lastFetched: null,
    isLoading: false,
    error: null
}

const createInvoiceFromOrder = (order) => ({
    // Order reference
    orderId: order._id,
    clientId: order.clientId?._id,
    
    // Invoice specific fields
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    buyerWorkOrderDate: '',
    
    // Client details (from order)
    buyerName: order.clientId?.name || '',
    buyerAddress: order.clientId?.address || '',
    buyerGSTIN: '',
    panNo: '',
    stateCode: '',
    stateName: '',
    
    // Shipping details
    vehicleNo: '',
    transporterName: '',
    shippingAddress: '',
    ewayBillNumber: '',
    
    // Items (from order)
    items: order.finalQuotationId?.items?.map(item => ({
        description: item.description || '',
        hsn: item.hsn || '',
        unit: item.unit || '',
        quantity: item.quantity || 1,
        rate: item.finalUnitPrice || 0,
        amount: item.subtotal || 0,
    })) || [],
    
    // Charges (from order)
    transportCharges: order.transport || 0,
    installationCharges: order.finalQuotationId?.installation || 0,
    
    // Tax details
    taxableAmount: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    gstAmount: order.finalQuotationId?.gstAmount || 0,
    totalAmount: order.finalQuotationId?.totalAmount || 0,
    
    // Additional details
    paymentTerms: '',
    paymentStatus: 'Pending',
    notes: '',
    
    lastModified: Date.now()
});

const invoiceSlice = createSlice({
    name: "invoice",
    initialState,
    reducers: {
        setOrderData: (state, action) => {
            state.orderData = action.payload;
            state.error = null;
        },
        initializeInvoiceForm: (state, action) => {
            const { savedInvoice, order } = action.payload;
            state.orderData = order;
            state.invoiceData = savedInvoice || createInvoiceFromOrder(order);
            state.lastFetched = Date.now();
            state.error = null;
            state.isLoading = false;
        },
        updateInvoice: (state, action) => {
            state.invoiceData = action.payload;
            state.error = null;
        },
        clearInvoice: (state) => {
            return { ...initialState };
        },
        resetToOrderData: (state) => {
            if (state.orderData) {
                state.invoiceData = createInvoiceFromOrder(state.orderData);
                state.error = null;
            }
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload !== undefined ? action.payload : true;
            state.error = null;
        },
        stopLoading: (state) => {
            state.isLoading = false;
        }
    }
});

export const {
    setOrderData,
    initializeInvoiceForm,
    updateInvoice,
    clearInvoice,
    resetToOrderData,
    setError,
    setLoading,
    stopLoading
} = invoiceSlice.actions;

export default invoiceSlice.reducer;

