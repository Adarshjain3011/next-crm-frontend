'use client'

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { RxCrossCircled } from "react-icons/rx";
import { Input } from "../ui/input";
import { Label } from "@radix-ui/react-label";

import { Select } from "../ui/select";

import { Button } from "../ui/button";

import { addNewQuotationToClient } from "@/lib/api";

import { handleAxiosError } from "@/lib/handleAxiosError";

import { useDispatch } from "react-redux";

import { addNewQuote } from "@/app/store/slice/quoteSlice";

import { updateRootFieldsAndItemAddDeleteAndUpdate } from "@/lib/api";

import toast from "react-hot-toast";

import { setQuoteData } from "@/app/store/slice/quoteSlice";

import { updateRootFieldsAndItem } from "@/app/store/slice/quoteSlice";

import { InlineLoader } from '@/components/ui/loader';

import { removeImageFromQuotes } from "@/lib/api";

import ExcelReader from "../common/ExcelReader";


let rootItemsFields = [
    "description",
    "hsn",
    "unit",
    "quantity",
    "finalUnitPrice",
    "subtotal"
]


let rootQuotationFields = [

    "taxPercent",
    "transport",
    "installation",
    "totalAmount",
    "reason",
    "image"
]


let type_of_item_changes = {

    removed: "removed",
    add: "add",
    modified: "modified",

}


export default function AddNewQuoteForm({ dummyData = [], setAddNewQuoteFormModal, addNewQuotation, client, queryClient }) {

    const [data, setData] = useState([]);


    console.log("dummy data inside the addnewQuote Form ", dummyData);

    // if it is a new quote then we have to show the new quote form

    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);

    // Add version to defaultValues
    const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            version: "New Quote",
            clientId: client?._id || "",
            items: [
                {
                    description: '',
                    hsn: '',
                    unit: '',
                    quantity: 0,
                    finalUnitPrice: 0,
                    subtotal: 0,
                }
            ],
            taxPercent: 0,
            transport: 0,
            installation: 0,
            totalAmount: 0,
            reason: '',
            existingImages: [],
            image: '',
            pdfUrl: '',
        }
    });

    // Watch version field
    const selectedVersion = watch("version");
    const pdfUrl = watch("pdfUrl");
    const existingImages = watch("existingImages");

    // Ensure dummyData is always an array
    const safeDummyData = Array.isArray(dummyData) ? dummyData : [];

    const onSubmit = async (data) => {
        if (!client?._id) {
            toast.error("Client information is missing");
            return;
        }

        if (data.version === "New Quote") {
            try {
                setIsLoading(true);

                // Create FormData instance
                const formData = new FormData();

                // Handle new image files
                if (data.image && data.image.length > 0) {
                    Array.from(data.image).forEach(file => {
                        formData.append('image', file);
                    });
                }

                // Prepare the data payload without the image
                const dataPayload = {
                    clientId: client._id,
                    taxPercent: Number(data.taxPercent),
                    transport: Number(data.transport),
                    installation: Number(data.installation),
                    totalAmount: Number(data.totalAmount),
                    reason: data.reason || "",
                    notes: data.notes || "",
                    pdfUrl: data.pdfUrl || '',
                    items: data.items.map(item => ({
                        ...item,
                        quantity: Number(item.quantity),
                        finalUnitPrice: Number(item.finalUnitPrice),
                        subtotal: Number(item.quantity) * Number(item.finalUnitPrice)
                    })),
                    existingImages: data.existingImages || [],
                };

                // Append the stringified data payload
                formData.append('data', JSON.stringify(dataPayload));

                // for (let pair of formData.entries()) {
                //     console.log(pair[0], pair[1]);
                // }

                // Call the addNewQuotation function with the formData
                await addNewQuotation(formData);
                setAddNewQuoteFormModal(false);

                queryClient.invalidateQueries(['quote']);

                toast.success("Quote added successfully!");

            } catch (error) {
                console.error("Error submitting form:", error);
                handleAxiosError(error);
                toast.error(error.message || "Failed to add quote");
            } finally {
                setIsLoading(false);
            }
        }
        else {
            // Updating an existing version
            const versionToUpdate = parseInt(data.version);
            const original = dummyData.find(q => q.version === versionToUpdate);

            try {
                // Create FormData for update
                const formData = new FormData();

                // Handle image if present
                if (data.image && data.image[0]) {
                    formData.append('image', data.image[0]);
                }

                // Track changes in root fields
                let rootFieldChanges = {};
                rootQuotationFields.forEach(field => {
                    if (field === "totalAmount") {
                        if (parseInt(data[field]) !== parseInt(original[field])) {
                            rootFieldChanges[field] = Number(data[field]);
                        }
                    }
                    else if (field === "image") {
                        // Skip image field as it's handled separately
                        return;
                    }
                    else if (data[field] !== original[field]) {
                        rootFieldChanges[field] = ["taxPercent", "transport", "installation"].includes(field)
                            ? Number(data[field])
                            : data[field];
                    }
                });

                // Handle pdfUrl changes
                if ((data.pdfUrl || '') !== (original.pdfUrl || '')) {
                    rootFieldChanges['pdfUrl'] = data.pdfUrl || '';
                }

                // Handle image array changes
                if (JSON.stringify(data.existingImages || []) !== JSON.stringify(original.image || [])) {
                    rootFieldChanges['image'] = data.existingImages || [];
                }

                // Track changes in items
                let itemChanges = [];
                data.items.forEach((item, index) => {
                    const originalItem = original.items[index];
                    if (!originalItem) {
                        // New item added
                        itemChanges.push({
                            index,
                            type: 'added',
                            data: {
                                ...item,
                                quantity: Number(item.quantity),
                                finalUnitPrice: Number(item.finalUnitPrice),
                                subtotal: Number(item.quantity) * Number(item.finalUnitPrice)
                            }
                        });
                        return;
                    }

                    let changes = {};
                    rootItemsFields.forEach(field => {
                        if (item[field] !== originalItem[field]) {
                            changes[field] = ["quantity", "finalUnitPrice", "subtotal"].includes(field)
                                ? Number(item[field])
                                : item[field];
                        }
                    });

                    if (Object.keys(changes).length > 0) {
                        itemChanges.push({
                            index,
                            type: 'modified',
                            changes
                        });
                    }
                });

                // Check for removed items
                original.items.forEach((_, index) => {
                    if (!data.items[index]) {
                        itemChanges.push({
                            index,
                            type: 'removed'
                        });
                    }
                });

                const hasChanges = Object.keys(rootFieldChanges).length > 0 || itemChanges.length > 0 || (data.image && data.image[0]);

                if (hasChanges) {
                    formData.append("rootFieldChanges", JSON.stringify(rootFieldChanges));
                    formData.append("itemChanges", JSON.stringify(itemChanges));
                    formData.append("quoteId", original._id);

                    const result = await updateRootFieldsAndItemAddDeleteAndUpdate(formData);

                    dispatch(updateRootFieldsAndItem({
                        rootFieldChanges,
                        itemChanges,
                        quoteId: original._id
                    }));

                    toast.success("Quotation updated successfully");
                    setAddNewQuoteFormModal(false);
                } else {
                    toast.error("No changes detected in this version.");
                }
            } catch (error) {
                console.error("Error updating quote:", error);
                handleAxiosError(error);
                toast.error("Failed to update quotation");
            }
            finally {

                queryClient.invalidateQueries(['quote']);

            }
        }
    };


    const onImageDeleteHandler = async (url, idx) => {

        try {

            console.log("url is : ", url);

            console.log("idx is : ", idx);

            console.log("current version is : ", selectedVersion);

            console.log("existing images : ", existingImages);

            const filteredData = dummyData.find((ele) => ele.version == selectedVersion);

            console.log("filtered data is : ", filteredData);

            let prepareData = {

                quoteId: filteredData._id,
                imageIndex: idx
            }

            const result = await removeImageFromQuotes(prepareData);


            setValue('existingImages', existingImages.filter((_, i) => i !== idx));

            toast.success("image deleted successfully : ", result);

            queryClient.invalidateQueries(['quote']);

        } catch (error) {

            console.log("error is : ", error);

            handleAxiosError(error);

        }

    }


    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });


    // handle version change 

    const handleVersionChange = (e) => {
        const value = e.target.value;

        setValue("version", value);

        if (value === "New Quote") {
            reset({
                version: "New Quote",
                items: [
                    {
                        description: '',
                        hsn: '',
                        unit: '',
                        quantity: 0,
                        finalUnitPrice: 0,
                        subtotal: 0,
                    }
                ],
                taxPercent: 0,
                transport: 0,
                installation: 0,
                totalAmount: 0,
                reason: '',
                existingImages: [],
                image: '',
                pdfUrl: '',
            });
        } else {
            // Find the selected version's data
            const found = dummyData.find(q => String(q.version) === value);
            if (found) {
                reset({
                    version: found.version,
                    items: found.items || [],
                    taxPercent: found.taxPercent || 0,
                    transport: found.transport || 0,
                    installation: found.installation || 0,
                    totalAmount: found.totalAmount || 0,
                    reason: found.reason || '',
                    existingImages: found.image || [],
                    image: '',
                    pdfUrl: found.pdfUrl || '',
                });
            }
        }
    };


    const calculateSubtotal = (quantity, price) => {
        return Number(quantity) * Number(price);
    };

    const calculateTotalAmount = () => {
        const items = watch("items");
        const transport = Number(watch("transport") || 0);
        const installation = Number(watch("installation") || 0);
        const taxPercent = Number(watch("taxPercent") || 0);

        const subtotalSum = items.reduce((sum, item) => {
            return sum + calculateSubtotal(item.quantity, item.finalUnitPrice);
        }, 0);

        const taxAmount = (subtotalSum * taxPercent) / 100;
        const totalAmount = (subtotalSum + taxAmount + transport + installation).toFixed(2);
        setValue("totalAmount", totalAmount);
        return parseInt((subtotalSum + taxAmount + transport + installation));
    };


    useEffect(() => {
        console.log("data is : ",data);

        // Map Excel data to form items if data is present
        if (data && Array.isArray(data) && data.length > 0) {
            const mappedItems = data.map(row => ({
                description: row["Particular"] || "",
                hsn: "", // or row["HSN"] if available
                unit: row["Unit"] || "",
                quantity: Number(row["Qty"]) || 0,
                finalUnitPrice: Number(row["Unit Price"]) || 0,
                subtotal: Number(row["Amount"]) || 0,
            }));
            setValue("items", mappedItems);
        }
    }, [data, setValue]);

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white max-w-4xl w-full rounded-lg shadow-lg p-6 overflow-y-auto max-h-[90vh] relative">
                <h1 className="text-2xl font-bold mb-6 text-center">Add New Quotation</h1>

                <RxCrossCircled size={40} className="top-2 right-2 absolute cursor-pointer" onClick={() => setAddNewQuoteFormModal(false)} />

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">


                    {/* first you have to select the version */}

                    <div className="flex justify-between ">

                        {/* this for changing the version  */}

                        <div className="relative w-60">
                            <select
                                {...register("version")}
                                onChange={handleVersionChange}
                                value={selectedVersion}
                                className="block w-full appearance-none px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-800"
                            >
                                <option value="">Select</option>
                                <option value="New Quote">New Quote</option>
                                {safeDummyData.map((item, index) => (
                                    <option key={index} value={item?.version || ''}>
                                        {item?.version || 'Unknown Version'}
                                    </option>
                                ))}
                            </select>

                            {/* Dropdown Arrow */}
                            <div className="pointer-events-none absolute right-0 top-4 flex items-center pr-3">
                                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a1 1 0 0 1-.7-.29l-4-4a1 1 0 0 1 1.4-1.42L10 9.58l3.3-3.3a1 1 0 0 1 1.4 1.42l-4 4A1 1 0 0 1 10 12z" />
                                </svg>
                            </div>
                        </div>

                        {/* upload the xlsx file */}

                        <div>

                            <ExcelReader data={data} setData={setData}></ExcelReader>

                        </div>

                    </div>


                    <h2 className="font-semibold text-lg mb-2">Items</h2>

                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-6 gap-4 mb-4 border p-4 rounded-md">
                            <div>
                                <Label>Description</Label>
                                <Input {...register(`items.${index}.description`, { required: "Required" })} />
                            </div>
                            <div>
                                <Label>HSN</Label>
                                <Input {...register(`items.${index}.hsn`, { required: "Required" })} />
                            </div>
                            <div>
                                <Label>Unit</Label>
                                <Input {...register(`items.${index}.unit`, { required: "Required" })} />
                            </div>
                            <div>
                                <Label>Qty</Label>
                                <Input type="number" {...register(`items.${index}.quantity`, { valueAsNumber: true })} />
                            </div>
                            <div>
                                <Label>Unit Price</Label>
                                <Input type="number" {...register(`items.${index}.finalUnitPrice`, { valueAsNumber: true })} />
                            </div>
                            <div className="flex items-end justify-between">
                                <button type="button" className="text-red-600" onClick={() => remove(index)}>Remove</button>
                            </div>
                        </div>
                    ))}

                    <div className="text-center">
                        <button type="button" className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => append({})}>Add Item</button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Tax Percentage</Label>
                            <Input {...register("taxPercent",)} />
                        </div>
                        <div>
                            <Label>Transport</Label>
                            <Input type="number" {...register("transport", { valueAsNumber: true })} />
                        </div>
                        <div>
                            <Label>Installation</Label>
                            <Input type="number" {...register("installation", { valueAsNumber: true })} />
                        </div>
                        <div>
                            <Label>Total Amount</Label>
                            <Input readOnly value={calculateTotalAmount()} />

                        </div>

                    </div>

                    <div>
                        <Label>Reason (Optional)</Label>
                        <Input {...register("reason")} />
                    </div>

                    {/* Existing Images Section */}
                    <div>
                        <Label>Quotation PDF(s) / Images</Label>
                        {existingImages && existingImages.length > 0 && (
                            <ul className="mb-2">
                                {existingImages.map((url, idx) => {
                                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                                    const isPdf = /\.pdf$/i.test(url);
                                    return (
                                        <li key={idx} className="flex items-center gap-2">
                                            {isImage ? (
                                                <a href={url} target="_blank" rel="noopener noreferrer">
                                                    <img
                                                        src={url}
                                                        alt={`Image ${idx + 1}`}
                                                        className="w-16 h-16 object-cover rounded border"
                                                    />
                                                </a>
                                            ) : isPdf ? (
                                                <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 underline break-all">
                                                    <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    PDF File
                                                </a>
                                            ) : (
                                                <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
                                                    {url}
                                                </a>
                                            )}
                                            <button
                                                type="button"
                                                className="ml-2 text-red-600 border border-red-600 rounded px-2 py-1 text-xs"
                                                onClick={() => onImageDeleteHandler(url, idx)}
                                            >
                                                Delete
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                        <Input
                            type="file"
                            multiple
                            {...register("image")}
                            className="mt-1"
                        />
                    </div>

                    <div className="text-center">
                        <Button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <InlineLoader className="mr-2" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit"
                            )}
                        </Button>
                    </div>
                </form>
            </div>

        </div >
    );
}





