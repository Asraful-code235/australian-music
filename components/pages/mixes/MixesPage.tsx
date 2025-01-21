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
import { getAllMixes } from '@/actions/shared/GetAllMixes';
import MixEditForm from '@/components/shared/MixEditform';
import { updateMix } from '@/actions/shared/UpdateMix';
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
import { deleteMix } from '@/actions/shared/DeleteMix';

const tableHeaders = [
  { key: 'title', value: 'Title' },
  { key: 'actions', value: 'Actions', width: '140px' },
];

const MixSchema = z.object({
  title: z.string().min(2, 'Name must be at least 2 characters'),
});

export type MixInput = z.infer<typeof MixSchema>;

export default function MixesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMix, setSelectedMix] = useState<Record<string, any> | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
  });

  const queryString = generateQueryString(params);

  const {
    data: allMixesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['all-mixes', params],
    queryFn: () => getAllMixes(queryString),
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
  } = useForm<MixInput>({
    resolver: zodResolver(MixSchema),
    defaultValues: {
      title: '',
    },
  });

  useEffect(() => {
    if (selectedMix) {
      reset({
        title: selectedMix.title,
      });
    }
  }, [selectedMix, reset]);

  useEffect(() => {
    router.push(queryString);
  }, [queryString, router]);

  const onSubmit = async (data: MixInput) => {
    startTransition(async () => {
      const promise = updateMix({
        title: data.title,
        id: selectedMix?.id || '',
      });

      toast.promise(promise, {
        loading: 'Updating Mix...',
        success: () => {
          setIsEditModalOpen(false);
          refetch();
          return 'Mix updated successfully!';
        },
        error: 'Failed to update Mix.',
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
    if (!selectedMix) return;

    startTransition(async () => {
      try {
        await deleteMix(selectedMix.id);
        toast.success('Mix deleted successfully!');
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
          <h1 className='text-3xl font-bold tracking-tight'>All Mixes</h1>
        </div>
        <div className='flex lg:flex-row flex-col justify-between gap-3'>
          <Input
            placeholder='Search by mix title...'
            defaultValue={params.search}
            onChange={(e) => debounced(e.target.value)}
            className='w-full lg:w-2/6'
          />
        </div>
        <CommonDataTable
          headers={tableHeaders}
          data={allMixesData}
          loading={isLoading}
          setParams={setParams}
          params={params}
          onEdit={(mix) => {
            setSelectedMix(mix);
            setIsEditModalOpen(true);
          }}
          customActions={(item) => (
            <Button
              variant='outline'
              size='icon'
              className='h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10'
              onClick={() => {
                setSelectedMix(item);
                setIsDeleteDialogOpen(true);
              }}
            >
              <FiTrash2 className='h-4 w-4' />
            </Button>
          )}
        />
      </div>

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
      <ModalForm<MixInput>
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        title='Edit Mix'
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        isValid={isValid}
        isPending={isPending}
      >
        <MixEditForm errors={errors} register={register} />
      </ModalForm>
    </div>
  );
}
