'use client';

import * as React from 'react';
import { GalleryVerticalEnd } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BsPerson } from 'react-icons/bs';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, status } = useSession();
  const isAdmin = session?.user.role === 'ADMIN';
  const pathname = usePathname();

  console.log({ pathname: pathname === '/dashboard/upfront/top' });

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
            url: '/dashboard/upfront/top',
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
                  <span className='font-semibold'>
                    Australian Dance Music Charts
                  </span>
                  <span className=''>v1.0.1</span>
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
                        <SidebarMenuSubButton
                          asChild
                          className={cn(
                            item.url === pathname ? 'bg-gray-200' : ''
                          )}
                        >
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
      <SidebarFooter>
        <div className='flex gap-2 justify-between p-1'>
          <div className='flex gap-2'>
            {session?.user?.name ? (
              <span className='w-7 h-7 flex items-center justify-center text-lg bg-gray-300 rounded-full shrink-0'>
                {(session?.user?.name || '').charAt(0).toUpperCase()}
              </span>
            ) : (
              <div className='p-1 bg-gray-300 h-fit rounded-full shrink-0'>
                <BsPerson className='w-5 h-5' />
              </div>
            )}
            <div className='flex flex-col gap-0'>
              <Tooltip>
                <TooltipTrigger>
                  <div className='w-[150px] text-sm truncate'>
                    {session?.user.name || 'User name'}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {session?.user.name || 'User name'}
                </TooltipContent>
              </Tooltip>
              <div className='inline-flex items-center'>
                <div className='text-[10px] border rounded-lg p-1 whitespace-nowrap'>
                  {session?.user.role}
                </div>
              </div>
            </div>
          </div>
          <div>
            <Button size='sm' onClick={() => signOut()}>
              Logout
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
