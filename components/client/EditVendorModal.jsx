'use client'

import { Label } from "@radix-ui/react-label";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";

import { RxCrossCircled } from "react-icons/rx";


export default function EditVendorModal({
    vendorName = "",
    productDescription = "",
    estimatedCost = "",
    advancePaid = "",
    deliveryEstimate = "",
    deliveryStatus = "Pending",
    remarks = "",
    setEditVendorModalOpen

}) {
    const {
        handleSubmit,
        register,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            vendorName,
            productDescription,
            estimatedCost,
            advancePaid,
            deliveryEstimate,
            deliveryStatus,
            remarks,
        },
    });

    const onSubmit = (data) => {

        setEditVendorModalOpen(false);
    };

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="relative max-w-5xl w-full mx-auto bg-white border p-4 rounded-xl h-[600px] overflow-y-scroll z-50">
                <div className="flex justify-between ">

                    <h1 className="text-2xl font-bold mb-4">Add New Vendor Form</h1>
                    <RxCrossCircled size={40} className="text-red-500" onClick={() => {

                        setEditVendorModalOpen(false);

                    }}></RxCrossCircled>

                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Vendor Dropdown */}
                    <div>
                        <Label>Vendor</Label>
                        <select
                            {...register("vendorName", { required: "Vendor is required" })}
                            className="w-full border p-2 rounded"
                        >
                            <option value={vendorName}>{vendorName}</option>
                            <option value="vendor1">Vendor 1</option>
                            <option value="vendor2">Vendor 2</option>
                            <option value="vendor3">Vendor 3</option>
                        </select>
                        {errors?.vendorName && (
                            <p className="text-red-600 text-sm">{errors.vendorName.message}</p>
                        )}
                    </div>

                    {/* Product Description */}
                    <div>
                        <Label>Product Description</Label>
                        <Input
                            {...register("productDescription", {
                                required: "Product description is required",
                            })}
                        />
                        {errors?.productDescription && (
                            <p className="text-red-600 text-sm">{errors.productDescription.message}</p>
                        )}
                    </div>

                    {/* Estimated Cost */}
                    <div>
                        <Label>Estimated Cost</Label>
                        <Input
                            type="number"
                            {...register("estimatedCost", {
                                required: "Estimated cost is required",
                                valueAsNumber: true,
                            })}
                        />
                        {errors?.estimatedCost && (
                            <p className="text-red-600 text-sm">{errors.estimatedCost.message}</p>
                        )}
                    </div>

                    {/* Advance Paid */}
                    <div>
                        <Label>Advance Paid</Label>
                        <Input
                            type="number"
                            {...register("advancePaid", {
                                valueAsNumber: true,
                            })}
                        />
                    </div>

                    {/* Delivery Estimate Date */}
                    <div>
                        <Label>Delivery Estimate</Label>
                        <Input
                            type="date"
                            {...register("deliveryEstimate", {
                                required: "Delivery estimate is required",
                            })}
                        />
                        {errors?.deliveryEstimate && (
                            <p className="text-red-600 text-sm">{errors.deliveryEstimate.message}</p>
                        )}
                    </div>

                    {/* Delivery Status Dropdown */}
                    <div>
                        <Label>Delivery Status</Label>
                        <select
                            {...register("deliveryStatus")}
                            className="w-full border p-2 rounded"
                        >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Overdue">Overdue</option>
                        </select>
                    </div>

                    {/* Remarks */}
                    <div>
                        <Label>Remarks</Label>
                        <Input {...register("remarks")} />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Submit
                    </button>
                </form>
            </div>

        </div>
    );
}

