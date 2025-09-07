"use client";

import { useState, useEffect, useCallback } from "react";

interface UseNicknamesReturn {
  nicknames: Record<string, string>;
  loading: boolean;
  setNickname: (
    userId: string,
    nickname: string,
    chatId: string
  ) => Promise<boolean>;
  getNickname: (userId: string) => string | null;
  refreshNicknames: () => Promise<void>;
}

export const useNicknames = (chatId: string): UseNicknamesReturn => {
  const [nicknames, setNicknames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchNicknames = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/chats/setting/nickname/?chatId=${chatId}`
      );
      if (response.ok) {
        const data = await response.json();
        setNicknames(data.nicknames || {});
      }
    } catch (error) {
      console.error("Error fetching nicknames:", error);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  const setNickname = useCallback(
    async (
      userId: string,
      nickname: string,
      chatId: string
    ): Promise<boolean> => {
      try {
        const response = await fetch("/api/chats/setting/nickname", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            nickname,
            chatId,
          }),
        });

        if (response.ok) {
          // Update local state
          setNicknames((prev) => ({
            ...prev,
            [userId]: nickname,
          }));
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error setting nickname:", error);
        return false;
      }
    },
    []
  );

  const getNickname = useCallback(
    (userId: string): string | null => {
      return nicknames[userId] || null;
    },
    [nicknames]
  );

  const refreshNicknames = useCallback(async () => {
    await fetchNicknames();
  }, [fetchNicknames]);

  useEffect(() => {
    fetchNicknames();
  }, [fetchNicknames]);

  return {
    nicknames,
    loading,
    setNickname,
    getNickname,
    refreshNicknames,
  };
};
