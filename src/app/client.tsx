"use client";
import { toast } from "sonner";
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
import { AppSidebar } from "@/components/app-sidebar";
import { UserData } from "@/types/user";
import { useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { FriendsWithLastMessage } from "@/types/message";
import { useOnlineStatus } from "@/hooks/use-online-status";

interface ClientProviderProps {
  children: React.ReactNode;
  unseenRequestCount: number;
  initialFriends: FriendsWithLastMessage[];
  userId: string;
}

const ClientProvider: React.FC<ClientProviderProps> = ({
  children,
  unseenRequestCount,
  initialFriends,
  userId,
}) => {
  
  useOnlineStatus();
  const [requestCount, setRequestCount] = useState(unseenRequestCount);

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
      <SidebarInset>
        <header className="bg-background top-0 flex shrink-0 items-center gap-2 border-b p-4">
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
        </header>
        <div className="h-full w-full">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ClientProvider;
