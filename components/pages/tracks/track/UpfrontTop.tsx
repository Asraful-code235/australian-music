'use client';

import { fetchUpfrontTracks } from '@/actions/admin/upfront/FetchUpfrontTrack';
import TracksTable from '@/components/shared/tracks-table';
import { Input } from '@/components/ui/input';
import { generateQueryString } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export default function UpfrontTop() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
  });

  const queryString = generateQueryString(params);
  console.log({ queryString });

  const { data: commercialData, isLoading } = useQuery({
    queryKey: [
      `track/commercial${queryString}`,
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

  console.log({ commercialData, searchParams, isLoading });
  return (
    <div className='container mx-auto py-10'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold tracking-tight'>
          Upfront Top Tracks
        </h1>
      </div>
      <div className='my-4'>
        <Input
          placeholder='Search by user name...'
          defaultValue={params.search}
          onChange={(e) => debounced(e.target.value)}
          className='w-full max-w-md'
        />
      </div>

      <TracksTable
        data={commercialData}
        isLoading={isLoading}
        params={params}
        setParams={setParams}
      />
    </div>
  );
}
