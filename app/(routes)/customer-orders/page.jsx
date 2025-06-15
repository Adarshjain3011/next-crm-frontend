'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { taskAssigningStatus } from "@/lib/data";

import { useParams, useRouter } from "next/navigation";

import SpecificClientDetails from "@/components/client/SpecificClientDetails";

import axios from "axios";

import { format, parseISO } from 'date-fns';

import { fetchAllSalesPerson, fetchAllUserQueries, fetchUserQueries, assignSalesPersonToEnquery } from "@/lib/api";

import { cutomer_orders_label_data } from "../../../lib/data";


export default function CustomersOrderPage() {

    const router = useRouter();

    const [clients, setClients] = useState(customer_orders_dummy_data);


    const [filters, setFilters] = useState({
        email: "",
        name: "",
        phone: "",
        date: "",
        status: "",
    });

    const [salesUsers, setSalesUsers] = useState(null);

    const [filteredClients, setFilteredClients] = useState(customer_orders_dummy_data);

    useEffect(() => {
        const updated = clients && clients.filter((client) => {

            const nameMatch = client.clientName?.toLowerCase().includes(filters.name.toLowerCase());
            const phoneMatch = client?.phoneNo?.toLowerCase().includes(filters.phone.toLowerCase());
            const statusMatch = filters.status ? client.status === filters.status : true;
            const dateMatch = filters.date
                ? new Date(client.date).toLocaleDateString() ===
                new Date(filters.date).toLocaleDateString()
                : true;
            return nameMatch && phoneMatch && statusMatch && dateMatch;
        });
        setFilteredClients(updated);
    }, [filters, clients]);

    const handleAssign = (clientId, userId) => {
        const updatedClients = clients.map(client =>
            client.id === clientId ? { ...client, assignedTo: userId, status: "Assigned" } : client
        );
        setClients(updatedClients);
    };

    function formatDate(dateString) {
        if (!dateString) return 'N/A'; // or return empty string, or show fallback text
        try {
            return format(parseISO(dateString), 'dd MMM yyyy, hh:mm a');
        } catch (err) {
            console.error("Invalid date string:", dateString, err);
            return 'Invalid date';
        }
    }

    async function selectSalesUser(enqueryId, salesPersonId) {

        try {

            const response = await assignSalesPersonToEnquery({ enqueryId, salesPersonId });

            const updatedClients = clients.map(client =>
                client._id === enqueryId ? { ...client, assignedTo: salesPersonId, status: "Assigned" } : client
            );
            setClients(updatedClients);

        } catch (error) {

            console.log("error is ", error);

        }
    }

    return (
        <div className="p-6">

            <div className="flex justify-between items-center gap-4">
                <h1 className="text-2xl font-semibold mb-4">Customers Order list</h1>
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
            </div>

            <Card>
                <CardContent className="p-4">
                    <Table>
                        <TableHeader>
                            <TableRow>

                                {

                                    cutomer_orders_label_data.map((label, index) => (

                                        <TableHead key={index}>{label}</TableHead>
                                    ))
                                }
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredClients && filteredClients?.map(client => (
                                <TableRow key={client.orderId}>
                                    <TableCell>{client.orderId}</TableCell>
                                    <TableCell>{client.clientName}</TableCell>
                                    <TableCell>{client.location}</TableCell>
                                    <TableCell>{client.phoneNo}</TableCell>
                                    <TableCell>{client.productDescription}</TableCell>
                                    <TableCell>{client.vendors}</TableCell>
                                    <TableCell>{client.quoteVersion}</TableCell>
                                    <TableCell>{client.quoteValue}</TableCell>
                                    <TableCell>{client.gSTvalue}</TableCell>
                                    <TableCell>{client.transportation}</TableCell>
                                    <TableCell>{client.installation}</TableCell>
                                    <TableCell>{client.totalOrderValue}</TableCell>
                                    <TableCell>{client.salesPerson}</TableCell>
                                    <TableCell>{formatDate(client.deliveryDate)}</TableCell>
                                    <TableCell>{client.deliveryStatus}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );

}

