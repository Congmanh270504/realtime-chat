"use client";

import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserData } from "@/types/user";

interface FriendRequestItemProps {
  friends: UserData[];
  onAccept: (friendId: string) => void;
  onDeny: (friendId: string) => void;
}

export function FriendRequestItem({
  friends: friends,
  onAccept,
  onDeny,
}: FriendRequestItemProps) {
  return (
    <>
      {friends.map((friend) => (
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
                onClick={() => onDeny(friend.id)}
                className="hover:bg-red-50 hover:border-red-300"
              >
                Deny
              </Button>
              <Button
                variant="outline"
                onClick={() => onAccept(friend.id)}
                className="hover:bg-green-50 hover:border-green-300"
              >
                Accept
              </Button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
