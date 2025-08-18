"use client";
import { toast, Toaster } from "sonner";
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
import { useState } from "react";

interface ClientProviderProps {
  children: React.ReactNode;
  unseenRequestCount: number;
  friendRequests: UserData[];
  userFriends: UserData[];
}

const ClientProvider: React.FC<ClientProviderProps> = ({
  children,
  unseenRequestCount,
  friendRequests,
  userFriends,
}) => {
  const [friendRequestsData, setFriendRequestsData] = useState(friendRequests);

  // Callback functions for friend request actions
  const handleAcceptFriend = async (friendId: string) => {
    console.log("Accepting friend request from:", friendId);
    try {
      const request = await fetch(`/api/friends/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendId }),
      });

      const data = await request.json();
      if (request.status === 200) {
        toast.success(data.messages);
        setFriendRequestsData((prev) =>
          prev.filter((friend) => friend.id !== friendId)
        );
      } else {
        toast.error(data.messages);
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleDenyFriend = async (friendId: string) => {
    try {
      const request = await fetch(`/api/friends/deny`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendId }),
      });

      const data = await request.json();
      if (request.status === 200) {
        toast.success(data.messages);
        setFriendRequestsData((prev) =>
          prev.filter((friend) => friend.id !== friendId)
        );
      } else {
        toast.error(data.messages);
      }
    } catch (error) {
      console.error("Error denying friend request:", error);
    }
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        unseenRequestCount={unseenRequestCount}
        friendRequestsData={friendRequestsData}
        onAcceptFriend={handleAcceptFriend}
        onDenyFriend={handleDenyFriend}
        userFriends={userFriends}
      />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4">
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
        <div className="flex flex-1 flex-col gap-4 p-4 ">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ClientProvider;
