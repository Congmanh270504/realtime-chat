"use client";

import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { UserData } from "@/types/user";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface FriendRequestItemProps {
  friends: UserData[];
  userId: string;
}

export function FriendRequestItem({ friends, userId }: FriendRequestItemProps) {
  const [friendRequestsData, setFriendRequestsData] = useState(friends);

  // fetch friend requests
  useEffect(() => {
    // pusherClient.subscribe(
    //   toPusherKey(`user:${userId}:incoming_friend_requests`)
    // );
    pusherClient.subscribe(toPusherKey(`user:${userId}:friend_request_denied`));

    const friendRequestDeniedHandler = (data: UserData) => {
      setFriendRequestsData((prev) =>
        prev.filter((friend) => friend.id !== data.id)
      );
      // setRequestCount((prev) => prev - 1);
    };

    // const friendRequestHandler2 = (data: UserData) => {
    //   setFriendRequestsData((prev) => [...prev, data]);
    // };

    // pusherClient.bind("incoming_friend_requests", friendRequestHandler2);
    pusherClient.bind("friend_request_denied", friendRequestDeniedHandler);

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${userId}:incoming_friend_requests`)
      );
      pusherClient.unsubscribe(toPusherKey(`user:${userId}:friends`));
      // pusherClient.unbind("incoming_friend_requests", friendRequestHandler2);
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
        toast.success(data.messages);

        setFriendRequestsData((prev) =>
          prev.filter((friend) => friend.id !== friendId)
        );
      } else {
        toast.error(data.messages);
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
        toast.success(data.messages);
        setFriendRequestsData((prev) =>
          prev.filter((friend) => friend.id !== friendId)
        );
      } else {
        toast.error(data.messages);
      }
    } catch (error) {
      console.error("Error denying friend request:", error);
    }
  };

  return (
    <>
      {friendRequestsData.length > 0 ? (
        friendRequestsData.map((friend) => (
          <div
            key={friend.id}
            className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm"
          >
            <Avatar>
              <AvatarImage src={friend.imageUrl} />
              <AvatarFallback>{friend.firstName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium text-gray-900 mb-1 ml-3">
                {friend.username}
              </div>
              <div className="text-sm text-gray-600 mb-1 ml-3">
                {friend.firstName + " " + friend.lastName}
              </div>
              <div className="flex justify-around">
                <Button
                  variant="outline"
                  onClick={() => handleDenyFriend(friend.id)}
                  className="hover:bg-red-50 hover:border-red-300"
                >
                  Deny
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAcceptFriend(friend.id)}
                  className="hover:bg-green-50 hover:border-green-300"
                >
                  Accept
                </Button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div>No friend requests</div>
      )}
    </>
  );
}
