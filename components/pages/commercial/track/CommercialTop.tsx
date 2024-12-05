'use client';

import { deleteCommercialTracks } from '@/actions/admin/commercial/DeleteCommercialTracks';
import { fetchCommercialTracks } from '@/actions/admin/commercial/FetchCommercialTracks';
import DeleteTrackSelect from '@/components/shared/delete-track-select';
import NoDataFound from '@/components/shared/no-data-found';
import TracksTable from '@/components/shared/tracks-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { generateQueryString } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export default function CommercialTop() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
  });

  const queryString = generateQueryString(params);

  const {
    data: commercialData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      `track/commercial${queryString}`,
      { page: params.page, search: params.search },
    ],
    queryFn: () => fetchCommercialTracks(queryString as string),
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
    console.log(value);
    await deleteCommercialTracks(value);
    refetch();
  };

  return commercialData && commercialData.data.length > 0 ? (
    <div className='container mx-auto py-10'>
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold tracking-tight'>
            Commercial Top Tracks
          </h1>
        </div>
        <div className='flex lg:flex-row flex-col justify-between gap-3'>
          <Input
            placeholder='Search by DJ name...'
            defaultValue={params.search}
            onChange={(e) => debounced(e.target.value)}
            className='w-full max-w-md'
          />
          <DeleteTrackSelect onDelete={handleDelete} />
        </div>
      </div>

      <div className='mt-4'>
        <TracksTable
          data={commercialData}
          isLoading={isLoading}
          params={params}
          setParams={setParams}
        />
      </div>
    </div>
  ) : (
    <NoDataFound />
  );
}
