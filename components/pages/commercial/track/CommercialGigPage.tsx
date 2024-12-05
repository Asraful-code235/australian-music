'use client';

import { FetchCommercialGigs } from '@/actions/gigs/commercial/FetchCommercialGig';
import { updateCommercialGigExportStatus } from '@/actions/gigs/commercial/UpdateCommercialGigExpStatus';
import GigsTable from '@/components/shared/gigs-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateQueryString, gigsCsv } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';

import { useEffect, useState } from 'react';
import { GoDownload } from 'react-icons/go';
import { useDebouncedCallback } from 'use-debounce';

export default function CommercialGigPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
  });

  const queryString = generateQueryString(params);

  const {
    data: commercialGigsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      `track/commercial${queryString}`,
      { page: params.page, search: params.search },
    ],
    queryFn: () => FetchCommercialGigs(queryString as string),
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

  const handleExport = async () => {
    if (!commercialGigsData?.data || commercialGigsData?.data.length === 0)
      return;

    gigsCsv(commercialGigsData, 'commercial-gig.csv');

    const ids = commercialGigsData.data.map((gig: { id: string }) => gig.id);
    await updateCommercialGigExportStatus(ids);
    refetch();
  };

  return (
    <div className='container mx-auto py-10'>
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold tracking-tight'>Commercial Gigs</h1>
        </div>
        <div className='flex lg:flex-row flex-col justify-between gap-3'>
          <Input
            placeholder='Search by DJ name or Club name'
            defaultValue={params.search}
            onChange={(e) => debounced(e.target.value)}
            className='w-full lg:w-2/6'
          />
          <div className='flex gap-2'>
            <Button
              variant='outline'
              disabled={commercialGigsData?.data.length === 0}
              onClick={handleExport}
            >
              <GoDownload />
              <span className='hidden lg:block'>Export to CSV</span>
            </Button>
          </div>
        </div>
      </div>

      <GigsTable
        data={commercialGigsData}
        isLoading={isLoading}
        params={params}
        setParams={setParams}
      />
    </div>
  );
}
