'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IoNotifications, IoCheckmarkDone, IoTrash, IoInformationCircle, IoWarning, IoCloseCircle, IoCheckmarkCircle } from 'react-icons/io5';
import { handleAxiosError } from '@/lib/handleAxiosError';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import { getAllNotification, fetchAllSalesPerson } from '@/lib/api';
import { Input } from '@/components/ui/input';

import { useAuth } from '@/app/hooks/useAuth';
import { Label } from '@radix-ui/react-label';

import { useSelector } from 'react-redux';

import { getAllMembersData } from '@/lib/api';
import { setAllMembersData } from '@/app/store/slice/membersSlice';

import { useDispatch } from 'react-redux';
import { user_role } from '@/lib/data';
import { useQuery } from '@tanstack/react-query';

const badgeVariant = {
  info: 'secondary',
  success: 'default',
  warning: 'outline',
  error: 'destructive',
};

const typeIcon = {
  info: <IoInformationCircle className="text-blue-500" size={22} />,
  success: <IoCheckmarkCircle className="text-green-500" size={22} />,
  warning: <IoWarning className="text-yellow-500" size={22} />,
  error: <IoCloseCircle className="text-red-500" size={22} />,
};

const NotificationPage = () => {

  // const [notifications, setNotifications] = useState([]);

  const dispatch = useDispatch();

  const [filters, setFilters] = useState({

    user: "",
    date: "",

  });

  const membersData = useSelector((state) => state.members.data);

  const { user } = useAuth();

  async function fetchAllNotificationsData() {
    try {
      const result = await getAllNotification();

      if (Array.isArray(result)) {

        return result;

      }
    } catch (error) {
      console.log("error is : ", error);
      handleAxiosError(error);
    }
  }


  const { data: notifications = [], isLoading, error } = useQuery({

    queryKey: ["allNotifications"],
    queryFn: fetchAllNotificationsData,
    staleTime: 1000 * 60 * 5,       // Data becomes stale after 5 minutes
    cacheTime: 1000 * 60 * 15,      // Cache data for 15 minutes
    refetchInterval: 1000 * 5,     // ✅ Refetch every 30 seconds
    enabled: true,
    onError: (error) => {

      console.error("Error fetching notifications:", error);
      toast.error("Failed to fetch notifications");

    }

  })


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



  let filtereSalesUserData = membersData && membersData.filter((data) => data.role == user_role.sales);
  let filterNotificationData = notifications.filter((data) => {
    const dateMatch = filters.date
      ? new Date(data.createdAt).toLocaleDateString() === new Date(filters.date).toLocaleDateString()
      : true;

    const userMatch = filters.user ? filters.user === data.recipientId._id : true;

    return dateMatch && userMatch;

  })



  // now i have to implement filter on the basis of the sales person 

  return (
    <div className=" relative max-h-screen w-full flex justify-center items-start px-2">
      <div className="w-full max-w-5xl">

        <div className="flex justify-between items-center gap-3 mb-3 border-b pb-6">

          <div className='flex gap-2 justify-center items-center'>

            <IoNotifications size={36} className="text-blue-600" />
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Notifications</h1>

          </div>

          <div className='flex gap-5 justify-start items-center'>

            {/*  filter using sales person */}

            <div className="flex flex-col gap-2">
              <label htmlFor="salesPerson" className="text-sm font-medium text-gray-700">
                Sales Person
              </label>

              <select
                id="salesPerson"
                className="px-4 py-2 border border-gray-300 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                onChange={(e) => setFilters({ ...filters, user: e.target.value })}
              >
                <option value={""}>
                  Select sales person
                </option>
                {

                  filtereSalesUserData && filtereSalesUserData.map((data) => (

                    <option value={data._id}>{data.name}</option>

                  ))

                }
              </select>

            </div>

            {/* filter using date */}

            <div className="flex flex-col gap-2">
              <Label>Date</Label>
              <Input
                type="date"
                id="date"
                name="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}

              />
            </div>

          </div>

        </div>

        {filterNotificationData.length === 0 ? (
          <div className="text-center text-muted-foreground py-24">
            <IoNotifications size={56} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No notifications yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:gap-10 max-h-[450px] overflow-y-scroll ">
            {filterNotificationData.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all duration-200 relative ${notification.read ? 'opacity-70' : 'shadow-lg border-primary/30'} bg-white/95 rounded-2xl px-4 sm:px-6 py-4 sm:py-5`}
                style={{ borderWidth: notification.read ? 1 : 2 }}
              >
                {/* Unread dot */}
                {!notification.read && (
                  <span className="absolute top-4 right-4 h-3 w-3 rounded-full bg-blue-500 animate-pulse border-2 border-white" />
                )}
                <CardHeader className="flex flex-row items-center justify-between gap-4 border-b pb-3 px-0">
                  <div className="flex items-center gap-3">
                    {/* Type icon */}
                    <span>{typeIcon[notification.type]}</span>
                    <CardTitle className="ml-2 text-lg font-semibold">
                      {notification.title}
                    </CardTitle>
                    {notification.recipientId && notification.recipientId._id !== user._id && (
                      <div className="ml-2 text-xs text-blue-600 font-medium mt-1">Belongs to: {notification.recipientId.name}</div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">{dayjs(notification.createdAt).fromNow()}</span>
                </CardHeader>
                <CardContent className="px-0 pt-1 pb-0">
                  <CardDescription className="text-base text-gray-700">
                    {notification.message}
                  </CardDescription>
                </CardContent>

              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;

