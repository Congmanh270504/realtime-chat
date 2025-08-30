"use client";
import ChatInterface from "@/components/chat/chat-interface";
import React, { useState } from "react";
import ProfileChat from "./profile-chat";
import { Message } from "@/types/message";
import { UserData } from "@/types/user";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatLayoutProps {
  chatId: string;
  initialMessages: Message[];
  transferCurrentUser: UserData;
  chatPartner: UserData;
}
const ChatLayout = ({
  chatId,
  initialMessages,
  transferCurrentUser,
  chatPartner,
}: ChatLayoutProps) => {
  const [showProfile, setShowProfile] = useState(true);
  const handleCloseProfile = () => setShowProfile(!showProfile);
  const isMobile = useIsMobile();

  return (
    <div className="flex h-full bg-gray-100 overflow-hidden p-4 gap-4">
      {isMobile ? (
        !showProfile ? (
          <ProfileChat
            chatPartner={chatPartner}
            chatId={chatId}
            isMobile={isMobile}
            handleCloseProfile={handleCloseProfile}
          />
        ) : (
          <ChatInterface
            chatId={chatId}
            initialMessages={initialMessages}
            currentUser={transferCurrentUser}
            chatPartner={chatPartner}
            handleCloseProfile={handleCloseProfile}
          />
        )
      ) : (
        <>
          <ChatInterface
            chatId={chatId}
            initialMessages={initialMessages}
            currentUser={transferCurrentUser}
            chatPartner={chatPartner}
            handleCloseProfile={handleCloseProfile}
          />
          {showProfile && (
            <ProfileChat
              chatPartner={chatPartner}
              chatId={chatId}
              isMobile={isMobile}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ChatLayout;
