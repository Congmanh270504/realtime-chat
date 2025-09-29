import { getMutualFriends } from "@/lib/hepper/get-friends";
import { fetchRedis } from "@/lib/hepper/redis";
import { pusherServer } from "@/lib/pusher";
import { redis } from "@/lib/redis";
import { toPusherKey } from "@/lib/utils";
import { UserData } from "@/types/user";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;
    if (!email) {
      return NextResponse.json(
        { message: "Email is missing" },
        { status: 400 }
      );
    }
    const userAddRaw = (await fetchRedis(
      "get",
      `user:email:${email}`
    )) as string;
    const userAdd = JSON.parse(userAddRaw) as UserData;

    if (!userAdd) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.id === userAdd.id) {
      return NextResponse.json(
        { message: "You cannot add yourself as a friend" },
        { status: 400 }
      );
    }

    // check if user is already added
    const isAlreadyAdded = (await fetchRedis(
      "sismember",
      `user:${userAdd.id}:incoming_friend_requests`,
      user.id
    )) as 0 | 1;

    if (isAlreadyAdded) {
      return NextResponse.json(
        { message: "Friend already added" },
        { status: 400 }
      );
    }

    // check if user is already friends
    const isAlreadyFriends = (await fetchRedis(
      "sismember",
      `user:${user.id}:friends`,
      userAdd.id
    )) as 0 | 1;

    if (isAlreadyFriends) {
      return NextResponse.json(
        { message: "Already friends with this user" },
        { status: 400 }
      );
    }

    const friendRequestsWithMutual = await getMutualFriends(
      user.id,
      userAdd.id
    );

    await pusherServer.trigger(
      toPusherKey(`user:${userAdd.id}:incoming_friend_requests`),
      "incoming_friend_requests",
      {
        requestUser: user,
        mutualFriends: friendRequestsWithMutual,
        mutualCount: friendRequestsWithMutual.length,
      }
    );

    await redis.sadd(`user:${userAdd.id}:incoming_friend_requests`, user.id);

    return NextResponse.json(
      { message: "Add friend successfully" },
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
