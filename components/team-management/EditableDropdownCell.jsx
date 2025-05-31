'use client'

import { user_role } from "@/lib/data";
import { useState } from "react";

const EditableDropdownCell = ({ row, columnId, value,handleEdit }) => {
  const [selectedRole, setSelectedRole] = useState(value);

  // Updated handleCommit to receive the most recent value
  const handleCommit = (newRole) => {
    console.log("handle commit ke andar ", row, columnId, newRole);
    console.log("row index is ", row.index);
    console.log("columnId is ", columnId);
    console.log("selectedRole is ", newRole);

    handleEdit(row.index, columnId, newRole);

    // Optional: Trigger update logic here, for example:
    // row.getContext().table.options.meta?.updateData(row.index, columnId, newRole);
  };

  return (
    <select
      className="border p-1 rounded w-full"
      value={selectedRole}
      onChange={(e) => {
        const newValue = e.target.value;
        setSelectedRole(newValue);
        handleCommit(newValue); // Use latest value directly
      }}
      onBlur={() => handleCommit(selectedRole)} // Also handle blur to ensure commit on focus loss
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
