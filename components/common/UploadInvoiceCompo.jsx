'use client';

import { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5'; // Using react-icons for close button

import { uploadPdfToInvoice } from "../../lib/api";
import { handleAxiosError } from '@/lib/handleAxiosError';

import toast from 'react-hot-toast';
import { FullScreenLoader } from '@/components/ui/loader';
import { useLoading } from '@/app/hooks/useLoading';

export default function UploadInvoiceCompo({ order, setUploadInvoiceModal }) {
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const { isLoading, withLoading, cleanup } = useLoading();

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) {
            alert('Please select a file first.');
            return;
        }

        console.log("handle upload ke andar")

        const formData = new FormData();
        formData.append('file', file);
        formData.append('orderId', order._id);
        formData.append("invoiceId", order.invoiceId._id || "");

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) return prev;
                return prev + Math.random() * 10;
            });
        }, 500);

        await withLoading(
            async () => {
                const result = await uploadPdfToInvoice(formData);
                console.log("Upload completed:", result);
                setUploadProgress(100);
                toast.success("Invoice uploaded successfully");
                setUploadInvoiceModal(false); // Close the modal after successful upload
                return result;
            },
            {
                timeout: 60000, // 60 second timeout for file upload
                onError: (error) => {
                    console.error("Upload failed:", error);
                    handleAxiosError(error);
                }
            }
        );

        clearInterval(progressInterval);
        setUploadProgress(0);
    };

    if (isLoading) {
        return (
            <FullScreenLoader 
                text={`Uploading ${file?.name || 'file'}...`}
                showProgress={true}
                progress={uploadProgress}
                estimatedTime="30-60 seconds"
            />
        );
    }

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="relative bg-white rounded-2xl shadow-inner shadow-gray-400 p-6 w-full max-w-md border border-gray-200">
                {/* Close button */}
                <button
                    onClick={() => setUploadInvoiceModal(false)}
                    disabled={isLoading}
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition text-2xl disabled:opacity-50"
                >
                    <IoClose />
                </button>

                <h2 className="text-2xl font-bold mb-5 text-center text-gray-800">Upload Invoice</h2>

                <label className="block mb-3 text-gray-600 text-sm font-medium">Select file (PDF or image)</label>
                <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    disabled={isLoading}
                    className="mb-4 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
                />

                {file && (
                    <p className="text-gray-700 text-sm mb-3">
                        Selected file: <strong>{file.name}</strong>
                        <br />
                        <span className="text-gray-500">
                            Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                    </p>
                )}

                <button
                    onClick={handleUpload}
                    disabled={isLoading || !file}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Uploading...' : 'Upload'}
                </button>
            </div>
        </div>
    );
}


