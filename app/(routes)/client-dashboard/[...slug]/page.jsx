'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TiEdit } from "react-icons/ti";
import { MdAddBusiness, MdDeleteForever, MdSave } from "react-icons/md";
import { Input } from '@/components/ui/input';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { flattenObject } from '@/lib/utils';
import toast from 'react-hot-toast';
import { FollowUpCompo } from '@/components/client/FollowUpCompo';
import { qouteTablesHeader } from "../../../../lib/data";
import QuoteRivisionComponent from '@/components/client/QuoteRevisionCompo';
import { getAllQuote } from '@/lib/api';
import { useSelector, useDispatch } from 'react-redux';
import { setQuoteData } from '@/app/store/slice/quoteSlice';
import { handleAxiosError } from '@/lib/handleAxiosError';
import { fetchAllUserQueries } from '@/lib/api';
import { getSpecifiEnqueryDetails } from '@/lib/api';
import { PageLoader } from '@/components/ui/loader';

export default function Clients() {
  // Initialize all hooks at the top level
  const queryClient = useQueryClient();
  const { slug } = useParams();
  const dispatch = useDispatch();

  // Initialize state first
  const [client, setClient] = useState(null);

  // Memoize the removed fields to prevent unnecessary recalculations
  const removedFields = useMemo(() => [
    "_id",
    "createdAt",
    "assignedBy._id",
    "assignedTo._id",
    "updatedAt",
    "followUps",
    "attachments",
    "communicationNotes"
  ], []);

  // Query for client data
  const { data: clientData, isLoading: isClientLoading } = useQuery({
    queryKey: ['clientQueries'],
    queryFn: fetchAllUserQueries,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    refetchInterval: 1000 * 20,     // ✅ Refetch every 30 seconds
    enabled: true,
    onError: (error) => {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    }
  });
  

  // Query for quote data

  const { data: quoteData, isLoading: isQuoteLoading } = useQuery({
    queryKey: ['quote', slug?.[0]],
    queryFn: async () => {
      try {

        const result = await getAllQuote(slug[0]);

        dispatch(setQuoteData(result));
        return result;
      } catch (error) {
        console.error("Error fetching quote:", error);
        handleAxiosError(error);
        throw error;
      }
    },
    enabled: true,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    refetchInterval: 1000 * 60 * 6,

  });



  // Memoize the filtered client data
  const filterQueryData = useMemo(() =>
    clientData?.find((data) => data._id === slug?.[0]),
    [clientData, slug]
  );

  // Update client state when query data changes
  useEffect(() => {
    if (filterQueryData) {
      setClient(filterQueryData);
    }
  }, [filterQueryData]);

  // Memoize the flattened client data
  const flattenedClient = useMemo(() =>
    client ? flattenObject(client) : {},
    [client]
  );

  // Memoize the data array
  const data = useMemo(() =>
    [flattenedClient],
    [flattenedClient]
  );

  // Memoize the columns

  const columns = useMemo(() =>
    Object.keys(flattenedClient)
      .filter((key) => !removedFields.includes(key))
      .map((key) => {
        // Custom rendering for 'assignedTo'
        if (key === 'assignedTo') {
          return {
            accessorKey: key,
            accessorFn: (row) => row[key],
            header: "Assigned To",
            cell: ({ row }) => {
              const users = row.original[key];
              if (!Array.isArray(users) || users.length === 0) {
                return <span className="text-gray-400 italic">None</span>;
              }

              return (
                <div className="flex flex-wrap gap-1">
                  {users.map((user, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs"
                    >
                      {user?.name || "Unnamed"}
                    </span>
                  ))}
                </div>
              );
            }
          };
        }
        // Default render for other fields
        return {
          accessorKey: key,
          accessorFn: (row) => row[key],
          header: key
            .replace(/\./g, ' → ')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase()),
        };
      }),
    [flattenedClient, removedFields]
  );


  // Initialize table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Show loading state if either query is loading
  if (isClientLoading) {
    return <PageLoader text="Loading client data..." />;
  }

  // Show error if client is not found
  if (!client) {
    return <div>Client not found</div>;
  }

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Card className="overflow-auto p-5 space-y-8">
        {/* Client Info Table */}
        <div>
          <h2 className="text-xl font-bold mb-3">Client Info</h2>
          <Card className="overflow-auto">
            <table className="min-w-full border">
              <thead className="bg-muted text-xs font-medium text-gray-700">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="border px-3 py-2 text-left">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="text-sm">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="border px-3 py-2">

                        {flexRender(cell.column.columnDef.cell, cell.getContext())}

                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Follow Ups Component */}
        
        <FollowUpCompo client={client} setClient={setClient}/>

        {/* Quotes revisions and other info */}
        <QuoteRivisionComponent
          dummyData={quoteData}
          dispatch={dispatch}
          enqueryId={slug?.[0]}
          client={client}
          setClient={setClient}
        />
      </Card>

      
    </div>
  );
}

