import React from "react";
import { usePartnerOnlineStatus } from "@/hooks/use-partner-online-status";

interface OnlineStatusIndicatorProps {
  partnerId: string;
  currentUserId: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function OnlineStatusIndicator({
  partnerId,
  currentUserId,
  size = "md",
  showText = false,
}: OnlineStatusIndicatorProps) {
  const { isOnline, status, lastSeen, isLoading } = usePartnerOnlineStatus(
    partnerId,
    currentUserId
  );

  const getStatusColor = () => {
    if (isLoading) return "bg-gray-300 border-white animate-pulse";

    switch (status) {
      case "online":
        return "bg-green-500 border-white";
      case "offline":
        return "bg-gray-400 border-white";
      default:
        return "bg-gray-400 border-white";
    }
  };

  const getStatusSize = () => {
    switch (size) {
      case "sm":
        return "w-2.5 h-2.5 border";
      case "md":
        return "w-3 h-3 border-2";
      case "lg":
        return "w-4 h-4 border-2";
      default:
        return "w-3 h-3 border-2";
    }
  };

  const formatLastSeen = () => {
    if (isLoading) return "Loading...";
    if (!lastSeen || isOnline) return "";

    const now = Date.now();
    const diff = now - lastSeen;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  return (
    <div className="flex items-center gap-1">
      <div className={`rounded-full ${getStatusSize()} ${getStatusColor()}`} />
      {showText && (
        <span className="text-xs text-gray-600">
          {isLoading ? "Loading..." : isOnline ? "Online" : formatLastSeen()}
        </span>
      )}
    </div>
  );
}
