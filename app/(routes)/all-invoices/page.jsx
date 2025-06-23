'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Search,
  FileText,
  Loader2,
  Download,
  Filter,
  ArrowUpDown,
  DollarSign,
  FileCheck,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import the API function to get all invoices
import { getAllInvoices } from '@/lib/api';
import RoleGuard from '@/components/auth/RoleGuard';
import { user_role } from '@/lib/data';
import { TableLoader } from '@/components/ui/loader';

import { payment_status } from '@/lib/data';

export default function AllInvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'invoiceDate', direction: 'desc' });

  // Fetch all invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoading(true);
        const response = await getAllInvoices();
        setInvoices(response);
        setFilteredInvoices(response);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        toast.error('Failed to load invoices');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // Calculate statistics
  const calculateStats = () => {
    const total = filteredInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
    const paid = filteredInvoices.filter(inv => (inv.paymentStatus || '').toLowerCase() === 'paid').length;
    const pending = filteredInvoices.filter(inv => (inv.paymentStatus || '').toLowerCase() === 'pending').length;
    const draft = filteredInvoices.filter(inv => !inv.paymentStatus || (inv.paymentStatus || '').toLowerCase() === 'draft').length;
    const totalInvoices = filteredInvoices.length;
    // Find latest invoice by date
    let latestInvoice = null;
    if (filteredInvoices.length > 0) {
      latestInvoice = filteredInvoices.reduce((latest, inv) => {
        if (!latest) return inv;
        const latestDate = new Date(latest.invoiceDate || 0);
        const invDate = new Date(inv.invoiceDate || 0);
        return invDate > latestDate ? inv : latest;
      }, null);
    }
    const average = filteredInvoices.length > 0 ? (total / filteredInvoices.length) : 0;
    return { total, paid, pending, draft, totalInvoices, latestInvoice, average };
  };

  // Handle search and filters
  useEffect(() => {
    let filtered = [...invoices];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      console.log("filtered data  : ",filtered);
      console.log("status Filter data : ",statusFilter);
      filtered = filtered.filter(invoice => invoice.paymentStatus === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'totalAmount') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }

      if (sortConfig.key === 'invoiceDate') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredInvoices(filtered);
  }, [searchTerm, statusFilter, sortConfig, invoices]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Navigate to invoice form
  const handleViewInvoice = (orderId) => {
    router.push(`/invoice-form/${orderId}`);
  };

  const stats = calculateStats();

  if (isLoading) {
    return <TableLoader text="Loading invoices..." />;
  }

  return (
    <RoleGuard allowedRoles={[user_role.admin]}>
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {/* Total Revenue */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <h3 className="text-2xl font-bold text-gray-900">₹{stats.total.toLocaleString()}</h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Total Invoices */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Invoices</p>
                  <h3 className="text-2xl font-bold text-indigo-600">{stats.totalInvoices}</h3>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <FileText className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Paid Invoices */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Paid Invoices</p>
                  <h3 className="text-2xl font-bold text-green-600">{stats.paid}</h3>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <FileCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Pending Invoices */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Invoices</p>
                  <h3 className="text-2xl font-bold text-yellow-600">{stats.pending}</h3>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Average Invoice Value */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Avg. Invoice Value</p>
                  <h3 className="text-2xl font-bold text-purple-600">₹{stats.average.toLocaleString(undefined, {maximumFractionDigits: 2})}</h3>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Latest Invoice */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-gray-500">Latest Invoice</p>
                {stats.latestInvoice ? (
                  <>
                    <span className="text-base font-semibold text-gray-900">{stats.latestInvoice.invoiceNumber}</span>
                    <span className="text-xs text-gray-500">{stats.latestInvoice.buyerName}</span>
                    <span className="text-xs text-gray-400">{stats.latestInvoice.invoiceDate ? format(new Date(stats.latestInvoice.invoiceDate), 'dd/MM/yyyy') : '-'}</span>
                  </>
                ) : (
                  <span className="text-xs text-gray-400">No invoices</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">All Invoices</CardTitle>
                <CardDescription>Manage and track all your invoice records</CardDescription>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <div className="relative w-full sm:w-[300px]">
                  <Input
                    placeholder="Search invoices..."
                    className="pl-8 bg-gray-50 border-gray-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                  <SelectTrigger className="w-[180px] bg-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {payment_status.map((data) => (
                      <SelectItem key={data} value={data}>
                        {data}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="cursor-pointer" onClick={() => handleSort('invoiceNumber')}>
                      <div className="flex items-center">
                        Invoice Number
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('invoiceDate')}>
                      <div className="flex items-center">
                        Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Buyer Name</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('totalAmount')}>
                      <div className="flex items-center">
                        Amount
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No invoices found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice._id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell>
                          {invoice.invoiceDate ? format(new Date(invoice.invoiceDate), 'dd/MM/yyyy') : '-'}
                        </TableCell>
                        <TableCell>{invoice.buyerName}</TableCell>
                        <TableCell>{invoice.orderId}</TableCell>
                        <TableCell>₹{invoice.totalAmount?.toLocaleString() || '0'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                            {invoice.paymentStatus || 'DRAFT'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewInvoice(invoice.orderId)}
                              className="hover:bg-gray-100"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}

