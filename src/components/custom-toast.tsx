"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

interface CustomToastProps {
  message: {
    sender: {
      username: string;
      imageUrl: string;
    };
    text: string;
  };
  chatHref: string;
  toastId: string | number;
}

export default function CustomToast({
  message,
  chatHref,
  toastId,
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
        <AvatarImage
          src={message.sender.imageUrl}
          alt={message.sender.username}
        />
        <AvatarFallback className="rounded-lg">
          {message.sender.username?.[0]?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col pr-6">
        <span className="font-semibold">{message.sender.username}</span>
        <span className="text-gray-600 text-sm truncate max-w-xs">
          {message.text}
        </span>
      </div>
    </div>
  );
}
