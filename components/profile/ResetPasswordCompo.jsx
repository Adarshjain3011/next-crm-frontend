
'use client'

import React, { useRef, useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '@radix-ui/react-label';
import { handleAxiosError } from '@/lib/handleAxiosError';
import { resetPassword } from '@/lib/api';
import { RxCrossCircled } from "react-icons/rx";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import toast from 'react-hot-toast';
import Loader from '../common/Loader';


const ResetPasswordCompo = ({ setResetPasswordModal }) => {

    const newPasswordRef = useRef();
    const confirmPasswordRef = useRef();

    const [loading, setLoading] = useState(false);

    const [isnewPasswordEyeOpen, setNewPasswordEyeOpen] = useState(false);

    const [isConfirmPasswordEyeOpen, setConfirmPasswordEyeOpen] = useState(false);

    const resetPasswordHandler = async () => {
        try {

            if (newPasswordRef.current.value === "" || confirmPasswordRef.current.value === "") {

                toast.error("password field cant be empty ");
                return;

            }

            if (newPasswordRef.current.value !== confirmPasswordRef.current.value) {

                toast.error("password dosent match");
                return;

            }

            setLoading(true);

            const preparedData = {

                newPassword: newPasswordRef.current.value,
                confirmPassword: confirmPasswordRef.current.value,

            }

            await resetPassword(preparedData);

            setResetPasswordModal(false);

            toast.success("password reset successfully ");

        } catch (error) {

            console.log("error is : ", error);

            handleAxiosError(error);
        }
        finally {

            setLoading(false);

        }
    };

    return (
        <div className=" bg-gray-100">
            <div className="absolute inset-0 z-50 m-auto p-8 bg-white rounded-2xl shadow-lg w-full max-w-md h-fit">
                <RxCrossCircled size={30} className='absolute right-2 top-2 m-2 cursor-pointer' onClick={() => {

                    setResetPasswordModal(false);

                }} />
                <h2 className="text-2xl font-semibold mb-6 text-center">Reset Password</h2>


                <div className="mb-4">
                    <Label className="text-sm font-medium text-gray-700">New Password</Label>

                    <div className='flex justify-center items-center gap-2'>

                        <Input
                            type={isnewPasswordEyeOpen ? "password" : "text"}
                            placeholder="Enter new password"
                            ref={newPasswordRef}
                            className="mt-2"
                        />

                        <div className='translate-x-[-2rem] mt-2 cursor-pointer'>

                            {

                                !isnewPasswordEyeOpen ? <FaEye onClick={() => {

                                    setNewPasswordEyeOpen(!isnewPasswordEyeOpen);

                                }}></FaEye> : <FaEyeSlash onClick={() => {

                                    setNewPasswordEyeOpen(!isnewPasswordEyeOpen);

                                }}></FaEyeSlash>

                            }

                        </div>


                    </div>

                </div>

                <div className="mb-6">
                    <Label className="text-sm font-medium text-gray-700">Confirm Password</Label>

                    <div className='flex gap-2 justify-center items-center'>

                        <Input
                            type={isConfirmPasswordEyeOpen ? "password" : "text"}
                            placeholder="Confirm new password"
                            ref={confirmPasswordRef}
                            className="mt-2"
                        />

                        <div className='translate-x-[-2rem] mt-2 cursor-pointer'>

                            {

                                !isConfirmPasswordEyeOpen ? <FaEye onClick={() => {

                                    setConfirmPasswordEyeOpen(!isConfirmPasswordEyeOpen);

                                }}></FaEye> : <FaEyeSlash onClick={() => {

                                    setConfirmPasswordEyeOpen(!isConfirmPasswordEyeOpen);

                                }}></FaEyeSlash>

                            }

                        </div>


                    </div>

                </div>

                <button
                    onClick={resetPasswordHandler}
                    className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition duration-200"
                >

                    {

                        loading ? "Reseting...." :"Reset Password"
                        
                    }
                    

                </button>
            </div>
        </div>
    );
};

export default ResetPasswordCompo;
