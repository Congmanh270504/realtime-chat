"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Servers, ServerWithLatestMessage } from "@/types/servers";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { GroupMessage } from "@/types/group-message";

interface ServerContextType {
  servers: ServerWithLatestMessage[];
  updateServer: (
    serverId: string,
    updates: Partial<ServerWithLatestMessage>
  ) => void;
  getCurrentServer: (serverId: string) => ServerWithLatestMessage | undefined;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

interface ServerProviderProps {
  children: React.ReactNode;
  initialServers: ServerWithLatestMessage[];
  userId: string;
}

export function ServerProvider({
  children,
  initialServers,
  userId,
}: ServerProviderProps) {
  const [servers, setServers] =
    useState<ServerWithLatestMessage[]>(initialServers);

  useEffect(() => {
    // Subscribe to all server channels
    servers.forEach((server) => {
      const channelName = toPusherKey(`server-${server.id}`);
      const channelMessages = toPusherKey(`server-${server.id}-messages`);
      pusherClient.subscribe(channelMessages);
      pusherClient.subscribe(channelName);
    });

    pusherClient.subscribe(toPusherKey(`user:${userId}:servers`));

    const newServerHandler = (data: { server: ServerWithLatestMessage }) => {
      setServers((prev) => [...prev, data.server]);
    };

    const handleLatestServerMessage = (
      data: GroupMessage & { serverId: string }
    ) => {
      setServers((prev) =>
        prev.map((server) =>
          server.id === data.serverId
            ? { ...server, latestMessage: data }
            : server
        )
      );
    };
    const handleUserOutServer = (serverId: string) => {
      setServers((prev) => prev.filter((server) => server.id !== serverId));
    };

    const renameServerHandler = (data: {
      serverId: string;
      newName: string;
    }) => {
      setServers((prev) =>
        prev.map((server) =>
          server.id === data.serverId
            ? { ...server, serverName: data.newName }
            : server
        )
      );
    };
    pusherClient.bind("new-server", newServerHandler);
    pusherClient.bind("user-out-server", handleUserOutServer);
    pusherClient.bind("server-renamed", renameServerHandler);
    pusherClient.bind("server-new-message", handleLatestServerMessage);

    return () => {
      servers.forEach((server) => {
        pusherClient.unsubscribe(toPusherKey(`server-${server.id}`));
      });
      servers.forEach((server) => {
        pusherClient.unsubscribe(toPusherKey(`server-${server.id}-messages`));
      });
      pusherClient.unsubscribe(toPusherKey(`user:${userId}:servers`));

      pusherClient.unbind("user-out-server", handleUserOutServer);
      pusherClient.unbind("server-new-message", handleLatestServerMessage);
      pusherClient.unbind("server-renamed", renameServerHandler);
      pusherClient.unbind("new-server", newServerHandler);
    };
  }, [servers, userId]);

  const updateServer = (serverId: string, updates: Partial<Servers>) => {
    setServers((prev) =>
      prev.map((server) =>
        server.id === serverId ? { ...server, ...updates } : server
      )
    );
  };

  const getCurrentServer = (serverId: string) => {
    return servers.find((server) => server.id === serverId);
  };

  return (
    <ServerContext.Provider value={{ servers, updateServer, getCurrentServer }}>
      {children}
    </ServerContext.Provider>
  );
}

export function useServerContext() {
  const context = useContext(ServerContext);
  if (context === undefined) {
    throw new Error("useServerContext must be used within a ServerProvider");
  }
  return context;
}
