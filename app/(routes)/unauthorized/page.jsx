'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-600 mb-4">401</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Unauthorized Access
        </h2>
        <p className="text-gray-600 mb-8">
          You don't have permission to access this page.
        </p>
        <Button
          onClick={() => router.push('/')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Go to Home
        </Button>
      </div>
    </div>
  );
} 

