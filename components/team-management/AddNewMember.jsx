'use client'

import { Label } from "@radix-ui/react-label";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { user_role } from "@/lib/data";
import { handleAxiosError } from "@/lib/handleAxiosError";

import { RxCrossCircled } from "react-icons/rx";

import { createNewUser } from "@/lib/api";
import toast from "react-hot-toast";
import { useEffect } from "react";

import { useSelector, useDispatch } from "react-redux";
import { setUserData } from "@/app/store/slice/salesPersonData";

import { getAllMembersData } from "@/lib/api";

import { addNewMember } from "@/app/store/slice/membersSlice";

export default function AddNewMemberModal({ setAddNewMemberModal }) {
    const {
        register,
        formState: { errors },
        reset,
        handleSubmit,
    } = useForm();

    const membersData = useSelector((state) => state.members.data);
    const dispatch = useDispatch();

    async function addNewMemberSubmitHandler(data) {
        try {
            console.log("form data is ", data);

            const result = await createNewUser(data);

            dispatch(addNewMember(result));
            setAddNewMemberModal(false); // close modal

            toast.success("new member added successfully");

        } catch (error) {
            console.log("error is ", error);
            handleAxiosError(error);
        }
    }



    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            {/* Modal Content */}
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">

                <div className="relative">

                    <RxCrossCircled size={30} className="top-0 right-0 absolute cursor-pointer" onClick={() => setAddNewMemberModal(false)}></RxCrossCircled>
                    <h1 className="text-2xl font-semibold mb-4 text-start">Add New Member</h1>


                </div>

                <form onSubmit={handleSubmit(addNewMemberSubmitHandler)} className="flex flex-col gap-4">
                    <div>
                        <Label className="block mb-1">User Name</Label>
                        <Input
                            {...register("name", { required: "Name is required" })}
                        />
                        {errors?.name && (
                            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <Label className="block mb-1">User Email</Label>
                        <Input
                            {...register("email", { required: "Email is required" })}
                        />
                        {errors?.email && (
                            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <Label className="block mb-1">User phoneNo</Label>
                        <Input
                            {...register("phoneNo", { required: "phoneNo is required" })}
                        />
                        {errors?.phoneNo && (
                            <p className="text-red-600 text-sm mt-1">{errors.phoneNo.message}</p>
                        )}
                    </div>

                    <div>
                        <Label className="block mb-1">Password</Label>
                        <Input
                            type="password"
                            {...register("password", { required: "Password is required" })}
                        />
                        {errors?.password && (
                            <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
                        )}
                    </div>

                    <div>
                        <Label className="block mb-1">Role</Label>
                        <select
                            {...register("role", { required: "Role is required" })}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="">Select Role</option>
                            {Object.values(user_role).map((role) => (
                                <option key={role} value={role}>
                                    {role}
                                </option>
                            ))}
                        </select>
                        {errors?.role && (
                            <p className="text-red-600 text-sm mt-1">{errors.role.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md mt-2"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
}

