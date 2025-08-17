import { fetchRedis } from "@/lib/hepper/redis";
import { redis } from "@/lib/redis";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;
    if (!email) {
      return NextResponse.json(
        { messages: "Email is missing" },
        { status: 400 }
      );
    }
    const idToAdd = (await fetchRedis("get", `user:email:${email}`)) as string;

    if (!idToAdd) {
      return NextResponse.json({ messages: "User not found" }, { status: 404 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ messages: "Unauthorized" }, { status: 401 });
    }

    if (user.id === idToAdd) {
      return NextResponse.json(
        { messages: "You cannot add yourself as a friend" },
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
        { messages: "Friend already added" },
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
      // Sửa lại để consistent với format response khác
      return NextResponse.json(
        { messages: "Already friends with this user" },
        { status: 400 }
      );
    }

    // await pusherServer.trigger(
    //   toPusherKey(`user:${idToAdd}:incoming_friend_requests`),
    //   "incoming_friend_requests",
    //   {
    //     senderId: session.user.id,
    //     senderEmail: session.user.email,
    //   }
    // );

    await redis.sadd(`user:${idToAdd}:incoming_friend_requests`, user.id);

    return NextResponse.json(
      { messages: "Add friend successfully" },
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
