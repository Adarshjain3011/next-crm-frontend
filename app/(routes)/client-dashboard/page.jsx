'use client';

import { useEffect, useState, useMemo } from "react";
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

import DownloadExcelButton from "@/components/common/DownloadExcelButton";

import { taskAssigningStatus, user_role, enqueryHeadingName } from "@/lib/data";
import {
    fetchAllSalesPerson,
    fetchAllUserQueries,
    assignSalesPersonToEnquery,
    getAllMembersData
} from "@/lib/api";

import { setAllMembersData } from "@/app/store/slice/membersSlice";
import RoleGuard from "@/components/auth/RoleGuard";
import { useRole } from "@/app/hooks/useRole";
import { HiOutlineArrowRight } from 'react-icons/hi';
import { Download, Link } from "lucide-react";
import { useLoading } from '@/app/hooks/useLoading';
import { InlineLoader } from '@/components/ui/loader';

import { useRef } from "react";
import { handleAxiosError } from "@/lib/handleAxiosError";
import { RiDeleteBin6Line } from "react-icons/ri";

import { updateEnqueryDetails } from "@/lib/api";

import DeleteConfirmationModal from "@/components/client/DeleteEnqueryConfirmationModal";


export default function ClientDashboardPage() {

    const [isRowEditing, setRowEditing] = useState(null);

    const [showDeleteEnqueryModal, setShowDeleteEnqueryModal] = useState(false);

    const { isAdmin, isSales, user } = useRole();
    const router = useRouter();
    const dispatch = useDispatch();
    const queryClient = useQueryClient();

    const inputRef = useRef();

    const [filters, setFilters] = useState({
        email: "",
        name: "",
        phone: "",
        date: "",
        status: "",
        salesPerson: "",
    });

    const { data: clients = [] } = useQuery({
        queryKey: ['clientQueries'],
        queryFn: fetchAllUserQueries,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 30,
    });

    const membersData = useSelector((state) => state.members.data) || [];
    const salesPersonData = useMemo(
        () => membersData.filter((val) => val.role === user_role.sales),
        [membersData]
    );

    const [editingRequirement, setEditingRequirement] = useState({});

    const [editClientDetails, setEditClientDetails] = useState({});

    console.log("client data : ", clients);

    // filtered clients

    const filteredClients = useMemo(() => {
        return clients.filter(client => {
            if (!client) return false;

            const emailMatch = client.email?.toLowerCase().includes(filters.email.toLowerCase()) ?? true;
            const nameMatch = client.name?.toLowerCase().includes(filters.name.toLowerCase()) ?? true;
            const phoneMatch = client.phone?.includes(filters.phone) ?? true;
            const dateMatch = filters.date
                ? new Date(client.createdAt).toLocaleDateString() === new Date(filters.date).toLocaleDateString()
                : true;
            const statusMatch = filters.status ? client.status === filters.status : true;
            const salesPersonMatch = filters.salesPerson ? client.assignedTo?._id === filters.salesPerson : true;

            if (isSales) {
                return client.assignedTo?._id === user?._id &&
                    emailMatch && nameMatch && phoneMatch && dateMatch && statusMatch;
            }

            return emailMatch && nameMatch && phoneMatch && dateMatch && statusMatch && salesPersonMatch;
        });
    }, [clients, filters, isSales, user]);

    const { isLoading: isAssigning, withLoading } = useLoading();

    useEffect(() => {
        async function getAllUserData() {
            try {
                const result = await getAllMembersData();
                dispatch(setAllMembersData(result));
                toast.success("All user data fetched successfully");
            } catch (error) {
                console.error("Error fetching user data:", error);
                toast.error("Failed to fetch user data");
            }
        }

        if (!membersData.length) {
            getAllUserData();
        }
    }, [dispatch, membersData.length]);


    const handleSalesUserSelect = async (enqueryId, salesPersonId) => {
        await withLoading(async () => {
            try {
                await assignSalesPersonToEnquery({ enqueryId, salesPersonId });
                queryClient.invalidateQueries(['clientQueries']);
                toast.success("Salesperson assigned successfully!");
            } catch (error) {
                console.error("Failed to assign salesperson:", error);
                toast.error("Failed to assign salesperson.");
            }
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(parseISO(dateString), 'dd MMM yyyy, hh:mm a');
        } catch {
            return 'Invalid date';
        }
    };

    const dynamicHeadingNames = useMemo(() => {
        const headings = [...enqueryHeadingName];
        if (!isAdmin) {
            headings.splice(8, 0, "AssignedBy");
        }
        return headings;
    }, [isAdmin]);


    let dowloadableDataForExcel = [];

    // filtered for the excel file downloading

    filteredClients && filteredClients.forEach((data) => {

        console.log("filtered clients data is : ", data);

        let item = {

            email: data.email,
            name: data.name,
            phone: data.phone,
            date: formatDate(data.createdAt),
            status: data.status,
            requirements: data.requirement,
            assignedTo: data.assignedTo?.name || "",
            assignedBy: data.assignedBy?.name || "",
            assignmentDate: formatDate(data.assignmentDate),
            sourceWebsite: data?.sourceWebsite || "",
            sourcePlatform: data?.sourcePlatform || ""

        }

        dowloadableDataForExcel.push(item);

    });

    // editing details on Change

    async function editingDetailsChangeHandler(e) {

        const name = e.target.name;

        const value = e.target.value;

        setEditClientDetails({ ...editClientDetails, [name]: value });


    }

    async function applyChangesHandler(clientId) {

        let finalpayload = {

            ...editClientDetails,
            clientId,

        }

        console.log("final payload is : ", finalpayload);

        try {

            const result = await updateEnqueryDetails(finalpayload);

            queryClient.invalidateQueries(['clientQueries']);
            toast.success("Requirement updated!");

        } catch (error) {

            console.log("error is : ", error);
            handleAxiosError(error);

        }
    }


    return (
        <RoleGuard allowedRoles={[user_role.admin, user_role.sales]}>
            <div className="p-6">
                <div className="flex justify-between items-center gap-4">
                    <h1 className="text-2xl font-semibold mb-4">Client Inquiries List</h1>

                    <DownloadExcelButton

                        data={dowloadableDataForExcel}
                        filename="client_enquery_list.xlsx"

                    />

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

                    {isAdmin && (
                        <div className="flex flex-col gap-2">
                            <Label>Sales Person</Label>
                            <select
                                className="w-full border p-2 rounded"
                                value={filters.salesPerson}
                                onChange={(e) => setFilters({ ...filters, salesPerson: e.target.value })}
                            >
                                <option value="">All</option>
                                {salesPersonData?.map(person => (
                                    <option key={person._id} value={person._id}>
                                        {person.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <Card>
                    <CardContent className="p-4 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead></TableHead>
                                    {dynamicHeadingNames.map((data, index) => (
                                        <TableHead key={index}>{data}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredClients.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={dynamicHeadingNames.length + 1}>
                                            No client inquiries found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredClients.map(client => {
                                        const assignedPersonName = salesPersonData.find(user => user._id === client.assignedTo?._id)?.name;

                                        return (

                                            <TableRow key={client._id} className="cursor-pointer">
                                                <TableCell>

                                                    <div className="flex gap-4">

                                                        <input
                                                            type="checkbox"
                                                            checked={isRowEditing === client._id}
                                                            className="w-6 h-6 accent-blue-600 scale-75 cursor-pointer"
                                                            onChange={e => {
                                                                if (e.target.checked) {
                                                                    setEditClientDetails({
                                                                        name: client.name || "",
                                                                        email: client.email || "",
                                                                        companyName: client.companyName || "",
                                                                        phone: client.phone || "",
                                                                        productLink: client.productLink || "",
                                                                        requirement: client.requirement || "",
                                                                        sourcePlatform: client.sourcePlatform || "",
                                                                        sourceWebsite: client.sourceWebsite || "",
                                                                    });
                                                                    setRowEditing(client._id);
                                                                } else {
                                                                    setRowEditing(null);
                                                                    setEditClientDetails({});
                                                                }
                                                            }}
                                                        />

                                                        {

                                                            isRowEditing === client._id && (

                                                                <RiDeleteBin6Line size={25} onClick={() => {

                                                                    setShowDeleteEnqueryModal(true);

                                                                }}></RiDeleteBin6Line>

                                                            )
                                                        }

                                                    </div>

                                                </TableCell>
                                                <TableCell>
                                                    {isRowEditing === client._id ? (
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            value={editClientDetails.name}
                                                            className="border rounded-2xl p-2 text-wrap"
                                                            onChange={e => setEditClientDetails({ ...editClientDetails, name: e.target.value })}
                                                        />
                                                    ) : (
                                                        <p>{client.name || "NA"}</p>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {isRowEditing === client._id ? (
                                                        <input
                                                            type="text"
                                                            name="email"
                                                            value={editClientDetails.email}
                                                            className="border rounded-2xl p-2 text-wrap"
                                                            onChange={e => setEditClientDetails({ ...editClientDetails, email: e.target.value })}
                                                        />
                                                    ) : (
                                                        <p>{client.email || "NA"}</p>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {isRowEditing === client._id ? (
                                                        <input
                                                            type="text"
                                                            name="requirement"
                                                            value={editClientDetails.requirement}
                                                            className="border rounded-2xl p-2 text-wrap"
                                                            onChange={e => setEditClientDetails({ ...editClientDetails, requirement: e.target.value })}
                                                        />
                                                    ) : (
                                                        <p>{client.requirement || "NA"}</p>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {isRowEditing === client._id ? (
                                                        <input
                                                            type="text"
                                                            name="sourcePlatform"
                                                            value={editClientDetails.sourcePlatform}
                                                            className="border rounded-2xl p-2 text-wrap"
                                                            onChange={e => setEditClientDetails({ ...editClientDetails, sourcePlatform: e.target.value })}
                                                        />
                                                    ) : (
                                                        <p>{client.sourcePlatform || "NA"}</p>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {isRowEditing === client._id ? (
                                                        <input
                                                            type="text"
                                                            name="phone"
                                                            value={editClientDetails.phone}
                                                            className="border rounded-2xl p-2 text-wrap"
                                                            onChange={e => setEditClientDetails({ ...editClientDetails, phone: e.target.value })}
                                                        />
                                                    ) : (
                                                        <p>{client.phone || "NA"}</p>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {isRowEditing === client._id ? (
                                                        <input
                                                            type="text"
                                                            name="sourceWebsite"
                                                            value={editClientDetails.sourceWebsite}
                                                            className="border rounded-2xl p-2 text-wrap"
                                                            onChange={e => setEditClientDetails({ ...editClientDetails, sourceWebsite: e.target.value })}
                                                        />
                                                    ) : (
                                                        <p>{client.sourceWebsite || "NA"}</p>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {isRowEditing === client._id ? (
                                                        <input
                                                            type="text"
                                                            name="productLink"
                                                            value={editClientDetails.productLink}
                                                            className="border rounded-2xl p-2 text-wrap"
                                                            onChange={e => setEditClientDetails({ ...editClientDetails, productLink: e.target.value })}
                                                        />
                                                    ) : (
                                                        <p>
                                                            {

                                                                client.productLink ? (

                                                                    <a href={client.productLink} target="_blank">link</a>

                                                                ) : "NA"

                                                            }

                                                        </p>
                                                    )}
                                                </TableCell>
                                                <TableCell>{formatDate(client.createdAt)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={client.status === "Assigned" ? "default" : "outline"}>
                                                        {client.status}
                                                    </Badge>
                                                </TableCell>
                                                {!isAdmin && (
                                                    <TableCell>
                                                        {client.assignedBy?.name || "Not available"}
                                                    </TableCell>
                                                )}
                                                {isAdmin ? (
                                                    <TableCell>
                                                        <Select
                                                            onValueChange={(value) => handleSalesUserSelect(client._id, value)}
                                                            disabled={isAssigning}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={
                                                                    isAssigning ? (
                                                                        <div className="flex items-center">
                                                                            <InlineLoader size="sm" className="mr-2" />
                                                                            Assigning...
                                                                        </div>
                                                                    ) : (
                                                                        assignedPersonName || "Assign"
                                                                    )
                                                                } />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {salesPersonData.map(user => (
                                                                    <SelectItem key={user._id} value={user._id}>
                                                                        {user.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                ) : (
                                                    <TableCell>{client.assignedTo?.name || "Unassigned"}</TableCell>
                                                )}

                                                <TableCell>
                                                    <HiOutlineArrowRight
                                                        className="cursor-pointer"
                                                        size={30}
                                                        onClick={() => router.push(`/client-dashboard/${client._id}`)}
                                                    />
                                                </TableCell>

                                                {isRowEditing === client._id && (
                                                    <TableCell colSpan={2}>
                                                        <Button
                                                            variant="success"
                                                            size="sm"
                                                            className="mr-2"
                                                            onClick={async () => {
                                                                await applyChangesHandler(client._id);
                                                                setRowEditing(null);
                                                                setEditClientDetails({});
                                                            }}
                                                        >
                                                            Update
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setRowEditing(null);
                                                                setEditClientDetails({});
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </TableCell>
                                                )}

                                            </TableRow>

                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                        {

                            showDeleteEnqueryModal && <DeleteConfirmationModal

                                onClose={()=>setShowDeleteEnqueryModal(false)}
                                enquiryDetails={editClientDetails}
                                clientId = {isRowEditing}
                                queryClient = {queryClient}
                            />
                        }
                    </CardContent>
                </Card>


            </div>
        </RoleGuard>
    );
}


