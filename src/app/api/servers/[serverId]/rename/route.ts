import { fetchRedis } from "@/lib/hepper/redis";
import { pusherServer } from "@/lib/pusher";
import { redis } from "@/lib/redis";
import { toPusherKey } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import { GroupMessage } from "@/types/group-message";
import { groupMessageValidator } from "@/lib/validation/group-message";
import { UserData } from "@/types/user";

// Validation schema
const renameServerSchema = z.object({
  newName: z
    .string()
    .min(1, { message: "Server name must be at least 1 character" })
    .max(100, { message: "Server name must be less than 100 characters" })
    .trim(),
});

interface ServerData {
  id: string;
  serverName: string;
  serverImage: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ serverId: string }> }
) {
  try {
    // Get user authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get serverId from params
    const { serverId } = await context.params;

    // Parse request body
    const body = await request.json();
    const validation = renameServerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Invalid input",
          errors: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { newName } = validation.data;

    // is member of the server
    const isMember = (await redis.sismember(
      `user:${userId}:servers`,
      serverId
    )) as 1 | 0;
    if (!isMember) {
      return NextResponse.json(
        { messages: "You are not a member of this server" },
        { status: 403 }
      );
    }

    const rawSender = (await fetchRedis("get", `user:${userId}`)) as string;

    if (!rawSender) {
      return NextResponse.json(
        { messages: "Sender not found" },
        { status: 404 }
      );
    }

    // Get current server data from Redis
    const serverData = (await fetchRedis(
      "get",
      `servers:${serverId}`
    )) as string;

    if (!serverData) {
      return NextResponse.json(
        { message: "Server not found" },
        { status: 404 }
      );
    }
    const currentServer: ServerData = JSON.parse(serverData);

    const sender = JSON.parse(rawSender) as UserData;

    const messageData: GroupMessage = {
      id: uuidv4(),
      text: `${sender.username} changed the server name to ${newName}`,
      timestamp: Date.now(),
      sender: sender,
      isNotification: true,
    };
    const message = groupMessageValidator.parse(messageData);

    // Update server data with new name and updated timestamp
    const updatedServer: ServerData = {
      ...currentServer,
      serverName: newName,
      updatedAt: Date.now().toString(),
    };

    await Promise.all([
      redis.zadd(`servers:${serverId}:messages`, {
        score: message.timestamp,
        member: JSON.stringify(message),
      }),
      // Save updated server data back to Redis using redis instance
      await redis.set(`servers:${serverId}`, JSON.stringify(updatedServer)),

      await pusherServer.trigger(
        toPusherKey(`server-${serverId}`),
        "server-renamed",
        {
          serverId,
          newName,
        }
      ),
      await pusherServer.trigger(
        toPusherKey(`server-${serverId}-messages`),
        "server-new-message",
        message
      ),
    ]);

    return NextResponse.json(
      {
        message: "Server name updated successfully",
        serverName: newName,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating server name:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
