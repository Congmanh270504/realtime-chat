"use client";
import { Toaster } from "sonner";
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
import { AuthKitProvider } from "@workos-inc/authkit-nextjs/components";

interface ClientProviderProps {
  children: React.ReactNode;
}

const ClientProvider: React.FC<ClientProviderProps> = ({ children }) => {
  //   const pathName = usePathname();
  //   const pathArray = pathName.split("/").slice(1);
  //   const breadcrumbItems = pathArray.reduce<string[]>((acc, item, index) => {
  //     const url = `${acc[index - 1] || ""}/${item}`;
  //     acc.push(url);
  //     return acc;
  //   }, []);
  //   const truncate = (str: string, max = 10) =>
  //     str.length > max ? `${str.slice(0, max)}...` : str;
  return (
    <AuthKitProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "350px",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
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
    </AuthKitProvider>
  );
};

export default ClientProvider;
