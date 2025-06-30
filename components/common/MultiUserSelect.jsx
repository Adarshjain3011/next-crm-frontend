import React, { useState } from "react";

import { removeSalesPersonFromEnquery, assignSalesPersonToEnquery } from "@/lib/api";
import { handleAxiosError } from "@/lib/handleAxiosError";
import toast from "react-hot-toast";


function getInitials(name) {

  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function MultiUserSelect({ options, selected, setSelected, label = "Select users", enqueryId,queryClient }) {

  const [open, setOpen] = useState(false);

  const handleSelect = async (user) => {

    if (selected.some((u) => u._id === user._id)) {

      // here we have to remove the assingned user 

      try {

        let preparedData = {

          enqueryId, salesPersonId: user._id,

        }

        const result = await removeSalesPersonFromEnquery(preparedData);

        queryClient.invalidateQueries(['clientQueries']);
        setSelected(selected.filter((u) => u._id !== user._id));

        toast.success("assingned person removed successfully from enquery ");

      } catch (error) {

        console.log("error is : ", error);
        handleAxiosError(error);

      }

    } else {


      try {

        let preparedData = {

          enqueryId, salesPersonId: user._id,

        }

        const result = await assignSalesPersonToEnquery(preparedData);

        queryClient.invalidateQueries(['clientQueries']);

        // here we have to add one more user;

        setSelected([...selected, user]);

        toast.success("Salesperson(s) assigned successfully!");
        
      } catch (error) {

        console.log("error is : ", error);
        handleAxiosError(error);

      }

    }
  };

  return (
    <div className="w-full max-w-xs">
      <label className="block mb-1 text-sm font-semibold text-gray-700">{label}</label>
      <div
        className="relative"
        tabIndex={0}
        onBlur={() => setOpen(false)}
      >
        <div
          className="flex flex-wrap gap-2 border border-gray-300 rounded-xl px-3 py-2 bg-white cursor-pointer min-h-[48px] shadow-sm hover:shadow-md transition-shadow"
          onClick={() => setOpen((o) => !o)}
        >
          {selected.length === 0 && (
            <span className="text-gray-400">Select users...</span>
          )}
          {selected.length > 0 && selected.map((user) => (
            <span
              key={user._id}
              className="flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-3 py-1 text-sm font-medium shadow hover:scale-105 transition-transform"
            >

              {

                user && user.name && <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-2 text-xs font-bold">
                  {user && user.name && getInitials(user.name)}
                </span>
              }

              {user.name}
              <button
                className="ml-2 text-white hover:text-gray-200"
                onClick={e => {
                  e.stopPropagation();
                  // setSelected(selected.filter((u) => u._id !== user._id));
                  handleSelect(user);
                  
                }}
              >
                &times;
              </button>
            </span>
          ))}
          <span className="ml-auto text-gray-400 pl-2 flex items-center">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>

        </div>

        {open && (
          <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto transition-all animate-fade-in">
            {options.map((user) => (
              <div
                key={user._id}
                className={`flex items-center px-4 py-2 cursor-pointer hover:bg-purple-100 transition-colors ${selected.some((u) => u._id === user._id) ? "bg-purple-50" : ""
                  }`}
                onClick={() => handleSelect(user)}
              >
                <input
                  type="checkbox"
                  checked={selected.some((u) => u._id === user._id)}
                  readOnly
                  className="mr-2 accent-purple-500"
                />
                <span className="w-6 h-6 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center mr-2 text-xs font-bold">
                  {user && user?.name && getInitials(user?.name)}
                </span>

                {

                  user && user?.name && (<span>{user.name}</span>)

                }

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


