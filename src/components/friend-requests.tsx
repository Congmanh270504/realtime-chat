"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { UserData } from "@/types/user";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface FriendSuggestion {
  id: string;
  name: string;
  avatar?: string;
  mutualFriends: {
    count: number;
    avatars: string[];
  };
}

const friendSuggestions: FriendSuggestion[] = [
  {
    id: "1",
    name: "Quí Trần",
    mutualFriends: { count: 1, avatars: ["/diverse-group.png"] },
  },
  {
    id: "2",
    name: "Nhật Minh",
    avatar: "/vietnamese-man-with-yellow-sign.png",
    mutualFriends: {
      count: 3,
      avatars: ["/diverse-group.png", "/diverse-woman-portrait.png"],
    },
  },
  {
    id: "3",
    name: "Thanh Tung",
    mutualFriends: {
      count: 2,
      avatars: ["/diverse-group.png", "/diverse-woman-portrait.png"],
    },
  },
  {
    id: "4",
    name: "Phan Ngọc",
    avatar: "/vietnamese-woman-with-flowers.png",
    mutualFriends: { count: 0, avatars: [] },
  },
  {
    id: "5",
    name: "Kiều Doãn",
    avatar: "/woman-in-blue-jacket-outdoors.png",
    mutualFriends: {
      count: 2,
      avatars: ["/diverse-group.png", "/diverse-woman-portrait.png"],
    },
  },
  {
    id: "6",
    name: "Trần Hiếu",
    mutualFriends: {
      count: 2,
      avatars: ["/diverse-group.png", "/diverse-woman-portrait.png"],
    },
  },
  {
    id: "7",
    name: "Pho Lo",
    avatar: "/cute-cat-with-hat.png",
    mutualFriends: { count: 0, avatars: [] },
  },
  {
    id: "8",
    name: "Trần Tiến",
    avatar: "/hanoi-cathedral-vietnam.png",
    mutualFriends: { count: 0, avatars: [] },
  },
  {
    id: "9",
    name: "Nguyễn Thanh Nam",
    avatar: "/man-in-mountains-vietnam.png",
    mutualFriends: {
      count: 3,
      avatars: ["/diverse-group.png", "/diverse-woman-portrait.png"],
    },
  },
  {
    id: "10",
    name: "Nguyễn Kim Ánh",
    avatar: "/vietnamese-woman-portrait.png",
    mutualFriends: { count: 0, avatars: [] },
  },
  {
    id: "11",
    name: "Đặng Thùy Mỹ Ngân",
    avatar: "/woman-in-nature-vietnam.png",
    mutualFriends: { count: 0, avatars: [] },
  },
  {
    id: "12",
    name: "Trương Huỳnh",
    mutualFriends: { count: 0, avatars: [] },
  },
  {
    id: "13",
    name: "Nguyễn Nhi",
    avatar: "/woman-taking-selfie.png",
    mutualFriends: { count: 0, avatars: [] },
  },
  {
    id: "14",
    name: "Vy Nguyễn",
    avatar: "/woman-in-colorful-outfit.png",
    mutualFriends: { count: 0, avatars: [] },
  },
];
interface FriendRequestsProps {
  initialFriendRequests: UserData[];
  userId: string;
}

export function FriendSuggestions({
  initialFriendRequests,
  userId,
}: FriendRequestsProps) {
  const [friendRequests, setFriendRequests] = useState<UserData[]>(
    initialFriendRequests
  );

  // fetch friend requests
  useEffect(() => {
    // pusherClient.subscribe(
    //   toPusherKey(`user:${userId}:incoming_friend_requests`)
    // );
    pusherClient.subscribe(toPusherKey(`user:${userId}:friend_request_denied`));

    const friendRequestDeniedHandler = (data: UserData) => {
      setFriendRequests((prev) =>
        prev.filter((friend) => friend.id !== data.id)
      );
      // setRequestCount((prev) => prev - 1);
    };

    const friendRequestsAdd = (data: UserData) => {
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
          prev.filter((friend) => friend.id !== friendId)
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
          prev.filter((friend) => friend.id !== friendId)
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
          <h1 className="text-xl font-semibold text-gray-900">
            Friend Requests
          </h1>
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
                      onClick={() => handleAcceptFriend(friend.id)}
                    >
                      Xác nhận
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm py-2"
                      onClick={() => handleDenyFriend(friend.id)}
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
