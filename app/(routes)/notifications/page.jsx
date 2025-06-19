'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IoNotifications } from 'react-icons/io5';

// Mock notification data
const mockNotifications = [
  {
    id: 1,
    type: 'info',
    title: 'New Order Received',
    message: 'You have received a new order from John Doe.',
    time: '2 minutes ago',
    read: false,
  },
  {
    id: 2,
    type: 'success',
    title: 'Invoice Paid',
    message: 'Invoice #1234 has been paid successfully.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: 3,
    type: 'warning',
    title: 'Payment Pending',
    message: 'Payment for Invoice #1235 is pending.',
    time: '3 hours ago',
    read: true,
  },
  {
    id: 4,
    type: 'error',
    title: 'Order Cancelled',
    message: 'Order #5678 was cancelled by the customer.',
    time: 'Yesterday',
    read: true,
  },
];

const badgeVariant = {
  info: 'secondary',
  success: 'default',
  warning: 'outline',
  error: 'destructive',
};

const NotificationPage = () => {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 flex justify-center items-start py-12 px-2">
      <div className="w-full max-w-3xl">
        <div className="flex items-center gap-3 mb-10 border-b pb-6">
          <IoNotifications size={36} className="text-blue-600" />
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Notifications</h1>
        </div>
        {notifications.length === 0 ? (
          <div className="text-center text-muted-foreground py-24">
            <IoNotifications size={56} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No notifications yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all duration-200 ${notification.read ? 'opacity-70' : 'shadow-lg border-primary/30'} hover:shadow-2xl bg-white/90 rounded-2xl px-6 py-5`}
                style={{ borderWidth: notification.read ? 1 : 2 }}
              >
                <CardHeader className="flex flex-row items-center justify-between gap-4 border-b pb-3 px-0">
                  <div className="flex items-center gap-3">
                    <Badge variant={badgeVariant[notification.type]} className="text-xs px-3 py-1">
                      {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                    </Badge>
                    <CardTitle className="ml-2 text-lg font-semibold">
                      {notification.title}
                    </CardTitle>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{notification.time}</span>
                </CardHeader>
                <CardContent className="px-0 pt-3 pb-0">
                  <CardDescription className="text-base text-gray-700">
                    {notification.message}
                  </CardDescription>
                </CardContent>
                {/* <CardFooter className="flex gap-3 justify-end px-0 pt-4">
                  {!notification.read && (
                    <Button size="sm" variant="secondary" className="font-medium" onClick={() => markAsRead(notification.id)}>
                      Mark as Read
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="font-medium" onClick={() => deleteNotification(notification.id)}>
                    Delete
                  </Button>
                </CardFooter> */}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;




