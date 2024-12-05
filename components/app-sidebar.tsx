'use client';

import * as React from 'react';
import { GalleryVerticalEnd } from 'lucide-react';

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
} from '@/components/ui/sidebar';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, status } = useSession();
  const isAdmin = session?.user.role === 'ADMIN';

  const data = {
    navMain: [
      {
        title: 'Commercial',
        url: '#',
        items: [
          {
            title: 'Tracks',
            url: '/dashboard/tracks/commercial/top',
          },
          {
            title: 'Gigs',
            url: '/dashboard/tracks/commercial/gigs',
          },
        ],
      },
      {
        title: 'Upfront',
        url: '#',
        items: [
          {
            title: 'Tracks',
            url: '/dashboard/tracks/upfront/top',
          },
          {
            title: 'Gigs',
            url: '/dashboard/tracks/upfront/gigs',
            isActive: true,
          },
        ],
      },
      {
        title: 'Settings',
        url: '#',
        items: [
          {
            title: 'Users',
            url: '/dashboard/users',
          },
        ],
      },
      {
        title: 'Tracks',
        url: '#',
        items: [
          {
            title: 'Commercial Top 20',
            url: '/dashboard/commercial/top',
          },

          {
            title: 'Upfront Top 20',
            url: '/dashboard/upfront/top ',
          },
        ],
      },
      {
        title: 'Gigs',
        url: '#',
        items: [
          {
            title: 'Commercial Gigs',
            url: '/dashboard/commercial/gigs',
          },
          {
            title: 'Upfront Gigs',
            url: '/dashboard/upfront/gigs',
          },
        ],
      },
    ].filter((item) => {
      if (
        !isAdmin &&
        ['Commercial', 'Upfront', 'Settings'].includes(item.title)
      ) {
        return false;
      }
      return true;
    }),
  };

  return (
    <Sidebar variant='floating' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <a href='#'>
                <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                  <GalleryVerticalEnd className='size-4' />
                </div>
                <div className='flex flex-col gap-0.5 leading-none'>
                  <span className='font-semibold'>Documentation</span>
                  <span className=''>v1.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className='gap-2'>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <span className='font-semibold'>{item.title}</span>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub className='ml-0 border-l-0 px-1.5'>
                    {item.items.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild isActive={item.isActive}>
                          <Link href={item.url}>{item.title}</Link>
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
