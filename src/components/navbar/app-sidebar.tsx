"use client";

import {
  ArchiveX,
  CirclePlus,
  Command,
  File,
  Inbox,
  Send,
  Trash2,
} from "lucide-react";
import { MdPeopleAlt, MdPersonAddAlt1 } from "react-icons/md";

import { Label } from "@/components/ui/label";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import SidebarChatList from "./sidebar-chat-list";
import { NavUser } from "./nav-user";
import { useState } from "react";
import { FriendsWithLastMessage } from "@/types/message";
import { useRouter } from "next/navigation";
import { CreateServerDialog } from "../server/create-server-dialog";

export function AppSidebar({
  unseenRequestCount = 0,
  userId,
  initialFriends,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  unseenRequestCount?: number;
  initialFriends: FriendsWithLastMessage[];
  userId: string;
}) {
  const { setOpen } = useSidebar();
  const router = useRouter();
  // Move all hooks before any conditional returns
  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: "Inbox",
        url: "#",
        icon: Inbox,
        isActive: true,
      },
      {
        title: "Drafts",
        url: "#",
        icon: File,
        isActive: false,
        component: <div>Drafts Component</div>,
      },
      {
        title: "Sent",
        url: "#",
        icon: Send,
        isActive: false,
        component: <div>Sent Component</div>,
      },
      {
        title: "Junk",
        url: "#",
        icon: ArchiveX,
        isActive: false,
        component: <div>Junk Component</div>,
      },
      {
        title: "Trash",
        url: "#",
        icon: Trash2,
        isActive: false,
        component: <div>Trash Component</div>,
      },
      {
        title: "Friends",
        url: "/all-friends",
        icon: MdPeopleAlt,
        isActive: false,
        // component: <Friends initialFriends={initialFriends} />,
      },
      {
        title: "Add Friends",
        url: "/add-friends",
        icon: MdPersonAddAlt1,
        isActive: false,
        // component: (
        //   <FriendRequestItem friends={friendRequestsData} userId={userId} />
        // ),
      },
    ],
  };

  const [activeItem, setActiveItem] = useState(data.navMain[0]);

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href="#">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Acme Inc</span>
                    <span className="truncate text-xs">Enterprise</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => {
                        setActiveItem(item);
                        setOpen(true);
                        // Navigate to URL if it's not just a hash
                        if (item.url && item.url !== "#") {
                          router.push(item.url);
                        }
                      }}
                      isActive={activeItem?.title === item.title}
                      className="px-2.5 md:px-2"
                    >
                      {item.title === "Add Friends" ? (
                        <div className="relative">
                          <item.icon />
                          {unseenRequestCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-3 w-3 flex items-center justify-center font-bold">
                              {unseenRequestCount}
                            </span>
                          )}
                        </div>
                      ) : (
                        <item.icon />
                      )}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => {
                      // setActiveItem(null);
                      setOpen(true);
                    }}
                    className="px-2.5 md:px-2"
                    tooltip={{
                      children: "Create Server",
                      hidden: false,
                    }}
                  >
                    {/* <PlusCircle className="mr-2" /> */}
                    <CreateServerDialog />
                    <span>Create Server</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      </Sidebar>

      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-foreground text-base font-medium">
              {activeItem?.title}
            </div>
            <Label className="flex items-center gap-2 text-sm">
              <span>Unreads</span>
              <Switch className="shadow-none" />
            </Label>
          </div>
          <SidebarInput placeholder="Type to search..." />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent className="p-2">
              <SidebarChatList friends={initialFriends} userId={userId} />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}
