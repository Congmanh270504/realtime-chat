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
      const { id } = evt.data;
      try {
        console.log(
          `Received webhook with ID ${id} and event type of ${eventType}`
        );
        console.log("Webhook payload:", evt.data);
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
        console.log(
          `Received webhook with ID ${id} and event type of ${eventType}`
        );
        console.log("Webhook payload:", evt.data);
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
