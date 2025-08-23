import { chatHrefConstructor, toPusherKey } from "@/lib/utils";
import { FriendsWithLastMessage, Message } from "@/types/message";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { pusherClient } from "@/lib/pusher";
import { toast } from "sonner";
import CustomToast from "./custom-toast";
import { UserData } from "@/types/user";

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

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${userId}:chats`));
    pusherClient.subscribe(toPusherKey(`user:${userId}:friends`));

    const chatHandler = (message: ExtendedMessage) => {
      const shouldNotify =
        pathName !== `${chatHrefConstructor(userId, message.senderId)}`;
      if (!shouldNotify) return;

      const chatHref = `${chatHrefConstructor(userId, message.senderId)}`;

      toast.custom((t) => (
        <CustomToast message={message} chatHref={chatHref} toastId={t} />
      ));

      setUnseenMessages((prev) => [...prev, message]);
    };

    const newFriendHandler = (newFriend: FriendsWithLastMessage) => {
      setActiveChat((prev) => [...prev, newFriend]);
    };

    pusherClient.bind("new_message", chatHandler);
    pusherClient.bind("new_friend", newFriendHandler);
    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${userId}:chats`));
      pusherClient.unsubscribe(toPusherKey(`user:${userId}:friends`));
      pusherClient.unbind("new_message", chatHandler);
      pusherClient.unbind("new_friend", newFriendHandler);
    };
  }, [userId, pathName, router]);

  useEffect(() => {
    if (pathName.includes("chat")) {
      setUnseenMessages((prev) => {
        return prev.filter((msg) => !pathName.includes(msg.senderId));
      });
    }
  }, [pathName]);

  return (
    <div className="h-screen overflow-y-auto space-y-1">
      {activeChat.sort().map((friend) => {
        const unseenMessagesCount = unseenMessages.filter((msg) => {
          return msg.senderId === friend.id;
        }).length;

        // Get the latest message for this friend (either from unseenMessages or lastMessage)
        const friendUnseenMessages = unseenMessages.filter(
          (msg) => msg.senderId === friend.id || msg.senderId === userId
        );

        const latestMessage =
          friendUnseenMessages.length > 0
            ? friendUnseenMessages[friendUnseenMessages.length - 1]
            : friend.lastMessage;

        return (
          <Link
            key={friend.id}
            href={`${chatHrefConstructor(userId, friend.id)}`}
            className="bg-base-200 shadow-lg flex items-center justify-between gap-3 p-3 hover:bg-gray-300 rounded-lg"
          >
            <div className="flex items-center gap-2">
              {/* {friend.firstName} {friend.lastName} */}
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={friend.imageUrl}
                  alt={friend.username ? friend.username : "User image"}
                />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                {" "}
                <span>{friend.username}</span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span className="text-gray-700 text-sm">
                    {latestMessage.id && latestMessage.senderId === userId
                      ? "You: "
                      : ""}
                  </span>
                  <span className="mb-0.5">{latestMessage.text}</span>
                </div>
                {/* last message logic here */}
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
