"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

interface CustomToastProps {
  message: {
    sender?: {
      username: string;
      imageUrl: string;
    };
    text: string;
    // For compatibility with friend messages
    senderId?: string;
    receiverId?: string;
  };
  chatHref: string;
  toastId: string | number;
  // Optional: to distinguish between friend and server messages
  isServerMessage?: boolean;
  serverName?: string;
}

export default function CustomToast({
  message,
  chatHref,
  toastId,
  isServerMessage = false,
  serverName,
}: CustomToastProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(chatHref);
    toast.dismiss(toastId);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.dismiss(toastId);
  };

  // Get display info based on message type
  const displayInfo = message.sender
    ? {
        username: message.sender.username,
        imageUrl: message.sender.imageUrl,
        fallback: message.sender.username?.[0]?.toUpperCase() || "U",
      }
    : {
        username: "Unknown User",
        imageUrl: "",
        fallback: "U",
      };

  return (
    <div
      className="flex items-center gap-3 bg-white shadow-lg rounded-lg p-4 border border-gray-200 relative cursor-pointer"
      onClick={handleClick}
      style={{ minWidth: 250 }}
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-gray-100 rounded-full"
        onClick={handleClose}
      >
        <X className="h-4 w-4 text-gray-500" />
      </Button>

      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage src={displayInfo.imageUrl} alt={displayInfo.username} />
        <AvatarFallback className="rounded-lg">
          {displayInfo.fallback}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col pr-6">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{displayInfo.username}</span>
          {isServerMessage && serverName && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              {serverName}
            </span>
          )}
        </div>
        <span className="text-gray-600 text-sm truncate max-w-xs">
          {message.text}
        </span>
      </div>
    </div>
  );
}
