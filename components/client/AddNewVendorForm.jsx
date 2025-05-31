'use client'

import { Label } from "@radix-ui/react-label";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";

import { RxCrossCircled } from "react-icons/rx";


export default function AddNewVendorForm({ setAddNewVendorModal,handleNewVendorAssignToEnqueryHandler }) {
    const {
        handleSubmit,
        register,
        formState: { errors },
        reset,
    } = useForm();

    // const onSubmit = (data) => {
    //     console.log("Form Submitted:", data);


    //     // Add your submit logic here
    // };

    // deliveryEstimate, deliveryStatus, productDescription, estimatedCost, advancePaid,quantity


    return (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white max-w-xl w-full rounded-lg shadow-lg p-6 overflow-y-auto max-h-[90vh] relative">
                <h1 className="text-2xl font-bold mb-6 text-center">Add New Vendor</h1>

                <RxCrossCircled size={40} className="top-2 right-2 absolute cursor-pointer" onClick={() => setAddNewVendorModal(false)}></RxCrossCircled>

                <form onSubmit={handleSubmit(handleNewVendorAssignToEnqueryHandler)} className="space-y-4">
                    {/* Vendor Dropdown */}
                    <div>
                        <Label className="block mb-1">Vendor</Label>
                        <select
                            {...register("vendorId", { required: "Vendor is required" })}
                            className="w-full border border-gray-300 p-2 rounded"
                        >
                            <option value="">Select Vendor</option>
                            <option value="vendor1">Vendor 1</option>
                            <option value="vendor2">Vendor 2</option>
                            <option value="vendor3">Vendor 3</option>
                        </select>
                        {errors?.vendorId && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.vendorId.message}
                            </p>
                        )}
                    </div>

                    {/* Product Description */}
                    <div>
                        <Label className="block mb-1">Product Description</Label>
                        <Input
                            {...register("productDescription", {
                                required: "Product description is required",
                            })}
                        />
                        {errors?.productDescription && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.productDescription.message}
                            </p>
                        )}
                    </div>


                    <div>

                        <Label className="block mb-1">quantity</Label>
                        <Input
                            {...register("quantity", {
                                required: "Quantity is required",
                            })}
                        />
                        {errors?.quantity && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.quantity.message}
                            </p>
                        )}

                    </div>

                    {/* Estimated Cost */}
                    <div>
                        <Label className="block mb-1">Estimated Cost</Label>
                        <Input
                            type="number"
                            {...register("estimatedCost", {
                                required: "Estimated cost is required",
                                valueAsNumber: true,
                            })}
                        />
                        {errors?.estimatedCost && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.estimatedCost.message}
                            </p>
                        )}
                    </div>

                    {/* Advance Paid */}
                    <div>
                        <Label className="block mb-1">Advance Paid</Label>
                        <Input
                            type="number"
                            {...register("advancePaid", {
                                valueAsNumber: true,
                            })}
                        />
                    </div>

                    {/* Delivery Estimate Date */}
                    <div>
                        <Label className="block mb-1">Delivery Estimate</Label>
                        <Input
                            type="date"
                            {...register("deliveryEstimate", {
                                required: "Delivery estimate is required",
                            })}
                        />
                        {errors?.deliveryEstimate && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.deliveryEstimate.message}
                            </p>
                        )}
                    </div>

                    {/* Delivery Status Dropdown */}
                    <div>
                        <Label className="block mb-1">Delivery Status</Label>
                        <select
                            {...register("deliveryStatus")}
                            className="w-full border border-gray-300 p-2 rounded"
                            defaultValue="Pending"
                        >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Overdue">Overdue</option>
                        </select>
                    </div>

                    {/* Remarks */}
                    <div>
                        <Label className="block mb-1">Remarks</Label>
                        <Input {...register("remarks")} />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
