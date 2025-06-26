'use client'

import { user_role } from "@/lib/data";
import { useState } from "react";
import { updateMembersData } from "@/lib/api";
import toast from "react-hot-toast";
import { handleAxiosError } from "@/lib/handleAxiosError";

const EditableDropdownCell = ({ row, columnId, value, handleEdit }) => {
  const [selectedRole, setSelectedRole] = useState(value);

  const handleCommit = async (row, columnId, newRole) => {

    console.log("row ,columnId,newRole : ", row.original._id, columnId, newRole);

    const prepareData = {

      role:newRole,
      userId:row.original._id,

    }

    try {
      const response = await updateMembersData(prepareData);

        handleEdit(row.index, columnId, newRole);

        toast.success("user role update successfully ");

    } catch (error) {
      console.error("Error updating role:", error);

      handleAxiosError(error);

    }
  };

  return (
    <select
      className="border p-1 rounded w-full"
      value={selectedRole}
      onChange={(e) => {
        const newValue = e.target.value;
        setSelectedRole(newValue);
        handleCommit(row, columnId, newValue);
      }}
      onBlur={() => handleCommit(row, columnId, selectedRole)}
    >
      {Object.values(user_role).map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </select>
  );
};

export default EditableDropdownCell;


