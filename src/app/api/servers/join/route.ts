import { redis } from "@/lib/redis";
import { UserData } from "@/types/user";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { promise } from "zod";

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

    const serverExists = await redis.exists(`servers:${inviteLink}`);
    if (!serverExists) {
      return NextResponse.json(
        {
          messages: "Server not found",
        },
        { status: 404 }
      );
    }

    const isMember = await redis.sismember(`user:${userId}:servers`, inviteLink);
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

    // Add user to server members set and server to user's servers set
    await Promise.all([
      redis.sadd(`servers:${inviteLink}:members`, userData),
      redis.sadd(`user:${userId}:servers`, inviteLink),
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
