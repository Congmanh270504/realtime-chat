import { pusherServer } from "@/lib/pusher";
import { redis } from "@/lib/redis";
import { toPusherKey } from "@/lib/utils";
import { ServerWithLatestMessage } from "@/types/servers";
import { UserData } from "@/types/user";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { serverName, imageUrl } = body;

    if (!serverName || !imageUrl) {
      return NextResponse.json(
        { messages: "Missing required fields" },
        { status: 400 }
      );
    }

    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ messages: "Unauthorized" }, { status: 401 });
    }

    // Create server in DB
    const time = Date.now();
    const serverId = uuidv4();

    const serverData = {
      id: serverId,
      serverName: serverName,
      serverImage: imageUrl,
      ownerId: user.id,
      createdAt: time.toString(),
      updatedAt: time.toString(),
    };

    const userData = {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      imageUrl: user.imageUrl || "",
      username: user.username || "",
      createdAt: user.createdAt || "",
    } as UserData;

    // Save server and associate with user
    await Promise.all([
      await redis.set(`servers:${serverId}`, JSON.stringify(serverData)),
      redis.sadd(`servers:${serverId}:members`, userData),

      await redis.sadd(`user:${user.id}:servers`, serverId),
      // trigger pusher event to update user's server list in real-time
      pusherServer.trigger(
        toPusherKey(`user:${user.id}:servers`),
        "new-server",
        {
          server: {
            id: serverId,
            serverName: serverData.serverName,
            serverImage: serverData.serverImage,
            ownerId: serverData.ownerId,
            createdAt: parseInt(serverData.createdAt),
            updatedAt: parseInt(serverData.updatedAt),
            latestMessage: {
              id: "",
              text: "Welcome to the server! Start chatting.",
              timestamp: 0,
              sender: userData,
              isNotification: false,
            },
          } as ServerWithLatestMessage,
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
