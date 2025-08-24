"use client";
import React, { useEffect, useState } from "react";
import { UserData } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { toast } from "sonner";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

interface FriendsProps {
  initialFriends: UserData[];
  userId: string;
}

const Friends = ({ initialFriends, userId }: FriendsProps) => {
  const [friends, setFriends] = useState<UserData[]>(initialFriends);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${userId}:unfriended`));

    const handleUnfriendState = (friendId: string) => {
      setFriends((prev) => prev.filter((friend) => friend.id !== friendId));
    };
    const handleAddFriendedSuccess = (data: UserData) => {
      setFriends((prev) => [data, ...prev]);
    };

    pusherClient.bind("friend_unfriended", handleUnfriendState);
    pusherClient.bind("new_friend", handleAddFriendedSuccess);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${userId}:unfriended`));
      pusherClient.unbind("friend_unfriended", handleUnfriendState);
      pusherClient.unbind("new_friend", handleAddFriendedSuccess);
    };
  }, [userId]);

  const handleUnfriend = async (friendId: string) => {
    try {
      const request = await fetch(`/api/friends/unfriend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendId }),
      });
      const data = await request.json();
      if (request.status === 200) {
        toast.success(data.message);
        setFriends((prev) => prev.filter((friend) => friend.id !== friendId));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error unfriend:", error);
    }
  };

  return (
    <div className="space-y-4 space-x-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Your friends</h1>
        <Button
          variant="link"
          className="text-blue-600 hover:text-blue-700 p-0 h-auto font-normal"
        >
          Xem tất cả
        </Button>
      </div>

      {/* Friend suggestions grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5  gap-4">
        {friends.map((friend) => {
          return (
            <Card
              className="overflow-hidden p-0 border border-gray-200 shadow-md hover:shadow-lg transition-shadow h-full"
              key={friend.id}
            >
              <CardContent className="p-0 flex flex-col h-full">
                {/* Profile Image */}
                <div className="aspect-square relative">
                  <Avatar className="w-full h-full rounded-none">
                    <AvatarImage
                      src={friend.imageUrl || "/placeholder.svg"}
                      alt={friend.username}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-none bg-gray-200 text-gray-600 text-4xl">
                      <div className="w-16 h-16 bg-gray-400 rounded-full"></div>
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Card Content */}
                <div className="p-3 flex flex-col flex-grow">
                  {/* Name */}
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-3">
                    {friend.username}
                  </h3>

                  {/* <div className="min-h-[20px] mb-3">
            {friend.mutualFriends.count > 0 && (
              <div className="flex items-center gap-1">
                <div className="flex -space-x-1">
                  {friend.mutualFriends.avatars
                    .slice(0, 2)
                    .map((avatar, index) => (
                      <Avatar
                        key={index}
                        className="w-4 h-4 border border-white"
                      >
                        <AvatarImage src={avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gray-300 text-xs"></AvatarFallback>
                      </Avatar>
                    ))}
                </div>
                <span className="text-xs text-gray-600">
                  {friend.mutualFriends.count} bạn chung
                </span>
              </div>
            )}
          </div> */}

                  <div className="space-y-2 mt-auto">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
                      onClick={() => handleUnfriend(friend.id)}
                    >
                      Unfriend
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Friends;
