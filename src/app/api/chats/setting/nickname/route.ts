import { fetchRedis } from "@/lib/hepper/redis";
import { pusherServer } from "@/lib/pusher";
import { redis } from "@/lib/redis";
import { toPusherKey } from "@/lib/utils";
import { Message } from "@/types/message";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { messageValidator } from "@/lib/validation/message";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, nickname, chatId } = body;

    // Verify user authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user has access to this chat
    const [userId1, userId2] = chatId.split("--");
    if (userId1 !== user.id && userId2 !== user.id) {
      return NextResponse.json(
        { error: "Access denied to this chat" },
        { status: 403 }
      );
    }

    // Validate input
    if (!userId || !nickname || typeof nickname !== "string") {
      return NextResponse.json(
        { error: "userId and nickname are required" },
        { status: 400 }
      );
    }

    const friendId = user.id === userId1 ? userId2 : userId1;

    await redis.hset(`chat:${chatId}:nicknames`, {
      [userId]: nickname.trim(),
    });

    const rawSender = (await fetchRedis("get", `user:${user.id}`)) as string;
    const sender = JSON.parse(rawSender);

    const messageData: Message = {
      id: nanoid(),
      senderId: user.id,
      text: `${user.username} set ${
        user.id === userId ? "their" : userId === friendId ? "your" : "their"
      } nickname to ${nickname.trim()}.`,
      timestamp: Date.now(),
      receiverId: friendId, 
      isNotification: true,
    };
    const message = messageValidator.parse(messageData);

    await redis.zadd(`chat:${chatId}:messages`, {
      score: message.timestamp,
      member: JSON.stringify(message),
    });

    // Trigger real-time update cho cả 2 users trong chat
    const chatChannel = toPusherKey(`chat:${chatId}`);
    const nicknameChannelKey = toPusherKey(
      `chat:${chatId}:nicknames:${user.id}`
    );
    const friendKey = toPusherKey(`user:${friendId}:chats`);
    const currentUserKey = toPusherKey(`user:${user.id}:chats`);
    try {
      // Trigger message notification vào chat channel để hiển thị trong chat
      await Promise.all([
        pusherServer.trigger(chatChannel, "incoming_message", message),

        // Trigger cho user hiện tại (người set nickname) để update UI nickname
        pusherServer.trigger(nicknameChannelKey, "nicknameChanged", {
          userId,
          nickname: nickname.trim(),
        }),

        pusherServer.trigger(friendKey, "new_message", {
          ...message,
          sender: {
            username: sender.username,
            imageUrl: sender.imageUrl,
          },
        }),

        pusherServer.trigger(currentUserKey, "new_message", {
          ...message,
          sender: {
            username: sender.username,
            imageUrl: sender.imageUrl,
          },
        }),
      ]);

      // Trigger cho user kia (nếu khác user hiện tại) để update UI nickname
      const otherUserId = userId1 === user.id ? userId2 : userId1;
      if (otherUserId !== user.id) {
        const otherChannelKey = toPusherKey(
          `chat:${chatId}:nicknames:${otherUserId}`
        );

        await pusherServer.trigger(otherChannelKey, "nicknameChanged", {
          userId,
          nickname: nickname.trim(),
        });
      }
    } catch (pusherError) {
      console.error("❌ Pusher trigger error:", pusherError);
    }

    return NextResponse.json({
      message: "Nickname saved successfully",
      userId,
      nickname: nickname.trim(),
    });
  } catch (error) {
    console.error("Error saving nickname:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint để lấy tất cả nicknames của user
export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");
    if (!chatId) {
      return NextResponse.json(
        { error: "chatId is required" },
        { status: 400 }
      );
    }

    const [userId1, userId2] = chatId.split("--");
    if (userId1 !== user.id && userId2 !== user.id) {
      return NextResponse.json(
        { error: "Access denied to this chat" },
        { status: 403 }
      );
    }

    // Lấy tất cả nicknames của user hiện tại
    const nicknames = (await redis.hgetall(
      `chat:${chatId}:nicknames`
    )) as Record<string, string>;

    return NextResponse.json({
      nicknames: nicknames || {},
    });
  } catch (error) {
    console.error("Error fetching nicknames:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
