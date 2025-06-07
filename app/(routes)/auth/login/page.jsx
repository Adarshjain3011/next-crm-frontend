'use client'

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { loginHandler } from "@/lib/api";
import toast from "react-hot-toast";
import { handleAxiosError } from "@/lib/handleAxiosError";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setUserData } from "@/app/store/slice/userSlice";

export default function Login() {
  const dispatch = useDispatch();
  const router = useRouter();
  
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async(values) => {
    try {
      const userData = await loginHandler(values);
      console.log("Login response:", userData);
      dispatch(setUserData(userData));
      toast.success("Login successful");
      router.push('/client-dashboard');
    } catch (error) {
      console.error("Login failed:", error);
      handleAxiosError(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl border border-gray-200">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">Login to Your Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                rules={{ required: "Email is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                rules={{ required: "Password is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Login</Button>
            </form>
          </Form>
          <p className="text-sm text-center text-gray-600 mt-4">
            Don&apos;t have an account? <a href="#" className="text-blue-600 hover:underline">Sign up</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


