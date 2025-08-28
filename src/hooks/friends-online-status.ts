import { useEffect, useState, useCallback } from "react";

interface UserStatus {
  status: string;
  lastSeen: number | null;
}

interface FriendsOnlineStatus {
  [userId: string]: UserStatus;
}

export function useFriendsOnlineStatus(userIds: string[]) {
  const [friendsStatus, setFriendsStatus] = useState<FriendsOnlineStatus>({});
  const [loading, setLoading] = useState(false);

  const fetchFriendsOnlineStatus = useCallback(async () => {
    if (!userIds.length) {
      setFriendsStatus({});
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/user/status/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userIds }),
      });

      if (response.ok) {
        const data = await response.json();
        setFriendsStatus(data.statuses);
      }
    } catch (error) {
      console.error("Failed to fetch friends status:", error);
    } finally {
      setLoading(false);
    }
  }, [userIds]);

//   useEffect(() => {
//     fetchFriendsOnlineStatus;

//     // Refresh status every 2 minutes
//     const interval = setInterval(fetchFriendsOnlineStatus, 2 * 60 * 1000);

//     return () => clearInterval(interval);
//   }, [fetchFriendsOnlineStatus]);

  return {
    friendsStatus,
    loading,
    refetch: fetchFriendsOnlineStatus,
  };
}
