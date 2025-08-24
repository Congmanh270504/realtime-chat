import { fetchRedis } from "@/lib/hepper/redis";
import { pusherServer } from "@/lib/pusher";
import { redis } from "@/lib/redis";
import { toPusherKey } from "@/lib/utils";
import { Message } from "@/types/message";
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
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.id === friendId) {
      return NextResponse.json(
        { message: "You cannot add yourself as a friend" },
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
        { message: "Already friends with this user" },
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
        { message: "Friend request not found" },
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
        {
          ...thisUser,
          lastMessage: {
            id: "",
            text: "You are now friends! Let's chat together.",
            senderId: "",
            receiverId: "",
            timestamp: 0,
          } as Message,
        }
      ),

      pusherServer.trigger(
        toPusherKey(`user:${user.id}:friends`),
        "new_friend",
        {
          ...friend,
          lastMessage: {
            id: "",
            text: "You are now friends! Let's chat together.",
            senderId: "",
            receiverId: "",
            timestamp: 0,
          } as Message,
        }
      ),

      redis.sadd(`user:${user.id}:friends`, friendId),
      redis.sadd(`user:${friendId}:friends`, user.id),

      redis.srem(`user:${friendId}:incoming_friend_requests`, user.id),
      redis.srem(`user:${user.id}:incoming_friend_requests`, friendId),
    ]);

    return NextResponse.json(
      { message: "Friend request accepted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
