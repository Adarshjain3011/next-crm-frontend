'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { format, parseISO } from "date-fns";

import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { taskAssigningStatus, user_role } from "@/lib/data";
import {
    fetchAllSalesPerson,
    fetchAllUserQueries,
    assignSalesPersonToEnquery,
} from "@/lib/api";

import { setUserData } from "@/app/store/slice/salesPersonData";
import { FiEye } from "react-icons/fi";

import { HiOutlineArrowRight } from 'react-icons/hi';
import { enqueryHeadingName } from "@/lib/data";

import { clearSalesPersonData } from "@/app/store/slice/salesPersonData";
// import { getAllMembersData } from "@/lib/api";

import { setAllMembersData } from "@/app/store/slice/membersSlice";

import { getAllMembersData } from "@/lib/api";

export default function ClientDashboardPage() {
    const [filters, setFilters] = useState({
        email: "",
        name: "",
        phone: "",
        date: "",
        status: "",
        salesPerson:"",
    });

    const [filteredClients, setFilteredClients] = useState([]);
    const [localSalesPersonData, setLocalSalesPersonData] = useState([]);

    const router = useRouter();
    const dispatch = useDispatch();
    const queryClient = useQueryClient();

    const cachedQueryData = queryClient.getQueryData(['clientQueries']);

    const { data: fetchedClientsQuery } = useQuery({
        queryKey: ['clientQueries'],
        queryFn: fetchAllUserQueries,
        enabled: !cachedQueryData,
        onSuccess: (data) => {

            console.log("on success query data ", data);
        }
    });


    const clients = cachedQueryData || fetchedClientsQuery;


    // const salesPersonData = useSelector((state) => state.salesPerson.data);

    // console.log("sales person data", salesPersonData);

    // quote members data 

    let membersData = useSelector((state) => state.members.data);

    console.log("members data", membersData);

    let salesPersonData = membersData && membersData.filter((val) => val.role === user_role.sales);

    console.log("sales person data : ", salesPersonData);


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

    useEffect(() => {
        if (!clients) return;

        const updated = clients.filter((client) => {
            const emailMatch = client.email?.toLowerCase().includes(filters.email.toLowerCase());
            const nameMatch = client.name?.toLowerCase().includes(filters.name.toLowerCase());
            const phoneMatch = client.phone?.toLowerCase().includes(filters.phone.toLowerCase());
            const statusMatch = filters.status ? client.status === filters.status : true;
            const salesPersonMatch = filters.salesPerson ? client.assignedTo?._id === filters.salesPerson : true;
            const dateMatch = filters.date
                ? new Date(client.createdAt).toLocaleDateString() ===
                new Date(filters.date).toLocaleDateString()
                : true;
            return emailMatch && nameMatch && phoneMatch && statusMatch && dateMatch && salesPersonMatch;
        });

        setFilteredClients(updated);
    }, [filters, clients]);

    async function selectSalesUser(enqueryId, salesPersonId) {
        try {
            const response = await assignSalesPersonToEnquery({ enqueryId, salesPersonId });

            const updatedClients = clients.map(client =>
                client._id === enqueryId
                    ? { ...client, assignedTo: salesPersonId, status: "Assigned" }
                    : client
            );

            setFilteredClients(updatedClients);

            queryClient.setQueryData(['clientQueries'], (oldData) =>
                oldData?.map(client =>
                    client._id === enqueryId
                        ? { ...client, assignedTo: salesPersonId, status: "Assigned" }
                        : client
                ) || []
            );

            toast.success("Salesperson assigned successfully!");
        } catch (error) {
            toast.error("Failed to assign salesperson.");
        }
    }

    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            return format(parseISO(dateString), 'dd MMM yyyy, hh:mm a');
        } catch {
            return 'Invalid date';
        }
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center gap-4">
                <h1 className="text-2xl font-semibold mb-4">Client Inquiries List</h1>
                <Button>Download Excel</Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="flex flex-col gap-2">
                    <Label>Name</Label>
                    <Input
                        type="text"
                        placeholder="Search by name"
                        value={filters.name}
                        onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Email</Label>
                    <Input
                        type="text"
                        placeholder="Search by email"
                        value={filters.email}
                        onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Phone</Label>
                    <Input
                        type="text"
                        placeholder="Search by phone"
                        value={filters.phone}
                        onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Date</Label>
                    <Input
                        type="date"
                        value={filters.date}
                        onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Status</Label>
                    <select
                        className="w-full border p-2 rounded"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option value="">All</option>
                        {Object.values(taskAssigningStatus).map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-2">

                    <Label>Sales Person</Label>
                    <select
                        className="w-full border p-2 rounded"
                        value={filters.salesPerson}
                        onChange={(e) => setFilters({ ...filters, salesPerson: e.target.value })}
                    >
                        <option value="">Select</option>
                        {salesPersonData.map((data,index) => (
                            <option key={index} value={data._id}>
                                {data.name}
                            </option>
                        ))}
                    </select>
                </div>


            </div>

            <Card>
                <CardContent className="p-4 overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>

                                {

                                    enqueryHeadingName.map((data) => (

                                        <TableHead>{data}</TableHead>

                                    ))
                                }
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredClients?.map(client => (
                                <TableRow
                                    key={client._id}
                                    className="cursor-pointer"
                                >
                                    <TableCell>{client.name}</TableCell>
                                    <TableCell>{client.email}</TableCell>
                                    <TableCell>{client.requirement}</TableCell>
                                    <TableCell>{client.sourcePlatform}</TableCell>
                                    <TableCell>{client.phone}</TableCell>
                                    <TableCell>{formatDate(client.createdAt)}</TableCell>
                                    <TableCell>{client.sourceWebsite}</TableCell>
                                    <TableCell>
                                        <Badge variant={client.status === "Assigned" ? "default" : "outline"}>
                                            {client.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Select onValueChange={(value) => selectSalesUser(client._id, value)}>
                                            <SelectTrigger>
                                                <SelectValue
                                                    placeholder={
                                                        client.assignedTo
                                                            ? salesPersonData.find(user => user._id === client.assignedTo._id)?.name || "Assigned"
                                                            : "Assign"
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {salesPersonData && salesPersonData.map(user => (
                                                    <SelectItem key={user._id} value={user._id}>
                                                        {user.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>


                                    </TableCell>

                                    <TableCell className="">

                                        <HiOutlineArrowRight className="cursor-pointer " size={30} onClick={() => {

                                            router.push(`/client-dashboard/${client._id}`)
                                        }} />

                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
