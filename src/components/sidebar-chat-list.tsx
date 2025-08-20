import { chatHrefConstructor } from "@/lib/utils";
import { Message } from "@/types/message";
import { UserData } from "@/types/user";
import { SignIn } from "@clerk/clerk-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface SidebarChatListProps {
  friends: UserData[];
}

const SidebarChatList = ({ friends }: SidebarChatListProps) => {
  //   const router = useRouter();
  const { user } = useUser();

  const pathName = usePathname();
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (pathName.includes("chat")) {
      setUnseenMessages((prev) => {
        return prev.filter((msg) => !pathName.includes(msg.senderId));
      });
    }
  }, [pathName]);

  if (!user) {
    return <SignIn />;
  }
  return (
    <div className="h-screen overflow-y-auto space-y-1">
      {friends.sort().map((friend) => {
        const unseenMessagesCount = unseenMessages.filter((msg) => {
          return msg.senderId === friend.id;
        }).length;
        return (
          <Link
            key={friend.id}
            href={`${chatHrefConstructor(user?.id, friend.id)}`}
            className="bg-gray-400 flex items-center justify-between gap-3 p-3 hover:bg-gray-300 rounded-lg"
          >
            <div className="flex items-center gap-2">
              {/* {friend.firstName} {friend.lastName} */}
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={friend.imageUrl}
                  alt={friend.username ? friend.username : "User image"}
                />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                {" "}
                <span>{friend.username}</span>
                <span>fadsfdsa</span>
              </div>
            </div>
            {unseenMessagesCount > 0 ? (
              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {unseenMessagesCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
};

export default SidebarChatList;
