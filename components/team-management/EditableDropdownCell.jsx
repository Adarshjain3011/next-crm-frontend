'use client'

import { user_role } from "@/lib/data";
import { useState } from "react";

const EditableDropdownCell = ({ row, columnId, value, handleEdit }) => {
  const [selectedRole, setSelectedRole] = useState(value);

  const handleCommit = async (row, columnId, newRole) => {
    try {
      const response = await updateMemberRole(row.original._id, newRole);
      if (response.success) {
        handleEdit(row.index, columnId, newRole);
      }
    } catch (error) {
      console.error("Error updating role:", error);
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
