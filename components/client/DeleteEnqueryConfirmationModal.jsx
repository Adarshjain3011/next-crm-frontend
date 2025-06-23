import React, { useState } from 'react';

import { deleteSpecificEnquery } from '@/lib/api';

import { handleAxiosError } from '@/lib/handleAxiosError';
import toast from 'react-hot-toast';

export default function DeleteConfirmationModal({ onClose, enquiryDetails,clientId,queryClient }) {

    const [loading,setLoading] = useState(false);

    async function specificEnqueryDeleteHandler(){

        try{

            setLoading(true);

            console.log("enqueryId at the specific enquery deletion",clientId);

            const result = await deleteSpecificEnquery(clientId);

            queryClient.invalidateQueries(['clientQueries']);

            toast.success("enquery Deleted Successfully");

        }catch(error){

            console.log("error is : ",error);
            handleAxiosError(error);

        }
        finally{

            setLoading(false);
            onClose();
            
        }
    }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md animate-fade-in">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Delete Enquiry</h2>
        <p className="text-gray-700 mb-4">
          Are you sure you want to permanently delete the enquiry from <span className="font-semibold">{enquiryDetails?.companyName}</span> regarding <span className="italic">"{enquiryDetails?.requirement}"</span>?<br />
          <span className="text-sm text-red-500">This action cannot be undone.</span>
        </p>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={specificEnqueryDeleteHandler}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
          >

            {

                loading ? "Deleting...":"Yes, Delete"
            }
        
          </button>
        </div>
      </div>
    </div>
  );
}


