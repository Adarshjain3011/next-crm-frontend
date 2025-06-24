'use client';

import { useState, useEffect, useMemo } from 'react';
import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { HiOutlineArrowRight } from "react-icons/hi";
import { getAllOrders, updateOrderStatus } from "@/lib/api";
import { order_status, orderTableHeaders } from "@/lib/data";
import { formatDateForInput } from "@/lib/utils";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import DisplayVendorDetails from "@/components/order/SpecificVendorDetails";
import { setOrderData, setLoading, setError } from "@/app/store/slice/invoiceSlice";
import RoleGuard from "@/components/auth/RoleGuard";
import { useRole } from "@/app/hooks/useRole";
import { user_role } from "@/lib/data";
import axios from "axios";
import { store } from "@/app/store/store";
import { handleAxiosError } from "@/lib/handleAxiosError";
import UploadInvoiceCompo from "@/components/common/UploadInvoiceCompo";
import DownloadExcelButton from "@/components/common/DownloadExcelButton";
import { TableLoader } from '@/components/ui/loader';
import { Changa } from 'next/font/google';

import { setAllMembersData } from '@/app/store/slice/membersSlice';
import { getAllMembersData } from '@/lib/api';

export default function OrderDashboard() {

    const router = useRouter();
    const { isAdmin, isSales, user } = useRole();

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

    console.log("members data is : ", membersData);

    function getVendorName(vendorId) {

        const vendor = membersData.find((member) => member._id === vendorId);
        return vendor ? vendor.name : "Unknown Vendor";
    }

    let filteredOrders = orders.filter(order => {
        // Filter by name (client name)
        const matchesName = filters.name
            ? (order.clientId?.name || '').toLowerCase().includes(filters.name.toLowerCase())
            : true;

        // Filter by status (deliveryStatus)
        const matchesStatus = filters.status
            ? order.deliveryStatus === filters.status
            : true;

        // Filter by date (createdAt)
        const matchesDate = filters.date
            ? order.createdAt && order.createdAt.slice(0, 10) === filters.date
            : true;

        return matchesName && matchesStatus && matchesDate;

    });



    async function generateInvoiceHandler(order) {
        try {
            dispatch(setLoading());

            // If the order has all needed data, use it directly
            if (order.finalQuotationId && order.clientId) {
                dispatch(setOrderData(order));
                // Log what's in Redux after dispatch
                const state = store.getState().invoice;
                router.push(`/invoice-form/${order._id}`);
                return;
            }

            // If we need fresh data, fetch it
            const response = await axios.get(`/api/orders/${order._id}`);
            if (response.data) {
                dispatch(setOrderData(response.data));
                // Log what's in Redux after fetching fresh data
                const state = store.getState().invoice;

                router.push(`/invoice-form/${order._id}`);
            }
        } catch (error) {
            console.error("Error preparing invoice data:", error);
            dispatch(setError(error.message));
            toast.error("Failed to prepare invoice data");
        }
    }

    // Function to prepare order data for Excel

    const prepareOrderDataForExcel = () => {

        const rows = [];

        filteredOrders.forEach(order => {

            const baseData = {
                'Order ID': order._id,
                'Client Name': order.clientId?.name || 'Unknown',
                'Quote Version': order.quoteVersion,
                'Transport': order.transport || 0,
                'Installation': order.installation || 0,
                'GST Amount': order.gstAmount || 0,
                'Total Payable': order.totalPayable || 0,
                'Order Value': order.orderValue || 0,
                'Delivery Status': order.deliveryStatus || 'N/A',
                'Documents': order.documents?.join(', ') || 'No Documents',
                'Updated At': formatDateForInput(order.updatedAt),
                'Invoice Pdf Url': order.invoiceId?.invoiceExcelPdfLink || 'N/A',
            };

            // Conditionally add a key
            if (order.invoiceId?.invoiceExcelPdfLink) {

                baseData["Invoice Excel Link"] = order.invoiceId.invoiceExcelPdfLink;

            }

            const vendorAssignments = order.vendorAssignments || [];
            const hasVendors = vendorAssignments.length > 0;

            if (hasVendors) {
                vendorAssignments.forEach(vendor => {
                    rows.push({
                        ...baseData,
                        'Vendor Name': getVendorName(vendor.vendorId),
                        'Vendor Item Ref': vendor.itemRef,
                        'Vendor Assigned Qty': vendor.assignedQty,
                        'Vendor Order Value': vendor.orderValue,
                        'Vendor Advance': vendor.advancePaid,
                        'Vendor Final Payment': vendor.finalPayment,
                        'Vendor Status': vendor.status,
                    });
                });
            } else {
                // If no vendors, push just the base data
                rows.push({
                    ...baseData,
                    'Vendor Name': 'No Vendors',
                    'Vendor Item Ref': 'N/A',
                    'Vendor Assigned Qty': 'N/A',
                    'Vendor Order Value': 'N/A',
                    'Vendor Advance': 'N/A',
                    'Vendor Final Payment': 'N/A',
                    'Vendor Status': 'N/A',
                });
            }

            // Add additional rows for extra invoice links if needed
            if (order.invoiceId?.invoiceExcelPdfLinks && Array.isArray(order.invoiceId.invoiceExcelPdfLinks)) {
                order.invoiceId.invoiceExcelPdfLinks.forEach((link, index) => {
                    rows.push({
                        ...baseData,
                        'Vendor Name': `Extra Invoice Link ${index + 1}`,
                        'Vendor Item Ref': '',
                        'Vendor Assigned Qty': '',
                        'Vendor Order Value': '',
                        'Vendor Advance': '',
                        'Vendor Final Payment': '',
                        'Vendor Status': '',
                        'Invoice Pdf Url': link,
                    });
                });
            }

        });

        return rows;

    };


    async function changeOrderStatus(event, orderId) {

        try {

            const preparedData = {

                orderId: orderId,
                status: event.target.value,

            }

            console.log("prepared data is : ", preparedData);

            console.log("prepared data is : ", preparedData);

            const result = await updateOrderStatus(preparedData);

            console.log("update order status : ", result);


        } catch (error) {

            handleAxiosError(error);

        }
    }

    useEffect(() => {

        async function getAllUserData() {

            try {

                const result = await getAllMembersData();

                dispatch(setAllMembersData(result));

                toast.success("all user data fetched successfully");

            } catch (error) {

                handleAxiosError(error);

            }

        }

        if (!membersData) {

            getAllMembersData();

        }

    }, [])


    return (
        <RoleGuard allowedRoles={[user_role.admin, user_role.sales]}>
            <div className="p-6">
                <div className="flex justify-between items-center gap-4">
                    <h1 className="text-2xl font-semibold mb-4">Order Dashboard</h1>
                    {isAdmin && (
                        <DownloadExcelButton
                            data={prepareOrderDataForExcel()}
                            filename="orders_report.xlsx"
                            sheetName="Orders"
                        />
                    )}
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

                            {

                                Object.values(order_status).map((order_stat, index) => (

                                    <option value={order_stat}>{order_stat}</option>

                                ))
                            }

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
                {isLoading && <TableLoader text="Loading orders..." />}

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
                                    {filteredOrders && filteredOrders.map((order) => {
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
                                                                <select
                                                                    className="w-full border p-2 rounded"
                                                                    value={order.deliveryStatus}
                                                                    onChange={(event) => changeOrderStatus(event, order._id)}
                                                                >
                                                                    {

                                                                        Object.values(order_status).map((order_stat, index) => (

                                                                            <option value={order_stat}>{order_stat}</option>

                                                                        ))
                                                                    }

                                                                </select>

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
                                                    <td className="border px-3 py-2 text-center">
                                                        <p
                                                            className="text-blue-600 text-lg cursor-pointer"
                                                            onClick={() => router.push(`/client-dashboard/${order.clientId?._id}`)}
                                                        >
                                                            {order.quoteVersion}
                                                        </p>
                                                    </td>
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

                {specificVendorData && showVendorDetails && (
                    <DisplayVendorDetails
                        setShowVendorDetails={setShowVendorDetails}
                        userName={specificVendorData?.name || "N/A"}
                        email={specificVendorData?.email || "N/A"}
                        phoneNo={specificVendorData?.phoneNo || "N/A"}
                        specialization={specificVendorData?.specialization || "N/A"}
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


