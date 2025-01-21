'use client';

import { getAllArtists } from '@/actions/shared/GetAllArtists';
import { getArtist } from '@/actions/shared/GetArtist';
import DeleteTrackSelect from '@/components/shared/delete-track-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { generateQueryString } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { GoDownload } from 'react-icons/go';
import { useDebouncedCallback } from 'use-debounce';

import CommonDataTable from '@/components/shared/CommonDataTable';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ModalForm from '@/components/shared/shared-modal';
import ArtistEditForm from '@/components/shared/ArtistEditForm';
import { toast } from 'sonner';
import { updateArtist } from '@/actions/shared/UpdateArtist';

const tableHeaders = [
  { key: 'name', value: 'Name' },
  { key: 'actions', value: 'Actions' },
];

const ArtistSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export type ArtistInput = z.infer<typeof ArtistSchema>;

export default function ArtistsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Record<
    string,
    any
  > | null>(null);
  const [isPending, startTransition] = useTransition();
  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
  });

  const queryString = generateQueryString(params);

  const {
    data: allArtistData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['all-artists', params],
    queryFn: () => getAllArtists(queryString),
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

  const {
    register,
    control,
    reset,
    handleSubmit,
    getValues,
    formState: { errors, isValid },
  } = useForm<ArtistInput>({
    resolver: zodResolver(ArtistSchema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    if (selectedArtist) {
      reset({
        name: selectedArtist.name,
      });
    }
  }, [selectedArtist, reset]);

  useEffect(() => {
    router.push(queryString);
  }, [queryString, router]);

  const onSubmit = async (data: ArtistInput) => {
    startTransition(async () => {
      const promise = updateArtist({
        name: data.name,
        id: selectedArtist?.id || '',
      });

      toast.promise(promise, {
        loading: 'Updating artist...',
        success: () => {
          setIsEditModalOpen(false);
          refetch();
          return 'Artist updated successfully!';
        },
        error: 'Failed to update artist.',
      });

      try {
        await promise;
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Something went wrong';
        toast.error(message);
      }
    });
  };

  return (
    <div className='container mx-auto py-10'>
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold tracking-tight'>All Artists</h1>
        </div>
        <div className='flex lg:flex-row flex-col justify-between gap-3'>
          <Input
            placeholder='Search by artist name...'
            defaultValue={params.search}
            onChange={(e) => debounced(e.target.value)}
            className='w-full lg:w-2/6'
          />
        </div>
        <CommonDataTable
          headers={tableHeaders}
          data={allArtistData}
          loading={isLoading}
          setParams={setParams}
          params={params}
          onEdit={(artist) => {
            setSelectedArtist(artist);
            setIsEditModalOpen(true);
          }}
        />
      </div>

      {/* <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Artist</DialogTitle>
          </DialogHeader>
         
        </DialogContent>
      </Dialog> */}
      <ModalForm<ArtistInput>
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        title='Edit Artist'
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        isValid={isValid}
        isPending={isPending}
      >
        <ArtistEditForm
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          errors={errors}
          control={control}
          register={register}
          isValid={isValid}
        />
        {/* <div>check</div> */}
      </ModalForm>
    </div>
  );
}
