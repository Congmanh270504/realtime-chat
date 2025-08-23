"use server";
import { getFriendsByUserId } from "@/lib/hepper/get-friends";
import { fetchRedis } from "@/lib/hepper/redis";
import { Message } from "@/types/message";
import { currentUser } from "@clerk/nextjs/server";
import React from "react";

const Page = async () => {
  const user = await currentUser();
  if (!user) return <div>no login</div>;
  const initialFriends = await getFriendsByUserId(user.id);
  const friendsWithLastMessage = await Promise.all(
    initialFriends.map(async (friend) => {
      const sortedIds = [user.id, friend.id].sort();
      const [lastMessageRaw] = await fetchRedis(
        "zrange",
        `chat:${sortedIds[0]}--${sortedIds[1]}:messages`,
        -1,
        -1
      );
      const lastMessage = JSON.parse(lastMessageRaw) as Message;
      console.log("lastMessageRaw", lastMessage);

      return {
        ...friend,
        lastMessage,
      };
    })
  );
  console.log("fdasfd", friendsWithLastMessage);
  return <div>fff</div>;
};

export default Page;
// chat:user_31XlY4gRxYCeJpFctdhScnkdG5M--user_31Xm3NuTP0Cez0nJxCuS98lbNeY:messages
