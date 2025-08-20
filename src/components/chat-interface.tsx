"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Copy,
  Download,
  ThumbsUp,
  ThumbsDown,
  Phone,
  Video,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Message } from "@/types/message";
import { toast } from "sonner";
import { UserData } from "@/types/user";
import {
  formatTimestamp,
  shouldShowTimeDivider,
} from "@/lib/hepper/format-time";
import { TimeDivider } from "./time-divider";

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

  const handleAddMessage = async () => {
    // if (!input) return;

    // const newMessage: Message = {
    //   id: Date.now().toString(),
    //   receiverId: "user-id-2",
    //   text: input,
    //   senderId: userId,
    //   timestamp: 1,
    // };

    // setMessages((prev) => [...prev, newMessage]);
    // setInput("");
    try {
      setIsLoading(true);
      const response = await fetch("/api/messages/send", {
        method: "POST",
        body: JSON.stringify({ text: input, chatId }),
      });
      const data = await response.json();
      if (response.status) {
        toast.success("Message sent successfully");
      } else {
        toast.error(data.message || "Failed to send message");
      }
      // setMessages((prev) => [...prev, data]);
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full p-6">
      <div className="bg-green-100 px-6 py-4 border-b flex items-center justify-between rounded-2xl mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={chatPartner.imageUrl} alt={"User image"} />
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

      <ScrollArea className="flex-1 flex-col-reverse">
        <div className="space-y-6 w-full">
          {messages.map((message, index) => {
            const isCurrentUser = message.senderId === currentUser.id;
            const previousMessage = index > 0 ? messages[index - 1] : undefined;
            const timeDivider = shouldShowTimeDivider(
              message.timestamp,
              previousMessage?.timestamp
            );

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
                >
                  <div
                    className={cn(
                      "flex gap-3 max-w-[70%]",
                      isCurrentUser && "flex-row-reverse"
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
                    <div className="space-y-2">
                      <div
                        className={cn(
                          "flex items-center gap-2",
                          isCurrentUser && "flex-row-reverse"
                        )}
                      >
                        <span className="text-sm font-medium">
                          {isCurrentUser
                            ? currentUser.username
                            : chatPartner.username}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
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
                      {!isCurrentUser && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
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

      <div className="pt-4 border-t">
        <div className="flex gap-2 items-center">
          <Textarea
            placeholder="Type a message as a customer"
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
          <Button
            className="px-8"
            onClick={handleAddMessage}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
