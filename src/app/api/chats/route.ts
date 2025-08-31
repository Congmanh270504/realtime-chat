import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const { chatId } = await req.json();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const isFriend = chatId.includes(user.id);
    if (!isFriend) {
      return NextResponse.json(
        { message: "Forbidden to delete chat" },
        { status: 403 }
      );
    }

    // delete one side not both side 


    return NextResponse.json({
      message: "Chat deleted successfully",
      status: 200,
    });
  } catch {
    return NextResponse.json(
      { message: "Failed to delete chat" },
      { status: 500 }
    );
  }
}
