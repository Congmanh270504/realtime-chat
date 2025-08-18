import { getFriendsByUserId } from "@/lib/hepper/get-friends";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ messages: "Missing userId" }, { status: 400 });
  }

  const friends = await getFriendsByUserId(userId);

  return NextResponse.json({ friends: friends }, { status: 200 });
}
