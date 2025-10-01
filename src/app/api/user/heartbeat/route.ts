import { redis } from "@/lib/redis";
import { auth } from "@clerk/nextjs/server";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const now = Date.now();

    // Update heartbeat with 1 hour expiry
    await Promise.all([
      redis.setex(`user:${userId}:heartbeat`, 3600, now.toString()),
      // Ensure user is marked as online
      redis.set(`user:${userId}:status`, "online"),
    ]);

    return new Response("Heartbeat updated", { status: 200 });
  } catch (error) {
    console.error("Error updating heartbeat:", error);
    return new Response("Error updating heartbeat", { status: 500 });
  }
}
