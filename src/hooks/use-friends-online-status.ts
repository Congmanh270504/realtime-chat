import { useEffect, useState, useRef } from "react";

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
  const userIdsRef = useRef<string[]>([]);

  // Kiểm tra xem userIds có thay đổi thực sự không
  const userIdsChanged =
    userIdsRef.current.length !== userIds.length ||
    userIdsRef.current.some((id, index) => id !== userIds[index]);

  if (userIdsChanged) {
    userIdsRef.current = userIds;
  }

  const fetchFriendsOnlineStatus = async () => {
    if (!userIdsRef.current.length) {
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
        body: JSON.stringify({ userIds: userIdsRef.current }),
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
  };

  useEffect(() => {
    fetchFriendsOnlineStatus();

    // Refresh status every 5 minutes
    const interval = setInterval(fetchFriendsOnlineStatus, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [userIdsChanged]); // Chỉ chạy lại khi userIds thực sự thay đổi

  return {
    friendsStatus,
    loading,
    refetch: fetchFriendsOnlineStatus,
  };
}
