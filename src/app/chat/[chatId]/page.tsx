import ChatInterface from "@/components/chat-interface";
import { fetchRedis } from "@/lib/hepper/redis";
import { messageArrayValidator } from "@/lib/validation/message";
import { Message } from "@/types/message";
import { UserData } from "@/types/user";
import { SignIn } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import React, { Suspense } from "react";
import Loading from "./loading";
import ProfileChat from "./profile-chat";
import ChatLayout from "./chat-layout";
interface PageProps {
  params: Promise<{
    chatId: string;
  }>;
}
async function getChatMessages(chatId: string) {
  try {
    const result = (await fetchRedis(
      "zrevrange",
      `chat:${chatId}:messages`,
      0,
      9
    )) as string[];
    const dbMessages = result.map((message) => JSON.parse(message) as Message);

    const messages = messageArrayValidator.parse(dbMessages);
    return messages.reverse();
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
  const chatPartnerRaw = await fetchRedis("get", `user:${chatPartnerId}`);

  const chatPartner = JSON.parse(chatPartnerRaw) as UserData;
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
    <Suspense fallback={<Loading />}>
      <ChatLayout
        chatPartner={chatPartner}
        initialMessages={initialMessages}
        transferCurrentUser={transferCurrentUser}
        chatId={chatId}
      />
    </Suspense>
  );
};

export default Page;
