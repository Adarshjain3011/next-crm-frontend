'use client';

import { useState } from 'react';
import { IoClose } from 'react-icons/io5'; // Using react-icons for close button

import { uploadPdfToInvoice } from "../../lib/api";
import { handleAxiosError } from '@/lib/handleAxiosError';

import toast from 'react-hot-toast';

export default function UploadInvoiceCompo({ order, setUploadInvoiceModal }) {

    console.log("upload component invoice : ", order);

    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };

    const handleUpload = async() => {
        if (!file) {
            alert('Please select a file first.');
            return;
        }

        console.log("upload component invoice : ", order);

        // invoiceId and excelFile

        const formData = new FormData();

        formData.append('invoiceId',order.invoiceId._id);

        formData.append('excelFile',file);


        try {

            const result = await uploadPdfToInvoice(formData);

            console.log("result is : ",result);

            toast.success("invoice uploaded successfully ");

            setUploadInvoiceModal(false);

        } catch (error) {

            console.log("error is  : ", error);

            handleAxiosError(error);

        }

    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="relative bg-white rounded-2xl shadow-inner shadow-gray-400 p-6 w-full max-w-md border border-gray-200">
                {/* Close button */}
                <button
                    onClick={() => setUploadInvoiceModal(false)}
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition text-2xl"
                >
                    <IoClose />
                </button>

                <h2 className="text-2xl font-bold mb-5 text-center text-gray-800">Upload Invoice</h2>

                <label className="block mb-3 text-gray-600 text-sm font-medium">Select file (PDF or image)</label>
                <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    className="mb-4 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />

                {file && (
                    <p className="text-gray-700 text-sm mb-3">
                        Selected file: <strong>{file.name}</strong>
                    </p>
                )}

                <button
                    onClick={handleUpload}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 rounded-md transition"
                >
                    Upload
                </button>
            </div>
        </div>
    );
}


