'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  ShoppingCart,
  FileText,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

import RoleGuard from '@/components/auth/RoleGuard';
// import { useAuth } from '@/app/hooks/useAuth';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

import { getAllOrders, fetchAllUserQueries, getAllInvoices } from '@/lib/api';
import { useRole } from '@/app/hooks/useRole';
import { user_role } from '@/lib/data';
import { PageLoader } from '@/components/ui/loader';

// Helper to check if all values in an array are zero or the array is empty
function isAllZeroOrEmpty(arr) {
  return !arr || arr.length === 0 || arr.every(val => val === 0);
}

export default function Dashboard() {

  const { isAdmin } = useRole();

  const [timeRange, setTimeRange] = useState('week');
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalEnquiries: 0,
    totalInvoices: 0,
    revenueGrowth: 0,
    orderGrowth: 0
  });
  const [chartData, setChartData] = useState({
    revenue: [],
    orders: [],
    enquiries: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [orders, enquiries, invoices] = await Promise.all([
          getAllOrders(),
          fetchAllUserQueries(),
          getAllInvoices()
        ]);

        // Defensive: always use arrays
        const safeOrders = Array.isArray(orders) ? orders : [];
        const safeEnquiries = Array.isArray(enquiries) ? enquiries : [];
        const safeInvoices = Array.isArray(invoices) ? invoices : [];

        // Calculate metrics
        const totalRevenue = safeInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
        const lastMonthRevenue = safeInvoices
          .filter(inv => new Date(inv.invoiceDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          .reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);

        setMetrics({
          totalRevenue,
          totalOrders: safeOrders.length,
          totalEnquiries: safeEnquiries.length,
          totalInvoices: safeInvoices.length,
          revenueGrowth: (totalRevenue > 0 ? ((lastMonthRevenue / totalRevenue) * 100).toFixed(1) : 0),
          orderGrowth: (safeOrders.length > 0 ? ((safeOrders.filter(o => new Date(o.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length / safeOrders.length) * 100).toFixed(1) : 0)
        });

        // Prepare chart data
        const last6Months = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          return format(date, 'MMM yyyy');
        }).reverse();

        setChartData({
          revenue: {
            labels: last6Months,
            datasets: [{
              label: 'Revenue',
              data: last6Months.map(month => {
                return safeInvoices
                  .filter(inv => format(new Date(inv.invoiceDate), 'MMM yyyy') === month)
                  .reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
              }),
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              fill: true,
              tension: 0.4
            }]
          },
          orders: {
            labels: last6Months,
            datasets: [{
              label: 'Orders',
              data: last6Months.map(month => {
                return safeOrders.filter(order =>
                  format(new Date(order.createdAt), 'MMM yyyy') === month
                ).length;
              }),
              backgroundColor: '#8b5cf6',
              borderRadius: 6,
            }]
          },
          enquiries: {
            labels: ['New', 'In Progress', 'Completed', 'On Hold'],
            datasets: [{
              data: [
                safeEnquiries.filter(e => e.status === 'NEW').length,
                safeEnquiries.filter(e => e.status === 'IN_PROGRESS').length,
                safeEnquiries.filter(e => e.status === 'COMPLETED').length,
                safeEnquiries.filter(e => e.status === 'ON_HOLD').length
              ],
              backgroundColor: ['#3b82f6', '#10b981', '#6366f1', '#f59e0b'],
              borderRadius: 6,
            }]
          }
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  if (isLoading) {
    return <PageLoader text="Loading dashboard data..." />;
  }

  // Check if all metrics are zero (no data at all)
  const allMetricsZero =
    metrics.totalRevenue === 0 &&
    metrics.totalOrders === 0 &&
    metrics.totalEnquiries === 0 &&
    metrics.totalInvoices === 0;

  // Defensive checks for datasets
  const revenueData = Array.isArray(chartData.revenue?.datasets) && chartData.revenue.datasets[0]?.data ? chartData.revenue.datasets[0].data : [];
  const ordersData = Array.isArray(chartData.orders?.datasets) && chartData.orders.datasets[0]?.data ? chartData.orders.datasets[0].data : [];
  const enquiriesData = Array.isArray(chartData.enquiries?.datasets) && chartData.enquiries.datasets[0]?.data ? chartData.enquiries.datasets[0].data : [];

  return (

    <RoleGuard allowedRoles={[user_role.admin]}>

      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-500">Track your business performance and growth</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* If all metrics are zero, show a big no data message */}
        {allMetricsZero && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <svg width="64" height="64" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#cbd5e1" strokeWidth="2" /><path d="M8 12h8M8 16h4" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"/></svg>
            <div className="mt-4 text-2xl font-semibold">No data available</div>
            <div className="text-gray-400 mt-2">There are no orders, invoices, or enquiries to display yet.</div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {metrics.totalRevenue > 0 ? `₹${metrics.totalRevenue.toLocaleString()}` : '—'}
                  </h3>
                  <div className="flex items-center mt-1">
                    <span className={`text-xs font-medium ${metrics.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metrics.totalRevenue > 0 ? `${metrics.revenueGrowth}%` : '—'}
                    </span>
                    {metrics.totalRevenue > 0 ? (
                      metrics.revenueGrowth > 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600 ml-1" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600 ml-1" />
                      )
                    ) : null}
                    <span className="text-xs text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          
          <Card className="bg-white hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Orders</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {metrics.totalOrders > 0 ? metrics.totalOrders : '—'}
                  </h3>
                  <div className="flex items-center mt-1">
                    <span className={`text-xs font-medium ${metrics.orderGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metrics.totalOrders > 0 ? `${metrics.orderGrowth}%` : '—'}
                    </span>
                    {metrics.totalOrders > 0 ? (
                      metrics.orderGrowth > 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600 ml-1" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600 ml-1" />
                      )
                    ) : null}
                    <span className="text-xs text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <ShoppingCart className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Enquiries</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {metrics.totalEnquiries > 0 ? metrics.totalEnquiries : '—'}
                  </h3>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-500">Active enquiries</span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Invoices</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {metrics.totalInvoices > 0 ? metrics.totalInvoices : '—'}
                  </h3>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-500">Generated invoices</span>
                  </div>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                {isAllZeroOrEmpty(revenueData) ? (
                  <div className="text-gray-400 text-lg">No revenue data to display</div>
                ) : (
                  <Line
                    data={chartData.revenue}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            display: false
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          display: false
                        }
                      }
                    }}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Orders Overview</CardTitle>
              <CardDescription>Monthly orders count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                {isAllZeroOrEmpty(ordersData) ? (
                  <div className="text-gray-400 text-lg">No order data to display</div>
                ) : (
                  <Bar
                    data={chartData.orders}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            display: false
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          display: false
                        }
                      }
                    }}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white lg:col-span-2">
            <CardHeader>
              <CardTitle>Enquiries Status Distribution</CardTitle>
              <CardDescription>Current status of all enquiries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                {isAllZeroOrEmpty(enquiriesData) ? (
                  <div className="text-gray-400 text-lg">No enquiry data to display</div>
                ) : (
                  <Bar
                    data={chartData.enquiries}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            display: false
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          display: false
                        }
                      }
                    }}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </RoleGuard>

  );
}

