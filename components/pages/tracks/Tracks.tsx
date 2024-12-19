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

export default function TracksPage() {
  const { data: session, status } = useSession();

  const [tracks, setTracks] = useState<UserTrack[]>([]);
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState([]);
  const [trackLoading, setTrackLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<Tracks[]>([]);
  const [isPending, startTransition] = useTransition();

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
      await updateTrackPosition(newTracks);
      fetchUpfrontTracks();
    }
  };

  const handleAddTrack = async () => {
    if (!search.trim()) return;

    const userId = session?.user.id;
    if (!userId) {
      console.error('User ID is not available in the session.');
      return;
    }

    const position = tracks.length ? tracks.length + 1 : 1;
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
    const result = await SearchTrack(value, 'upfront');
    setSearchResult(result);
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
    try {
      await ImportUpfrontTracks(session?.user?.id);
      fetchUpfrontTracks();
      trackImportCheckRefetch();
      toast.success('Track imported successfully');
    } catch (error) {
      toast.error('Failed to import tracks');
    }
  };

  if (status === 'loading') {
    return <Loading />;
  }

  const handleSavePlaylist = async () => {
    if (!session) {
      toast.error('Please sign in to save your playlist');
      return;
    }

    setIsSaving(true);
    try {
      await updateTrackStatus(tracks.slice(0, TracksLimit));
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
                  {searchResult.map((track) => {
                    return (
                      <div
                        key={track.id}
                        className='py-2 px-4 hover:bg-gray-100 cursor-pointer'
                        onClick={() => handleSearchAndAdd(track)}
                      >
                        {track.title}
                      </div>
                    );
                  })}
                </div>
                {searchResult.length < 1 && (
                  <div className='p-2'>
                    <Button
                      variant='ghost'
                      className='w-full justify-start'
                      onClick={handleAddTrack}
                    >
                      <Plus className='mr-2 h-4 w-4' />
                      Create &quot;{search}&quot;
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
              disabled={!trackImportCheck || trackImportCheckLoading}
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
            onClick={handleSavePlaylist}
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
    </div>
  );
}
