'use client';

import { deleteCommercialTracks } from '@/actions/admin/commercial/DeleteCommercialTracks';
import { fetchCommercialTracks } from '@/actions/admin/commercial/FetchCommercialTracks';
import DeleteTrackSelect from '@/components/shared/delete-track-select';
import TracksTable from '@/components/shared/tracks-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { exportToCSV, generateQueryString } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { GoDownload } from 'react-icons/go';
import { updateCommercialExportStatus } from '@/actions/commercial-tracks/CommercialTrackExport';
import ConfirmModal from '@/components/shared/ConfirmModal';
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
import { DeleteTracksTypes } from '@/types/track';
import { toast } from 'sonner';
import { fetchAllCommercialTracks } from '@/actions/admin/commercial/FetchAllCommercialTracks';

export default function CommercialTop() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
  });
  const [deleteTypes, setDeleteTypes] = useState<DeleteTracksTypes>('all');
  const [isPending, startTransition] = useTransition();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isExportPending, startExportTransition] = useTransition();

  const queryString = generateQueryString(params);

  const {
    data: commercialData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['commercial-tracks', params],
    queryFn: () => fetchCommercialTracks(queryString),
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

  useEffect(() => {
    refetch();
  }, [params, refetch]);

  const handleExportClick = () => {
    if (!commercialData?.data || commercialData?.data.length === 0) return;
    setIsExportDialogOpen(true);
  };

  const handleExport = async () => {
    if (!commercialData?.data || commercialData?.data.length === 0) return;

    startExportTransition(async () => {
      const exportPromise = (async () => {
        const allData = await fetchAllCommercialTracks(params.search);
        exportToCSV(allData as any, 'commercial-track.csv');
        const ids = allData.data.map((track) => track.id);
        await updateCommercialExportStatus(ids);
        await refetch();

        return 'All tracks exported successfully';
      })();

      toast.promise(exportPromise, {
        loading: 'Exporting tracks...',
        success: (message) => message,
        error: 'Failed to export tracks',
      });

      setIsExportDialogOpen(false);
    });
  };

  const handleDeleteClick = (value: DeleteTracksTypes) => {
    setDeleteTypes(value);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    handleDelete(deleteTypes);
    setIsConfirmOpen(false);
  };

  const handleDelete = async (value: DeleteTracksTypes) => {
    startTransition(async () => {
      toast.promise(
        (async () => {
          await deleteCommercialTracks(value);
          refetch();
        })(),
        {
          loading: 'Deleting Tracks',
          success: 'Track deleted successfully!',
          error: (e) =>
            e instanceof Error ? e.message : 'Something went wrong',
        }
      );
    });
  };

  return (
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
            className='w-full lg:w-2/6'
          />
          <div className='flex gap-2'>
            <Button
              variant='outline'
              disabled={commercialData?.data.length === 0 || isExportPending}
              onClick={handleExportClick}
            >
              <GoDownload />
              <span className='hidden lg:block'>Export to CSV</span>
            </Button>
            <DeleteTrackSelect
              onDelete={handleDeleteClick}
              disabled={commercialData?.data.length === 0 || isPending}
            />
          </div>
        </div>
      </div>

      <TracksTable
        data={commercialData}
        isLoading={isLoading}
        params={params}
        setParams={setParams}
        refetch={refetch}
        trackType='commercial'
      />
      <ConfirmModal
        isOpen={isConfirmOpen}
        setIsOpen={setIsConfirmOpen}
        title='This action cannot be undone. This will permanently delete your Commercial Tracks and remove your data from our servers.'
        onClick={handleConfirmDelete}
      />
      <AlertDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Export Tracks</AlertDialogTitle>
            <AlertDialogDescription>
              This will export all tracks to a CSV file and mark them as
              exported. They will no longer appear in the list. Are you sure you
              want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleExport}>Export</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
