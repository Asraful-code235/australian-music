'use client';

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
import { QueryObserverResult } from '@tanstack/react-query';
import TracksTableRow from './tracks-table-row';
import { useState } from 'react';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TrackCardItems from './track-card-items';

export type UserTrack = {
  id?: string;
  position?: number | null | undefined;
  artists: {
    id: string;
    name: string;
  } | null;
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
      id: string;
      title: string;
    };
  }[];
  status: boolean | null;
  label?: string | null;
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
  refetch?: () => Promise<QueryObserverResult>;
  trackType: 'commercial' | 'upfront';
  handlePageChange?: (page: number) => Promise<void>;
};

export default function TracksTable({
  data,
  isLoading: isLoadingProp,
  params,
  setParams,
  refetch,
  trackType,
  handlePageChange,
}: TrackTableProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePreviousPage = async () => {
    if (data.page > 1) {
      if (handlePageChange) {
        try {
          setIsLoading(true);
          const toastId = toast.loading('Loading tracks...');
          await handlePageChange(data.page - 1);
          toast.success('Tracks loaded successfully', {
            id: toastId,
          });
        } catch (error) {
          toast.error('Failed to load tracks');
        } finally {
          setIsLoading(false);
        }
      } else {
        setParams({ ...params, page: String(Number(params.page) - 1) });
      }
    }
  };

  const handleNextPage = async () => {
    if (data.page < data.totalPages) {
      if (handlePageChange) {
        try {
          setIsLoading(true);
          const toastId = toast.loading('Loading tracks...');
          await handlePageChange(data.page + 1);
          toast.success('Tracks loaded successfully', {
            id: toastId,
          });
        } catch (error) {
          toast.error('Failed to load tracks');
        } finally {
          setIsLoading(false);
        }
      } else {
        setParams({ ...params, page: String(Number(params.page) + 1) });
      }
    }
  };

  if (isLoadingProp) return <div className='py-4'>Loading...</div>;

  if (!data || !data.data) return <div className='py-4'>No data available</div>;

  return (
    <div className='mt-8'>
      {/* Desktop view (table) */}
      <div className='hidden lg:block overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>DJ Name</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Artist</TableHead>
              <TableHead>Mix</TableHead>
              <TableHead className='w-[100px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((items, index) => (
              <TracksTableRow
                key={items.id}
                index={index}
                data={data}
                items={items}
                refetch={refetch}
                trackType={trackType}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Tablet view (2-column cards) */}
      <div className='grid lg:hidden grid-cols-1 md:grid-cols-2 gap-4'>
        {data.data.map((items, index) => (
          <TrackCardItems
            key={items.id}
            index={index}
            data={data}
            items={items}
            refetch={refetch}
            trackType={trackType}
          />
        ))}
      </div>

      {data.totalPages > 1 && (
        <div className='flex justify-between items-center mt-8'>
          <Button
            size='sm'
            onClick={handlePreviousPage}
            disabled={data.page <= 1 || isLoading}
          >
            <ChevronLeft className='h-4 w-4' />
            Previous
          </Button>
          <span className='text-sm text-muted-foreground'>
            Page {data.page} of {data.totalPages}
          </span>
          <Button
            size='sm'
            onClick={handleNextPage}
            disabled={data.page >= data.totalPages || isLoading}
          >
            Next
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      )}
    </div>
  );
}
