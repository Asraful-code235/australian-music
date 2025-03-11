'use client';

import { useEffect, useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Command } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Music, Plus, Loader2 } from 'lucide-react';
import { Tracks, UserTrack } from '@/types/track';
import { toast } from 'sonner';

import { useQuery } from '@tanstack/react-query';
import { getTracks } from '@/actions/upfront-tracks/GetTracks';

import { addTracks } from '@/actions/upfront-tracks/AddTracks';
import { updateTrackPosition } from '@/actions/upfront-tracks/UpdateTrackPosition';
import AllTracks from './AllTracks';
import Loading from '../../shared/loading/Loading';
import { updateTrackStatus } from '@/actions/upfront-tracks/UpdateUpfrontStatus';
import { TracksLimit } from '@/lib/utils';
import { addSearchedTrack } from '@/actions/upfront-tracks/AddSearchTrack';
import { useDebouncedCallback } from 'use-debounce';
import { SearchTrack } from '@/actions/shared/SearchTrack';
import { ImportUpfrontTracks } from '@/actions/upfront-tracks/ImportUpfrontTracks';
import { checkImport } from '@/actions/upfront-tracks/checkImport';
import ConfirmModal from '@/components/shared/ConfirmModal';

export default function TracksPage() {
  const { data: session, status } = useSession();

  const [tracks, setTracks] = useState<UserTrack[]>([]);
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasExactMatch, setHasExactMatch] = useState(false);
  const [trackLoading, setTrackLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<Tracks[]>([]);
  const [isPending, startTransition] = useTransition();
  const [searchLoading, setSearchLoading] = useState(false);
  const [isPendingImport, startImportTransition] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const fetchUpfrontTracks = async () => {
    if (!session?.user.id) return;
    setTrackLoading(true);
    try {
      const data = await getTracks(session.user.id);
      const typedTracksData = data.map((item) => ({
        ...item,
        position: item.position || 1,
      }));
      setTracks(typedTracksData);
    } catch (error) {
      toast.error('Failed to fetch tracks');
    } finally {
      setTrackLoading(false);
    }
  };

  useEffect(() => {
    fetchUpfrontTracks();
  }, [session]);

  const {
    isLoading: trackImportCheckLoading,
    data: trackImportCheck,
    error: trackImportCheckError,
    refetch: trackImportCheckRefetch,
  } = useQuery({
    queryKey: ['upfront-tracks-import-check'],
    queryFn: () =>
      checkImport(session?.user.id || '')
        .then((data) => data)
        .catch((error) => console.error(error)),
  });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = tracks.findIndex((item) => item.id === active.id);
      const newIndex = tracks.findIndex((item) => item.id === over.id);

      const newTracks = arrayMove(tracks, oldIndex, newIndex).map(
        (track, index) => ({
          ...track,
          position: index + 1,
        })
      );
      setTracks(newTracks);
      const promise = updateTrackPosition(newTracks);

      toast.promise(promise, {
        loading: 'Track position updating...',
        success: () => {
          fetchUpfrontTracks();
          return 'Track position updated successfully';
        },
        error: 'Failed to Track position updated',
      });
    }
  };

  const handleAddTrack = async () => {
    if (!search.trim() || hasExactMatch) return;

    const userId = session?.user.id;
    if (!userId) {
      console.error('User ID is not available in the session.');
      return;
    }

    // Calculate the next position based on the maximum position in existing tracks
    const maxPosition = tracks.reduce(
      (max, track) => Math.max(max, track.position || 0),
      0
    );
    const position = maxPosition + 1;

    startTransition(async () => {
      try {
        const res = await addTracks({
          title: search,
          userId,
          position,
        });

        fetchUpfrontTracks();
        setSearch('');
        toast.success('Track added successfully');
      } catch (error) {
        toast.error('Failed to add track');
      }
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSearch = useDebouncedCallback(async (value: string) => {
    setSearchLoading(true);
    const { results, hasExactMatch } = await SearchTrack(value, 'upfront');
    setHasExactMatch(hasExactMatch);
    setSearchResult(results);
    setSearchLoading(false);
  }, 500);

  const handleInputChange = (value: string) => {
    setSearch(value);
    handleSearch(value);
  };

  const handleSearchAndAdd = async (value: Tracks) => {
    setSearch(value.title);

    if (!search.trim()) return;

    const userId = session?.user.id;
    if (!userId) {
      console.error('User ID is not available in the session.');
      return;
    }
    const position = tracks.length ? tracks.length + 1 : 1;
    try {
      const res = await addSearchedTrack({
        trackId: value.id,
        userId,
        position,
      });

      fetchUpfrontTracks();
      setSearch('');
      toast.success('Track added successfully');
    } catch (error) {
      console.error('Error adding track:', error);
    }
  };

  const handleImport = async () => {
    if (!session) {
      toast.error('Please sign in to save your playlist');
      return;
    }
    startImportTransition(() => {
      toast.promise(
        (async () => {
          await ImportUpfrontTracks(session?.user?.id);
          fetchUpfrontTracks();
          trackImportCheckRefetch();
        })(),
        {
          loading: 'Importing tracks...',
          success: 'Tracks imported successfully',
          error: 'Failed to import tracks',
        }
      );
    });
  };

  if (status === 'loading') {
    return <Loading />;
  }

  const handleDeleteClick = () => {
    setIsConfirmOpen(true);
  };

  const handleSavePlaylist = async () => {
    if (!session) {
      toast.error('Please sign in to save your playlist');
      return;
    }

    setIsSaving(true);
    try {
      await updateTrackStatus(tracks.slice(0, TracksLimit));

      const remainingTracks = tracks.slice(TracksLimit);
      const updatedTracks = remainingTracks.map((track, index) => ({
        ...track,
        position: index + 1,
      }));

      if (updatedTracks.length > 0) {
        const positionUpdatePromises = updatedTracks.map((track) =>
          updateTrackPosition([track])
        );
        await Promise.all(positionUpdatePromises);
      }

      fetchUpfrontTracks();
      trackImportCheckRefetch();
      toast.success('Playlist saved successfully');
    } catch (error) {
      toast.error('Failed to save playlist');
    } finally {
      setIsSaving(false);
    }
  };

  const handleError = (): Array<boolean> | undefined => {
    const errorArray = tracks?.slice(0, TracksLimit).map((item) => {
      return (
        item.artists?.name === null ||
        item.artists?.name === '' ||
        item?.track?.title === null ||
        !item.mixes ||
        item.mixes.length < 1
      );
    });
    return errorArray ?? [];
  };

  const allTrue = handleError()?.every((value) => value === false) ?? true;

  if (!session) {
    return (
      <div className='max-w-3xl mx-auto p-6 text-center'>
        <h1 className='text-3xl font-bold mb-4'>Please Sign In</h1>
        <p className='text-gray-600'>
          You need to be signed in to create and save playlists.
        </p>
      </div>
    );
  }

  return (
    <div className='max-w-3xl mx-auto p-1 lg:p-6 space-y-6'>
      <div className='flex flex-col space-y-4'>
        <h1 className='text-xl lg:text-3xl font-bold'>
          Create Your Top 20 Tracks
        </h1>

        <div className='flex gap-3'>
          <div className='relative flex-1'>
            <Command className='rounded-lg border shadow-md'>
              <div className='flex items-center border-b px-3'>
                <Music className='mr-2 h-4 w-4 shrink-0 opacity-50' />
                <Input
                  placeholder='Search or create a track...'
                  value={search}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className='flex h-10 w-full border-none shadow-none focus-none  focus-visible:ring-0'
                />
              </div>
            </Command>

            {search && (
              <div className='absolute w-full bg-white rounded-b-lg border border-t-0 shadow-lg z-[9999] max-h-[250px] overflow-y-auto'>
                <div>
                  {searchLoading ? (
                    <div className='p-4 text-sm text-muted-foreground'>
                      Loading...
                    </div>
                  ) : (
                    searchResult.map((track) => {
                      return (
                        <div
                          key={track.id}
                          className='py-2 px-4 hover:bg-gray-100 cursor-pointer text-sm'
                          onClick={() => handleSearchAndAdd(track)}
                        >
                          {track.title}
                        </div>
                      );
                    })
                  )}
                </div>
                {!searchLoading && !hasExactMatch && (
                  <div className='p-2'>
                    <Button
                      variant='ghost'
                      className='w-full justify-start px-2'
                      onClick={handleAddTrack}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <span className='flex items-center gap-1'>
                          <Loader2 className='animate-spin mr-2 h-4 w-4' />{' '}
                          Adding...
                        </span>
                      ) : (
                        <span className='flex items-center'>
                          <Plus className='mr-2 h-4 w-4' />
                          Create &quot;{search}&quot;
                        </span>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div>
            <Button
              size='lg'
              onClick={handleImport}
              disabled={
                !trackImportCheck || trackImportCheckLoading || isPendingImport
              }
            >
              Import
            </Button>
          </div>
        </div>

        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <AllTracks
            tracks={tracks || []}
            refetch={fetchUpfrontTracks}
            error={handleError}
          />
        </DndContext>

        {tracks.length > 0 && (
          <Button
            className='w-full'
            onClick={handleDeleteClick}
            disabled={tracks.length < TracksLimit || isSaving || !allTrue}
          >
            {isSaving ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Saving...
              </>
            ) : tracks.length >= TracksLimit ? (
              'Save Playlist'
            ) : (
              `Add ${TracksLimit - tracks.length} more tracks`
            )}
          </Button>
        )}
      </div>
      <ConfirmModal
        isOpen={isConfirmOpen}
        setIsOpen={setIsConfirmOpen}
        loading={isSaving}
        title='This action can be reorder your tracks, are you sure you want to save the playlist?'
        onClick={handleSavePlaylist}
      />
    </div>
  );
}
