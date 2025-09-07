import { fetchRedis } from "@/lib/hepper/redis";
import { messageArrayValidator } from "@/lib/validation/message";
import { Message } from "@/types/message";
import { UserData } from "@/types/user";
import { SignIn } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import React, { Suspense } from "react";
import Loading from "../../../components/chat/loading";
import { Metadata } from "next";
import { redis } from "@/lib/redis";
import ChatLayout from "@/components/chat/chat-layout";

interface PageProps {
  params: Promise<{
    chatId: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { chatId } = await params;
  const user = await currentUser();

  if (!user) {
    return {
      title: "Chat - Please sign in",
      description: "Real-time chat application",
    };
  }

  const [userId1, userId2] = chatId.split("--");

  if (userId1 !== user.id && userId2 !== user.id) {
    return {
      title: "Chat - Access Denied",
      description: "You do not have access to this chat",
    };
  }

  const partnerUserId = userId1 === user.id ? userId2 : userId1;

  try {
    // Lấy nicknames của user hiện tại
    const nicknamesData = (await redis.hgetall(
      `chat:${chatId}:nicknames`
    )) as Record<string, string>;

    const partnerUserRaw = await fetchRedis("get", `user:${partnerUserId}`);
    const partnerUser = JSON.parse(partnerUserRaw) as UserData;

    // Sử dụng nickname nếu có, nếu không thì dùng username gốc
    const displayName = nicknamesData[partnerUser.id] || partnerUser.username;

    return {
      title: `Chat with ${displayName} - Thomas`,
      description: `Chat conversation with ${displayName}`,
    };
  } catch {
    return {
      title: "Chat - Thomas",
      description: "Real-time chat application",
    };
  }
}
async function getChatMessages(chatId: string) {
  try {
    const result = (await fetchRedis(
      "zrevrange",
      `chat:${chatId}:messages`,
      0,
      19
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

  // Lấy nicknames của user hiện tại
  const nicknames = (await redis.hgetall(`chat:${chatId}:nicknames`)) as Record<
    string,
    string
  >;

  // Helper function để lấy display name
  const getDisplayName = (userId: string, originalUsername: string) => {
    return nicknames[userId] || originalUsername;
  };

  const partnerUserId = userId1 === user.id ? userId2 : userId1;
  const partnerUserRaw = await fetchRedis("get", `user:${partnerUserId}`);

  const partnerUserData = JSON.parse(partnerUserRaw) as UserData;

  // Tạo partnerUser với nickname nếu có
  const partnerUser: UserData = {
    ...partnerUserData,
    username: getDisplayName(partnerUserData.id, partnerUserData.username),
  };

  const initialMessages = (await getChatMessages(chatId)) as Message[];

  const transferCurrentUser: UserData = {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress || "",
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    imageUrl: user.imageUrl || "",
    username: getDisplayName(user.id, user.username || ""),
    createdAt: "",
  };

  return (
    <Suspense fallback={<Loading />}>
      <ChatLayout
        partnerUser={partnerUser}
        initialMessages={initialMessages}
        transferCurrentUser={transferCurrentUser}
        chatId={chatId}
      />
    </Suspense>
  );
};

export default Page;
