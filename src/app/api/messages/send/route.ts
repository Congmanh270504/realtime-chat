import { fetchRedis } from "@/lib/hepper/redis";
import { redis } from "@/lib/redis";
import { Message, messageValidator } from "@/lib/validation/message";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { toPusherKey } from "@/lib/utils";
import { pusherServer } from "@/lib/pusher";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, chatId }: { text: string; chatId: string } = body;
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({
        message: "User not authenticated",
        status: 401,
      });
    }
    if (!text) {
      return NextResponse.json({
        message: "Text is required",
        status: 400,
      });
    }
    const [userId1, userId2] = chatId.split("--");
    if (user.id !== userId1 && user.id !== userId2) {
      return NextResponse.json({
        message: "You do not have access to this chat",
        status: 403,
      });
    }
    const friendId = user.id === userId1 ? userId2 : userId1;

    const isFriend = (await fetchRedis(
      "sismember",
      `user:${user.id}:friends`,
      friendId
    )) as 0 | 1;

    if (!isFriend) {
      return NextResponse.json({
        message: "You can only send messages to friends",
        status: 403,
      });
    }
    const rawSender = (await fetchRedis("get", `user:${user.id}`)) as string;
    const sender = JSON.parse(rawSender);

    const messageData: Message = {
      id: nanoid(),
      senderId: user.id,
      text,
      timestamp: Date.now(),
      receiverId: friendId,
    };
    const message = messageValidator.parse(messageData);

    try {
      const chatKey = toPusherKey(`chat:${chatId}`);
      const friendKey = toPusherKey(`user:${friendId}:chats`);
      const currentUserKey = toPusherKey(`user:${user.id}:chats`);
      await Promise.all([
        // Lưu message vào database 
        redis.zadd(`chat:${chatId}:messages`, {
          score: message.timestamp,
          member: JSON.stringify(message),
        }),
        
        // notify all clients in the chat
        await pusherServer.trigger(chatKey, "incoming_message", message),

        // notify the recipient's client
        await pusherServer.trigger(friendKey, "new_message", {
          ...message,
          sender: {
            username: sender.username,
            imageUrl: sender.imageUrl,
          },
        }),

        await pusherServer.trigger(currentUserKey, "new_message", {
          ...message,
          sender: {
            username: sender.username,
            imageUrl: sender.imageUrl,
          },
        }),
      ]);
    } catch (pusherError) {
      console.error("Pusher trigger error:", pusherError);
      // Vẫn trả về success vì message đã được lưu
    }

    return NextResponse.json({
      message: "Message sent successfully",
      status: 200,
    });
  } catch (error) {
    return NextResponse.json({
      message:
        "Error sending message" + (error instanceof Error ? error.message : ""),
      status: 500,
    });
  }
}
