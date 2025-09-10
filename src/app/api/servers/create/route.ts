import { pusherServer } from "@/lib/pusher";
import { redis } from "@/lib/redis";
import { toPusherKey } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log(body);
    const { serverName, imageUrl } = body;

    if (!serverName || !imageUrl) {
      return NextResponse.json(
        { messages: "Missing required fields" },
        { status: 400 }
      );
    }
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ messages: "Unauthorized" }, { status: 401 });
    }

    // Create server in DB
    const time = Date.now();
    const serverId = uuidv4();

    const serverData = {
      id: serverId,
      serverName: serverName,
      serverImage: imageUrl,
      ownerId: userId,
      createdAt: time.toString(),
      updatedAt: time.toString(),
    };

    // Save server and associate with user
    await Promise.all([
      await redis.set(`servers:${serverId}`, JSON.stringify(serverData)),
      await redis.sadd(`user:${userId}:servers`, serverId),
      // trigger pusher event to update user's server list in real-time
      pusherServer.trigger(
        toPusherKey(`user:${userId}:servers`),
        "new-server",
        {
          server: {
            serverData: serverData,
            id: serverId,
            text: "Welcome to the server!",
            timestamp: Date.now(),
            sender: {
              id: userId,
              email: "",
              firstName: "",
              lastName: "",
              imageUrl: "",
              username: "",
              createdAt: new Date().toISOString(),
            },
            isNotification: false,
          },
        }
      ),
    ]);

    return NextResponse.json(
      { url: `/servers/${serverId}`, messages: "Server created" },
      { status: 201 }
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
