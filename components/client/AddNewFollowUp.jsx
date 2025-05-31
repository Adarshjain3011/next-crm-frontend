'use client'

import { Label } from "@radix-ui/react-label";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";

import { RxCrossCircled } from "react-icons/rx";


export default function AddNewFollowUp({ setAddNewFollowUpModal, NewFollowUpAddHandler }) {
    const {
        handleSubmit,
        register,
        formState: { errors },
        reset,
    } = useForm();

    // enqueryId, followUpDate, followUpNote

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white max-w-xl w-full rounded-lg shadow-lg p-6 overflow-y-auto max-h-[90vh] relative">
                <h1 className="text-2xl font-bold mb-6 text-center">Add New Followup</h1>

                <RxCrossCircled size={40} className="top-2 right-2 absolute cursor-pointer" onClick={() => setAddNewFollowUpModal(false)}></RxCrossCircled>

                <form onSubmit={handleSubmit(NewFollowUpAddHandler)} className="space-y-4">

                    {/* Follow Up note  */}

                    <div>
                        <Label className="block mb-1">followUp Note</Label>
                        <Input
                            {...register("followUpNote", {
                                required: "follow up note is required",
                            })}
                        />
                        {errors?.followUpNote && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.followUpNote.message}
                            </p>
                        )}
                    </div>

                    {/* follow Up Date */}

                    <div>
                        <Label className="block mb-1">Follow Up Date</Label>
                        <Input
                            type="date"
                            {...register("followUpDate", {
                                required: "followUpDate is required",
                            })}
                        />
                        {errors?.followUpDate && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.followUpDate.message}
                            </p>
                        )}
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
