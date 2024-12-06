'use client';

import { useQuery } from '@tanstack/react-query';
import { AddUserDialog } from './add-user-dialog';
import { columns } from './columns';
import { DataTable } from './data-table';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { generateQueryString } from '@/lib/utils';
import { fetchAllUser } from '@/actions/user/fetchAllUser';
import { UserResponse } from '@/types/track';
import { useDebouncedCallback } from 'use-debounce';
import UsersTable from '../../shared/users-table';
import { Input } from '../../ui/input';

export default function UserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
  });

  const queryString = generateQueryString(params);

  const {
    data: usersData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      `user${queryString}`,
      { page: params.page, search: params.search },
    ],
    queryFn: () => fetchAllUser(queryString as string),
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

  console.log({ usersData });
  return (
    <div className='container mx-auto py-10'>
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold tracking-tight'>
            Users Management
          </h1>
        </div>
        <div className='flex lg:flex-row flex-col justify-between gap-3'>
          <Input
            placeholder='Search by DJ name or Email'
            defaultValue={params.search}
            onChange={(e) => debounced(e.target.value)}
            className='w-full lg:w-2/6'
          />
          <div className='flex gap-2'>
            <AddUserDialog />
          </div>
        </div>
      </div>

      <UsersTable
        data={usersData}
        isLoading={isLoading}
        params={params}
        setParams={setParams}
        refetch={refetch}
      />
    </div>
  );
}
