import { currentUser } from "@clerk/nextjs/server";
import { getFriendsByUserId } from "@/lib/hepper/get-friends";
import { MessageSquare } from "lucide-react";
import MessagesContent from "./messages-content";
import { fetchRedis } from "@/lib/hepper/redis";
import { Message } from "@/types/message";

const MessagesPage = async () => {
  const user = await currentUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600">
            Please sign in to view messages
          </h2>
        </div>
      </div>
    );
  }

  const initialFriendsMessages = await getFriendsByUserId(user.id);
  const friendsWithLastMessage = await Promise.all(
    initialFriendsMessages.map(async (friendMessages) => {
      const sortedIds = [user.id, friendMessages.id].sort();
      const [lastMessageRaw] = await fetchRedis(
        "zrange",
        `chat:${sortedIds[0]}--${sortedIds[1]}:messages`,
        -1,
        -1
      );
      if (!lastMessageRaw) {
        return {
          ...friendMessages,
          lastMessage: {
            id: "",
            text: "You are now friends! Let's chat together.",
            senderId: "",
            timestamp: 0,
          } as Message,
        };
      } else {
        const lastMessage = JSON.parse(lastMessageRaw) as Message;
        return {
          ...friendMessages,
          lastMessage,
        };
      }
    })
  );

  return (
    <MessagesContent initialFriends={friendsWithLastMessage} userId={user.id} />
  );
};

export default MessagesPage;
