"use client";

import { useState, useCallback, useRef } from "react";
import { Message } from "@/types/message";
import { messageArrayValidator } from "@/lib/validation/message";

interface UseLoadMoreMessagesProps {
  chatId: string;
  initialMessages: Message[];
  messagesPerPage?: number;
}

interface UseLoadMoreMessagesReturn {
  messages: Message[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  addMessage: (message: Message) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export const useLoadMoreMessages = ({
  chatId,
  initialMessages,
  messagesPerPage = 10,
}: UseLoadMoreMessagesProps): UseLoadMoreMessagesReturn => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(initialMessages.length);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/messages/load-more`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          offset: offsetRef.current,
          limit: messagesPerPage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to load more messages");
      }

      const data = await response.json();
      const newMessages = messageArrayValidator.parse(
        data.messages
      ) as Message[];

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
  }, [chatId, messagesPerPage, isLoading, hasMore]);

  const addMessage = useCallback((message: Message) => {
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
