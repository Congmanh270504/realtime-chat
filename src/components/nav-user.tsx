"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { SignOutButton, useUser } from "@clerk/nextjs";
import ClientOnly from "./client-only";
import { OnlineStatusIndicator } from "./online-status-indicator";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user, isLoaded } = useUser();

  const LoadingSkeleton = () => (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-2 p-2">
          <div className="h-8 w-8 rounded-lg bg-gray-200 animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-1" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
  if (!isLoaded) {
    return <LoadingSkeleton />;
  }

  return (
    <ClientOnly fallback={<LoadingSkeleton />}>
      {user ? (
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user.imageUrl}
                      alt={user.username ? user.username : "User image"}
                    />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {user.username}
                    </span>
                    <span className="truncate text-xs">
                      {user.emailAddresses[0].emailAddress}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    {/* <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={user.imageUrl}
                        alt={user.username ? user.username : "User image"}
                      />
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar> */}
                    <div className="relative">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage
                          src={user.imageUrl}
                          alt={user.username ? user.username : "User image"}
                        />
                        <AvatarFallback className="rounded-lg">
                          CN
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5">
                        <OnlineStatusIndicator status="online" size="sm" />
                      </div>
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {user.username}
                      </span>
                      <span className="truncate text-xs">
                        {user.emailAddresses[0].emailAddress}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Sparkles />
                    Upgrade to Pro
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <BadgeCheck />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <SignOutButton>
                    {/* <LogOut /> */}
                    Log out
                  </SignOutButton>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      ) : null}
    </ClientOnly>
  );
}
