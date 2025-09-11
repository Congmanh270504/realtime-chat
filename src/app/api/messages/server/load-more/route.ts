import { fetchRedis } from "@/lib/hepper/redis";
import { redis } from "@/lib/redis";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      serverId,
      offset,
      limit,
    }: { serverId: string; offset: number; limit: number } = body;

    if (!serverId || offset === undefined || limit === undefined) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if user is member of the server
    const isMember = (await redis.sismember(
      `user:${userId}:servers`,
      serverId
    )) as 1 | 0;

    if (!isMember) {
      return NextResponse.json(
        { message: "You are not a member of this server" },
        { status: 403 }
      );
    }

    // Get messages from Redis with offset and limit
    // ZREVRANGE để lấy messages từ mới nhất đến cũ nhất
    const messageRaws = (await fetchRedis(
      "zrevrange",
      `servers:${serverId}:messages`,
      offset,
      offset + limit - 1
    )) as string[];

    const messages = messageRaws.map((raw) => JSON.parse(raw));

    // Reverse to get chronological order (oldest first)
    messages.reverse();

    return NextResponse.json(
      {
        messages,
        hasMore: messages.length === limit,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error loading more server messages:", error);
    return NextResponse.json(
      {
        message:
          "Error loading messages: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}
