
'use client'

import { useForm } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { handleAxiosError } from "@/lib/handleAxiosError";

import { createNewClientEnquery } from "@/lib/api";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

import { user_role } from "@/lib/data";
import RoleGuard from "@/components/auth/RoleGuard";

import { useRole } from "@/app/hooks/useRole";

import BeautifulLoader from "@/components/common/BeautifulLoader";
import { useState } from "react";

export default function createNewEnquery() {

    const { isAdmin, isSales } = useRole();

    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    const [loading,setLoading]= useState(false);

    // name, companyName, phone, email, address, requirement, sourceWebsite, sourcePlatform

    async function formSubmitHandler(data) {

        try {

            setLoading(true);

            const result = await createNewClientEnquery(data);

            toast.success("Enquery Created Successfully");

            // Reset the form fields
            reset(); // Clears all fields

        } catch (error) {
            
            handleAxiosError(error);

        }

        finally{

            setLoading(false);

        }
    }


    if(loading){

        return <BeautifulLoader />

    }


    return (

        <RoleGuard allowedRoles={[user_role.admin,user_role.sales]}>

            <div className="w-full min-h-screen p-4 max-h-4xl overflow-y-scroll">

                <h1 className="text-center">Add New Enquery </h1>

                <form onSubmit={handleSubmit(formSubmitHandler)} className="relative max-w-4xl mx-auto flex flex-col gap-4">

                    {/* name */}

                    <div className="flex flex-col gap-2">

                        <Label>Name</Label>

                        <Input

                            type="text"
                            placeholder=" Name is required"
                            {...register("name", { required: " Name is required" })}

                        />

                        {

                            errors.name && <p className="text-red-500 h-fit">{errors.name.message}</p>
                        }

                    </div>

                    <div className="flex flex-col gap-2">

                        <Label>Company Name</Label>

                        <Input

                            type="text"
                            placeholder="Enter Company Name"
                            {...register("companyName",)}

                        />

                    </div>

                    {/* email */}

                    <div className="flex flex-col gap-2">

                        <Label>Email</Label>

                        <Input

                            type="text"
                            placeholder="Enter email"
                            {...register("email",)}

                        />

                    </div>

                    {/* phoneNo */}

                    <div className="flex flex-col gap-2">

                        <Label>phoneNo</Label>

                        <Input

                            type="text"
                            placeholder="Enter phoneNo"
                            {...register("phone", { required: "Phone No is required" })}

                        />
                        {

                            errors.phone && <p className="text-red-500">{errors.phone.message}</p>
                        }


                    </div>

                    {/* address */}

                    <div className="flex flex-col gap-2">

                        <Label>Address</Label>

                        <Input

                            type="text"
                            placeholder="Enter Address"
                            {...register("address",)}

                        />

                    </div>

                    <div className="flex flex-col gap-2">

                        <Label>Date</Label>

                        <Input

                            type="date"
                            placeholder="Enter date"
                            {...register("date", { required: "client enquery date is required" })}

                        />

                        {

                            errors.date && <p className="text-red-500">{errors.date.message}</p>
                        }

                    </div>

                    {/* requirement */}


                    <div className="flex flex-col gap-2">

                        <Label>Requirement</Label>

                        <Input

                            type="text"
                            placeholder="Enter Requirement"
                            {...register("requirement", { required: "requirement is required" })}

                        />

                        {

                            errors.requirement && <p className="text-red-500">{errors.requirement.message}</p>
                        }

                    </div>


                    {/* sourcePlatform */}

                    <div className="flex flex-col gap-2">

                        <Label>Source Platform</Label>

                        <Input

                            type="text"
                            placeholder="Enter Source Platform"
                            {...register("sourcePlatform")}

                        />

                    </div>

                    {/* sourceWebsite */}

                    <div className="flex flex-col gap-2">

                        <Label>Source Website</Label>

                        <Input

                            type="text"
                            placeholder="Enter Source Website"
                            {...register("sourceWebsite",)}

                        />

                    </div>

                    <Button type="submit">Add Enquery</Button>

                </form>

            </div>

        </RoleGuard>

    )
}


