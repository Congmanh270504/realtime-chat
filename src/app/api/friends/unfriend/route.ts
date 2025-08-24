import { fetchRedis } from "@/lib/hepper/redis";
import { pusherServer } from "@/lib/pusher";
import { redis } from "@/lib/redis";
import { toPusherKey } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { friendId } = await req.json();

    if (!friendId) {
      return NextResponse.json(
        { message: "Missing friendId" },
        { status: 400 }
      );
    }
    console.log("friendId to unfriend:", friendId);

    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // check if user is already friends
    const isAlreadyFriends = (await fetchRedis(
      "sismember",
      `user:${user.id}:friends`,
      friendId
    )) as 0 | 1;

    if (!isAlreadyFriends) {
      return NextResponse.json(
        { messages: "Not friends with this user" },
        { status: 400 }
      );
    }
    await Promise.all([
      pusherServer.trigger(
        toPusherKey(`user:${friendId}:unfriended`),
        "friend_unfriended",
        user.id
      ),
      pusherServer.trigger(
        toPusherKey(`user:${user.id}:unfriended`),
        "friend_unfriended",
        friendId
      ),

      redis.srem(`user:${user.id}:friends`, friendId),
      redis.srem(`user:${friendId}:friends`, user.id),
    ]);

    // Unfriend logic here

    return NextResponse.json(
      { message: "Unfriended successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error parsing request:", error);
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}
