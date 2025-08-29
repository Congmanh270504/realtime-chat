import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

export function useOnlineStatus() {
  const { userId, isSignedIn } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isSignedIn && userId) {
      const updateStatus = async () => {
        try {
          await fetch("/api/user/status/online", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ currentUserId: userId }),
          });
        } catch (error) {
          console.error("Failed to update online status:", error);
        }
      };

      const sendHeartbeat = async () => {
        try {
          await fetch("/api/user/heartbeat", {
            method: "POST",
          });
        } catch (error) {
          console.error("Failed to send heartbeat:", error);
        }
      };

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
        // Using sendBeacon with proper Content-Type
        const blob = new Blob([JSON.stringify({ currentUserId: userId })], {
          type: "application/json",
        });
        navigator.sendBeacon("/api/user/status/offline", blob);

        // Fallback for debugging
        console.log("User going offline - sendBeacon sent");
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

  // Return functions for manual use if needed
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

  return { updateStatus, sendHeartbeat };
}
