import { pusherServer } from "@/lib/pusher";
import { redis } from "@/lib/redis";
import { toPusherKey } from "@/lib/utils";
import { GroupMessage } from "@/types/group-message";
import { Servers } from "@/types/servers";
import { UserData } from "@/types/user";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { promise } from "zod";
import { v4 as uuidv4 } from "uuid";
import { groupMessageValidator } from "@/lib/validation/group-message";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ messages: "Unauthorized" }, { status: 401 });
  }
  const { inviteLink } = await request.json();
  try {
    if (!inviteLink) {
      return NextResponse.json(
        {
          messages: "Invite link is required",
        },
        { status: 400 }
      );
    }

    const serverData = (await redis.get(`servers:${inviteLink}`)) as Servers;

    if (!serverData) {
      return NextResponse.json(
        {
          messages: "Server not found",
        },
        { status: 404 }
      );
    }

    const isMember = await redis.sismember(
      `user:${userId}:servers`,
      inviteLink
    );
    if (isMember) {
      return NextResponse.json(
        { messages: "Already a member of the server" },
        { status: 400 }
      );
    }

    const userData = (await redis.get(`user:${userId}`)) as UserData | null;
    if (!userData) {
      return NextResponse.json(
        {
          messages: "User not found",
        },
        { status: 404 }
      );
    }

    const messageData: GroupMessage = {
      id: uuidv4(),
      text: `${userData.username} just joined the server`,
      timestamp: Date.now(),
      sender: userData,
      isNotification: true,
    };
    const message = groupMessageValidator.parse(messageData);

    // Add user to server members set and server to user's servers set
    await Promise.all([
      await redis.zadd(`servers:${inviteLink}:messages`, {
        score: message.timestamp,
        member: JSON.stringify(message),
      }),
      redis.sadd(`servers:${inviteLink}:members`, userData),
      redis.sadd(`user:${userId}:servers`, inviteLink),
      pusherServer.trigger(
        toPusherKey(`user:${userId}:servers`),
        "new-server",
        { server: serverData }
      ),
      pusherServer.trigger(
        toPusherKey(`server-${inviteLink}-messages`),
        "server-new-message",
        message
      ),
    ]);

    return NextResponse.json(
      {
        messages: "Joined server successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Server creation error:", error);
    return NextResponse.json(
      {
        messages:
          "Error creating server: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}
