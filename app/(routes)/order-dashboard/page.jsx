'use client';

import { useState } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { HiOutlineArrowRight } from "react-icons/hi";
import { getAllOrders } from "@/lib/api";
import { orderTableHeaders } from "@/lib/data";
import { formatDateForInput } from "@/lib/utils";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import DisplayVendorDetails from "@/components/order/SpecificVendorDetails";
import { useDispatch } from "react-redux";
import { setOrderData, setLoading, setError } from "@/app/store/slice/invoiceSlice";
import RoleGuard from "@/components/auth/RoleGuard";
import { useRole } from "@/app/hooks/useRole";
import { user_role } from "@/lib/data";
import axios from "axios";


import { store } from "@/app/store/store";
import { handleAxiosError } from "@/lib/handleAxiosError";
import UploadInvoiceCompo from "@/components/common/UploadInvoiceCompo";

export default function OrderDashboard() {
    const router = useRouter();
    const { isAdmin, isSales, user } = useRole();

    console.log("user data at the order dashboard ",user);

    const [uploadInvoiceModal, setUploadInvoiceModal] = useState(false);

    const [selectedOrderData, setSelectedOrderData] = useState(null);


    const [filters, setFilters] = useState({
        name: "",
        status: "",
        date: "",
    });

    const dispatch = useDispatch();
    const [showVendorDetails, setShowVendorDetails] = useState(false);
    const [specificVendorData, setSpecificVendorData] = useState(null);

    // React Query for fetching orders
    const { data: orders = [], isLoading, error } = useQuery({
        queryKey: ['orders'],
        queryFn: getAllOrders,
        staleTime: 1000 * 60 * 5,       // Data becomes stale after 5 minutes
        cacheTime: 1000 * 60 * 15,      // Cache data for 15 minutes
        refetchInterval: 1000 * 5,     // ✅ Refetch every 30 seconds
        enabled: true,
        onError: (error) => {
            console.error("Error fetching orders:", error);
            toast.error("Failed to fetch orders");
        }
    });


    let membersData = useSelector((state) => state.members.data);

    console.log("members data  at the quotes", membersData);

    console.log("orders data at the quotes", orders);

    function getVendorName(vendorId) {
        console.log("Vendor ID at the get vendor name", vendorId);
        console.log("Members data at the get vendor name", membersData);
        const vendor = membersData.find((member) => member._id === vendorId);
        console.log("Vendor name at the get vendor name", vendor);
        return vendor ? vendor.name : "Unknown Vendor";
    }

    let filteredOrders = orders;

    // Filter orders based on user role and filters
    // const filteredOrders = orders.filter((order) => {
    //     // Base filters
    //     const clientName = order.clientId?.name || "";
    //     const nameMatch = clientName.toLowerCase().includes(filters.name.toLowerCase());
    //     const statusMatch = filters.status ? order.deliveryStatus === filters.status : true;
    //     const dateMatch = filters.date
    //         ? new Date(order.createdAt).toLocaleDateString() ===
    //         new Date(filters.date).toLocaleDateString()
    //         : true;

    //     // Role-based filtering
    //     if (isSales) {
    //         // Sales person can only see their assigned orders
    //         return order.salesPerson === user._id && nameMatch && statusMatch && dateMatch;
    //     }

    //     // Admin can see all orders
    //     return nameMatch && statusMatch && dateMatch;
    // });

    async function generateInvoiceHandler(order) {
        try {
            dispatch(setLoading());

            // Log the current state before generating invoice
            console.log("Current order data:", order);

            // If the order has all needed data, use it directly
            if (order.finalQuotationId && order.clientId) {
                dispatch(setOrderData(order));
                // Log what's in Redux after dispatch
                const state = store.getState().invoice;
                console.log("Redux state after dispatch:", {
                    orderData: state.orderData,
                    invoiceData: state.invoiceData
                });
                router.push(`/invoice-form/${order._id}`);
                return;
            }

            // If we need fresh data, fetch it
            const response = await axios.get(`/api/orders/${order._id}`);
            if (response.data) {
                dispatch(setOrderData(response.data));
                // Log what's in Redux after fetching fresh data
                const state = store.getState().invoice;
                console.log("Redux state after fresh data:", {
                    orderData: state.orderData,
                    invoiceData: state.invoiceData
                });
                router.push(`/invoice-form/${order._id}`);
            }
        } catch (error) {
            console.error("Error preparing invoice data:", error);
            dispatch(setError(error.message));
            toast.error("Failed to prepare invoice data");
        }
    }


    return (
        <RoleGuard allowedRoles={[user_role.admin, user_role.sales]}>
            <div className="p-6">
                <div className="flex justify-between items-center gap-4">
                    <h1 className="text-2xl font-semibold mb-4">Order Dashboard</h1>
                    {isAdmin && <Button>Download Excel</Button>}
                </div>

                {/* Filters Section */}
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
                        <Label>Status</Label>
                        <select
                            className="w-full border p-2 rounded"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="">All</option>
                            <option value="Pending">Pending</option>
                            <option value="Delivered">Delivered</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Date</Label>
                        <Input
                            type="date"
                            value={filters.date}
                            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                        />
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error.message}</span>
                    </div>
                )}

                {/* Orders Table */}
                {!isLoading && !error && (
                    <Card>
                        <CardContent className="p-4 overflow-x-auto">
                            <Table className="w-full border-collapse border text-sm text-left">
                                <thead>
                                    <tr className="bg-gray-100">
                                        {orderTableHeaders.map((header, index) => (
                                            <TableHead
                                                key={index}
                                                className="border px-3 py-2 text-gray-700 font-semibold"
                                            >
                                                {header}
                                            </TableHead>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((order) => {
                                        const hasVendors = Array.isArray(order.vendorAssignments) && order.vendorAssignments.length > 0;

                                        if (hasVendors) {
                                            return order.vendorAssignments.map((vendor, vendorIdx) => (
                                                <tr key={`${order._id}-${vendorIdx}`} className="border-b">
                                                    {/* Order details - show only for first vendor */}
                                                    {vendorIdx === 0 && (
                                                        <>
                                                            <td
                                                                rowSpan={order.vendorAssignments.length}
                                                                className="border px-3 py-2 text-center"
                                                                onClick={() => router.push(`/order-dashboard/${order._id}`)}
                                                            >
                                                                {order._id}
                                                            </td>
                                                            <td
                                                                rowSpan={order.vendorAssignments.length}
                                                                className="border px-3 py-2 text-center"
                                                            >
                                                                {order.clientId?.name || "Unknown"}
                                                            </td>
                                                            <td
                                                                rowSpan={order.vendorAssignments.length}
                                                                className="border px-3 py-2 text-center"
                                                            >
                                                                <p
                                                                    className="text-blue-600 text-lg cursor-pointer"
                                                                    onClick={() => router.push(`/client-dashboard/${order.clientId?._id}`)}
                                                                >
                                                                    {order.quoteVersion}
                                                                </p>
                                                            </td>
                                                            <td
                                                                rowSpan={order.vendorAssignments.length}
                                                                className="border px-3 py-2 text-center"
                                                            >
                                                                ₹{order.transport?.toLocaleString() || 0}
                                                            </td>
                                                            <td
                                                                rowSpan={order.vendorAssignments.length}
                                                                className="border px-3 py-2 text-center"
                                                            >
                                                                ₹{order.installation?.toLocaleString() || 0}
                                                            </td>
                                                            <td
                                                                rowSpan={order.vendorAssignments.length}
                                                                className="border px-3 py-2 text-center"
                                                            >
                                                                ₹{order.gstAmount?.toLocaleString() || 0}
                                                            </td>
                                                            <td
                                                                rowSpan={order.vendorAssignments.length}
                                                                className="border px-3 py-2 text-center"
                                                            >
                                                                ₹{order.totalPayable?.toLocaleString() || 0}
                                                            </td>
                                                            <td
                                                                rowSpan={order.vendorAssignments.length}
                                                                className="border px-3 py-2 text-center"
                                                            >
                                                                ₹{order.orderValue?.toLocaleString() || 0}
                                                            </td>
                                                        </>
                                                    )}

                                                    {/* Vendor-specific details */}
                                                    <td className="border px-3 py-2 text-center text-blue-500 cursor-pointer" onClick={() => {
                                                        setShowVendorDetails(true);
                                                        const filteredVendorData = membersData.find((member) => member._id === vendor.vendorId);
                                                        console.log("Vendor data at the click is : ", filteredVendorData);
                                                        setSpecificVendorData(filteredVendorData);
                                                    }}>
                                                        {getVendorName(vendor.vendorId) || "Unknown Vendor"}
                                                    </td>
                                                    <td className="border px-3 py-2 text-center">
                                                        {vendor.itemRef || "-"}
                                                    </td>
                                                    <td className="border px-3 py-2 text-center">
                                                        {vendor.assignedQty || 0}
                                                    </td>
                                                    <td className="border px-3 py-2 text-center">
                                                        ₹{vendor.orderValue?.toLocaleString() || 0}
                                                    </td>
                                                    <td className="border px-3 py-2 text-center">
                                                        ₹{vendor.advancePaid?.toLocaleString() || 0}
                                                    </td>
                                                    <td className="border px-3 py-2 text-center">
                                                        ₹{vendor.finalPayment?.toLocaleString() || 0}
                                                    </td>
                                                    <td className="border px-3 py-2 text-center">
                                                        <Badge
                                                            variant={vendor.status === "Completed" ? "default" : "outline"}
                                                        >
                                                            {vendor.status || "Pending"}
                                                        </Badge>
                                                    </td>

                                                    {/* Order status and actions - show only for first vendor */}
                                                    {vendorIdx === 0 && (
                                                        <>
                                                            <td
                                                                rowSpan={order.vendorAssignments.length}
                                                                className="border px-3 py-2 text-center"
                                                            >
                                                                <Badge
                                                                    variant={
                                                                        order.deliveryStatus === "Delivered" ? "default" : "outline"
                                                                    }
                                                                >
                                                                    {order.deliveryStatus}
                                                                </Badge>
                                                            </td>
                                                            <td
                                                                rowSpan={order.vendorAssignments.length}
                                                                className="border px-3 py-2 text-center"
                                                            >
                                                                {order.documents?.map((doc, index) => (
                                                                    <div key={index}>
                                                                        <a
                                                                            href={doc}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-blue-500 underline"
                                                                        >
                                                                            Document {index + 1}
                                                                        </a>
                                                                    </div>
                                                                ))}
                                                            </td>
                                                            <td
                                                                rowSpan={order.vendorAssignments.length}
                                                                className="border px-3 py-2 text-center"
                                                            >
                                                                {order.createdAt ? formatDateForInput(order.createdAt) : "N/A"}
                                                            </td>

                                                            <td
                                                                rowSpan={order.vendorAssignments.length}
                                                                className="border px-3 py-2 text-center"
                                                            >
                                                                <div className="flex flex-col gap-3">

                                                                    <a href={order?.invoiceId?.invoiceExcelPdfLink ? order?.invoiceId?.invoiceExcelPdfLink : ""} target="_blank">{order?.invoiceId?.invoiceExcelPdfLink ? "PDF Link" : ""}</a>
                                                                    <a href={order?.invoiceId?.invoiceExcelLink ? order?.invoiceId?.invoiceExcelLink : ""} target="_blank">{order?.invoiceId?.invoiceExcelLink ? "Excel Link" : ""}</a>
                                                                </div>

                                                            </td>

                                                            <td
                                                                rowSpan={order.vendorAssignments.length}
                                                                className="border px-3 py-2 text-center gap-6"
                                                            >
                                                                <div className="flex flex-col gap-2">

                                                                    <Button onClick={() => generateInvoiceHandler(order)}>
                                                                        Generate Invoice
                                                                    </Button>

                                                                    <Button className="pt-7" onClick={() => {

                                                                        setUploadInvoiceModal(true);
                                                                        setSelectedOrderData(order);

                                                                    }}>
                                                                        Upload Invoice

                                                                    </Button>

                                                                </div>

                                                            </td>
                                                            <td
                                                                rowSpan={order.vendorAssignments.length}
                                                                className="border px-3 py-2 text-center"
                                                            >
                                                                <HiOutlineArrowRight
                                                                    className="cursor-pointer"
                                                                    size={24}
                                                                    onClick={() => router.push(`/order-dashboard/${order._id}`)}
                                                                />
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            ));
                                        } else {
                                            // Render single row for orders without vendors
                                            return (
                                                <tr key={order._id} className="border-b">
                                                    <td className="border px-3 py-2 text-center">{order._id}</td>
                                                    <td className="border px-3 py-2 text-center">
                                                        {order.clientId?.name || "Unknown"}
                                                    </td>
                                                    <td className="border px-3 py-2 text-center">{order.quoteVersion}</td>
                                                    <td className="border px-3 py-2 text-center">
                                                        ₹{order.transport?.toLocaleString() || 0}
                                                    </td>
                                                    <td className="border px-3 py-2 text-center">
                                                        ₹{order.installation?.toLocaleString() || 0}
                                                    </td>
                                                    <td className="border px-3 py-2 text-center">
                                                        ₹{order.gstAmount?.toLocaleString() || 0}
                                                    </td>
                                                    <td className="border px-3 py-2 text-center">
                                                        ₹{order.totalPayable?.toLocaleString() || 0}
                                                    </td>
                                                    <td className="border px-3 py-2 text-center">
                                                        ₹{order.orderValue?.toLocaleString() || 0}
                                                    </td>
                                                    <td colSpan={7} className="text-center text-gray-500">
                                                        No Vendor Assignments
                                                    </td>
                                                    <td className="border px-3 py-2 text-center">
                                                        <Badge
                                                            variant={order.deliveryStatus === "Delivered" ? "default" : "outline"}
                                                        >
                                                            {order.deliveryStatus}
                                                        </Badge>
                                                    </td>
                                                    <td className="border px-3 py-2 text-center">
                                                        {order.documents?.map((doc, index) => (
                                                            <div key={index}>
                                                                <a
                                                                    href={doc}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-500 underline"
                                                                >
                                                                    Document {index + 1}
                                                                </a>
                                                            </div>
                                                        ))}
                                                    </td>
                                                    <td className="border px-3 py-2 text-center">
                                                        <Button onClick={() => generateInvoiceHandler(order)}>
                                                            Generate Invoice
                                                        </Button>
                                                    </td>
                                                    <td className="border px-3 py-2 text-center">
                                                        <HiOutlineArrowRight
                                                            className="cursor-pointer"
                                                            size={24}
                                                            onClick={() => router.push(`/order-dashboard/${order._id}`)}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    })}
                                </tbody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {console.log("Specific vendor data is : ", specificVendorData)}

                {specificVendorData && showVendorDetails && (
                    <DisplayVendorDetails
                        setShowVendorDetails={setShowVendorDetails}
                        userName={specificVendorData?.name || "N/A"}
                        email={specificVendorData?.email || "N/A"}
                        phoneNo={specificVendorData?.phoneNo || "N/A"}
                        role={specificVendorData?.role || "N/A"}
                    />
                )}
            </div>

            {

                uploadInvoiceModal && <UploadInvoiceCompo

                    setUploadInvoiceModal={setUploadInvoiceModal}
                    order={selectedOrderData}

                ></UploadInvoiceCompo>
            }

        </RoleGuard>
    );
}


