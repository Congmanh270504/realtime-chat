"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronDown,
  ChevronUp,
  Search,
  ImageIcon,
  FileText,
  ArrowLeft,
  Users,
  Settings,
  Hash,
  Volume2,
  Shield,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Servers } from "@/types/servers";
import { EditServerNameDialog } from "./edit-server-name-dialog";
import { useRouter } from "next/navigation";
import { UserData } from "@/lib/validation/group-message";

interface ServerProfileChatProps {
  serverId: string;
  serverData: Servers;
  isMobile: boolean;
  handleCloseProfile?: () => void;
  members: UserData[];
}

export default function ServerProfileChat({
  serverData,
  serverId,
  isMobile,
  handleCloseProfile,
  members,
}: ServerProfileChatProps) {
  const router = useRouter();
  const [currentServerData, setCurrentServerData] = useState(serverData);
  const [expandedSections, setExpandedSections] = useState({
    serverInfo: false,
    members: true,
    channels: false,
    files: false,
    settings: false,
  });
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleServerNameUpdate = (newName: string) => {
    setCurrentServerData((prev) => ({
      ...prev,
      serverName: newName,
    }));
  };

  const handleOutServer = async () => {
    try {
      const response = await fetch("/api/servers/out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ serverId }),
      });

      if (!response.ok) {
        throw new Error("Failed to leave server");
      }
      router.push("/");

      // Handle successful response
    } catch (error) {
      console.error("Error leaving server:", error);
    }
  };

  return (
    <div
      className={cn(
        " rounded-2xl 2xl:w-96 shadow-lg overflow-hidden h-full flex flex-col",
        isMobile ? "w-full" : "w-80"
      )}
    >
      <ScrollArea className="flex-1 min-h-0 max-h-full">
        <div className="p-4 space-y-6 pb-16 min-h-full">
          {/* Header with Previous Button */}
          {isMobile && (
            <div className="flex items-center gap-3 pb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseProfile}
                className="flex items-center gap-2 hover:"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
            </div>
          )}

          {/* Server Profile Section */}
          <div className="text-center">
            <Avatar className="w-20 h-20 mx-auto mb-3">
              <AvatarImage
                src={currentServerData.serverImage}
                alt="Server Avatar"
              />
              <AvatarFallback>
                {currentServerData.serverName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center justify-center gap-2 mb-1">
              <h3 className="font-semibold mb-1">
                {currentServerData.serverName}
              </h3>
              <EditServerNameDialog
                serverId={serverId}
                currentServerName={currentServerData.serverName}
                onServerNameUpdate={handleServerNameUpdate}
              />
            </div>
            <p className="text-sm  flex items-center justify-center gap-1">
              <Users className="w-3 h-3" />
              Server Members
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm trong server"
              className="pl-10 bg-white border-gray-200"
            />
          </div>

          {/* Server Info Section */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-between p-3 h-auto"
              onClick={() => toggleSection("serverInfo")}
            >
              <span className="font-medium ">Thông tin server</span>
              {expandedSections.serverInfo ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>

            {expandedSections.serverInfo && (
              <div className="pl-3 space-y-2">
                <div className="text-sm ">
                  <p>Server ID: {serverId}</p>
                  <p>Created: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Members Section */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-between p-3 h-auto"
              onClick={() => toggleSection("members")}
            >
              <span className="font-medium ">Thành viên</span>
              {expandedSections.members ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>

            {expandedSections.members && (
              <div className="pl-3 space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-2  rounded-lg cursor-pointer"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={member.imageUrl}
                        alt={member.username}
                      />
                      <AvatarFallback>
                        {member.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex justify-between">
                      <div className="text-sm font-medium">
                        {member.username}
                      </div>
                      {member.id === serverData.ownerId && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-center">
                          Owner
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Channels Section */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-between p-3 h-auto"
              onClick={() => toggleSection("channels")}
            >
              <span className="font-medium ">Kênh</span>
              {expandedSections.channels ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>

            {expandedSections.channels && (
              <div className="pl-3 space-y-2">
                <div className="flex items-center gap-3 p-2  rounded-lg cursor-pointer">
                  <Hash className="w-4 h-4 " />
                  <span className="text-sm ">general</span>
                </div>
                <div className="flex items-center gap-3 p-2  rounded-lg cursor-pointer">
                  <Volume2 className="w-4 h-4 " />
                  <span className="text-sm ">Voice Channel</span>
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
              <span className="font-medium ">File phương tiện & file</span>
              {expandedSections.files ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>

            {expandedSections.files && (
              <div className="pl-3 space-y-3">
                <div className="flex items-center gap-3 p-2  rounded-lg cursor-pointer">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm ">File phương tiện</span>
                </div>

                <div className="flex items-center gap-3 p-2  rounded-lg cursor-pointer">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-orange-400" />
                  </div>
                  <span className="text-sm ">File</span>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Settings Section */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-between p-3 h-auto"
              onClick={() => toggleSection("settings")}
            >
              <span className="font-medium ">Cài đặt server</span>
              {expandedSections.settings ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>

            {expandedSections.settings && (
              <div className="pl-3 space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm  h-auto p-2"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Cài đặt chung
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm  h-auto p-2"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Quyền hạn
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm text-red-600 h-auto p-2"
                  onClick={handleOutServer}
                >
                  Rời khỏi server
                </Button>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
