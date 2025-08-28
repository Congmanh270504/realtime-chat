import { fetchRedis } from "@/lib/hepper/redis";
import { redis } from "@/lib/redis";
import { UserData } from "@/types/user";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    if (!secret) return new Response("Missing secret", { status: 500 });

    const evt = await verifyWebhook(req);

    const { id } = evt.data;
    const eventType = evt.type;
    console.log(
      `Received webhook with ID ${id} and event type of ${eventType}`
    );
    console.log("Webhook payload:", evt.data);

    if (evt.type === "user.created") {
      const {
        id,
        email_addresses,
        first_name,
        last_name,
        image_url,
        username,
      } = evt.data;
      try {
        // Lưu thông tin user vào Redis
        const userData: UserData = {
          id,
          email: email_addresses?.[0]?.email_address || "",
          firstName: first_name || "",
          lastName: last_name || "",
          imageUrl: image_url || "",
          username: username || "",
          createdAt: new Date().toISOString(),
        };

        await redis.set(`user:${userData.id}`, JSON.stringify(userData));
        await redis.set(`user:email:${userData.email}`, userData.id);

        // Set initial offline status
        await redis.set(`user:${userData.id}:status`, "offline");

        return new Response("User created successfully", { status: 200 });
      } catch (error) {
        console.error("Error creating user:", error);
        return new Response("Error creating user", { status: 500 });
      }
    }

    if (evt.type === "user.deleted") {
      const { id } = evt.data;
      try {
        if (!id) {
          return new Response("User ID is required", { status: 400 });
        }

        // Xóa user khỏi Redis
        await redis.del(`user:${id}`);
        await redis.del(`user:${id}:status`);
        await redis.del(`user:${id}:heartbeat`);
        console.log(`User ${id} deleted from Redis successfully`);

        return new Response("User deleted successfully", { status: 200 });
      } catch (error) {
        console.error("Error deleting user:", error);
        return new Response("Error deleting user", { status: 500 });
      }
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
