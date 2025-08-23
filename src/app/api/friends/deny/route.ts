import { fetchRedis } from "@/lib/hepper/redis";
import { pusherServer } from "@/lib/pusher";
import { redis } from "@/lib/redis";
import { toPusherKey } from "@/lib/utils";
import { UserData } from "@/types/user";
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
    const friend = await fetchRedis("get", `user:${friendId}`);

    pusherServer.trigger(
      toPusherKey(`user:${user.id}:friend_request_denied`),
      "friend_request_denied",
      JSON.parse(friend) as UserData
    );

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
