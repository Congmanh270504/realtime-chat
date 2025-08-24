"use client";

import { useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusher";

export default function PusherDebug() {
  const [connectionState, setConnectionState] =
    useState<string>("initializing");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Chỉ hiển thị trong development hoặc khi có debug flag
    const isDev = process.env.NODE_ENV === "development";
    const hasDebug = new URLSearchParams(window.location.search).has("debug");
    setIsVisible(isDev || hasDebug);

    if (!isVisible) return;

    const updateState = () => {
      setConnectionState(pusherClient.connection.state);
    };

    pusherClient.connection.bind("state_change", updateState);
    pusherClient.connection.bind("connected", updateState);
    pusherClient.connection.bind("disconnected", updateState);
    pusherClient.connection.bind("error", updateState);

    // Initial state
    updateState();

    return () => {
      pusherClient.connection.unbind("state_change", updateState);
      pusherClient.connection.unbind("connected", updateState);
      pusherClient.connection.unbind("disconnected", updateState);
      pusherClient.connection.unbind("error", updateState);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs z-50">
      Pusher: {connectionState}
    </div>
  );
}
