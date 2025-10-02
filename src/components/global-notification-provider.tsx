"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useRef } from "react";
import { pusherClient } from "@/lib/pusher";
import { chatHrefConstructor, toPusherKey } from "@/lib/utils";
import { Message } from "@/types/message";
import { GroupMessage } from "@/types/group-message";
import { usePathname } from "next/navigation";

interface GlobalNotificationProviderProps {
  children: React.ReactNode;
}

export default function GlobalNotificationProvider({
  children,
}: GlobalNotificationProviderProps) {
  const { user } = useUser();
  const pathName = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const unreadCountRef = useRef(0);
  const originalTitleRef = useRef<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notificationActiveRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Khởi tạo audio element
  useEffect(() => {
    audioRef.current = new Audio("/new-notification-09-352705.mp3");
    audioRef.current.preload = "auto";

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Function để phát âm thanh
  const playNotificationSound = () => {
    if (audioRef.current) {
      // Reset audio về đầu để có thể phát nhiều lần liên tiếp
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.log("Could not play notification sound:", error);
      });
    }
  };

  // Function để setup title protection
  const setupTitleProtection = (notificationTitle: string) => {
    notificationActiveRef.current = true;

    // Set notification title
    document.title = notificationTitle;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Override document.title setter để prevent ghi đè
    const originalTitleDescriptor = Object.getOwnPropertyDescriptor(
      Document.prototype,
      "title"
    );

    Object.defineProperty(document, "title", {
      get() {
        return document.querySelector("title")?.textContent || "";
      },
      set(newTitle: string) {
        // Nếu notification đang active và title mới không phải notification
        if (notificationActiveRef.current && !newTitle.includes("💬")) {
          // Ignore việc set title mới, giữ nguyên notification title
          return;
        }
        // Nếu không phải trường hợp trên, set title bình thường
        const titleElement = document.querySelector("title");
        if (titleElement) {
          titleElement.textContent = newTitle;
        }
      },
      configurable: true,
    });

    // Auto reset sau 15 phút
    timeoutRef.current = setTimeout(() => {
      notificationActiveRef.current = false;

      // Restore original title descriptor
      if (originalTitleDescriptor) {
        Object.defineProperty(document, "title", originalTitleDescriptor);
      }

      if (document.title.includes("💬")) {
        document.title = originalTitleRef.current || "Chat App";
        unreadCountRef.current = 0;
        setUnreadCount(0);
        originalTitleRef.current = "";
      }
    }, 15 * 60 * 1000);
  };

  useEffect(() => {
    if (!user) return;

    // Lắng nghe tin nhắn mới từ tất cả các chat
    const userChatsChannel = toPusherKey(`user:${user.id}:chats`);
    const userChatsServers = toPusherKey(`user:${user.id}:servers`);

    pusherClient.subscribe(userChatsChannel);
    pusherClient.subscribe(userChatsServers);

    const newMessageHandler = (
      data: Message & { sender: { username: string; imageUrl: string } }
    ) => {
      // Chỉ thay đổi title nếu tin nhắn không phải từ user hiện tại
      // và người dùng không đang ở trong chat đó

      if (data.senderId === user.id) return;

      // Phát âm thanh thông báo ngay khi nhận tin nhắn từ người khác
      playNotificationSound();

      const chatHref = `${chatHrefConstructor(user.id, data.senderId)}`;

      // Chỉ thay đổi title khi tab không active
      if (chatHref && document.hidden) {
        // Lưu original title nếu chưa có
        if (!originalTitleRef.current) {
          originalTitleRef.current = document.title;
        }

        // Tăng số lượng tin nhắn chưa đọc
        unreadCountRef.current += 1;
        const newCount = unreadCountRef.current;

        setUnreadCount(newCount);
        const notificationTitle = `💬 (${newCount}) New message${
          newCount > 1 ? "s" : ""
        } from ${data.sender.username}`;

        // Setup title protection để prevent bị ghi đè
        setupTitleProtection(notificationTitle);

        const resetTitle = () => {
          notificationActiveRef.current = false;

          // Restore original title descriptor
          const originalTitleDescriptor = Object.getOwnPropertyDescriptor(
            Document.prototype,
            "title"
          );
          if (originalTitleDescriptor) {
            Object.defineProperty(document, "title", originalTitleDescriptor);
          }

          document.title = originalTitleRef.current || "Chat App";
          unreadCountRef.current = 0;
          setUnreadCount(0);
          originalTitleRef.current = "";
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        };
        const focusHandler = () => {
          resetTitle();
          window.removeEventListener("focus", focusHandler);
          document.removeEventListener("visibilitychange", visibilityHandler);
        };

        const visibilityHandler = () => {
          if (!document.hidden) {
            resetTitle();
            window.removeEventListener("focus", focusHandler);
            document.removeEventListener("visibilitychange", visibilityHandler);
          }
        };

        window.addEventListener("focus", focusHandler);
        document.addEventListener("visibilitychange", visibilityHandler);
      }
    };

    const newServerMessageHandler = (
      data: GroupMessage & {
        sender: { username: string; imageUrl: string };
        serverId: string;
      }
    ) => {
      // Chỉ thay đổi title nếu tin nhắn không phải từ user hiện tại
      // và người dùng không đang ở trong server chat đó
      if (data.sender.id === user.id) return;

      // Kiểm tra xem user có đang ở trong server chat này không
      const isInServerChat = pathName.includes(`/servers/${data.serverId}`);

      // Phát âm thanh thông báo nếu không ở trong chat hoặc tab không active
      if (!isInServerChat || document.hidden) {
        playNotificationSound();
      }

      // Chỉ thay đổi title khi tab không active hoặc không ở trong server chat
      if (!isInServerChat && document.hidden) {
        // Lưu original title nếu chưa có
        if (!originalTitleRef.current) {
          originalTitleRef.current = document.title;
        }

        // Tăng số lượng tin nhắn chưa đọc
        unreadCountRef.current += 1;
        const newCount = unreadCountRef.current;

        setUnreadCount(newCount);
        const notificationTitle = `💬 (${newCount}) New server message${
          newCount > 1 ? "s" : ""
        } from ${data.sender.username}`;

        // Setup title protection để prevent bị ghi đè
        setupTitleProtection(notificationTitle);

        const resetTitle = () => {
          notificationActiveRef.current = false;

          // Restore original title descriptor
          const originalTitleDescriptor = Object.getOwnPropertyDescriptor(
            Document.prototype,
            "title"
          );
          if (originalTitleDescriptor) {
            Object.defineProperty(document, "title", originalTitleDescriptor);
          }

          document.title = originalTitleRef.current || "Chat App";
          unreadCountRef.current = 0;
          setUnreadCount(0);
          originalTitleRef.current = "";
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        };

        const focusHandler = () => {
          resetTitle();
          window.removeEventListener("focus", focusHandler);
          document.removeEventListener("visibilitychange", visibilityHandler);
        };

        const visibilityHandler = () => {
          if (!document.hidden) {
            resetTitle();
            window.removeEventListener("focus", focusHandler);
            document.removeEventListener("visibilitychange", visibilityHandler);
          }
        };

        window.addEventListener("focus", focusHandler);
        document.addEventListener("visibilitychange", visibilityHandler);
      }
    };

    pusherClient.bind("new_message", newMessageHandler);
    pusherClient.bind("new_server_message", newServerMessageHandler);

    return () => {
      pusherClient.unsubscribe(userChatsChannel);
      pusherClient.unsubscribe(userChatsServers);
      pusherClient.unbind("new_message", newMessageHandler);
      pusherClient.unbind("new_server_message", newServerMessageHandler);

      // Cleanup timers
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Reset notification state
      notificationActiveRef.current = false;

      // Restore original title descriptor if needed
      const originalTitleDescriptor = Object.getOwnPropertyDescriptor(
        Document.prototype,
        "title"
      );
      if (originalTitleDescriptor) {
        Object.defineProperty(document, "title", originalTitleDescriptor);
      }
    };
  }, [user, pathName]);

  // Reset unread count khi user quay lại trang
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && unreadCount > 0) {
        setUnreadCount(0);
      }
    };

    const handleFocus = () => {
      if (unreadCount > 0) {
        setUnreadCount(0);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [unreadCount]);

  return <>{children}</>;
}
