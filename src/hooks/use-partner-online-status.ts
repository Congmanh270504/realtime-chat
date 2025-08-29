"use client";

import { useState, useEffect } from "react";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

interface PartnerStatus {
  status: "online" | "offline";
  lastSeen: number | null;
}

export function usePartnerOnlineStatus(
  partnerId: string,
  currentUserId: string
) {
  const [partnerStatus, setPartnerStatus] = useState<PartnerStatus>({
    status: "offline",
    lastSeen: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial status
  useEffect(() => {
    if (!partnerId || !currentUserId) return;

    const fetchInitialStatus = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/user/status?userId=${partnerId}`);
        if (response.ok) {
          const data = await response.json();
          setPartnerStatus({
            status: data.status === "online" ? "online" : "offline",
            lastSeen: data.lastSeen,
          });
        }
      } catch (error) {
        console.error("Failed to fetch partner status:", error);
        setPartnerStatus({ status: "offline", lastSeen: null });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialStatus();
  }, [partnerId, currentUserId]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!partnerId || !currentUserId) return;

    const channel = toPusherKey(`user:${currentUserId}:friend_online_list`);

    pusherClient.subscribe(channel);

    const handleStatusUpdate = (data: {
      [userId: string]: { status: string; lastSeen: number | null };
    }) => {
      // Check if the update is for our partner
      if (data[partnerId]) {
        setPartnerStatus({
          status: data[partnerId].status === "online" ? "online" : "offline",
          lastSeen: data[partnerId].lastSeen,
        });
      }
    };

    pusherClient.bind("friend_online_list", handleStatusUpdate);

    return () => {
      pusherClient.unbind("friend_online_list", handleStatusUpdate);
      pusherClient.unsubscribe(channel);
    };
  }, [partnerId, currentUserId]);

  return {
    isOnline: partnerStatus.status === "online",
    status: partnerStatus.status,
    lastSeen: partnerStatus.lastSeen,
    isLoading,
  };
}
