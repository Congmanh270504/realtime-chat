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
    const idToAdd = (await fetchRedis("get", `user:email:${email}`)) as string;

    if (!idToAdd) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.id === idToAdd) {
      return NextResponse.json(
        { message: "You cannot add yourself as a friend" },
        { status: 400 }
      );
    }

    // check if user is already added
    const isAlreadyAdded = (await fetchRedis(
      "sismember",
      `user:${idToAdd}:incoming_friend_requests`,
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
      idToAdd
    )) as 0 | 1;

    if (isAlreadyFriends) {
      return NextResponse.json(
        { message: "Already friends with this user" },
        { status: 400 }
      );
    }

    await pusherServer.trigger(
      toPusherKey(`user:${idToAdd}:incoming_friend_requests`),
      "incoming_friend_requests",
      {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        imageUrl: user.imageUrl,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      } as UserData
    );

    await redis.sadd(`user:${idToAdd}:incoming_friend_requests`, user.id);

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
