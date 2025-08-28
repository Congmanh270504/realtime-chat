import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

export function useOnlineStatus() {
  const { userId, isSignedIn } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateStatus = async () => {
    if (!isSignedIn || !userId) return;

    try {
      await fetch("/api/user/status", {
        method: "POST",
      });
    } catch (error) {
      console.error("Failed to update online status:", error);
    }
  };

  const sendHeartbeat = async () => {
    if (!isSignedIn || !userId) return;

    try {
      await fetch("/api/user/heartbeat", {
        method: "POST",
      });
    } catch (error) {
      console.error("Failed to send heartbeat:", error);
    }
  };

  useEffect(() => {
    if (isSignedIn && userId) {
      // Set initial online status
      updateStatus();

      // Send heartbeat every 30 minutes (half of the expiry time)
      intervalRef.current = setInterval(sendHeartbeat, 30 * 60 * 1000);

      // Handle page visibility changes
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          sendHeartbeat();
        }
      };

      // Handle page unload to set offline status
      const handleBeforeUnload = () => {
        navigator.sendBeacon(
          "/api/user/status",
          JSON.stringify({ status: "offline" })
        );
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [isSignedIn, userId]);

  return { updateStatus, sendHeartbeat };
}
