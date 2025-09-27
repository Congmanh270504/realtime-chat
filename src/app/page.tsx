import { redis } from "@/lib/redis";
import { RedirectToSignIn } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import React from "react";

const Page = async () => {
  const user = await currentUser();
  if (!user) {
    return <RedirectToSignIn />;
  }
  const chatMessages = (await redis.get(`user:${user.id}:friends`)) as string[];
  if (!chatMessages || chatMessages.length === 0) {
    const serverChatMessages = (await redis.get(
      `user:${user.id}:servers`
    )) as string[];
    if (!serverChatMessages || serverChatMessages.length === 0) {
      return ;
    }
  }
  
  return (
    <div className="flex justify-center items-start pt-20">
      <div className="w-full max-w-md mx-auto p-6 rounded-lg shadow-lg">
        fadsfdsa
      </div>
    </div>
  );
};

export default Page;
