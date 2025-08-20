"use client";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { UserData } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const Friends = ({ initialFriends }: { initialFriends: UserData[] }) => {
  const [userFriends, setUserFriends] =
    useState<UserData[]>(initialFriends);
  // const { user } = useUser();

  // useEffect(() => {
  //   const fetchFriends = async () => {
  //     if (user) {
  //       const friends = await fetch(
  //         `/api/friends/getFriends?userId=${user.id}`
  //       );
  //       const data = await friends.json();
  //       if (friends.status !== 200) {
  //         console.error("Failed to fetch friends:", data);
  //         return;
  //       }
  //       setUserFriends(data.friends);
  //     }
  //   };
  //   fetchFriends();
  // }, [user]);

  // if (!userFriends.length) {
  //   return <div>No friends found.</div>;
  // }

  return userFriends.map((friend) => (
    <div
      key={friend.id}
      className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0"
    >
      <div className="flex w-full items-center gap-2">
        <Avatar>
          <AvatarImage src={friend.imageUrl} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <span>
          {friend.firstName} {friend.lastName}
        </span>{" "}
        <span className="ml-auto text-xs">09:10 AM</span>
      </div>
      <span className="font-medium">{friend.email}</span>
      <span className="line-clamp-2 w-[260px] text-xs whitespace-break-spaces">
        {/* {friend.teaser} */}fadsfdsa
      </span>
    </div>
  ));
};

export default Friends;
