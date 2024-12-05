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
              <TableCell>{index + 1}</TableCell>
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
