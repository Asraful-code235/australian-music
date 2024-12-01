'use client';

import { useState, useEffect } from 'react';
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

import AllTracks from '../../shared/tracks/AllTracks';
import Loading from '../../shared/loading/Loading';
import { getTracks } from '@/actions/commercial-tracks/GetTracks';
import { updateTrackPosition } from '@/actions/commercial-tracks/UpdateTrackPosition';
import { addTracks } from '@/actions/commercial-tracks/AddCommercialTracks';

export default function CommercialPage() {
  const { data: session, status } = useSession();

  const [tracks, setTracks] = useState<UserTrack[]>([]);
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState([]);

  const {
    isLoading: trackLoading,
    data: commercialTracksData,
    error: trackError,
    refetch,
  } = useQuery({
    queryKey: ['upfront-tracks'],
    queryFn: () =>
      getTracks(session?.user.id)
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
      refetch();
    }
  };

  const handleAddTrack = async () => {
    if (!search.trim()) return;

    const userId = session?.user.id;
    if (!userId) {
      console.error('User ID is not available in the session.');
      return;
    }

    try {
      const res = await addTracks({ title: search, userId });

      refetch();
      setSearch('');
      toast.success('Track added successfully');
    } catch (error) {
      console.error('Error adding track:', error);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (commercialTracksData) {
      const typedTracksData = commercialTracksData.map((item: any) => ({
        ...item,
        position: item.position || 1,
      })) as UserTrack[];
      setTracks(typedTracksData);
    }
  }, [commercialTracksData, refetch]);

  if (status === 'loading' || trackLoading) {
    return <Loading />;
  }

  const handleSavePlaylist = async () => {
    if (!session) {
      toast.error('Please sign in to save your playlist');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tracks }),
      });

      if (!response.ok) throw new Error('Failed to save playlist');
      toast.success('Playlist saved successfully');
    } catch (error) {
      toast.error('Failed to save playlist');
    } finally {
      setIsSaving(false);
    }
  };

  const handleError = (): Array<boolean> | undefined => {
    const errorArray = tracks?.map((item) => {
      return (
        item.artist === null ||
        item.artist === '' ||
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
    <div className='max-w-3xl mx-auto p-6 space-y-6'>
      <div className='flex flex-col space-y-4'>
        <h1 className='text-3xl font-bold'>Create Your Top 20 Tracks</h1>

        <div className='relative'>
          <Command className='rounded-lg border shadow-md'>
            <div className='flex items-center border-b px-3'>
              <Music className='mr-2 h-4 w-4 shrink-0 opacity-50' />
              <Input
                placeholder='Search or create a track...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='flex h-11 w-full border-none shadow-none focus-none  focus-visible:ring-0'
              />
            </div>
          </Command>

          {search && (
            <div className='absolute w-full bg-white rounded-b-lg border border-t-0 shadow-lg z-10'>
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
            </div>
          )}
        </div>

        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <AllTracks
            tracks={tracks || []}
            refetch={refetch}
            error={handleError}
          />
        </DndContext>

        {tracks.length > 0 && (
          <Button
            className='w-full'
            onClick={handleSavePlaylist}
            disabled={tracks.length !== 20 || isSaving || !allTrue}
          >
            {isSaving ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Saving...
              </>
            ) : tracks.length === 20 ? (
              'Save Playlist'
            ) : (
              `Add ${20 - tracks.length} more tracks`
            )}
          </Button>
        )}
      </div>
    </div>
  );
}