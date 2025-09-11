"use client";

import { useState, useCallback, useRef } from "react";
import { Message } from "@/types/message";
import { GroupMessage } from "@/types/group-message";
import { messageArrayValidator } from "@/lib/validation/message";

interface UseLoadMoreMessagesProps<T = Message> {
  chatId: string;
  initialMessages: T[];
  messagesPerPage?: number;
  isServerChat?: boolean;
}

interface UseLoadMoreMessagesReturn<T = Message> {
  messages: T[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  addMessage: (message: T) => void;
  setMessages: React.Dispatch<React.SetStateAction<T[]>>;
}

export const useLoadMoreMessages = <T = Message>({
  chatId,
  initialMessages,
  messagesPerPage = 10,
  isServerChat = false,
}: UseLoadMoreMessagesProps<T>): UseLoadMoreMessagesReturn<T> => {
  const [messages, setMessages] = useState<T[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(initialMessages.length);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) {
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = isServerChat
        ? `/api/messages/server/load-more`
        : `/api/messages/load-more`;

      const requestBody = isServerChat
        ? {
            serverId: chatId,
            offset: offsetRef.current,
            limit: messagesPerPage,
          }
        : {
            chatId,
            offset: offsetRef.current,
            limit: messagesPerPage,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to load more messages");
      }

      const data = await response.json();

      // For server chat, we don't validate with messageArrayValidator
      // since GroupMessage has different structure
      const newMessages = isServerChat
        ? (data.messages as T[])
        : (messageArrayValidator.parse(data.messages) as T[]);

      if (newMessages.length === 0) {
        setHasMore(false);
      } else {
        setMessages((prev) => [...newMessages, ...prev]);
        offsetRef.current += newMessages.length;

        // Nếu số tin nhắn nhận được ít hơn limit, có nghĩa đã hết
        if (newMessages.length < messagesPerPage) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [chatId, messagesPerPage, isLoading, hasMore, isServerChat]);

  const addMessage = useCallback((message: T) => {
    setMessages((prev) => [...prev, message]);
    offsetRef.current += 1;
  }, []);

  return {
    messages,
    isLoading,
    hasMore,
    loadMore,
    addMessage,
    setMessages,
  };
};
