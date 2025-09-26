"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { UserData } from "@/types/user";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface FriendRequestWithMutual {
  requestUser: UserData;
  mutualFriends: UserData[];
  mutualCount: number;
}

interface FriendRequestsProps {
  initialFriendRequests: FriendRequestWithMutual[];
  userId: string;
}

export function FriendSuggestions({
  initialFriendRequests,
  userId,
}: FriendRequestsProps) {
  const [friendRequests, setFriendRequests] = useState<
    FriendRequestWithMutual[]
  >(initialFriendRequests);

  // fetch friend requests
  useEffect(() => {
    // pusherClient.subscribe(
    //   toPusherKey(`user:${userId}:incoming_friend_requests`)
    // );
    pusherClient.subscribe(toPusherKey(`user:${userId}:friend_request_denied`));

    const friendRequestDeniedHandler = (data: UserData) => {
      setFriendRequests((prev) =>
        prev.filter((friend) => friend.requestUser.id !== data.id)
      );
      // setRequestCount((prev) => prev - 1);
    };

    const friendRequestsAdd = (data: FriendRequestWithMutual) => {
      setFriendRequests((prev) => [data, ...prev]);
    };

    // pusherClient.bind("incoming_friend_requests", friendRequestHandler2);
    pusherClient.bind("friend_request_denied", friendRequestDeniedHandler);
    pusherClient.bind("incoming_friend_requests", friendRequestsAdd);

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${userId}:incoming_friend_requests`)
      );
      pusherClient.unsubscribe(toPusherKey(`user:${userId}:friends`));

      pusherClient.unbind("incoming_friend_requests", friendRequestsAdd);
      pusherClient.unbind("friend_request_denied", friendRequestDeniedHandler);
    };
  }, [userId]);

  // Callback functions for friend request actions
  const handleAcceptFriend = async (friendId: string) => {
    try {
      const request = await fetch(`/api/friends/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendId }),
      });

      const data = await request.json();
      if (request.status === 200) {
        toast.success(data.message);

        setFriendRequests((prev) =>
          prev.filter((friend) => friend.requestUser.id !== friendId)
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleDenyFriend = async (friendId: string) => {
    try {
      const request = await fetch(`/api/friends/deny`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendId }),
      });

      const data = await request.json();
      if (request.status === 200) {
        toast.success(data.message);
        setFriendRequests((prev) =>
          prev.filter((friend) => friend.requestUser.id !== friendId)
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error denying friend request:", error);
    }
  };

  return (
    <div className="space-y-4 space-x-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Friend Requests</h1>
          <span className="text-sm text-red-500 mt-1">
            ({friendRequests.length})
          </span>
        </div>
        <Button
          variant="link"
          className="text-blue-600 hover:text-blue-700 p-0 h-auto font-normal"
        >
          View All
        </Button>
      </div>

      {/* Friend suggestions grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5  gap-4">
        {friendRequests.map((friend) => {
          return (
            <Card
              className="overflow-hidden p-0 border border-gray-200 shadow-md hover:shadow-lg transition-shadow h-full"
              key={friend.requestUser.id}
            >
              <CardContent className="p-0 flex flex-col h-full">
                {/* Profile Image */}
                <div className="aspect-square relative">
                  <Avatar className="w-full h-full rounded-none">
                    <AvatarImage
                      src={friend.requestUser.imageUrl || "/placeholder.svg"}
                      alt={friend.requestUser.username}
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
                  <h3 className="font-semibold  text-sm leading-tight mb-3">
                    {friend.requestUser.username}
                  </h3>

                  <div className="min-h-[20px] mb-3">
                    {friend.mutualCount > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="flex -space-x-1">
                          {friend.mutualFriends
                            .slice(0, 3)
                            .map((avatar, index) => (
                              <Avatar
                                key={index}
                                className="w-4 h-4 border border-white"
                              >
                                <AvatarImage
                                  src={avatar.imageUrl || "/placeholder.svg"}
                                />
                                <AvatarFallback className="bg-gray-300 text-xs"></AvatarFallback>
                              </Avatar>
                            ))}
                        </div>
                        <span className="text-xs text-gray-600">
                          {friend.mutualCount} bạn chung
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mt-auto">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
                      onClick={() => handleAcceptFriend(friend.requestUser.id)}
                    >
                      Xác nhận
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm py-2"
                      onClick={() => handleDenyFriend(friend.requestUser.id)}
                    >
                      Xóa
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
}
