'use client';

import * as React from 'react';

import { useState } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  getFilteredRowModel,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import AddNewMember from '@/components/team-management/AddNewMember';

import { useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { handleAxiosError } from '@/lib/handleAxiosError';

import { getAllMembersData } from '@/lib/api';

import { setAllMembersData } from "../../store/slice/membersSlice";

import { formatDateForInput } from '@/lib/utils';

import toast from 'react-hot-toast';

import EditableDropdownCell from '@/components/team-management/EditableDropdownCell';

import { updateMembersData } from '@/lib/api';

import { updateExistingMembersData } from '../../store/slice/membersSlice';

import { clearAllMembersData } from '../../store/slice/membersSlice';

import { debounce } from 'lodash';

import RoleGuard from '@/components/auth/RoleGuard';

import { useRole } from '@/app/hooks/useRole';

import { user_role } from '@/lib/data';


export default function TeamManagement() {


  const { isAdmin } = useRole();

  const [globalFilter, setGlobalFilter] = useState('');

  const [addNewMemberModal, setAddNewMemberModal] = useState(false);

  const membersData = useSelector((state) => state.members.data);

  const dispatch = useDispatch();

  const debouncedUpdate = debounce(async (dataToUpdate, reduxDataToUpdate, dispatch, columnId) => {
    try {
      const result = await updateMembersData(dataToUpdate);

      if (columnId != "password") {

        dispatch(updateExistingMembersData(reduxDataToUpdate));
        console.log("result is ", result);

      }
      else {

        toast.success("password updated sucessfully");

      }

    } catch (error) {
      console.log("error is : ", error);
      handleAxiosError(error);
    }
  }, 500); // delay of 500ms

  const handleEdit = (rowIndex, columnId, value) => {
    if (value === "") return;

    console.log("handle edit ke andar ", rowIndex, columnId, value);

    const dataToUpdate = {
      userId: membersData[rowIndex]._id,
      [columnId]: value,
    };

    let reduxDataToUpdate;

    if (columnId !== "password") {

      reduxDataToUpdate = {
        userId: membersData[rowIndex]._id,
        columnToUpdate: columnId,
        value: value,
      };

    }

    debouncedUpdate(dataToUpdate, reduxDataToUpdate, dispatch, columnId);

  };




  const EditableCell = ({
    row,
    columnId,
    value,
  }) => {
    const [editingValue, setEditingValue] = React.useState(value);

    const handleCommit = () => {
      handleEdit(row.index, columnId, editingValue);
    };

    return (
      <Input
        value={editingValue}
        onChange={(e) => setEditingValue(e.target.value)}
        onBlur={handleCommit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur();
          }
        }}
      />
    );
  };


  const columns = [
    {
      header: 'User',
      accessorKey: 'name',
      cell: ({ row, getValue }) => {
        const member = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&color=fff`}
                alt={member.name}
              />
            </Avatar>
            <EditableCell
              row={row}
              columnId="name"
              value={getValue()}
            />
          </div>
        );
      },
    },
    {
      header: 'Email',
      accessorKey: 'email',

      cell: ({ row, getValue }) => (
        <EditableCell
          row={row}
          columnId="email"
          value={getValue()}
        />
      ),
    },

    {
      header: 'phoneNo',
      accessorKey: 'phoneNo',

      cell: ({ row, getValue }) => (
        <EditableCell
          row={row}
          columnId="phoneNo"
          value={getValue()}
        />
      ),
    },
    {
      header: 'Password',
      accessorKey: 'password',
      cell: ({ row, getValue }) => (
        <EditableCell
          row={row}
          columnId="password"
          value={""}
        />
      ),
    },
    {
      header: 'Created At',
      accessorKey: 'createdAt',
      cell: ({ getValue }) => {
        const rawDate = getValue();
        const formattedDate = formatDateForInput(rawDate); // You already have this util
        return <span>{formattedDate}</span>;
      },
    },

    {
      header: 'Role',
      accessorKey: 'role',
      cell: ({ row, getValue }) => (
        <EditableDropdownCell
          row={row}
          columnId="role"
          handleEdit={handleEdit}
          value={getValue()}
        />
      ),
    },
  ];



  const table = useReactTable({
    data: membersData,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
  });


  console.log("all user data is ", membersData);


  // useEffect hook 

  useEffect(() => {

    async function getAllUserData() {

      try {

        const result = await getAllMembersData();

        dispatch(setAllMembersData(result));

        toast.success("all user data fetched successfully");

      } catch (error) {

        console.log("error is :", error);
        handleAxiosError(error);

      }

    }

    if (!membersData || membersData.length === 0) {

      console.log("hellow ")

      getAllUserData();

    }


  }, []);

  return (

    <RoleGuard allowedRoles={[user_role.admin,user_role.sales]}>

      <div className="p-6">

        <h2 className="text-xl font-bold mb-4">Team Members</h2>

        <div className='flex justify-between items-center'>

          <div className="mb-4">
            <Input
              placeholder="Search..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-64"
            />
          </div>

          <div>

            <Button onClick={() => setAddNewMemberModal(true)}>Add New Member </Button>

          </div>

        </div>


        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          {

            membersData && <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          }

        </Table>

        {

          addNewMemberModal && <AddNewMember

            setAddNewMemberModal={setAddNewMemberModal}

          />

        }

      </div>

    </RoleGuard>
  );
}



