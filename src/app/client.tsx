"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/navbar/app-sidebar";
import { useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { FriendsWithLastMessage } from "@/types/message";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { ServerProvider } from "@/contexts/server-context";
import { ServerWithLatestMessage } from "@/types/servers";
interface ClientProviderProps {
  children: React.ReactNode;
  unseenRequestCount: number;
  initialFriends: FriendsWithLastMessage[];
  userId: string;
  servers: ServerWithLatestMessage[];
}

const ClientProvider: React.FC<ClientProviderProps> = ({
  children,
  unseenRequestCount,
  initialFriends,
  userId,
  servers,
}) => {
  useOnlineStatus(); // POST /api/user/status 200 in 303ms
  const [requestCount, setRequestCount] = useState(unseenRequestCount);
  const queryClient = new QueryClient();

  // count request add friends data
  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${userId}:incoming_friend_requests`)
    );
    pusherClient.subscribe(toPusherKey(`user:${userId}:friends`));

    const friendRequestHandler = () => {
      setRequestCount((prev) => prev + 1);
    };

    const addedFriendHandler = () => {
      setRequestCount((prev) => prev - 1);
    };

    pusherClient.bind("incoming_friend_requests", friendRequestHandler);

    pusherClient.bind("new_friend", addedFriendHandler);
    pusherClient.bind("friend_request_denied", addedFriendHandler);
    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${userId}:incoming_friend_requests`)
      );
      pusherClient.unsubscribe(toPusherKey(`user:${userId}:friends`));
      pusherClient.unsubscribe(
        toPusherKey(`user:${userId}:friend_request_denied`)
      );
      pusherClient.unbind("new_friend", addedFriendHandler);
      pusherClient.unbind("incoming_friend_requests", friendRequestHandler);
      pusherClient.unbind("friend_request_denied", addedFriendHandler);
    };
  }, [userId]);

  return (
    <QueryClientProvider client={queryClient}>
      <ServerProvider initialServers={servers} userId={userId}>
        <SidebarProvider
          style={
            {
              "--sidebar-width": "350px",
            } as React.CSSProperties
          }
        >
          <AppSidebar
            unseenRequestCount={requestCount}
            initialFriends={initialFriends}
            userId={userId}
          />
          <SidebarInset className="flex flex-col h-screen">
            <header className="bg-background top-0 flex shrink-0 items-center justify-between gap-2 border-b p-4">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">All Inboxes</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Inbox</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <ModeToggle />
            </header>
            <div className="flex-1 overflow-hidden">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </ServerProvider>
    </QueryClientProvider>
  );
};

export default ClientProvider;
