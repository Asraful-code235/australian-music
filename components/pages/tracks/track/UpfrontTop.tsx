'use client';

import { deleteUpfrontTracks } from '@/actions/admin/upfront/DeleteUpfrontTracks';
import { fetchUpfrontTracks } from '@/actions/admin/upfront/FetchUpfrontTrack';
import { updateUpfrontExportStatus } from '@/actions/upfront-tracks/UpfrontTracksExport';
import DeleteTrackSelect from '@/components/shared/delete-track-select';
import NoDataFound from '@/components/shared/no-data-found';
import TracksTable from '@/components/shared/tracks-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { exportToCSV, generateQueryString } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { GoDownload } from 'react-icons/go';
import { useDebouncedCallback } from 'use-debounce';

export default function UpfrontTop() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
  });

  const queryString = generateQueryString(params);

  const {
    data: upfrontData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      `track/upfront-top${queryString}`,
      { page: params.page, search: params.search },
    ],
    queryFn: () => fetchUpfrontTracks(queryString as string),
    //@ts-ignore
    keepPreviousData: true,
  });

  const debounced = useDebouncedCallback((value) => {
    setParams((prevParams) => ({
      ...prevParams,
      search: value,
      page: '1',
    }));
  }, 500);

  useEffect(() => {
    router.push(queryString);
  }, [queryString, router]);

  const handleDelete = async (
    value: 'all' | 'one_week' | 'one_month' | 'six_month'
  ) => {
    await deleteUpfrontTracks(value);
    refetch();
  };

  const handleExport = async () => {
    if (!upfrontData?.data || upfrontData?.data.length === 0) return;

    exportToCSV(upfrontData, 'upfront-track.csv');
    const ids = upfrontData.data.map((gig: { id: string }) => gig.id);
    await updateUpfrontExportStatus(ids);
    refetch();
  };

  return (
    <div className='container mx-auto py-10'>
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold tracking-tight'>
            Upfront Top Tracks
          </h1>
        </div>
        <div className='flex lg:flex-row flex-col justify-between gap-3'>
          <Input
            placeholder='Search by DJ name...'
            defaultValue={params.search}
            onChange={(e) => debounced(e.target.value)}
            className='w-full lg:w-2/6'
          />
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={handleExport}
              disabled={upfrontData?.data.length === 0}
            >
              <GoDownload />
              <span className='hidden lg:block'>Export to CSV</span>
            </Button>
            <DeleteTrackSelect
              onDelete={handleDelete}
              disabled={upfrontData?.data.length === 0}
            />
          </div>
        </div>
      </div>

      <div className='mt-4'>
        <TracksTable
          data={upfrontData}
          isLoading={isLoading}
          params={params}
          setParams={setParams}
        />
      </div>
    </div>
  );
}
