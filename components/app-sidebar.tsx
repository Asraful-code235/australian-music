import * as React from "react";
import { GalleryVerticalEnd } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { auth } from "@/auth";

// This is sample data.

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const user = await auth();

  const isAdmin = user?.user.role === "ADMIN";

  console.log("isAdmin", isAdmin);

  const data = {
    navMain: [
      {
        title: "Commercial",
        url: "#",
        items: [
          {
            title: "Tracks",
            url: "#",
          },
          {
            title: "Gigs",
            url: "#",
          },
        ],
      },
      {
        title: "Upfront",
        url: "#",
        items: [
          {
            title: "Tracks",
            url: "#",
          },
          {
            title: "Gigs",
            url: "#",
            isActive: true,
          },
        ],
      },
      {
        title: "Settings",
        url: "#",
        items: [
          {
            title: "Users",
            url: "/dashboard/users",
          },
        ],
      },
      {
        title: "Tracks",
        url: "#",
        items: [
          {
            title: "Commercial Top 20",
            url: "#",
          },
          {
            title: "Commercial Gigs",
            url: "#",
          },
        ],
      },
      {
        title: "Gigs",
        url: "#",
        items: [
          {
            title: "Upfront Top 20",
            url: "#",
          },
          {
            title: "Upfront Gigs",
            url: "#",
          },
        ],
      },
    ].filter((item) => {
      if (
        !isAdmin &&
        ["Commercial", "Upfront", "Settings"].includes(item.title)
      ) {
        return false;
      }
      return true;
    }),
  };

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Documentation</span>
                  <span className="">v1.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <span className="font-semibold">{item.title}</span>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                    {item.items.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild isActive={item.isActive}>
                          <a href={item.url}>{item.title}</a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
