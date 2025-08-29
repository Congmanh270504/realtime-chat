"use client";
import ChatInterface from "@/components/chat-interface";
import React, { useState } from "react";
import ProfileChat from "./profile-chat";
import { Message } from "@/types/message";
import { UserData } from "@/types/user";

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
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden p-4 gap-4 max-2xl:mt-10">
      <ChatInterface
        chatId={chatId}
        initialMessages={initialMessages}
        currentUser={transferCurrentUser}
        chatPartner={chatPartner}
        handleCloseProfile={handleCloseProfile}
      />
      {showProfile && (
        <ProfileChat
          showProfile={showProfile}
          chatPartner={chatPartner}
          chatId={chatId}
        />
      )}
    </div>
  );
};

export default ChatLayout;
