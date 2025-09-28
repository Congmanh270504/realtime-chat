"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
  Loader2,
} from "lucide-react";
import { cn, toPusherKey } from "@/lib/utils";
import {
  formatTimestamp,
  shouldShowTimeDivider,
} from "@/lib/hepper/format-time";
import { pusherClient } from "@/lib/pusher";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { useDocumentTitle } from "@/hooks/use-document-title";
import Emoji from "@/components/emoji";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Servers } from "@/types/servers";
import ChatReactIcons from "@/components/chat-react-icons";
import { TimeDivider } from "@/components/time-divider";
import { useUser } from "@clerk/nextjs";
import { GroupMessage } from "@/types/group-message";
import { useLoadMoreMessages } from "@/hooks/use-load-more-messages";
import { useScrollToLoad } from "@/hooks/use-scroll-to-load";

interface GroupChatInterfaceProps {
  servers: Servers;
  initialMessages: GroupMessage[];
  serverId: string;
  handleCloseProfile?: () => void;
}
const GroupChatInterface = ({
  servers,
  initialMessages,
  serverId,
  handleCloseProfile,
}: GroupChatInterfaceProps) => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  // Sử dụng hook để load thêm tin nhắn
  const {
    messages,
    isLoading: isLoadingMore,
    hasMore,
    loadMore,
    setMessages,
  } = useLoadMoreMessages<GroupMessage>({
    chatId: serverId, // Sử dụng serverId thay vì chatId
    initialMessages,
    messagesPerPage: 20,
    isServerChat: true, // Flag để phân biệt server chat vs private chat
  });

  // Sử dụng hook để detect scroll và load thêm tin nhắn
  const { scrollAreaRef } = useScrollToLoad({
    onLoadMore: loadMore,
    hasMore,
    isLoading: isLoadingMore,
    threshold: 100,
  });
  useDocumentTitle({
    newMessageTitle: `💬 New message in ${servers.serverName}`,
    originalTitle: `Chat - ${servers.serverName}`,
    resetDelay: 10000,
  });

  const handleEmojiSelect = (emoji: string) => {
    setInput((prev) => prev + emoji);
  };
  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`server-${serverId}-messages`));

    pusherClient.bind("server-new-message", (message: GroupMessage) => {
      setMessages((prev) => {
        // Tìm và thay thế optimistic message nếu có
        const optimisticIndex = prev.findIndex(
          (msg) =>
            msg.sender.id === message.sender.id &&
            msg.text === message.text &&
            msg.id.startsWith("temp-") &&
            Math.abs(msg.timestamp - message.timestamp) < 5000 // trong vòng 5 giây
        );

        if (optimisticIndex !== -1) {
          // Thay thế optimistic message bằng message thật
          const updatedMessages = [...prev];
          updatedMessages[optimisticIndex] = message;
          return updatedMessages;
        }

        return [...prev, message];
      });
    });

    return () => {
      pusherClient.unsubscribe(toPusherKey(`server-${serverId}-messages`));
      pusherClient.unbind("server-new-message");
    };
  }, [serverId, setMessages]);

  // Scroll to bottom function
  const scrollToBottom = useCallback(
    (behavior: "smooth" | "instant" = "smooth") => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector(
          "[data-radix-scroll-area-viewport]"
        ) as HTMLElement;
        if (scrollContainer) {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: behavior,
          });
        }
      } else if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior });
      }
    },
    [scrollAreaRef]
  );

  // Auto scroll to bottom when component mounts
  useEffect(() => {
    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      scrollToBottom("instant");
    }, 100);

    return () => clearTimeout(timer);
  }, [scrollToBottom]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    // Only auto-scroll if user is near the bottom (within 100px)
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLElement;
      if (scrollContainer) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

        if (isNearBottom) {
          scrollToBottom("smooth");
        }
      }
    } else {
      scrollToBottom("smooth");
    }
  }, [messages, scrollAreaRef, scrollToBottom]);

  const handleAddMessage = async () => {
    if (!input.trim()) return;

    const messageText = input.trim();
    const tempId = `temp-${Date.now()}`;

    // Optimistic update - thêm message ngay lập tức
    const optimisticMessage: GroupMessage = {
      id: tempId,
      text: messageText,
      timestamp: Date.now(),
      sender: {
        id: user?.id || "",
        username: user?.username || "Unknown",
        imageUrl: user?.imageUrl || "",
        email: user?.emailAddresses[0]?.emailAddress || "",
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        createdAt: "",
      },
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInput("");
    setIsLoading(true);

    // Scroll to bottom immediately after sending
    setTimeout(() => scrollToBottom("smooth"), 50);

    try {
      const response = await fetch("/api/messages/server/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: messageText, serverId }),
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

  return (
    <div className="flex-1 flex flex-col rounded-2xl relative h-full overflow-hidden shadow-lg">
      <div className="sticky top-0 left-0 right-0 z-10 px-6 py-4 border-b flex items-center justify-between rounded-t-2xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage
              src={
                servers.serverImage ||
                "/placeholder.svg?height=32&width=32&query=user avatar" ||
                "/placeholder.svg"
              }
              alt={"User image"}
            />
            <AvatarFallback className="rounded-lg">
              {servers.serverName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold ">{servers.serverName}</h2>
            <div className="flex items-center gap-1">
              <div className="rounded-full w-2.5 h-2.5 border bg-green-500 border-white" />
              <span className="text-xs text-green-400">Online</span>
            </div>
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
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 space-y-4 md:space-y-6">
            {/* Loading indicator cho load more messages */}
            {isLoadingMore && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}

            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-10">
                No messages yet. Say hi! 👋
              </div>
            )}

            {messages.map((message, index) => {
              const isCurrentUser = message.sender.id === user?.id;
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
                  {message.isNotification !== undefined &&
                  message.isNotification === true ? (
                    <div className="flex justify-center my-4">
                      <div className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {message.text}
                      </div>
                    </div>
                  ) : (
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
                              src={
                                message.sender.imageUrl || "/placeholder.svg"
                              }
                              alt={
                                message.sender.username
                                  ? message.sender.username
                                  : "User image"
                              }
                            />
                            <AvatarFallback className="rounded-lg">
                              {message.sender.username
                                .slice(0, 2)
                                .toUpperCase()}
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
                                {isCurrentUser ? null : message.sender.username}
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
                  )}
                </div>
              );
            })}
            {/* Invisible div for auto-scroll */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area - Sticky at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 border-t border-gray-200  rounded-b-2xl">
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
};

export default GroupChatInterface;
