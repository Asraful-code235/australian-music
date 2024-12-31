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
  const handlePreviousPage = () => {
    if (data.page > 1) {
      setParams({ ...params, page: String(Number(params.page) - 1) });
    }
  };

  const handleNextPage = () => {
    if (data.page < data.totalPages) {
      setParams({ ...params, page: String(Number(params.page) + 1) });
    }
  };

  if (isLoading) return <div className='py-4'>Loading...</div>;

  if (!data || !data.data) return <div className='py-4'>No data available</div>;

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
                <TableCell>
                  {index + 1 + (data.page - 1) * data.limit}
                </TableCell>
                <TableCell>{items.position}</TableCell>
                <TableCell>{items.user?.name}</TableCell>
                <TableCell>{items.track?.title}</TableCell>
                <TableCell>{items.artists?.name}</TableCell>
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
                  #{index + 1 + (data.page - 1) * data.limit}
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
                      {items?.artists?.name}
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

      {data.totalPages > 1 && (
        <div className='flex justify-between items-center mt-8'>
          <Button
            size='sm'
            onClick={handlePreviousPage}
            disabled={data.page === 1}
          >
            Previous
          </Button>
          <span className='text-sm text-muted-foreground'>
            Page {data.page} of {data.totalPages}
          </span>
          <Button
            size='sm'
            onClick={handleNextPage}
            disabled={data.page === data.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
