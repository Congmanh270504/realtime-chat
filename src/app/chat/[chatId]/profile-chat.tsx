"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  User,
  Bell,
  Search,
  ChevronDown,
  ChevronUp,
  Shield,
  ImageIcon,
  FileText,
} from "lucide-react";
import { useState } from "react";
import type { UserData } from "@/types/user";
import { cn } from "@/lib/utils";

interface ProfileChatProps {
  showProfile: boolean;
  chatPartner: UserData;
}

export default function ProfileChat({
  showProfile,
  chatPartner,
}: ProfileChatProps) {
  const [mediaExpanded, setMediaExpanded] = useState(true);
  const [chatInfoExpanded, setChatInfoExpanded] = useState(false);
  const [customizeExpanded, setCustomizeExpanded] = useState(false);
  const [privacyExpanded, setPrivacyExpanded] = useState(false);

  return (
    <div
      className={cn(
        "w-1/3 bg-background h-full border rounded-lg flex flex-col",
        showProfile
          ? "animate-fade-left animate-once"
          : "animate-fade-right animate-once"
      )}
    >
      <div className="flex-1 flex flex-col overflow-hidden">
        <Card className="border-0 shadow-none flex-1 flex flex-col overflow-hidden">
          {/* Profile Header */}
          <div className="flex flex-col items-center p-6 space-y-4 flex-shrink-0">
            <Avatar className="w-20 h-20">
              <AvatarImage
                src={chatPartner?.imageUrl || "/placeholder.svg"}
                alt={chatPartner?.username || "Profile"}
              />
              <AvatarFallback>
                {chatPartner?.username?.slice(0, 2).toUpperCase() || "??"}
              </AvatarFallback>
            </Avatar>

            <div className="text-center space-y-1">
              <h1 className="text-lg font-semibold">
                {chatPartner?.username || "Unknown User"}
              </h1>
              <p className="text-sm text-muted-foreground">Đang hoạt động</p>
            </div>

            {/* Encryption Status */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Được mã hóa đầu cuối</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-8 pt-4">
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-muted"
                >
                  <User className="w-5 h-5" />
                </Button>
                <span className="text-xs text-center">Trang cá nhân</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-muted"
                >
                  <Bell className="w-5 h-5" />
                </Button>
                <span className="text-xs text-center">Tắt thông báo</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-muted"
                >
                  <Search className="w-5 h-5" />
                </Button>
                <span className="text-xs text-center">Tìm kiếm</span>
              </div>
            </div>
          </div>

          {/* Collapsible Sections */}
          <div className="flex-1 overflow-y-auto px-4">
            <div className="space-y-1">
              {/* Chat Information */}
              <Collapsible
                open={chatInfoExpanded}
                onOpenChange={setChatInfoExpanded}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                  <span className="font-medium">Thông tin về đoạn chat</span>
                  {chatInfoExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-2">
                  <div className="text-sm text-muted-foreground">
                    Chat information content would go here
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Customize Chat */}
              <Collapsible
                open={customizeExpanded}
                onOpenChange={setCustomizeExpanded}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                  <span className="font-medium">Tùy chỉnh đoạn chat</span>
                  {customizeExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-2">
                  <div className="text-sm text-muted-foreground">
                    Chat customization options would go here
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Media & Files */}
              <Collapsible open={mediaExpanded} onOpenChange={setMediaExpanded}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                  <span className="font-medium">File phương tiện & file</span>
                  {mediaExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-2 space-y-2">
                  <div className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md cursor-pointer">
                    <ImageIcon className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm">File phương tiện</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md cursor-pointer">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm">File</span>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Privacy & Support */}
              <Collapsible
                open={privacyExpanded}
                onOpenChange={setPrivacyExpanded}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                  <span className="font-medium">Quyền riêng tư và hỗ trợ</span>
                  {privacyExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-2">
                  <div className="text-sm text-muted-foreground">
                    Privacy and support options would go here
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
