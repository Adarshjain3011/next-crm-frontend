'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRole } from '@/app/hooks/useRole';
import { Badge } from "@/components/ui/badge";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Building,
    Calendar,
    Shield,
    Edit2,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { format } from 'date-fns';

export default function ProfilePage() {
    const { user, isAdmin, isSales } = useRole();
    const [isEditing, setIsEditing] = useState(false);

    console.log("user ka data at profile : ",user);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phoneNo: user?.phoneNo || '',
        address: user?.address || '',
        company: user?.company || '',
        role: user?.role || '',
        joinDate: user?.joinDate || new Date(),
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // TODO: Implement profile update logic
        setIsEditing(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                        <p className="text-gray-500">Manage your account settings and preferences</p>
                    </div>
                    <Button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center gap-2"
                        variant={isEditing ? "destructive" : "default"}
                    >
                        {isEditing ? (
                            <>
                                <XCircle size={18} />
                                Cancel
                            </>
                        ) : (
                            <>
                                <Edit2 size={18} />
                                Edit Profile
                            </>
                        )}
                    </Button>
                </div>

                {/* Main Profile Card */}
                <Card className="shadow-lg border-0">
                    <CardHeader className="border-b border-gray-100 bg-white rounded-t-xl">
                        <div className="flex items-center gap-6">
                            <Avatar className="h-24 w-24 ring-4 ring-blue-50">
                                <AvatarImage src={user?.avatar || '/default-avatar.png'} />
                                <AvatarFallback className="text-2xl bg-blue-600 text-white">
                                    {user?.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-2xl mb-2">{user?.name}</CardTitle>
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                        {isAdmin ? 'Administrator' : isSales ? 'Sales Representative' : 'User'}
                                    </Badge>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        Active
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Personal Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <div className="relative">
                                            {/* <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" /> */}
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="pl-10"
                                                placeholder="Your full name"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <div className="relative">
                                            {/* <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" /> */}
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="pl-10"
                                                placeholder="your.email@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <div className="relative">
                                            {/* <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" /> */}
                                            <Input
                                                id="phone"
                                                name="phone"
                                                value={formData.phoneNo}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="pl-10"
                                                placeholder="Your phone number"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Work Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Information</h3>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="company">Company</Label>
                                        <div className="relative">
                                            {/* <Building className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" /> */}
                                            <Input
                                                id="company"
                                                name="company"
                                                value="Mayuri International"
                                                disabled
                                                className="pl-10 bg-gray-50"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role</Label>
                                        <div className="relative">
                                            {/* <Shield className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" /> */}
                                            <Input
                                                id="role"
                                                name="role"
                                                value={isAdmin ? 'Administrator' : isSales ? 'Sales Representative' : 'User'}
                                                disabled
                                                className="pl-10 bg-gray-50"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="joinDate">Join Date</Label>
                                        <div className="relative">
                                            {/* <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" /> */}
                                            <Input
                                                id="joinDate"
                                                name="joinDate"
                                                value={format(new Date(formData.joinDate), 'PPP')}
                                                disabled
                                                className="pl-10 bg-gray-50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Activity Stats */}
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Overview</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card className="bg-blue-50 border-0">
                                        <CardContent className="pt-6">
                                            <div className="text-blue-600 text-2xl font-bold">
                                                {user?.totalOrders || 0}
                                            </div>
                                            <div className="text-blue-600/80 text-sm">Total Orders</div>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-green-50 border-0">
                                        <CardContent className="pt-6">
                                            <div className="text-green-600 text-2xl font-bold">
                                                {user?.activeEnquiries || 0}
                                            </div>
                                            <div className="text-green-600/80 text-sm">Active Enquiries</div>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-purple-50 border-0">
                                        <CardContent className="pt-6">
                                            <div className="text-purple-600 text-2xl font-bold">
                                                {user?.completedDeals || 0}
                                            </div>
                                            <div className="text-purple-600/80 text-sm">Completed Deals</div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* {isEditing && (
                                <div className="flex justify-end gap-3 pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </Button>
                                </div>
                            )} */}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 

