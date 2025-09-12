import { pusherServer } from "@/lib/pusher";
import { redis } from "@/lib/redis";
import { toPusherKey } from "@/lib/utils";
import {
  GroupMessage,
  groupMessageValidator,
} from "@/lib/validation/group-message";
import { UserData } from "@/types/user";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { serverId } = await request.json();
  try {
    if (!serverId) {
      return NextResponse.json(
        { message: "Server ID is required" },
        { status: 400 }
      );
    }
    const isMember = await redis.sismember(`user:${userId}:servers`, serverId);
    if (!isMember) {
      return NextResponse.json(
        { message: "You are not a member of this server" },
        { status: 403 }
      );
    }

    const userData = (await redis.get(`user:${userId}`)) as UserData | null;
    if (!userData) {
      return NextResponse.json(
        {
          messages: "User not found",
        },
        { status: 404 }
      );
    }

    const messageData: GroupMessage = {
      id: uuidv4(),
      text: `${userData.username} just left the server 😥`,
      timestamp: Date.now(),
      sender: userData,
      isNotification: true,
    };

    const message = groupMessageValidator.parse(messageData);

    await Promise.all([
      await redis.zadd(`servers:${serverId}:messages`, {
        score: message.timestamp,
        member: JSON.stringify(message),
      }),
      await redis.srem(`user:${userId}:servers`, serverId),
      await redis.srem(`servers:${serverId}:members`, userId),
      pusherServer.trigger(
        toPusherKey(`server-${serverId}-messages`),
        "server-new-message",
        message
      ),
      pusherServer.trigger(
        toPusherKey(`server-${serverId}`),
        "user-out-server",
        serverId
      ),
    ]);
    // await redis.zadd
    return NextResponse.json(
      { message: "Successfully left the server" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error leaving server:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
