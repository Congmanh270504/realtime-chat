"use client";
import React, { useState } from "react";
import GroupChatInterface from "./group-chat-interface";
import { GroupMessage } from "@/types/group-message";
import { Servers } from "@/types/servers";
import { useIsMobile } from "@/hooks/use-mobile";
import { useServerContext } from "@/contexts/server-context";
import { UserData } from "@/types/user";
import ServerProfileChat from "./server-profile-chat";

interface GroupChatLayoutProps {
  serverId: string;
  initialMessages: GroupMessage[];
  serverData: Servers;
  members: UserData[];
}

const GroupChatLayout = ({
  serverId,
  initialMessages,
  serverData,
  members,
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
            members={members}
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
              members={members}
            />
          )}
        </>
      )}
    </div>
  );
};

export default GroupChatLayout;
