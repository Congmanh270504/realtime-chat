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
        { messages: "You cannot add yourself as a friend" },
        { status: 400 }
      );
    }

    // check if user is already friends
    const isAlreadyFriends = await fetchRedis(
      "sismember",
      `user:${user.id}:friends`,
      friendId
    );

    if (isAlreadyFriends) {
      return NextResponse.json(
        { messages: "Already friends with this user" },
        { status: 400 }
      );
    }

    // check if no friend request exists
    const isAlreadyAdded = (await fetchRedis(
      "sismember",
      `user:${user.id}:incoming_friend_requests`,
      friendId
    )) as 0 | 1;

    if (!isAlreadyAdded) {
      return NextResponse.json(
        { messages: "Friend request not found" },
        { status: 404 }
      );
    }

    const [currentUserRaw, friendRaw] = await Promise.all([
      fetchRedis("get", `user:${user.id}`),
      fetchRedis("get", `user:${friendId}`),
    ]);
    const thisUser = JSON.parse(currentUserRaw) as UserData;
    const friend = JSON.parse(friendRaw) as UserData;

    await Promise.all([
      // notify added user
      pusherServer.trigger(
        toPusherKey(`user:${friendId}:friends`),
        "new_friend",
        thisUser
      ),

      pusherServer.trigger(
        toPusherKey(`user:${user.id}:friends`),
        "new_friend",
        friend
      ),
      
      redis.sadd(`user:${user.id}:friends`, friendId),
      redis.sadd(`user:${friendId}:friends`, user.id),

      redis.srem(`user:${friendId}:incoming_friend_requests`, user.id),
      redis.srem(`user:${user.id}:incoming_friend_requests`, friendId),
    ]);

    return NextResponse.json(
      { messages: "Friend request accepted" },
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
