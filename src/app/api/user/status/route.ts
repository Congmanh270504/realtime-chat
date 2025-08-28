import { redis } from "@/lib/redis";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

// Set user online and update heartbeat
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const now = Date.now();

    // Set user status to online
    await redis.set(`user:${userId}:status`, "online");

    // Set heartbeat with 1 hour expiry
    await redis.setex(`user:${userId}:heartbeat`, 3600, now.toString());

    return new Response("Status updated", { status: 200 });
  } catch (error) {
    console.error("Error updating user status:", error);
    return new Response("Error updating status", { status: 500 });
  }
}

// Get user status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId");

    if (!targetUserId) {
      return new Response("User ID required", { status: 400 });
    }

    const status = await redis.get(`user:${targetUserId}:status`);
    const heartbeat = await redis.get(`user:${targetUserId}:heartbeat`);

    // Check if heartbeat has expired (older than 1 hour)
    if (heartbeat) {
      const lastSeen = parseInt(heartbeat as string);
      const now = Date.now();
      const hourInMs = 60 * 60 * 1000;

      if (now - lastSeen > hourInMs) {
        // Update status to offline if heartbeat expired
        await redis.set(`user:${targetUserId}:status`, "offline");
        return Response.json({ status: "offline", lastSeen });
      }
    }

    return Response.json({
      status: status || "offline",
      lastSeen: heartbeat ? parseInt(heartbeat as string) : null,
    });
  } catch (error) {
    console.error("Error getting user status:", error);
    return new Response("Error getting status", { status: 500 });
  }
}
