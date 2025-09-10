"use client";
import React, { useState } from "react";
import GroupChatInterface from "./group-chat-interface";
import ServerProfileChat from "./server-profile-chat";
import { GroupMessage } from "@/types/group-message";
import { Servers } from "@/types/servers";
import { useIsMobile } from "@/hooks/use-mobile";
import { useServerContext } from "@/contexts/server-context";

interface GroupChatLayoutProps {
  serverId: string;
  initialMessages: GroupMessage[];
  serverData: Servers;
}

const GroupChatLayout = ({
  serverId,
  initialMessages,
  serverData,
}: GroupChatLayoutProps) => {
  const [showProfile, setShowProfile] = useState(true);
  const handleCloseProfile = () => setShowProfile(!showProfile);
  const isMobile = useIsMobile();
  const { getCurrentServer } = useServerContext();

  // Get current server data from context (updated via Pusher)
  const currentServerData = getCurrentServer(serverId) || serverData;

  return (
    <div className="flex h-full  overflow-hidden p-4 gap-4 min-h-0">
      {isMobile ? (
        !showProfile ? (
          <ServerProfileChat
            serverData={currentServerData}
            serverId={serverId}
            isMobile={isMobile}
            handleCloseProfile={handleCloseProfile}
          />
        ) : (
          <GroupChatInterface
            serverId={serverId}
            initialMessages={initialMessages}
            servers={currentServerData}
            handleCloseProfile={handleCloseProfile}
          />
        )
      ) : (
        <>
          <GroupChatInterface
            serverId={serverId}
            initialMessages={initialMessages}
            servers={currentServerData}
            handleCloseProfile={handleCloseProfile}
          />
          {showProfile && (
            <ServerProfileChat
              serverData={currentServerData}
              serverId={serverId}
              isMobile={isMobile}
            />
          )}
        </>
      )}
    </div>
  );
};

export default GroupChatLayout;
