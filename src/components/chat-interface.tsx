"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Copy,
  Download,
  ThumbsUp,
  ThumbsDown,
  Phone,
  Video,
  Info,
  Send,
  EllipsisVertical,
  SmilePlus,
  Trash,
} from "lucide-react";
import { cn, toPusherKey } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Message } from "@/types/message";
import { UserData } from "@/types/user";
import {
  formatTimestamp,
  shouldShowTimeDivider,
} from "@/lib/hepper/format-time";
import { TimeDivider } from "./time-divider";
import { pusherClient } from "@/lib/pusher";
import { useIsMobile } from "@/hooks/use-mobile";
import ChatReactIcons from "./chat-react-icons";
import Emoji from "./emoji";

interface ChatInterfaceProps {
  initialMessages: Message[];
  currentUser: UserData;
  chatId: string; // Optional chatId if needed for the API call
  chatPartner: UserData;
}

export default function ChatInterface({
  initialMessages,
  currentUser,
  chatId,
  chatPartner,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`chat:${chatId}`));

    const messageHandler = (data: Message) => {
      setMessages((prev) => [...prev, data]); // check if message display is wrong order
    };

    pusherClient.bind("incoming_message", messageHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`));
      pusherClient.unbind("incoming_message", messageHandler);
    };
  }, [currentUser.id]);

  const handleAddMessage = async () => {
    if (!input) return;
    try {
      setIsLoading(true);
      await fetch("/api/messages/send", {
        method: "POST",
        body: JSON.stringify({ text: input, chatId }),
      });
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setInput((prev) => prev + emoji);
  };

  return (
    <div className="h-full flex flex-col w-full relative ">
      <div className="sticky top-3 right-0 z-10 bg-green-100 px-6 py-4 border-b flex items-center justify-between rounded-2xl mx-6 mt-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage
              src={
                chatPartner.imageUrl ||
                "/placeholder.svg?height=32&width=32&query=user avatar"
              }
              alt={"User image"}
            />
            <AvatarFallback className="rounded-lg">
              {chatPartner.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div>
            <h2 className="font-semibold text-gray-900">
              {chatPartner.username}
            </h2>
            <p className="text-sm text-gray-600">Đang hoạt động</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-green-600 hover:bg-green-200"
          >
            <Phone className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-green-600 hover:bg-green-200"
          >
            <Video className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-green-600 hover:bg-green-200"
          >
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-6 py-4">
        <div className="space-y-4 w-full px-4 pb-6 md:space-y-6">
          {messages.map((message, index) => {
            const isCurrentUser = message.senderId === currentUser.id;
            const previousMessage = index > 0 ? messages[index - 1] : undefined;
            const timeDivider = shouldShowTimeDivider(
              message.timestamp,
              previousMessage?.timestamp
            );
            const isHovered = hoveredMessageId === message.id;
            return (
              <div key={`${message.id}-${message.timestamp}`}>
                {/* Time Divider */}
                {timeDivider.show && timeDivider.content && (
                  <TimeDivider content={timeDivider.content} />
                )}

                {/* Message */}
                <div
                  className={cn(
                    "flex w-full",
                    isCurrentUser ? "justify-end" : "justify-start"
                  )}
                  onMouseEnter={() => setHoveredMessageId(message.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                >
                  <div
                    className={cn(
                      "flex gap-3 ",
                      isCurrentUser && "flex-row-reverse",
                      isMobile ? "w-full" : ""
                    )}
                  >
                    {!isCurrentUser && (
                      // <div className="h-8 w-8 rounded-full bg-primary flex-shrink-0" />
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage
                          src={chatPartner.imageUrl}
                          alt={
                            chatPartner.username
                              ? chatPartner.username
                              : "User image"
                          }
                        />
                        <AvatarFallback className="rounded-lg">
                          {" "}
                          {chatPartner.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="space-y-2 flex w-full gap-2 max-w-xl">
                      <div
                        className={cn(
                          "w-full",
                          isCurrentUser ? "order-2" : "order-1"
                        )}
                      >
                        <div
                          className={cn(
                            "flex items-center gap-2",
                            isCurrentUser && "flex-row-reverse"
                          )}
                        >
                          <span className="text-sm font-medium">
                            {isCurrentUser ? null : chatPartner.username}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </div>
                        <div
                          className={cn(
                            "flex items-center gap-2",
                            isCurrentUser && "flex-row-reverse"
                          )}
                        >
                          <div
                            className={cn(
                              "p-3 rounded-lg",
                              !isCurrentUser
                                ? "bg-muted/50"
                                : "bg-primary text-primary-foreground"
                            )}
                          >
                            <p className="text-sm whitespace-pre-wrap">
                              {message.text}
                            </p>
                          </div>
                          {isMobile && (
                            <DropdownMenu>
                              <DropdownMenuTrigger>
                                <EllipsisVertical className="h-6 w-6 bg-gray-300 rounded-full p-1" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>
                                  Copy
                                  <Copy className="h-4 w-4" />
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  {" "}
                                  Delete
                                  <Trash className="h-4 w-4 text-red-500" />
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Like
                                  <ThumbsUp className="h-4 w-4" />
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  DisLike
                                  <ThumbsDown className="h-4 w-4" />
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                      {!isMobile && (
                        <div
                          className={cn(
                            "flex items-center transition-opacity duration-200",
                            isCurrentUser ? "order-1" : "order-2",
                            isHovered ? "opacity-100" : "opacity-0"
                          )}
                        >
                          <ChatReactIcons />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      {/* input chat */}
      <div className="px-6 py-4 border-t bg-background flex-shrink-0 sticky bottom-0 left-0 right-0">
        <div className="flex gap-2 items-center">
          <Textarea
            placeholder="Type a message"
            value={input}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddMessage();
              }
            }}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[44px] max-h-32 resize-none"
          />

          <Emoji onEmojiSelect={handleEmojiSelect} />

          <Button
            className="px-8"
            onClick={handleAddMessage}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : <Send />}
          </Button>
        </div>
      </div>
    </div>
  );
}
