'use client';

import { getAllArtists } from '@/actions/shared/GetAllArtists';
import { updateArtist } from '@/actions/shared/UpdateArtist';
import { deleteArtist } from '@/actions/shared/DeleteArtist';
import CommonDataTable from '@/components/shared/CommonDataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateQueryString } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { GoDownload } from 'react-icons/go';
import { useDebouncedCallback } from 'use-debounce';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ArtistEditForm from '@/components/shared/ArtistEditForm';
import { toast } from 'sonner';
import { FiTrash2 } from 'react-icons/fi';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import ModalForm from '@/components/shared/shared-modal';

const tableHeaders = [
  { key: 'name', value: 'Name' },
  { key: 'actions', value: 'Actions', width: '140px' },
];

const ArtistSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export type ArtistInput = z.infer<typeof ArtistSchema>;

export default function ArtistsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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

  const handleDelete = async () => {
    if (!selectedArtist) return;

    startTransition(async () => {
      try {
        await deleteArtist(selectedArtist.id);
        toast.success('Artist deleted successfully!');
        setIsDeleteDialogOpen(false);
        refetch();
      } catch (error) {
        toast.error('Failed to delete artist');
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
          customActions={(item) => (
            <Button
              variant='outline'
              size='icon'
              className='h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10'
              onClick={() => {
                setSelectedArtist(item);
                setIsDeleteDialogOpen(true);
              }}
            >
              <FiTrash2 className='h-4 w-4' />
            </Button>
          )}
        />

        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                artist and remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
            onSubmit={onSubmit}
            errors={errors}
            register={register}
          />
        </ModalForm>
      </div>
    </div>
  );
}
