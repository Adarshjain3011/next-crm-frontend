
'use client'

import { addNewFollowUpHandler, updateFollowUpStatus } from "@/lib/api";
import React, { useState, useRef } from "react";
import AddNewFollowUp from "./AddNewFollowUp";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import { respondToFollowUp } from "@/lib/api";
import { followUpTableHeaders } from "@/lib/data";
import { FaSave } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { handleAxiosError } from "@/lib/handleAxiosError";

export const FollowUpCompo = ({ client, setClient }) => {

    const [activeFollowUpId, setActiveFollowUpId] = useState(null);
    const [addNewFollowUpModal, setAddNewFollowUpModal] = useState(false);

    const followUpInputRef = useRef();


    const NewFollowUpAddHandler = async (data) => {

        try {

            data.enqueryId = client._id;

            // here we have to make db call to handle followups data

            const result = await addNewFollowUpHandler(data);

            setClient({ ...client, followUps: [...client.followUps, result] });

            setAddNewFollowUpModal(false);

            toast.success("new follow up add success");


        } catch (error) {

            handleAxiosError(error);

        }

    }

    // respond to the follow up handler 

    const respondToFollowUpHandler = async () => {

        try {

            let data = {};

            // message, enqueryId, followUpId

            data.message = followUpInputRef.current.value;
            data.enqueryId = client._id;
            data.followUpId = activeFollowUpId;

            // make call to save the response 

            const result = await respondToFollowUp(data);

            followUpInputRef.current.value = "";

            let matchedFollowUp = client.followUps.find((data) => data._id === activeFollowUpId);

            // data.respondedBy = 

            if (matchedFollowUp) {
                // Add response to the matched followUp
                matchedFollowUp.responses.push(result); // assuming `newResponse` is the data to add
            }
            // Create a new updated followUps array
            const updatedFollowUps = client.followUps.map(followUp =>
                followUp._id === activeFollowUpId ? matchedFollowUp : followUp
            );

            // Set updated client state
            setClient({ ...client, followUps: updatedFollowUps });
            setActiveFollowUpId(null);

            toast.success("response added to the note successfully ",)

        } catch (error) {

            console.log("error is ", error);

            handleAxiosError(error);

        }
    }

    // update followup response Handler

    const updateFollowUpStatusHandler = async (event, followUpId) => {

        try {

            const { value } = event.target;

            if (value === "") {

                return;

            }

            let data = {};

            data.enqueryId = client._id;
            data.followUpId = followUpId;

            data.status = value;

            let result = await updateFollowUpStatus(data);

            let updatedData = client.followUps.map((item) => {
                if (item._id === followUpId) {
                    return {
                        ...item,
                        done: value
                    };
                }
                return item;
            });

            setClient({ ...client, followUps: updatedData });

            toast.success("follow up status updated successfully");

        } catch (error) {

            console.log(error);

            return handleAxiosError(error);

        }
    }


    return (

        <div>

            <div className='flex justify-between items-center'>

                <h2 className="text-xl font-bold mb-3">Follow Ups</h2>

                <Button onClick={() => setAddNewFollowUpModal(true)}>Add Follow Up</Button>

            </div>


            <div className="mb-4">
                <table className="min-w-full border mt-2 text-sm">
                    <thead className="bg-muted">

                        <tr>
                            {

                                followUpTableHeaders.map((data) => (

                                    <th className="border px-3 py-2">{data}</th>

                                ))
                            }
                        </tr>

                    </thead>
                    <tbody>
                        {client &&
                            client.followUps.map((followUp, idx) => (
                                <React.Fragment key={followUp._id}>
                                    {/* Main Follow-Up Row */}
                                    <tr className="border-b bg-gray-100">
                                        <td className="border px-3 py-2">
                                            {new Date(followUp.followUpDate).toLocaleDateString()}
                                        </td>
                                        <td className="border px-3 py-2">{followUp.followUpNote}</td>
                                        <td className="border px-3 py-2">{followUp?.noteAddByUser?.name || "temp"}</td>
                                        <td className="border px-3 py-2">

                                            <select value={followUp.done} className="px-4 py-2" onChange={(event) => updateFollowUpStatusHandler(event, followUp._id)}>

                                                <option value="">Select status</option>
                                                <option value={true}>Done</option>
                                                <option value={false}>Pending</option>

                                            </select>

                                        </td>

                                        {/* Response area */}

                                        <td className="border px-3 py-2" colSpan={3}>
                                            {activeFollowUpId === followUp._id ? (
                                                <div className="flex gap-3 items-center">
                                                    <input
                                                        type="text"
                                                        placeholder="Type response..."
                                                        className="p-2 border rounded-md w-full"
                                                        ref={followUpInputRef}
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => respondToFollowUpHandler(followUp._id)}
                                                            className="text-green-600 hover:underline"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => setActiveFollowUpId(null)}
                                                            className="text-red-500 hover:underline"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Button onClick={() => {

                                                    setActiveFollowUpId(followUp._id);
                                                }}>
                                                    Add Response
                                                </Button>
                                            )}
                                        </td>

                                        <td className="border px-3 py-2">{/* Actions if any */}</td>

                                    </tr>

                                    {/* Response Rows */}

                                    {followUp.responses?.map((resp, ridx) => (
                                        <tr key={`${followUp._id}-${ridx}`} className="border-b bg-gray-50">
                                            <td className="border px-3 py-1" colSpan={4}></td>
                                            <td className="border px-3 py-1">{resp.message}</td>
                                            <td className="border px-3 py-1">
                                                {resp.respondedBy?.name || "N/A"}
                                            </td>
                                            <td className="border px-3 py-1">
                                                {new Date(resp.respondedAt).toLocaleString()}
                                            </td>
                                            <td className="border px-3 py-1"></td>
                                        </tr>
                                    ))}

                                </React.Fragment>
                            ))}
                    </tbody>

                </table>

            </div>

            {

                addNewFollowUpModal && <AddNewFollowUp

                    setAddNewFollowUpModal={setAddNewFollowUpModal}
                    NewFollowUpAddHandler={NewFollowUpAddHandler}

                ></AddNewFollowUp>

            }

        </div>
    )
}



