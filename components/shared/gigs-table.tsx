'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { GigsData } from '@/types/track';
import dayjs from 'dayjs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

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
    data: GigsData[];
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

export default function GigsTable({
  data,
  isLoading,
  params,
  setParams,
}: TrackTableProps) {
  return isLoading ? (
    'Loading...'
  ) : (
    <div className='mt-8'>
      <div className='lg:block hidden'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[100px]'>Serial no.</TableHead>
              <TableHead>DJ Name</TableHead>
              <TableHead>Club Name</TableHead>
              <TableHead>Day</TableHead>
              <TableHead>Time Slot</TableHead>
              <TableHead className='text-center'>Has Played</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((items, index) => (
              <TableRow key={items.id}>
                <TableCell>
                  {index + 1 + (data.page - 1) * data.limit}
                </TableCell>
                <TableCell>{items.user?.name}</TableCell>
                <TableCell>{items.clubName}</TableCell>
                <TableCell>{dayjs(items.dayOfGig).format('dddd')}</TableCell>
                <TableCell>
                  {items.startDate}-{items.startDate}
                </TableCell>
                <TableCell className='text-center'>
                  {items.hasPlayed === 'yes' ? 'Yes' : 'No'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className='lg:hidden block'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {data.data.map((gig, index) => (
            <Card key={gig.id} className='hover:shadow-lg transition-shadow'>
              <CardHeader className='space-y-1'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-xl font-bold'>
                    {gig.clubName}
                  </CardTitle>
                  <div
                    className={`px-2 py-1 rounded-full text-xs ${
                      gig.hasPlayed === 'yes'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {gig.hasPlayed === 'yes' ? 'Played' : 'Not Yet'}
                  </div>
                </div>
              </CardHeader>
              <CardContent className='grid gap-3'>
                <div className='grid grid-cols-2 gap-2 text-sm'>
                  <div className='text-muted-foreground'>Serial No.</div>
                  <div className='font-medium'>{index + 1}</div>
                  <div className='text-muted-foreground'>DJ Name</div>
                  <div className='font-medium'>{gig.user?.name}</div>
                  <div className='text-muted-foreground'>Day</div>
                  <div className='font-medium'>
                    {dayjs(gig.dayOfGig).format('dddd')}
                  </div>
                  <div className='text-muted-foreground'>Time Slot</div>
                  <div className='font-medium'>
                    {gig.startDate}-{gig.startDate}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {data.totalPages > 1 && (
        <div className='flex items-center justify-end space-x-2 py-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={() =>
              setParams({
                ...params,
                page: (parseInt(params.page) - 1).toString(),
              })
            }
            disabled={+params.page <= 1}
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() =>
              setParams({
                ...params,
                page: (parseInt(params.page) + 1).toString(),
              })
            }
            disabled={+params.page >= data.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
