'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Music2, Trophy, User } from 'lucide-react';

export type UserTrack = {
  id?: string;
  position?: number | null | undefined;
  artist?: string | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: Date | null;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  track: {
    id: string;
    title: string;
  };
  mixes: {
    id: string;
    mix: {
      title: string;
    };
  }[];
  status: boolean | null;
};

type TrackTableProps = {
  data: {
    data: UserTrack[];
    count: number;
    limit: number;
    page: number;
    totalPages: number;
  };
  isLoading: boolean;
  params: {
    search: string;
    page: string;
  };
  setParams: (params: { search: string; page: string }) => void;
};

export default function TracksTable({
  data,
  isLoading,
  params,
  setParams,
}: TrackTableProps) {
  if (isLoading) return <div className='text-center py-4'>Loading...</div>;

  // Add a check for undefined data
  if (!data || !data.data)
    return <div className='text-center py-4'>No data available</div>;

  return (
    <div className='mt-8'>
      {/* Desktop view (table) */}
      <div className='hidden lg:block overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[100px]'>Serial no.</TableHead>
              <TableHead className='w-[200px]'>Chart Position</TableHead>
              <TableHead>DJ Name</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Artist</TableHead>
              <TableHead>Mix</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((items, index) => (
              <TableRow key={items.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{items.position}</TableCell>
                <TableCell>{items.user?.name}</TableCell>
                <TableCell>{items.track?.title}</TableCell>
                <TableCell>{items.artist}</TableCell>
                <TableCell>
                  {items.mixes
                    ?.map((item) => item?.mix?.title)
                    .filter(Boolean)
                    .join(', ')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Tablet view (2-column cards) */}
      <div className='grid lg:hidden grid-cols-1 md:grid-cols-2 gap-4'>
        {data.data.map((items, index) => (
          <Card
            key={items.id}
            className='w-full hover:shadow-lg transition-shadow'
          >
            <CardHeader className='space-y-1'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-2xl font-bold'>
                  {items.track?.title}
                </CardTitle>
                <Badge variant='secondary' className='h-6'>
                  #{index + 1}
                </Badge>
              </div>
              <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                <Trophy className='h-4 w-4' />
                <span>Chart Position: {items.position}</span>
              </div>
            </CardHeader>
            <CardContent className='grid gap-4'>
              <div className='grid gap-2'>
                <div className='flex items-center gap-2'>
                  <User className='h-4 w-4 text-muted-foreground' />
                  <div className='grid gap-0.5'>
                    <label className='text-sm font-medium'>DJ Name</label>
                    <span className='text-sm text-muted-foreground'>
                      {items.user?.name}
                    </span>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Music2 className='h-4 w-4 text-muted-foreground' />
                  <div className='grid gap-0.5'>
                    <label className='text-sm font-medium'>Artist</label>
                    <span className='text-sm text-muted-foreground'>
                      {items.artist}
                    </span>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Music2 className='h-4 w-4 text-muted-foreground rotate-90' />
                  <div className='grid gap-0.5'>
                    <label className='text-sm font-medium'>Mix</label>
                    <span className='text-sm text-muted-foreground'>
                      {items.mixes
                        ?.map((item) => item?.mix?.title)
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
