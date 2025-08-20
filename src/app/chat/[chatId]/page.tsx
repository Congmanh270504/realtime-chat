import ChatInterface from "@/components/chat-interface";
import { fetchRedis } from "@/lib/hepper/redis";
import { redis } from "@/lib/redis";
import { messageArrayValidator } from "@/lib/validation/message";
import { Message } from "@/types/message";
import { UserData } from "@/types/user";
import { SignIn } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import React from "react";
interface PageProps {
  params: Promise<{
    chatId: string;
  }>;
}
async function getChatMessages(chatId: string) {
  try {
    const result = (await fetchRedis(
      "zrange",
      `chat:${chatId}:messages`,
      0,
      -1
    )) as string[];
    const dbMessages = result.map((message) => JSON.parse(message) as Message);

    const messages = messageArrayValidator.parse(dbMessages);
    return messages;
  } catch {
    return [];
  }
}

const Page = async ({ params }: PageProps) => {
  const { chatId } = await params;
  const user = await currentUser();
  if (!user) {
    return <SignIn />;
  }

  const [userId1, userId2] = chatId.split("--");

  if (userId1 !== user.id && userId2 !== user.id) {
    return <div>You do not have access to this chat.</div>;
  }

  const chatPartnerId = userId1 === user.id ? userId2 : userId1;
  const chatPartner = (await redis.get(`user:${chatPartnerId}`)) as UserData;

  const initialMessages = (await getChatMessages(chatId)) as Message[];

  const transferCurrentUser: UserData = {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress || "",
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    imageUrl: user.imageUrl || "",
    username: user.username || "",
    createdAt: "",
  };

  return (
    <div className="h-full flex flex-col">
      <ChatInterface
        chatId={chatId}
        initialMessages={initialMessages}
        currentUser={transferCurrentUser}
        chatPartner={chatPartner}
      />
    </div>
  );
};

export default Page;
