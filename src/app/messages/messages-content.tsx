"use client";

import { chatHrefConstructor, toPusherKey } from "@/lib/utils";
import { FriendsWithLastMessage, Message } from "@/types/message";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { pusherClient } from "@/lib/pusher";
import { useFriendsOnlineStatus } from "@/hooks/use-friends-online-status";
import { OnlineStatusUsersSidebar } from "@/components/online-status-users-sidebar";
import { useServerContext } from "@/contexts/server-context";
import { GroupMessage } from "@/types/group-message";
import { MessageSquare, Users, Search, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ExtendedMessage extends Message {
  sender: {
    username: string;
    imageUrl: string;
  };
}

interface MessagesContentProps {
  initialFriends: FriendsWithLastMessage[];
  userId: string;
}

const MessagesContent: React.FC<MessagesContentProps> = ({
  initialFriends,
  userId,
}) => {
  const pathName = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "friends" | "servers">(
    "all"
  );
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
  const [unseenMessageServers, setUnseenMessageServers] = useState<
    (GroupMessage & { serverId: string })[]
  >([]);
  const [activeChat, setActiveChat] =
    useState<FriendsWithLastMessage[]>(initialFriends);

  // Use server context for servers
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

  // Setup Pusher subscriptions for real-time updates
  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${userId}:friend_online_list`));
    pusherClient.subscribe(toPusherKey(`user:${userId}:chats`));
    pusherClient.subscribe(toPusherKey(`user:${userId}:servers`));

    const handleFriendOnlineList = (data: {
      [userId: string]: { status: string; lastSeen: number | null };
    }) => {
      setFriendsStatus((prev) => ({ ...prev, ...data }));
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

      // Add to unseen messages if not from current user
      if (message.senderId !== userId) {
        setUnseenMessages((prev) => [...prev, message]);
      }
    };

    const newFriendHandler = (newFriend: FriendsWithLastMessage) => {
      setActiveChat((prev) => [...prev, newFriend]);
    };

    const serverMessageHandler = (
      message: GroupMessage & { serverId: string }
    ) => {
      const shouldUpdate = !pathName.includes(`/servers/${message.serverId}`);
      if (shouldUpdate && userId !== message.sender.id) {
        setUnseenMessageServers((prev) => [...prev, message]);
      }
    };

    pusherClient.bind("friend_online_list", handleFriendOnlineList);
    pusherClient.bind("new_message", chatHandlerAddLastMessage);
    pusherClient.bind("new_friend", newFriendHandler);
    pusherClient.bind("new_server_message", serverMessageHandler);

    return () => {
      pusherClient.unbind("friend_online_list", handleFriendOnlineList);
      pusherClient.unbind("new_message", chatHandlerAddLastMessage);
      pusherClient.unbind("new_friend", newFriendHandler);
      pusherClient.unbind("new_server_message", serverMessageHandler);
      pusherClient.unsubscribe(
        toPusherKey(`user:${userId}:friend_online_list`)
      );
      pusherClient.unsubscribe(toPusherKey(`user:${userId}:chats`));
      pusherClient.unsubscribe(toPusherKey(`user:${userId}:servers`));
    };
  }, [userId, pathName]);

  // Clear unseen messages when user navigates to a chat
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

  // Filter and search logic
  const filteredFriends = activeChat.filter((friend) => {
    const matchesSearch = friend.username
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return filterType === "all" || filterType === "friends"
      ? matchesSearch
      : false;
  });

  const filteredServers = allServers.filter((server) => {
    const matchesSearch = server.serverName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return filterType === "all" || filterType === "servers"
      ? matchesSearch
      : false;
  });

  // Sort friends: online first, then by latest message
  const sortedFriends = [...filteredFriends].sort((a, b) => {
    const aStatus = friendsStatus[a.id]?.status || "offline";
    const bStatus = friendsStatus[b.id]?.status || "offline";

    // Online users first
    if (aStatus === "online" && bStatus !== "online") return -1;
    if (bStatus === "online" && aStatus !== "online") return 1;

    // Then by latest message timestamp
    const aTimestamp = a.lastMessage?.timestamp || 0;
    const bTimestamp = b.lastMessage?.timestamp || 0;
    return bTimestamp - aTimestamp;
  });

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Messages</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            {sortedFriends.length} friends • {filteredServers.length} servers
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-1">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("all")}
            >
              All
            </Button>
            <Button
              variant={filterType === "friends" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("friends")}
            >
              <Users className="h-4 w-4 mr-1" />
              Friends
            </Button>
            <Button
              variant={filterType === "servers" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("servers")}
            >
              <Hash className="h-4 w-4 mr-1" />
              Servers
            </Button>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* Friends Section */}
        {(filterType === "all" || filterType === "friends") &&
          sortedFriends.length > 0 && (
            <div className="space-y-2">
              {filterType === "all" && sortedFriends.length > 0 && (
                <div className="flex items-center gap-2 px-2 py-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Friends
                  </span>
                </div>
              )}
              {sortedFriends.map((friend) => {
                const unseenMessagesCount = unseenMessages.filter(
                  (msg) => msg.senderId === friend.id
                ).length;

                const latestMessage = friend.lastMessage || null;
                const userStatus = friendsStatus[friend.id];

                return (
                  <Link
                    key={friend.id}
                    href={`${chatHrefConstructor(userId, friend.id)}`}
                    className="block p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={friend.imageUrl}
                            alt={friend.username || "User"}
                          />
                          <AvatarFallback>
                            {friend.username?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5">
                          <OnlineStatusUsersSidebar
                            status={userStatus?.status || "offline"}
                            lastSeen={userStatus?.lastSeen}
                            size="sm"
                          />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">
                              {friend.username}
                            </span>
                            {userStatus?.status === "online" && (
                              <span className="text-xs text-green-600 font-medium">
                                Online
                              </span>
                            )}
                          </div>
                          {latestMessage && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(
                                latestMessage.timestamp
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <span>
                              {latestMessage &&
                              latestMessage.senderId === userId
                                ? "You: "
                                : ""}
                            </span>
                            <span className="truncate max-w-[200px]">
                              {latestMessage?.text || "No messages yet"}
                            </span>
                          </div>
                          {unseenMessagesCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                              {unseenMessagesCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

        {/* Servers Section */}
        {(filterType === "all" || filterType === "servers") &&
          filteredServers.length > 0 && (
            <div className="space-y-2">
              {filterType === "all" && filteredServers.length > 0 && (
                <div className="flex items-center gap-2 px-2 py-1 mt-6">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Servers
                  </span>
                </div>
              )}
              {filteredServers.map((server) => {
                const unseenServerMessagesCount = unseenMessageServers.filter(
                  (msg) => msg.serverId === server.id
                ).length;

                return (
                  <Link
                    key={server.id}
                    href={`/servers/${server.id}`}
                    className="block p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={server.serverImage || "/default-server.png"}
                            alt={server.serverName || "Server"}
                          />
                          <AvatarFallback>
                            <Hash className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5">
                          <OnlineStatusUsersSidebar status="online" size="sm" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">
                              {server.serverName}
                            </span>
                            <span className="bg-green-600 text-xs text-white px-1.5 py-0.5 rounded-full">
                              Server
                            </span>
                          </div>
                          {server.latestMessage && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(
                                server.latestMessage.timestamp
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {server.latestMessage ? (
                              <>
                                <span className="font-medium">
                                  {server.latestMessage.sender.id === userId
                                    ? "You: "
                                    : `${server.latestMessage.sender.username}: `}
                                </span>
                                <span>{server.latestMessage.text}</span>
                              </>
                            ) : (
                              <span className="italic">No messages yet</span>
                            )}
                          </div>
                          {unseenServerMessagesCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                              {unseenServerMessagesCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

        {/* Empty State */}
        {sortedFriends.length === 0 && filteredServers.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {searchQuery
                ? `No conversations match "${searchQuery}"`
                : "Start chatting with friends or join a server to see your conversations here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesContent;
