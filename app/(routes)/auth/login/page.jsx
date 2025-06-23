'use client'

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { loginHandler } from "@/lib/api";
import toast from "react-hot-toast";
import { handleAxiosError } from "@/lib/handleAxiosError";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setUserData } from "@/app/store/slice/userSlice";
import { Mail, Lock } from 'lucide-react';
import Image from 'next/image';
import { InlineLoader } from "@/components/ui/loader";

export default function Login() {
  const dispatch = useDispatch();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values) => {
    try {
      const userData = await loginHandler(values);
      dispatch(setUserData(userData));
      toast.success("Welcome back to Mayuri International");
      router.push('/client-dashboard');
    } catch (error) {
      console.error("Login failed:", error);
      handleAxiosError(error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white p-8 flex-col justify-between">
        <div>
          <div className="mb-8">
            <Image
              src="https://www.mayuriinternational.com/images/logo.png"
              alt="Mayuri International"
              width={180}
              height={60}
              className="mb-4"
            />
            <h1 className="text-3xl font-bold mb-2">Mayuri International</h1>
            <p className="text-blue-200">Premium Furniture Solutions</p>
          </div>
          <div className="space-y-6">
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
              <h2 className="text-xl font-semibold mb-2">Welcome to Our B2B Portal</h2>
              <p className="text-blue-200">Access your dashboard to manage orders, track inventory, and connect with our premium furniture solutions.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="font-medium mb-1">Premium Quality</h3>
                <p className="text-sm text-blue-200">Finest materials and craftsmanship</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="font-medium mb-1">Global Reach</h3>
                <p className="text-sm text-blue-200">Serving clients worldwide</p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-sm text-blue-200">
          © {new Date().getFullYear()} Mayuri International. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <Card className="w-full max-w-md shadow-xl rounded-xl border-0">
          <CardHeader className="space-y-2 pb-8">
            <CardTitle className="text-2xl font-bold text-gray-900">Sign in to your account</CardTitle>
            <CardDescription className="text-gray-500">
              Welcome back! Please enter your credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email address"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Email address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          {/* <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" /> */}
                          <Input
                            type="email"
                            placeholder="you@company.com"
                            className="pl-64 bg-white border-gray-200"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  rules={{
                    required: "Password is required",
                    minLength: {
                      value: 3,
                      message: "Password must be at least 3 characters"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          {/* <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" /> */}
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            className="pl-10 bg-white border-gray-200"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <InlineLoader className="mr-2" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>
            </Form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Need assistance? Contact our{' '}
                <a href="mailto:support@mayuriinternational.com" className="text-blue-600 hover:text-blue-700 font-medium">
                  support team
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



