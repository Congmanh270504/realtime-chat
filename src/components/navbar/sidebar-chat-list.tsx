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
import { useServerContext } from "@/contexts/server-context";
import { GroupMessage } from "@/types/group-message";
import { SearchX } from "lucide-react";
import { highlightText } from "@/lib/search-utils";

interface SidebarChatListProps {
  friends: FriendsWithLastMessage[];
  userId: string;
  searchQuery?: string;
}
interface ExtendedMessage extends Message {
  sender: {
    username: string;
    imageUrl: string;
  };
}

const SidebarChatList = ({
  friends,
  userId,
  searchQuery = "",
}: SidebarChatListProps) => {
  const router = useRouter();
  const pathName = usePathname();
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
  const [unseenMessageServers, setUnseenMessageServers] = useState<
    (GroupMessage & { serverId: string })[]
  >([]);
  const [activeChat, setActiveChat] =
    useState<FriendsWithLastMessage[]>(friends);

  // Use server context instead of local state
  const { servers: allServers } = useServerContext();
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
    const channelName = toPusherKey(`user:${userId}:servers`);

    pusherClient.subscribe(channelName);

    const serverMessageHandler = (
      message: GroupMessage & { serverId: string }
    ) => {
      const shouldNotify = !pathName.includes(`/servers/${message.serverId}`);

      if (!shouldNotify || userId === message.sender.id) return;

      // Find server name for toast
      const server = allServers.find((s) => s.id === message.serverId);
      const serverName = server?.serverName || "Server";
      // Add toast notification for server messages
      toast.custom((t) => (
        <CustomToast
          message={{
            sender: message.sender,
            text: message.text,
            senderId: message.sender.id,
            receiverId: userId,
          }}
          chatHref={`/servers/${message.serverId}`}
          toastId={t}
          isServerMessage={true}
          serverName={serverName}
        />
      ));

      setUnseenMessageServers((prev) => [...prev, message]);
    };

    pusherClient.bind("new_server_message", serverMessageHandler);

    return () => {
      pusherClient.unsubscribe(channelName);
      pusherClient.unbind("new_server_message", serverMessageHandler);
    };
  }, [userId, pathName, allServers]);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${userId}:chats`));
    pusherClient.subscribe(toPusherKey(`user:${userId}:unfriended`));

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
    
    const handleUnfriend = (unfriendedId: string) => {
      setActiveChat((prev) =>
        prev.filter((friend) => friend.id !== unfriendedId)
      );
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
    };
    pusherClient.bind("new_message", chatHandler);
    pusherClient.bind("new_message", chatHandlerAddLastMessage);
    pusherClient.bind("new_friend", newFriendHandler);
    pusherClient.bind("friend_unfriended", handleUnfriend);
    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${userId}:chats`));
      pusherClient.unsubscribe(toPusherKey(`user:${userId}:unfriended`));
      pusherClient.unbind("new_message", chatHandler);
      pusherClient.unbind("new_friend", newFriendHandler);
      pusherClient.unbind("new_message", chatHandlerAddLastMessage);
      pusherClient.unbind("friend_unfriended", handleUnfriend);
    };
  }, [userId, pathName, router]);

  useEffect(() => {
    if (pathName.includes("chat")) {
      setUnseenMessages((prev) => {
        return prev.filter((msg) => !pathName.includes(msg.senderId));
      });
    }
  }, [pathName]);

  useEffect(() => {
    if (pathName.includes("/servers/")) {
      const serverId = pathName.split("/servers/")[1];
      setUnseenMessageServers((prev) => {
        return prev.filter((msg) => msg.serverId !== serverId);
      });
    }
  }, [pathName]);

  // Filter friends based on search query
  const filteredFriends = activeChat.filter((friend) => {
    if (!searchQuery.trim()) return true;
    return friend.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Filter servers based on search query
  const filteredServers = allServers.filter((server) => {
    if (!searchQuery.trim()) return true;
    return server.serverName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Sort friends: online first, then alphabetically
  const sortedFriends = [...filteredFriends].sort((a, b) => {
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
            : friend.lastMessage || null;

        const userStatus = friendsStatus[friend.id];

        return (
          <Link
            key={friend.id}
            href={`${chatHrefConstructor(userId, friend.id)}`}
            className="border bg-card flex items-center justify-between gap-3 p-3 hover:bg-gray-300 rounded-sm dark:hover:bg-gray-700"
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
                  <span>{highlightText(friend.username, searchQuery)}</span>
                  {userStatus?.status === "online" && (
                    <span className="text-xs text-green-600 font-medium">
                      Online
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs ">
                  <span className="text-sm">
                    {latestMessage && latestMessage.senderId === userId
                      ? "You: "
                      : ""}
                  </span>
                  <span className="mt-0.5">
                    {latestMessage?.text
                      ? latestMessage.text.length > 20
                        ? `${latestMessage.text.slice(0, 20)}...`
                        : latestMessage.text
                      : "No messages yet"}
                  </span>
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
      {filteredServers.map((server) => {
        const unseenServerMessagesCount = unseenMessageServers.filter(
          (msg) => msg.serverId === server.id
        ).length;
        return (
          <Link
            key={server.id}
            href={`/servers/${server.id}`}
            className="border bg-card flex items-center justify-between gap-3 p-3 hover:bg-gray-300 rounded-sm dark:hover:bg-gray-700"
          >
            <div className="flex items-center gap-2 w-full">
              <div className="relative">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={server.serverImage || "/default-server.png"}
                    alt={server.serverName ? server.serverName : "Server image"}
                  />
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5">
                  <OnlineStatusUsersSidebar status={"online"} size="sm" />
                </div>
              </div>
              <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center justify-between gap-2">
                  <span>{highlightText(server.serverName, searchQuery)} </span>
                  <div className="bg-green-600 text-xs text-white px-1.5 rounded-full">
                    Server
                  </div>
                </div>
                <div className="flex items-center justify-between gap-1 text-xs ">
                  <div className="truncate max-w-[150px]">
                    {server.latestMessage ? (
                      <>
                        <span className="text-sm">
                          {server.latestMessage.sender.id === userId
                            ? "You:"
                            : server.latestMessage.sender.username
                            ? server.latestMessage.sender.username + ":"
                            : ""}
                        </span>
                        <span className="mt-0.5 ml-1">
                          {server.latestMessage.text}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-500 italic">
                        No messages yet
                      </span>
                    )}
                  </div>
                  {/* Unseen message count for servers */}
                  {unseenServerMessagesCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold mr-4">
                      {unseenServerMessagesCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        );
      })}

      {/* Empty State for Search */}
      {searchQuery.trim() &&
        sortedFriends.length === 0 &&
        filteredServers.length === 0 && (
          <div className="text-center py-8">
            <SearchX className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-2">
              No results found
            </p>
            <p className="text-xs text-muted-foreground">
              Try searching for a different name
            </p>
          </div>
        )}
    </div>
  );
};

export default SidebarChatList;
