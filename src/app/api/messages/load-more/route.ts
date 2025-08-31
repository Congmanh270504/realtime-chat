import { fetchRedis } from "@/lib/hepper/redis";
import { messageArrayValidator } from "@/lib/validation/message";
import { Message } from "@/types/message";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chatId, offset, limit } = body;

    // Verify user authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user has access to this chat
    const [userId1, userId2] = chatId.split("--");
    if (userId1 !== user.id && userId2 !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch messages from Redis with pagination
    const result = (await fetchRedis(
      "zrevrange",
      `chat:${chatId}:messages`,
      offset,
      offset + limit - 1
    )) as string[];

    const dbMessages = result.map((message) => JSON.parse(message) as Message);
    const messages = messageArrayValidator.parse(dbMessages);

    // Return messages in chronological order (oldest first for the batch)
    return NextResponse.json({
      messages: messages.reverse(),
      hasMore: messages.length === limit,
    });
  } catch (error) {
    console.error("Error loading more messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
