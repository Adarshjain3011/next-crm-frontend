import { head } from "lodash";
import axios from "../app/providers/axiosCall.js";

import { handleAxiosError } from "./handleAxiosError.js";



export async function fetchAllUserQueries() {

    try {


        const res = await axios.get('/get-all-enquery');

        console.log("res ka data ", res.data.data);

        return res.data.data;

    } catch (error) {

        console.error("Error fetching categories:", error);
        // toast.error("Failed to fetch categories");
        throw error;

    }
}



export async function fetchAllSalesPerson() {

    try {


        const response = await axios.get('/get-all-salespersonData');

        console.log("salesperson ka data ", response.data.data);

        return response.data.data;

    } catch (error) {

        throw error;

    }
}



export async function assignSalesPersonToEnquery(data) {

    try {

        const res = await axios.post('/assign-person-to-enquery', data);

        return res.data.data;

    } catch (error) {

        console.log("error is ", error);

        throw error;

    }
}


export async function updateEnqueryRequirement (data){

    try{

        const result = await axios.post("/update-enquery-requirement",data);

        return result.data.data;
        

    }catch(error){

        console.log("error is : ",error);

        throw error
    }

}


// assign vendor to the Enquery 

export async function assignVendorToEnquery(data) {

    try {

        const res = await axios.post('/assign-vendor-to-enquery', data);

        return res.data.data;

    } catch (error) {

        console.log(error);
        throw error;
    }

}



// delete vendor from the enquery 

export async function deleteVendorFromEnquery(data) {

    try {

        const res = await axios.post('/delete-vendor-from-enquery', data);

        return res.data.data;

    } catch (error) {

        console.log("error is ", error);

        throw error;
    }
}


export async function addNewFollowUpHandler(data) {

    try {

        const result = await axios.post('/add-new-followups', data);

        return result.data.data;

    } catch (error) {

        console.log("error is ", error);

        throw error;

    }
}



export async function respondToFollowUp(data) {

    try {

        const result = await axios.post('/respondToFollowUps', data);

        return result.data.data;

    } catch (error) {

        console.log("error is ", error);
        throw error;
    }
}


// auth api handler 

export async function loginHandler(data) {

    try {

        const result = await axios.post("/login", data);

        return result.data.data;

    } catch (error) {

        console.log("error is ", error);

        throw error; // keep the original AxiosError structure

    }
}



export async function logoutHandler() {

    try {

        const result = await axios.get("/logout");

        console.log("result of logout is ", result.data);

        return result.data.data;

    } catch (error) {

        console.log("error is ", error);

        throw error; // keep the original AxiosError structure

    }
}



// Quote Api Routes ---- >


// add new quotation to the client

export async function addNewQuotationToClient(formData) {
    try {
        const result = await axios.post('/create-new-quote', formData, {
            headers: {
                "Content-Type": 'multipart/form-data'
            }
        });

        return result.data;

    } catch (error) {
        console.log("error is ", error);
        throw error; // keep the original AxiosError structure
    }
}


// get all quote 

export async function getAllQuote(enqueryId) {

    try {

        const result = await axios.get(`/get-all-quote-revisions/${enqueryId}`);

        console.log("result is ", result.data.data);

        return result.data.data;

    } catch (error) {

        console.log("error is ", error);
        throw error;
    }
}




// create new user 


export async function createNewUser(data) {

    try {

        const result = await axios.post('/create-user', data);

        console.log("result of create new user is ", result.data.data);

        return result.data.data;

    } catch (error) {

        console.log("error is ", error);

        throw error;
    }
}


// delete user data

export async function deleteUserData(userId) {

    try {

        const resut = await axios.post('/delete-user', { userId });
        console.log("result of delete user is ", resut.data.data);
        return resut.data.data;

    } catch (error) {

        console.log("error is ", error);

        throw error;

    }
}



// get - all - members - data

export async function getAllMembersData() {

    try {


        const response = await axios.get('/get-all-members-data');

        console.log("all members ka data ", response.data.data);

        return response.data.data;

    } catch (error) {

        throw error;

    }
}


// update members data ---->

export async function updateMembersData(data) {

    try {

        const result = await axios.post('/update-members-data', data);

        return result.data.data;

    } catch (error) {

        console.log("error is : ", error);
        throw error;

    }
}



// create new client enquery 

export async function createNewClientEnquery(data) {

    try {

        const result = await axios.post('/create-enquery', data);

        return result.data.data;

    } catch (error) {

        console.log("error is : ", error);
        throw error;

    }
}



// add new vendor at the quotes 


export async function addNewVendorTOQuoteHandler(data) {

    try {

        // quoteId, itemIndex, vendorData

        const result = await axios.post('/add-new-vendor-to-quote', data);

        return result.data.data;

    } catch (error) {

        console.log("error is : ", error);
        throw error;

    }
}



// remove vendor at the quotes 


export async function removeVendorFromQuoteHandler(data) {

    try {

        // quoteId, itemIndex, vendorData

        const result = await axios.post('/remove-vendor-at-quote', data);

        return result.data.data;

    } catch (error) {

        console.log("error is : ", error);
        throw error;

    }
}



// update the quote details 


export async function updateQuoteItemDetailsHandler(data) {

    try {

        // quoteId, itemIndex, updatedItemData

        const result = await axios.post('/update-quote-item-details', data);

        return result.data.data;

    } catch (error) {

        console.log("error is : ", error);
        throw error;

    }
}



// update-root-fields-and-item-add-delete-and-update


export async function updateRootFieldsAndItemAddDeleteAndUpdate(data) {

    try {

        const result = await axios.post('/update-root-fields-and-item-add-delete-and-update', data, {

            headers: {

                "Content-Type": 'multipart/form-data'
            }

        });

        return result.data.data;

    } catch (error) {

        console.log("error is : ", error);
        throw error;

    }
}



export async function updateQuoteStatus(data) {

    try {

        // quoteId, status

        const result = await axios.post('/update-quote-status', data);

        return result.data.data;

    } catch (error) {

        console.log("error is : ", error);
        throw error;

    }
}

export async function getAllOrders() {

    try {

        const response = await axios.get('/get-all-orders');

        console.log("all orders ka data ", response.data.data);

        return response.data.data;

    } catch (error) {

        console.error("Error fetching orders:", error);
        throw error;

    }

}


export async function updateOrderStatus(data) {


    try {

        // orderId, status, remarks

        const result = await axios.post("/update-order-status", data);

        return result.data.data;

    } catch (error) {

        console.error("Error occur while update order status:", error);
        throw error;

    }
}

export async function getSpecifiEnqueryDetails(enqueryId) {

    try {

        const response = await axios.get(`/get-specific-enquery-data/${enqueryId}`);

        console.log("enquery details ka data ", response.data.data);

        return response.data.data;

    } catch (error) {

        console.error("Error fetching enquery details:", error);
        throw error;

    }

}




// update follow up status 


export async function updateFollowUpStatus(data) {

    try {

        const result = await axios.post("/update-follow-up-status", data);


        console.log("updatedd folllow ups ka data", result.data.data);

        return result.data.data;


    } catch (error) {

        console.log(error);

        throw error;

    }
}




// create new invoice form 

export async function createNewInvoice(data) {

    try {

        const result = await axios.post('/create-new-invoice', data);

        return result.data.data;

    } catch (error) {

        console.log("error is : ", error);
        throw error;

    }
}



// update invoice data 

export async function updateInvoiceData(data) {

    try {

        const result = await axios.post('/update-invoice-data', data);

        return result.data.data;

    } catch (error) {

        console.log("error is : ", error);
        throw error;

    }
}


// get the invoice details 

export async function getInvoiceDetails(data) {

    try {

        const result = await axios.post('/get-invoice-details', data);

        return result.data.data;


    } catch (error) {

        console.log("error is : ", error);
        throw error;

    }
}


export async function resetPassword (data){

    try{

        const result = await axios.post("/reset-password",data);

        console.log("result is : ",result);

        return result.data.data;

    }catch(error){

        console.log("error is : ",error);
        throw error;

    }
}



// upload pdf to invoice 


export async function uploadPdfToInvoice(formData) {

    try {

        const result = await axios.post('/upload-invoice-pdf', formData, {

            headers: {
                "Content-Type": 'multipart/form-data'
            }

        });

        return result.data.data;


    } catch (error) {

        console.log("error is : ", error);
        throw error;

    }

}


export async function deleteInvoiceData(invoiceId) {
    try {
        const result = await axios.get(`/delete-invoice-formData/${invoiceId}`);
        return result.data.data;
    } catch (error) {
        console.log("error is : ", error);
        throw error;
    }
}

export const getAllInvoices = async () => {
    try {
        const response = await axios.get(`/get-all-invoice-form`);
        return response.data.data || [];
    } catch (error) {
        if (
            error.response &&
            error.response.status === 400 &&
            error.response.data?.message === 'no invoices found'
        ) {
            return [];
        }
        throw error;
    }
};




export const getAllNotification = async()=>{

    try{

        const result = await axios.get("/get-all-notification");

        console.log("result is : ",result.data.data);

        return result.data.data;

    }catch(error){

        console.log("error is : ",error);
        throw error;
    }
}




export const updateEnqueryDetails = async(data)=>{

    try{

        const result = await axios.post("/update-enquery-details",data);

        console.log("result is : ",result);

        return result.data.data;


    }catch(error){

        console.log("error is : ",error);

        throw error;

    }

}



export const deleteSpecificEnquery = async(enqueryId)=>{

    try{

        const result = await axios.get(`/deleteSpecificEnquery/${enqueryId}`);

        console.log("delete enquery result is : ",result);

        return result.data.data;

    }catch(error){

        console.log("error is : ",error);

        throw error;

    }
}


export const updateUserImage = async(data)=>{


    try{

        console.log("data at the update user image api.js file ",data);

        const result = await axios.post("/updateUserImage",data,{

            headers: {
                "Content-Type": 'multipart/form-data'
            }

        });

        console.log("update user data ",result);

        return result.data.data;


    }catch(error){

        console.log("error is : ",error);
        throw error;

    }

}


