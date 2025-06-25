import { useRef } from "react";
import { FiPlusCircle } from "react-icons/fi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserAvatar({ user, onImageSelect }) {

    const fileInputRef = useRef(null);

    const handleIconClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        
        const file = e.target.files?.[0];

        if (file && onImageSelect) {
            onImageSelect(file); // You can handle image upload here
        }
        
    };

    return (
        <div className="relative w-24 h-24">
            <Avatar className="h-full w-full ring-4 ring-blue-100">
                <AvatarImage src={user?.avatar || "/default-avatar.png"} alt="User Avatar" />
                <AvatarFallback className="text-3xl bg-blue-600 text-white flex items-center justify-center">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
            </Avatar>

            {/* Plus icon button */}
            <div
                onClick={handleIconClick}
                className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer hover:scale-105 transition-transform"
            >
                <FiPlusCircle size={24} className="text-blue-600" />
            </div>

            {/* Hidden file input */}
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
}


