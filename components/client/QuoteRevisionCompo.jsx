'use client'

import { Button } from "../ui/button";
import { qouteTablesHeader, user_role, quote_status, vendor_delivery_status } from "@/lib/data";
import { useState, useEffect } from "react";
import { formatDateForInput } from '@/lib/utils';
import AddNewQuoteForm from "./NewQuoteForm";
import { Input } from "../ui/input";
import toast from "react-hot-toast";
import {
  updateVendorDataAtQuotes,
  addNewVendor,
  deleteVendor,
  setLoading,
  setError,
  addNewQuote,
  updateRootFieldsAndItem,
  setQuoteData
} from "@/app/store/slice/quoteSlice";
import { useDispatch, useSelector } from "react-redux";
import { handleAxiosError } from "@/lib/handleAxiosError";
// import { addNewQuotationToClient, updateQuoteStatus, fetchQuotesForClient } from "@/lib/api";

import { addNewQuotationToClient, updateQuoteStatus, getSpecifiEnqueryDetails } from "@/lib/api";

import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { addNewVendorTOQuoteHandler, removeVendorFromQuoteHandler, updateQuoteItemDetailsHandler } from "@/lib/api";

import { clearAllQuoteData } from "@/app/store/slice/quoteSlice";

import { SectionLoader } from '@/components/ui/loader';




export default function QuoteRivisionComponent({ dummyData, client, setClient, enquiryData, enqueryId }) {

  console.log("dummy data is : ", dummyData);


  const dispatch = useDispatch();
  const { data: reduxQuoteData, loading, error } = useSelector((state) => state.quote);
  const membersData = useSelector((state) => state.members.data);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const queryClient = useQueryClient();

  const data = enquiryData || reduxQuoteData || dummyData;


  // Ensure data is always an array before mapping
  const normalizedData = Array.isArray(data) ? data : data ? [data] : [];

  // Filter vendors from members data
  const vendorData = membersData?.filter((val) => val.role === user_role.vendor) || [];

  // Helper function to get vendor name by ID
  const getVendorNameById = (vendorId) => {
    const vendor = vendorData.find(v => v._id === vendorId);
    return vendor ? vendor.name : 'Unknown Vendor';
  };

  const [addNewQuoteFormModal, setAddNewQuoteFormModal] = useState(false);
  const [isMainRowEditing, setMainRowEditing] = useState(false);
  const [editItemDataAtQuotes, setEditItemDataAtQuotes] = useState({});
  const [editItemKey, setEditItemKey] = useState({});
  const [editingVendorKey, setEditingVendorKey] = useState(null);
  const [editVendorDataAtQuotes, setEditVendorDataAtQuotes] = useState({});
  const [editingQuoteIndex, setEditingQuoteIndex] = useState(null);
  const [editQuoteData, setEditQuoteData] = useState({}); // this is the main thing 


  const handleVendorDetailsChangeHandlerAtQuotes = (e, key) => {
    const { name, value } = e.target;
    setEditVendorDataAtQuotes((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [name]: name === "vendorId" ? value :
          name === "quantity" || name === "costPerUnit" || name === "advance"
            ? Number(value)
            : value,
      },
    }));
  };

  const addNewVendorAtQuotes = async (versionIndex, itemIndex) => {
    try {
      dispatch(setLoading(true));
      const newVendor = {
        vendorId: "",
        description: "",
        quantity: "",
        costPerUnit: "",
        advance: "",
        deliveryDate: Date.now(),
        isNew: true, // Flag to indicate it's not saved in the database
      };


      dispatch(addNewVendor({ versionIndex, itemIndex, vendor: newVendor }));
      handleEditVendorAtQuotes(versionIndex, itemIndex, data[versionIndex].items[itemIndex].vendors.length);
    } catch (error) {
      dispatch(setError(error.message));
      handleAxiosError(error);
    } finally {
      dispatch(setLoading(false));
    }
  };


  const handleEditItemAtQuotes = (quoteIndex, itemIndex) => {
    const itemKey = `${quoteIndex}-${itemIndex}`;
    const item = data[quoteIndex].items[itemIndex];
    setEditItemKey(itemKey);
    setEditItemDataAtQuotes(prev => ({
      ...prev,
      [itemKey]: { ...item }
    }));
    setEditingQuoteIndex(itemKey);
    setEditQuoteData({ ...data[quoteIndex] });
  };


  const handleQuoteFieldChange = (e) => {
    const { name, value } = e.target;
    setEditQuoteData(prev => ({
      ...prev,
      [name]: ["taxPercentage", "transport", "installation", "totalAmount"].includes(name)
        ? Number(value)
        : value
    }));
  };



  const handleSaveVendorChangesAtQuotes = async (versionIndex, itemIndex, vendorIdx) => {

    console.log("handle save vendor changes at quotes called", versionIndex, itemIndex, vendorIdx);

    // quoteId, itemIndex, vendorData,vendorIndex,isUpdate

    try {
      // Validate required fields
      const vendorKey = `${versionIndex}-${itemIndex}-${vendorIdx}`;
      let vendorData = editVendorDataAtQuotes[vendorKey];

      if (!vendorData?.vendorId) {
        toast.error("Please select a vendor");
        return;
      }
      if (!vendorData?.description?.trim()) {
        toast.error("Please enter a description");
        return;
      }
      if (!vendorData?.quantity) {
        toast.error("Please enter quantity");
        return;
      }
      if (!vendorData?.costPerUnit) {
        toast.error("Please enter cost per unit");
        return;
      }
      if (!vendorData?.deliveryDate) {
        toast.error("Please select delivery date");
        return;
      }

      // if(!vendorData?.vendordeliveryStatus) {


      // }

      console.log("vendor key ", vendorKey);

      console.log("vendor data is", vendorData);

      // add version and item version

      vendorData = {
        ...vendorData,
        version: data[versionIndex].version,
        itemIndex: itemIndex,

      };

      console.log("vendor data is : ", vendorData);

      console.log("data at the quotes is ", data[versionIndex]);

      dispatch(setLoading(true));

      // Create a deep copy of the data to avoid mutation
      const updatedData = JSON.parse(JSON.stringify(data));

      // Get the vendor data from the edit state
      const updatedVendorData = editVendorDataAtQuotes[vendorKey];

      // Update the vendor data in the new array
      if (updatedData[versionIndex]?.items[itemIndex]?.vendors) {
        updatedData[versionIndex].items[itemIndex].vendors = [
          ...updatedData[versionIndex].items[itemIndex].vendors.slice(0, vendorIdx),
          {
            ...updatedData[versionIndex].items[itemIndex].vendors[vendorIdx],
            ...updatedVendorData
          },
          ...updatedData[versionIndex].items[itemIndex].vendors.slice(vendorIdx + 1)
        ];
      }

      // quoteId, itemIndex, vendorData 


      let preparedData = {

        quoteId: updatedData[versionIndex]._id,
        itemIndex: itemIndex,
        vendorData: vendorData,
        vendorIndex: vendorIdx

      }

      console.log("prepared data is : ", preparedData);

      // save vendor to the quotes

      const result = await addNewVendorTOQuoteHandler(preparedData);

      console.log("result at add new vendor at quotes is ", result);

      console.log("updated data that they going to update ");

      // Dispatch the update with the new array
      dispatch(updateVendorDataAtQuotes(updatedData));
      setEditingVendorKey(null);
      toast.success("Vendor details updated successfully");


    }
    catch (error) {
      console.log("error is ", error);
      dispatch(setError(error.message));
      handleAxiosError(error);
      toast.error("Failed to update vendor details");
    } finally {
      dispatch(setLoading(false));
    }
  };


  // handle edit vendor

  const handleEditVendorAtQuotes = async (quoteIndex, itemIndex, vendorIdx) => {

    console.log("handle edit vendor at quotes called with quoteIndex: ", quoteIndex, " itemIndex: ", itemIndex, " vendorIdx: ", vendorIdx);

    const vendorKey = `${quoteIndex}-${itemIndex}-${vendorIdx}`;
    const itemKey = `${quoteIndex}-${itemIndex}`;
    const vendor = data[quoteIndex].items[itemIndex].vendors[vendorIdx];
    const item = data[quoteIndex].items[itemIndex];


    // console.log("vendor data is ", vendor);

    // quoteId, itemIndex, vendorData

    console.log("item key is ", itemKey);
    console.log("item data is ", item);
    console.log("quote index is ", quoteIndex);
    console.log("item index is ", itemIndex);


    setEditingVendorKey(vendorKey);
    setEditVendorDataAtQuotes(prev => ({
      ...prev,
      [vendorKey]: { ...vendor }
    }));

  };

  const handleDeleteVendorAtQuotes = async (vendorId, itemIndex, versionIndex) => {
    try {
      console.log("delete vendor at quotes called with vendorId: ", vendorId, " itemIndex: ", itemIndex, " versionIndex: ", versionIndex);

      const vendor = data[versionIndex].items[itemIndex].vendors.find(v => v.vendorId === vendorId);

      // Check if the vendor is blank (no details filled)
      if (!vendor?.vendorId && !vendor?.description?.trim() && !vendor?.quantity && !vendor?.costPerUnit) {
        // Remove blank vendor directly from Redux state
        dispatch(deleteVendor({ versionIndex, itemIndex, vendorId }));
        toast.success("Blank vendor removed successfully");
        return;
      }

      if (vendor?.isNew) {
        // If the vendor is new and not saved in the database, remove it directly from Redux state
        dispatch(deleteVendor({ versionIndex, itemIndex, vendorId }));
        toast.success("Unsaved vendor deleted successfully");
        return;
      }

      // Prepare data for backend deletion
      let preparedData = {
        quoteId: data[versionIndex]._id,
        itemIndex: itemIndex,
        vendorId: vendorId,
      };

      const result = await removeVendorFromQuoteHandler(preparedData);

      console.log("result at remove vendor from quote handler is ", result);

      dispatch(setLoading(true));
      dispatch(deleteVendor({ versionIndex, itemIndex, vendorId }));

      toast.success("Vendor deleted successfully");
    } catch (error) {
      dispatch(setError(error.message));
      handleAxiosError(error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const editItemChangeHandler = (e, key) => {
    const { name, value } = e.target;
    setEditItemDataAtQuotes(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [name]: value
      }
    }));
  }

  // Add new Quotation to the client 

  const addNewQuotation = async (formData) => {
    try {
      dispatch(setLoading(true));

      // Call the API to add new quotation
      const response = await addNewQuotationToClient(formData);

      console.log("response ka data at add new quotation", response.data);

      dispatch(addNewQuote(response.data));
      setAddNewQuoteFormModal(false);
      toast.success("Quote added successfully!");

    } catch (error) {

      console.log("error is ", error);

      console.error("Error adding quote:", error);
      dispatch(setError(error.message));
      handleAxiosError(error);
      toast.error("Failed to add quote");

    } finally {
      dispatch(setLoading(false));
    }
  };

  // handle save edit item at quotes

  const handleSaveEditItemAtQuotes = async (versionIdx, itemIdx) => {
    try {
      const itemKey = `${versionIdx}-${itemIdx}`;
      const editedItem = editItemDataAtQuotes[itemKey];
      if (!editedItem) {
        toast.error("No changes to save.");
        return;
      }

      console.log("edited item is ", editedItem);

      // now we have to update the item in the db 

      // Create a deep copy of the data array
      let updatedData = JSON.parse(JSON.stringify(data));
      updatedData[versionIdx].items[itemIdx] = {
        ...updatedData[versionIdx].items[itemIdx],
        ...editedItem,
      };

      // update item data of the quote at the backend side 

      // quoteId, itemIndex, updatedItemData

      let prepareData = {

        quoteId: updatedData[versionIdx]._id,
        itemIndex: itemIdx,
        updatedItemData: updatedData[versionIdx].items[itemIdx],

      }

      console.log("prepare data is at save edit item at quotes", prepareData);

      const result = await updateQuoteItemDetailsHandler(prepareData);

      console.log("result at update quote item details handler is ", result);

      // Update the state with the modified data
      dispatch(updateVendorDataAtQuotes(updatedData)); // Assuming this updates the Redux store

      // Reset editing states
      setEditItemKey({});
      setEditItemDataAtQuotes({});
      setEditingQuoteIndex({});
      toast.success("Item changes saved successfully!");

    } catch (error) {

      console.log("error is ", error);
      toast.error(error.message);

    }
  };



  const handleStatusChange = async (quoteId, newStatus) => {
    try {
      dispatch(setLoading(true));
      const response = await updateQuoteStatus({ quoteId, status: newStatus });
      toast.success(`Quote status updated to ${newStatus}`);

      // Update the local state to reflect the change
      const updatedData = data.map(quote =>
        quote._id === quoteId
          ? { ...quote, status: newStatus }
          : quote
      );
      dispatch(setQuoteData(updatedData));
    } catch (error) {
      console.error("Error updating quote status:", error);
      handleAxiosError(error);
      toast.error("Failed to update quote status");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (

    <div className="w-screen max-w-[96%] overflow-x-scroll">

      <div className='flex justify-between items-center'>
        <h2 className="text-xl font-bold mb-3">Quote Revisions</h2>
        <Button onClick={() => setAddNewQuoteFormModal(true)}>Add New Quote</Button>
      </div>

      {!normalizedData.length && !loading && (
        <div className="text-center py-4 text-gray-500">No quote data available. Click "Add New Quote" to create one.</div>
      )}

      {loading && <SectionLoader text="Loading quote data..." />}

      {normalizedData.length > 0 && (
        <table className="w-full border-collapse border text-sm text-left">
          <thead>
            <tr className="bg-gray-100">
              {qouteTablesHeader.map((data, index) => (
                <th key={index} className="border px-3 py-2">{data}</th>
              ))}
              <th className="border px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {normalizedData.map((quote, quoteIdx) => {
              // Ensure items is always an array
              const items = Array.isArray(quote?.items) ? quote.items : [];
              const totalItems = items.length;
              return items.map((item, itemIdx) => {
                const hasVendors = Array.isArray(item?.vendors) && item.vendors.length > 0;
                const mainRowKey = `${quoteIdx}-${itemIdx}`;
                const isEditingMainItem = editItemKey === mainRowKey;
                const isFirstItemInVersion = itemIdx === 0;

                return hasVendors ? (
                  item.vendors.map((vendor, vendorIdx) => {
                    const rowKey = `${quoteIdx}-${itemIdx}-${vendorIdx}`;
                    const isEditing = editingVendorKey === rowKey;
                    const isFirstVendorInFirstItem = isFirstItemInVersion && vendorIdx === 0;

                    return (
                      <tr key={rowKey} className="border-b">
                        {/* Show version and cost details only for first vendor of first item in a version */}
                        {isFirstVendorInFirstItem && (
                          <>
                            <td className="border px-3 py-2 text-blue-600 font-medium" rowSpan={quote.items.reduce((acc, curr) => acc + (curr.vendors?.length || 1), 0)}>
                              <div className="flex flex-col gap-2 items-start">
                                <span>{quote.version}</span>
                                {quote.image && (
                                  <a href={quote.image} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">
                                    View Attachment
                                  </a>
                                )}
                              </div>
                            </td>
                          </>
                        )}

                        {vendorIdx === 0 && (
                          <>
                            <td className="border px-3 py-2" rowSpan={item.vendors.length}>
                              {isEditingMainItem && editItemDataAtQuotes ? (
                                <input
                                  name="description"
                                  value={editItemDataAtQuotes[mainRowKey]?.description || ""}
                                  onChange={(e) => editItemChangeHandler(e, mainRowKey)}
                                  className="border px-2 py-2"
                                />
                              ) : (
                                item.description
                              )}
                            </td>
                            <td className="border px-3 py-2" rowSpan={item.vendors.length}>
                              {isEditingMainItem && editItemDataAtQuotes ? (
                                <input
                                  name="hsn"
                                  type="text"
                                  value={editItemDataAtQuotes[mainRowKey]?.hsn || ""}
                                  onChange={(e) => editItemChangeHandler(e, mainRowKey)}
                                  className="border px-2 py-2"
                                />
                              ) : (
                                item.hsn
                              )}
                            </td>
                            <td className="border px-3 py-2" rowSpan={item.vendors.length}>
                              {isEditingMainItem && editItemDataAtQuotes ? (
                                <input
                                  name="unit"
                                  type="text"
                                  value={editItemDataAtQuotes[mainRowKey]?.unit || ""}
                                  onChange={(e) => editItemChangeHandler(e, mainRowKey)}
                                  className="border px-2 py-2"
                                />
                              ) : (
                                item.unit
                              )}
                            </td>
                            <td className="border px-3 py-2" rowSpan={item.vendors.length}>
                              {isEditingMainItem && editItemDataAtQuotes ? (
                                <input
                                  name="quantity"
                                  type="text"
                                  value={editItemDataAtQuotes[mainRowKey]?.quantity || ""}
                                  onChange={(e) => editItemChangeHandler(e, mainRowKey)}
                                  className="border px-2 py-2"
                                />
                              ) : (
                                item.quantity
                              )}
                            </td>
                            <td className="border px-3 py-2" rowSpan={item.vendors.length}>
                              {isEditingMainItem && editItemDataAtQuotes ? (
                                <input
                                  name="finalUnitPrice"
                                  type="number"
                                  value={editItemDataAtQuotes[mainRowKey]?.finalUnitPrice || ""}
                                  onChange={(e) => editItemChangeHandler(e, mainRowKey)}
                                  className="border px-2 py-2"
                                />
                              ) : (
                                `₹${item.finalUnitPrice}`
                              )}
                            </td>
                            {isFirstVendorInFirstItem && (
                              <>
                                <td className="border px-3 py-2" rowSpan={quote.items.reduce((acc, curr) => acc + (curr.vendors?.length || 1), 0)}>{quote.taxPercent}%</td>
                                <td className="border px-3 py-2" rowSpan={quote.items.reduce((acc, curr) => acc + (curr.vendors?.length || 1), 0)}>₹{quote.transport}</td>
                                <td className="border px-3 py-2" rowSpan={quote.items.reduce((acc, curr) => acc + (curr.vendors?.length || 1), 0)}>₹{quote.installation}</td>
                              </>
                            )}
                          </>
                        )}
                        {/* Vendor Fields */}

                        {/* vendor name */}

                        <td className="border px-3 py-2 min-w-xs">
                          {isEditing ? (
                            <select
                              name="vendorId"
                              value={editVendorDataAtQuotes[rowKey]?.vendorId || ""}
                              onChange={(e) => handleVendorDetailsChangeHandlerAtQuotes(e, rowKey)}
                              className={`w-full px-2 py-1 border rounded bg-white ${!editVendorDataAtQuotes[rowKey]?.vendorId ? 'border-red-500' : ''}`}
                            >
                              <option value="">Select a vendor *</option>
                              {vendorData.map((vendor) => (
                                <option key={vendor._id} value={vendor._id}>
                                  {vendor.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            getVendorNameById(vendor.vendorId)
                          )}
                        </td>

                        {/* vendor description */}

                        <td className="border px-3 py-2 relative min-w-xs">
                          {isEditing ? (
                            <input
                              type="text"
                              name="description"
                              value={editVendorDataAtQuotes[rowKey]?.description || ""}
                              onChange={(e) => handleVendorDetailsChangeHandlerAtQuotes(e, rowKey)}
                              className={`w-full px-2 border rounded h-16 text-start ${!editVendorDataAtQuotes[rowKey]?.description?.trim() ? 'border-red-500' : ''
                                }`}
                              placeholder="Enter description *"
                            />
                          ) : (
                            vendor.description
                          )}
                        </td>

                        {/* quantity */}

                        <td className="border px-3 py-2 min-w-[150px]">
                          {isEditing ? (
                            <input
                              type="number"
                              name="quantity"
                              value={editVendorDataAtQuotes[rowKey]?.quantity || ""}
                              onChange={(e) => handleVendorDetailsChangeHandlerAtQuotes(e, rowKey)}
                              className={`w-full px-2 py-1 border rounded ${!editVendorDataAtQuotes[rowKey]?.quantity ? 'border-red-500' : ''
                                }`}
                              placeholder="Enter quantity *"
                              min="1"
                            />
                          ) : (
                            vendor.quantity
                          )}
                        </td>

                        {/* cost per unit */}

                        <td className="border px-3 py-2 min-w-[150px]">
                          {isEditing ? (
                            <input
                              type="number"
                              name="costPerUnit"
                              value={editVendorDataAtQuotes[rowKey]?.costPerUnit || ""}
                              onChange={(e) => handleVendorDetailsChangeHandlerAtQuotes(e, rowKey)}
                              className={`w-full px-2 py-1 border rounded ${!editVendorDataAtQuotes[rowKey]?.costPerUnit ? 'border-red-500' : ''
                                }`}
                              placeholder="Enter cost per unit *"
                              min="0"
                            />
                          ) : (
                            `₹${vendor.costPerUnit}`
                          )}
                        </td>

                        {/* advance */}

                        <td className="border px-3 py-2 min-w-[150px]">
                          {isEditing ? (
                            <input
                              type="number"
                              name="advance"
                              value={editVendorDataAtQuotes[rowKey]?.advance || ""}
                              onChange={(e) => handleVendorDetailsChangeHandlerAtQuotes(e, rowKey)}
                              className="w-full px-2 py-1 border rounded"
                              placeholder="Enter advance amount"
                              min="0"
                            />
                          ) : (
                            `₹${vendor.advance}`
                          )}
                        </td>

                        {/* delivery date  */}

                        <td className="border px-3 py-2 min-w-[150px]">
                          {isEditing ? (
                            <input
                              type="date"
                              name="deliveryDate"
                              value={formatDateForInput(editVendorDataAtQuotes[rowKey]?.deliveryDate)}
                              onChange={(e) => handleVendorDetailsChangeHandlerAtQuotes(e, rowKey)}
                              className={`w-full px-2 py-1 border rounded ${!editVendorDataAtQuotes[rowKey]?.deliveryDate ? 'border-red-500' : ''
                                }`}
                              required
                            />
                          ) : (
                            new Date(vendor.deliveryDate).toLocaleDateString()
                          )}
                        </td>

                        {/* vendor delivery  status  */}

                        <td className="border px-3 py-2 min-w-[150px]">
                          {isEditing ? (
                            <select
                              name="vendordeliveryStatus"
                              value={editVendorDataAtQuotes[rowKey]?.vendordeliveryStatus || ""}
                              onChange={(e) => handleVendorDetailsChangeHandlerAtQuotes(e, rowKey)}
                              className={`w-full px-2 py-1 border rounded bg-white ${!editVendorDataAtQuotes[rowKey]?.vendorId ? 'border-red-500' : ''}`}
                            >
                              <option value="">Update Vendor delivery status *</option>
                              {Object.values(vendor_delivery_status).map((status, index) => (
                                <option key={index} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          ) : (
                            vendor.vendordeliveryStatus || vendor_delivery_status.Pending
                          )}

                        </td>


                        <td className="border px-3 py-2 flex gap-3">
                          {isEditing ? (
                            <Button onClick={() => handleSaveVendorChangesAtQuotes(quoteIdx, itemIdx, vendorIdx)}>Save</Button>
                          ) : (
                            <Button onClick={() => handleEditVendorAtQuotes(quoteIdx, itemIdx, vendorIdx)}>Edit</Button>
                          )}
                          <Button className="bg-slate-600 rounded-full p-2" onClick={() => handleDeleteVendorAtQuotes(vendor.vendorId, itemIdx, quoteIdx)}>
                            Delete
                          </Button>

                        </td>

                        {vendorIdx === 0 && (
                          <td className="border px-3 py-2" rowSpan={item.vendors.length}>
                            <Button onClick={() => addNewVendorAtQuotes(quoteIdx, itemIdx)}>Add New Vendor</Button>
                          </td>
                        )}
                        {vendorIdx === 0 && (
                          <td className="border px-3 py-2" >
                            {editingQuoteIndex === mainRowKey ? (
                              <div className="flex gap-3">
                                <Button onClick={() => handleSaveEditItemAtQuotes(quoteIdx, itemIdx)}>Save</Button>
                                <Button onClick={() => {
                                  setEditingQuoteIndex({});
                                  setEditItemDataAtQuotes({});
                                  setEditItemKey({});
                                }}>Cancel</Button>
                              </div>
                            ) : (
                              <Button onClick={() => handleEditItemAtQuotes(quoteIdx, itemIdx)}>Edit iTem</Button>
                            )}
                          </td>
                        )}
                        {isFirstVendorInFirstItem && (
                          <td className="border px-3 py-2 w-[200px]" rowSpan={quote.items.reduce((acc, curr) => acc + (curr.vendors?.length || 1), 0)}>
                            <select
                              className="w-full px-24 relative py-1 border rounded bg-white "
                              value={quote.status || quote_status.DRAFT}
                              onChange={(e) => handleStatusChange(quote._id, e.target.value)}
                            >
                              {Object.values(quote_status).map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr key={`${quoteIdx}-${itemIdx}-no-vendor`} className="border-b">
                    {isFirstItemInVersion && (
                      <>
                        <td className="border px-3 py-2 text-blue-600 font-medium" rowSpan={quote.items.reduce((acc, curr) => acc + (curr.vendors?.length || 1), 0)}>
                          <div className="flex flex-col gap-2 items-start">
                            <span>{quote.version}</span>
                            {quote.image && (
                              <a href={quote.image} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">
                                View Attachment
                              </a>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                    <td className="border px-3 py-2">
                      {isEditingMainItem && editItemDataAtQuotes ? (
                        <input
                          name="description"
                          value={editItemDataAtQuotes[mainRowKey]?.description || ""}
                          onChange={(e) => editItemChangeHandler(e, mainRowKey)}
                          className="border px-2 py-2"
                        />
                      ) : (
                        item.description
                      )}
                    </td>
                    <td className="border px-3 py-2">
                      {isEditingMainItem && editItemDataAtQuotes ? (
                        <input
                          name="hsn"
                          type="text"
                          value={editItemDataAtQuotes[mainRowKey]?.hsn || ""}
                          onChange={(e) => editItemChangeHandler(e, mainRowKey)}
                          className="border px-2 py-2"
                        />
                      ) : (
                        item.hsn
                      )}
                    </td>
                    <td className="border px-3 py-2">
                      {isEditingMainItem && editItemDataAtQuotes ? (
                        <input
                          name="unit"
                          type="text"
                          value={editItemDataAtQuotes[mainRowKey]?.unit || ""}
                          onChange={(e) => editItemChangeHandler(e, mainRowKey)}
                          className="border px-2 py-2"
                        />
                      ) : (
                        item.unit
                      )}
                    </td>
                    <td className="border px-3 py-2">
                      {isEditingMainItem && editItemDataAtQuotes ? (
                        <input
                          name="quantity"
                          type="text"
                          value={editItemDataAtQuotes[mainRowKey]?.quantity || ""}
                          onChange={(e) => editItemChangeHandler(e, mainRowKey)}
                          className="border px-2 py-2"
                        />
                      ) : (
                        item.quantity
                      )}
                    </td>
                    <td className="border px-3 py-2">
                      {isEditingMainItem && Object.keys(editItemDataAtQuotes).length != 0 ? (
                        <input
                          name="finalUnitPrice"
                          type="number"
                          value={editItemDataAtQuotes[mainRowKey]?.finalUnitPrice || ""}
                          onChange={(e) => editItemChangeHandler(e, mainRowKey)}
                          className="border px-2 py-2"
                        />
                      ) : (
                        `₹${item.finalUnitPrice}`
                      )}
                    </td>
                    {isFirstItemInVersion && (
                      <>
                        <td className="border px-3 py-2" rowSpan={quote.items.reduce((acc, curr) => acc + (curr.vendors?.length || 1), 0)}>{quote.taxPercent}%</td>
                        <td className="border px-3 py-2" rowSpan={quote.items.reduce((acc, curr) => acc + (curr.vendors?.length || 1), 0)}>₹{quote.transport}</td>
                        <td className="border px-3 py-2" rowSpan={quote.items.reduce((acc, curr) => acc + (curr.vendors?.length || 1), 0)}>₹{quote.installation}</td>
                      </>
                    )}
                    <td className="border px-3 py-2 text-center" colSpan={6}>No vendors assigned</td>
                    <td className="border px-3 py-2" colSpan={2}>
                      <Button onClick={() => addNewVendorAtQuotes(quoteIdx, itemIdx)}>Add New Vendor</Button>
                    </td>
                    <td className="border px-3 py-2" >
                      {editingQuoteIndex === mainRowKey ? (
                        <div className="flex gap-3">
                          <Button onClick={() => handleSaveEditItemAtQuotes(quoteIdx, itemIdx)}>Save</Button>
                          <Button onClick={() => {
                            setEditingQuoteIndex({});
                            setEditItemDataAtQuotes({});
                            setEditItemKey({});
                          }}>Cancel</Button>
                        </div>
                      ) : (
                        <Button onClick={() => handleEditItemAtQuotes(quoteIdx, itemIdx)}>Edit iTem</Button>
                      )}
                    </td>
                    {isFirstItemInVersion && (
                      <td className="border px-3 py-2" rowSpan={quote.items.reduce((acc, curr) => acc + (curr.vendors?.length || 1), 0)}>
                        <select
                          className="w-full px-2 py-1 border rounded bg-white"
                          value={quote?.status || quote_status.DRAFT}
                          onChange={(e) => handleStatusChange(quote._id, e.target.value)}
                        >
                          {Object.values(quote_status).map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      )}

      {addNewQuoteFormModal && (
        <AddNewQuoteForm
          dummyData={data}
          setAddNewQuoteFormModal={setAddNewQuoteFormModal}
          addNewQuotation={addNewQuotation}
          client={client}
        />
      )}
    </div>
  );
}

