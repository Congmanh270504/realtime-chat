"use client";
import ChatInterface from "@/components/chat/chat-interface";
import React, { useEffect, useState } from "react";
import ProfileChat from "./profile-chat";
import { Message } from "@/types/message";
import { UserData } from "@/types/user";
import { useIsMobile } from "@/hooks/use-mobile";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

interface ChatLayoutProps {
  chatId: string;
  initialMessages: Message[];
  transferCurrentUser: UserData;
  partnerUser: UserData;
}

const ChatLayout = ({
  chatId,
  initialMessages,
  transferCurrentUser,
  partnerUser,
}: ChatLayoutProps) => {
  const [showProfile, setShowProfile] = useState(true);
  const handleCloseProfile = () => setShowProfile(!showProfile);
  const isMobile = useIsMobile();

  // Tách thành 2 state riêng biệt - performance tốt nhất
  const [currentUser, setCurrentUser] = useState(transferCurrentUser);
  const [partnerUserData, setPartnerUserData] = useState(partnerUser);

  useEffect(() => {
    const currentUserChannel = toPusherKey(
      `chat:${chatId}:nicknames:${transferCurrentUser.id}`
    );
    const partnerUserChannel = toPusherKey(
      `chat:${chatId}:nicknames:${partnerUser.id}`
    );

    pusherClient.subscribe(currentUserChannel);
    pusherClient.subscribe(partnerUserChannel);

    const handleNickNameChange = (data: {
      userId: string;
      nickname: string;
    }) => {

      if (data.userId === transferCurrentUser.id) {
        setCurrentUser((prev) => ({ ...prev, username: data.nickname }));
      } else if (data.userId === partnerUser.id) {
        setPartnerUserData((prev) => ({ ...prev, username: data.nickname }));
      }
    };

    pusherClient.bind("nicknameChanged", handleNickNameChange);

    return () => {
      pusherClient.unsubscribe(currentUserChannel);
      pusherClient.unsubscribe(partnerUserChannel);
      pusherClient.unbind("nicknameChanged", handleNickNameChange);
    };
  }, [transferCurrentUser.id, chatId, partnerUser.id]);

  return (
    <div className="flex h-full bg-gray-100 overflow-hidden p-4 gap-4 min-h-0">
      {isMobile ? (
        !showProfile ? (
          <ProfileChat
            partnerUser={partnerUserData}
            chatId={chatId}
            isMobile={isMobile}
            handleCloseProfile={handleCloseProfile}
            currentUser={currentUser}
          />
        ) : (
          <ChatInterface
            chatId={chatId}
            initialMessages={initialMessages}
            currentUser={currentUser}
            partnerUser={partnerUserData}
            handleCloseProfile={handleCloseProfile}
          />
        )
      ) : (
        <>
          <ChatInterface
            chatId={chatId}
            initialMessages={initialMessages}
            currentUser={currentUser}
            partnerUser={partnerUserData}
            handleCloseProfile={handleCloseProfile}
          />
          {showProfile && (
            <ProfileChat
              partnerUser={partnerUserData}
              chatId={chatId}
              isMobile={isMobile}
              currentUser={currentUser}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ChatLayout;
