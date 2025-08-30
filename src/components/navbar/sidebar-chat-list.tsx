import { chatHrefConstructor, toPusherKey } from "@/lib/utils";
import { FriendsWithLastMessage, Message } from "@/types/message";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { pusherClient } from "@/lib/pusher";
import { toast } from "sonner";
import CustomToast from "../custom-toast";
import { useFriendsOnlineStatus } from "@/hooks/use-friends-online-status";
import { OnlineStatusUsersSidebar } from "../online-status-users-sidebar";

interface SidebarChatListProps {
  friends: FriendsWithLastMessage[];
  userId: string;
}
interface ExtendedMessage extends Message {
  sender: {
    username: string;
    imageUrl: string;
  };
}

const SidebarChatList = ({ friends, userId }: SidebarChatListProps) => {
  const router = useRouter();
  const pathName = usePathname();
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
  const [activeChat, setActiveChat] =
    useState<FriendsWithLastMessage[]>(friends);
  const [isCurrentUserChat, setIsCurrentUserChat] = useState<boolean>(false);

  // Get online status for all friends
  const friendIds = activeChat.map((friend) => friend.id);
  const { friendsStatus: friendsStatusData } =
    useFriendsOnlineStatus(friendIds);
  const [friendsStatus, setFriendsStatus] = useState(friendsStatusData);

  // Sync hook data with local state
  useEffect(() => {
    setFriendsStatus(friendsStatusData);
  }, [friendsStatusData]);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${userId}:friend_online_list`));

    const handleFriendOnlineList = (data: {
      [userId: string]: { status: string; lastSeen: number | null };
    }) => {
      // console.log("Received friend status update:", data);
      setFriendsStatus((prev) => {
        return { ...prev, ...data };
      });
    };

    pusherClient.bind("friend_online_list", handleFriendOnlineList);
    return () => {
      pusherClient.unbind("friend_online_list", handleFriendOnlineList);
      pusherClient.unsubscribe(
        toPusherKey(`user:${userId}:friend_online_list`)
      );
    };
  }, [userId]);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${userId}:chats`));

    const chatHandler = (message: ExtendedMessage) => {
      const shouldNotify =
        pathName !== `${chatHrefConstructor(userId, message.senderId)}`;

      if (!shouldNotify || userId === message.senderId) return;

      const chatHref = `${chatHrefConstructor(userId, message.senderId)}`;

      toast.custom((t) => (
        <CustomToast message={message} chatHref={chatHref} toastId={t} />
      ));

      setUnseenMessages((prev) => [...prev, message]);
    };

    const newFriendHandler = (newFriend: FriendsWithLastMessage) => {
      setActiveChat((prev) => [...prev, newFriend]);
    };

    const chatHandlerAddLastMessage = (message: ExtendedMessage) => {
      setActiveChat((prev) => {
        const updatedChat = prev.map((friend) => {
          if (
            friend.id === message.receiverId ||
            friend.id === message.senderId
          ) {
            return {
              ...friend,
              lastMessage: message,
            };
          }
          return friend;
        });
        return updatedChat;
      });
      setIsCurrentUserChat(userId === message.senderId);
    };
    pusherClient.bind("new_message", chatHandler);
    pusherClient.bind("new_message", chatHandlerAddLastMessage);
    pusherClient.bind("new_friend", newFriendHandler);
    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${userId}:chats`));
      pusherClient.unbind("new_message", chatHandler);
      pusherClient.unbind("new_friend", newFriendHandler);
      pusherClient.unbind("new_message", chatHandlerAddLastMessage);
    };
  }, [userId, pathName, router]);

  useEffect(() => {
    if (pathName.includes("chat")) {
      setUnseenMessages((prev) => {
        return prev.filter((msg) => !pathName.includes(msg.senderId));
      });
    }
  }, [pathName]);

  // Sort friends: online first, then alphabetically
  const sortedFriends = [...activeChat].sort((a, b) => {
    const aStatus = friendsStatus[a.id]?.status || "offline";
    const bStatus = friendsStatus[b.id]?.status || "offline";

    // Online users first
    if (aStatus === "online" && bStatus !== "online") return -1;
    if (bStatus === "online" && aStatus !== "online") return 1;

    // Then sort alphabetically
    return a.username.localeCompare(b.username);
  });

  return (
    <div className="h-screen overflow-y-auto space-y-2">
      {sortedFriends.map((friend) => {
        const unseenMessagesCount = unseenMessages.filter((msg) => {
          return msg.senderId === friend.id;
        }).length;

        // Get the latest message for this friend
        const friendUnseenMessages = unseenMessages.filter(
          (msg) => msg.senderId === friend.id || msg.senderId === userId
        );

        const latestMessage =
          friendUnseenMessages.length > 0
            ? friendUnseenMessages[friendUnseenMessages.length - 1]
            : friend.lastMessage;

        const userStatus = friendsStatus[friend.id];

        return (
          <Link
            key={friend.id}
            href={`${chatHrefConstructor(userId, friend.id)}`}
            className="bg-base-200 shadow-lg flex items-center justify-between gap-3 p-3 hover:bg-gray-300 rounded-sm"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={friend.imageUrl}
                    alt={friend.username ? friend.username : "User image"}
                  />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                {/* Online status indicator positioned at bottom-right of avatar */}
                <div className="absolute -bottom-0.5 -right-0.5">
                  <OnlineStatusUsersSidebar
                    status={userStatus?.status || "offline"}
                    lastSeen={userStatus?.lastSeen}
                    size="sm"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span>{friend.username}</span>
                  {userStatus?.status === "online" && (
                    <span className="text-xs text-green-600 font-medium">
                      Online
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span className="text-gray-700 text-sm">
                    {isCurrentUserChat || latestMessage.senderId === userId
                      ? "You: "
                      : ""}
                  </span>
                  <span className="mt-0.5">{latestMessage.text}</span>
                </div>
              </div>
            </div>
            {unseenMessagesCount > 0 ? (
              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {unseenMessagesCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
};

export default SidebarChatList;
