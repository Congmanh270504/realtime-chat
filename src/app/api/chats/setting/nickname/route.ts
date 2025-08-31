import { pusherServer } from "@/lib/pusher";
import { redis } from "@/lib/redis";
import { toPusherKey } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

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

    // Set nickname for the specific user
    // Key format: user:{currentUserId}:nicknames
    // Field: userId, Value: nickname
    await redis.hset(`user:${user.id}:nicknames`, {
      [userId]: nickname.trim(),
    });


    // Trigger real-time update cho cả 2 users trong chat
    const channelKey = toPusherKey(`chat:${chatId}:nicknames:${user.id}`);

    // Trigger cho user hiện tại (người set nickname)
    await pusherServer.trigger(channelKey, "nicknameChanged", {
      userId,
      nickname: nickname.trim(),
    });

    // Trigger cho user kia (nếu khác user hiện tại)
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
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Lấy tất cả nicknames của user hiện tại
    const nicknames = (await redis.hgetall(
      `user:${user.id}:nicknames`
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
