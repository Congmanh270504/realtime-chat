"use client";

import { useEffect, useState, useRef } from "react";
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
  ThumbsUp,
  ThumbsDown,
  Info,
  Send,
  EllipsisVertical,
  Trash,
} from "lucide-react";
import { cn, toPusherKey } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Message } from "@/types/message";
import { UserData } from "@/types/user";
import {
  formatTimestamp,
  shouldShowTimeDivider,
} from "@/lib/hepper/format-time";
import { TimeDivider } from "../time-divider";
import { pusherClient } from "@/lib/pusher";
import { useIsMobile } from "@/hooks/use-mobile";
import ChatReactIcons from "../chat-react-icons";
import Emoji from "../emoji";
import { toast } from "sonner";
import { OnlineStatusIndicator } from "../online-status-partner";
import { useDocumentTitle } from "@/hooks/use-document-title";

interface ChatInterfaceProps {
  initialMessages: Message[];
  currentUser: UserData;
  chatId: string; // Optional chatId if needed for the API call
  chatPartner: UserData;
  handleCloseProfile?: () => void;
}

export default function ChatInterface({
  initialMessages,
  currentUser,
  chatId,
  chatPartner,
  handleCloseProfile,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Hook quản lý title
  const { changeTitle } = useDocumentTitle({
    newMessageTitle: `💬 New message from ${chatPartner.username}`,
    originalTitle: `Chat with ${chatPartner.username} - Thomas`,
    resetDelay: 10000,
  });

  useEffect(() => {
    // Đảm bảo kết nối tới Pusher
    const chatChannel = toPusherKey(`chat:${chatId}`);

    pusherClient.subscribe(chatChannel);

    const messageHandler = (data: Message) => {
      // Kiểm tra nếu tin nhắn không phải từ người dùng hiện tại
      if (data.senderId !== currentUser.id) {
        // Thay đổi title khi có tin nhắn mới từ người khác
        changeTitle();
      }

      setMessages((prev) => {
        // Tìm và thay thế optimistic message nếu có
        const optimisticIndex = prev.findIndex(
          (msg) =>
            msg.senderId === data.senderId &&
            msg.text === data.text &&
            msg.id.startsWith("temp-") &&
            Math.abs(msg.timestamp - data.timestamp) < 5000 // trong vòng 5 giây
        );

        if (optimisticIndex !== -1) {
          // Thay thế optimistic message bằng message thật
          const newMessages = [...prev];
          newMessages[optimisticIndex] = data;
          return newMessages;
        }

        // Kiểm tra xem message đã tồn tại chưa để tránh duplicate
        const exists = prev.some((msg) => msg.id === data.id);
        if (exists) return prev;

        return [...prev, data];
      });
    };

    pusherClient.bind("incoming_message", messageHandler);

    return () => {
      pusherClient.unsubscribe(chatChannel);
      pusherClient.unbind("incoming_message", messageHandler);
    };
  }, [chatId, currentUser.id, chatPartner.username, changeTitle]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAddMessage = async () => {
    if (!input.trim()) return;

    const messageText = input.trim();
    const tempId = `temp-${Date.now()}`;

    // Optimistic update - thêm message ngay lập tức
    const friendId =
      currentUser.id === chatId.split("--")[0]
        ? chatId.split("--")[1]
        : chatId.split("--")[0];
    const optimisticMessage: Message = {
      id: tempId,
      senderId: currentUser.id,
      receiverId: friendId,
      text: messageText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: messageText, chatId }),
      });
      const data = await response.json();

      if (!response.status) {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Xóa optimistic message nếu gửi thất bại
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      setInput(messageText); // Khôi phục input
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setInput((prev) => prev + emoji);
  };

  return (
    <div className="flex-1 flex flex-col bg-white rounded-2xl relative h-full overflow-hidden shadow-lg">
      {/* Chat Header - Sticky at top */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-green-100 px-6 py-4 border-b flex items-center justify-between rounded-t-2xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage
              src={
                chatPartner.imageUrl ||
                "/placeholder.svg?height=32&width=32&query=user avatar" ||
                "/placeholder.svg"
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
            <OnlineStatusIndicator
              partnerId={chatPartner.id}
              currentUserId={currentUser.id}
              showText={true}
              size="sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* <Button
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
          </Button> */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-green-600 hover:bg-green-200"
            onClick={handleCloseProfile}
          >
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area - Scrollable between header and input */}
      <div className="absolute top-[73px] bottom-[73px] left-0 right-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4 md:space-y-6">
            {messages.map((message, index) => {
              const isCurrentUser = message.senderId === currentUser.id;
              const previousMessage =
                index > 0 ? messages[index - 1] : undefined;
              const timeDivider = shouldShowTimeDivider(
                message.timestamp,
                previousMessage?.timestamp
              );
              const isHovered = hoveredMessageId === message.id;
              return (
                <div key={`${message.id}-${message.timestamp}`}>
                  {timeDivider.show && timeDivider.content && (
                    <TimeDivider content={timeDivider.content} />
                  )}

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
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarImage
                            src={chatPartner.imageUrl || "/placeholder.svg"}
                            alt={
                              chatPartner.username
                                ? chatPartner.username
                                : "User image"
                            }
                          />
                          <AvatarFallback className="rounded-lg">
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
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area - Sticky at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 border-t border-gray-200 bg-white rounded-b-2xl">
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
