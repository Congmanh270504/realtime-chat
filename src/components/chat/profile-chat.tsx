"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
// import {
//   User,
//   Bell,
//   Search,
//   ChevronDown,
//   ChevronUp,
//   Shield,
//   ImageIcon,
//   FileText,
// } from "lucide-react";
import { useState } from "react";
import type { UserData } from "@/types/user";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronDown,
  ChevronUp,
  Search,
  ImageIcon,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@radix-ui/react-separator";
interface ProfileChatProps {
  chatId: string;
  chatPartner: UserData;
  isMobile: boolean;
  handleCloseProfile?: () => void;
}

export default function ProfileChat({
  chatPartner,
  chatId,
  isMobile,
  handleCloseProfile,
}: ProfileChatProps) {
  const [expandedSections, setExpandedSections] = useState({
    chatInfo: false,
    customization: false,
    files: true,
    privacy: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  const handleDeleteChat = async () => {
    try {
      const response = await fetch(`/api/chats`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId }),
      });
      const data = await response.json();
      if (data && data.status) {
        toast.success(data.message);
      } else toast.error(data.message);
    } catch {
      toast.error("Failed to delete chat");
    }
  };

  return (
    <div
      className={cn(
        "bg-gray-50 rounded-2xl 2xl:w-96 shadow-lg",
        isMobile ? "w-full" : "w-80"
      )}
    >
      <ScrollArea className="h-full">
        <div className="p-4 space-y-6">
          {/* Header with Previous Button */}
          {isMobile && (
            <div className="flex items-center gap-3 pb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseProfile}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
            </div>
          )}

          {/* Profile Section */}
          <div className="text-center">
            {/* {isMobile} */}
            <Avatar className="w-20 h-20 mx-auto mb-3">
              <AvatarImage src={chatPartner.imageUrl} alt="User Avatar" />
              <AvatarFallback>TC</AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-gray-900 mb-1">
              {chatPartner.username}
            </h3>
            <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Đang mở hóa đầu cuối
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm"
              className="pl-10 bg-white border-gray-200"
            />
          </div>

          {/* Chat Info Section */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-between p-3 h-auto"
              onClick={() => toggleSection("chatInfo")}
            >
              <span className="font-medium text-gray-900">
                Thông tin về đoạn chat
              </span>
              {expandedSections.chatInfo ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>

            {expandedSections.chatInfo && (
              <div className="pl-3 space-y-2">
                <div className="text-sm text-gray-600">
                  Chat details content...
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Customization Section */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-between p-3 h-auto"
              onClick={() => toggleSection("customization")}
            >
              <span className="font-medium text-gray-900">
                Tùy chỉnh đoạn chat
              </span>
              {expandedSections.customization ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>

            {expandedSections.customization && (
              <div className="pl-3 space-y-2">
                <div className="text-sm text-gray-600">
                  Customization options...
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Files Section */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-between p-3 h-auto"
              onClick={() => toggleSection("files")}
            >
              <span className="font-medium text-gray-900">
                File phương tiện & file
              </span>
              {expandedSections.files ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>

            {expandedSections.files && (
              <div className="pl-3 space-y-3">
                <div className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-700">
                    File phương tiện
                  </span>
                </div>

                <div className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-700">File</span>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Privacy Section */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-between p-3 h-auto"
              onClick={() => toggleSection("privacy")}
            >
              <span className="font-medium text-gray-900">
                Quyền riêng tư và hỗ trợ
              </span>
              {expandedSections.privacy ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>

            {expandedSections.privacy && (
              <div className="pl-3 space-y-2">
                <div className="text-sm text-gray-600">
                  Privacy and support options...
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
