'use client'

import { Label } from "@radix-ui/react-label";
import { RxCrossCircled } from "react-icons/rx";

export default function DisplayVendorDetails({
  setShowVendorDetails,
  userName,
  email,
  role,
  phoneNo,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative animate-fade-in">
        {/* Close Icon */}
        <button
          onClick={() => setShowVendorDetails(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"
          aria-label="Close"
        >
          <RxCrossCircled size={28} />
        </button>

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
          Vendor Details
        </h2>

        {/* Detail Fields */}
        <div className="space-y-4">
          <DetailItem label="User Name" value={userName} />
          <DetailItem label="Email" value={email} />
          <DetailItem label="Phone Number" value={phoneNo} />
          <DetailItem label="Role" value={role} />
        </div>
      </div>
    </div>
  );
}

// Reusable component for each detail row
function DetailItem({ label, value }) {
  return (
    <div>
      <Label className="block text-sm font-medium text-gray-600 mb-1">
        {label}
      </Label>
      <p className="text-base font-medium text-gray-900 bg-gray-100 rounded-md px-3 py-2">
        {value || '—'}
      </p>
    </div>
  );
}


