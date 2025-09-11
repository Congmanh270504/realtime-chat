import { fetchRedis } from "@/lib/hepper/redis";
import { pusherServer } from "@/lib/pusher";
import { redis } from "@/lib/redis";
import { toPusherKey } from "@/lib/utils";
import { groupMessageValidator } from "@/lib/validation/group-message";
import { GroupMessage } from "@/types/group-message";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, serverId }: { text: string; serverId: string } = body;
    if (!text || !serverId) {
      return NextResponse.json(
        { messages: "Missing required fields" },
        { status: 400 }
      );
    }
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ messages: "Unauthorized" }, { status: 401 });
    }
    // is member of the server
    const isMember = (await redis.sismember(
      `user:${userId}:servers`,
      serverId
    )) as 1 | 0;
    if (!isMember) {
      return NextResponse.json(
        { messages: "You are not a member of this server" },
        { status: 403 }
      );
    }
    const rawSender = (await fetchRedis("get", `user:${userId}`)) as string;
    if (!rawSender) {
      return NextResponse.json(
        { messages: "Sender not found" },
        { status: 404 }
      );
    }

    const sender = JSON.parse(rawSender);

    const messageData: GroupMessage = {
      id: uuidv4(),
      text,
      timestamp: Date.now(),
      sender: sender,
    };
    const message = groupMessageValidator.parse(messageData);

    await redis.zadd(`servers:${serverId}:messages`, {
      score: message.timestamp,
      member: JSON.stringify(message),
    });

    // Trigger for server chat interface
    pusherServer.trigger(
      toPusherKey(`server-${serverId}-messages`),
      "server-new-message",
      {
        ...message,
        serverId: serverId,
      }
    );

    return NextResponse.json(
      { message: "Message sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Message sending error:", error);
    return NextResponse.json(
      {
        messages:
          "Error sending message: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}
