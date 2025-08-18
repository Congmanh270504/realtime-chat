import { fetchRedis } from "@/lib/hepper/redis";
import { redis } from "@/lib/redis";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const { friendId } = await req.json();

    if (!friendId) {
      return NextResponse.json(
        { message: "Missing friend ID" },
        { status: 400 }
      );
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ messages: "Unauthorized" }, { status: 401 });
    }

    if (user.id === friendId) {
      return NextResponse.json(
        { messages: "You cannot deny yourself as a friend" },
        { status: 400 }
      );
    }

    await redis.srem(`user:${user.id}:incoming_friend_requests`, friendId);

    return NextResponse.json(
      { messages: "Friend request denied" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { messages: "Internal server error" },
      { status: 500 }
    );
  }
}
