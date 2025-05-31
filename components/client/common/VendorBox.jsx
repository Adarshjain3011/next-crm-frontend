'use client'

import { MdDelete } from "react-icons/md";
import { FiEdit } from "react-icons/fi";

export default function VendorBox({

    vendorName,
    productAssigned,
    estimatedCost,
    advancePaid,
    deliveryEstimate,
    status,
    remarks,
    setEditVendorModalOpen,
    setEditVendorData

}) {

    return (

        <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-[700px] relative border border-gray-200">
            {/* Content */}
            <div className="space-y-2 text-gray-700">
                <p><span className="font-semibold">Vendor:</span> {vendorName}</p>
                <p><span className="font-semibold">Product Description:</span> {productAssigned}</p>
                <p><span className="font-semibold">Estimated Cost:</span> ₹{estimatedCost}</p>
                <p><span className="font-semibold">Advance Paid:</span> ₹{advancePaid}</p>
                <p><span className="font-semibold">Delivery Estimate:</span> {deliveryEstimate}</p>
                <p><span className="font-semibold">Assignment Status:</span> {status}</p>
                {remarks?.trim() !== '' && (
                    <p><span className="font-semibold">Remarks:</span> {remarks}</p>
                )}
            </div>

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
                <button className="text-red-600 hover:text-red-800 transition">
                    <MdDelete size={24} />
                </button>
                <button className="text-blue-600 hover:text-blue-800 transition">
                    <FiEdit size={24} onClick={()=>{

                        setEditVendorData({vendorName,productAssigned,estimatedCost,advancePaid,deliveryEstimate,status,remarks})
                        setEditVendorModalOpen(true);

                    }} />
                </button>
            </div>
        </div>
    )
}

