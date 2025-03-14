'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GripVertical, Save, Edit, X } from 'lucide-react';
import { Artist, Mix, Tracks, UserTrack } from '@/types/track';
import { toast } from 'sonner';

import { getMix } from '@/actions/shared/GetMix';
import { MultiValue, ActionMeta } from 'react-select';
import { addMix } from '@/actions/shared/AddMix';
import Select from 'react-select/async-creatable';
import { updateUpfrontTrackWithMixes } from '@/actions/upfront-tracks/UpdateTrack';
import { Label } from '@/components/ui/label';
import { TfiTrash } from 'react-icons/tfi';
import { deleteUpfrontTrack } from '@/actions/upfront-tracks/DeleteUpfrontTrack';
import { getArtist } from '@/actions/shared/GetArtist';
import { addArtist } from '@/actions/shared/AddArtist';
import { reactSelectStyle } from '@/lib/utils';
import TracksLoading from '@/components/shared/loading/TracksLoading';

interface TrackItemProps {
  track: UserTrack;
  refetch?: () => Promise<void>;
  error: () => Array<boolean> | undefined;
  index: number;
}

export function TrackItem({ track, refetch, error, index }: TrackItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTrack, setEditedTrack] = useState(track);
  const [isDragged, setIsDragged] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isUpdateTrackPending, startUpdateTrackTransition] = useTransition();
  const [trackTitle, setTrackTitle] = useState(track?.track?.title || '');
  const [selectedMixes, setSelectedMixes] = useState(
    track?.mixes
      ?.filter((item) => item?.mix?.title && item?.mix?.id)
      .map((item) => ({
        label: item.mix?.title || '',
        value: item.mix?.id || '',
      })) || []
  );

  const [allOptions, setAllOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [artistOptions, setArtistOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [mixes, setMixes] = useState<Mix[]>([]);
  const [searchArtist, setSearchArtist] = useState('');
  const [selectArtist, setSelectArtist] = useState<{
    value: string;
    label: string;
  }>({
    value: track?.artists?.id || '',
    label: track?.artists?.name || '',
  });
  const [artists, setArtists] = useState<Artist[]>([]);

  const fetchArtists = async () => {
    try {
      const data = await getArtist({
        search: searchArtist,
        page: '1',
        trackId: track.trackId || '',
      });
      setArtists(data.artists);
    } catch (err) {
      toast.error('Failed to fetch artists');
    }
  };

  const fetchMixes = async () => {
    try {
      const data = await getMix({
        search: searchTerm,
        page: '1',
        trackId: track.trackId || '',
      });
      setMixes(data.mixes);
    } catch (err) {
      toast.error('Failed to fetch mixes');
    }
  };

  useEffect(() => {
    fetchArtists();
  }, [track.trackId, searchArtist]);

  useEffect(() => {
    fetchMixes();
  }, [track.trackId, searchTerm]);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: track.id });

  const handleSave = async () => {
    if (!editedTrack) return;

    setIsEditing(false);

    startUpdateTrackTransition(() => {
      toast.promise(
        (async () => {
          if (!editedTrack) return;

          if (selectArtist?.value === '') {
            throw new Error('Artist field is required!');
          }

          if (selectedMixes.length === 0) {
            throw new Error('Mixes field is required!');
          }

          await updateUpfrontTrackWithMixes({
            upfrontId: editedTrack?.id,
            trackId: editedTrack?.trackId || '',
            label: editedTrack?.label || '',
            mixIds: selectedMixes.map((item) => item.value || ''),
            title: trackTitle || '',
            artistId: selectArtist?.value || '',
          });

          if (refetch) {
            refetch();
          }
        })(),
        {
          loading: 'Saving track...',
          success: 'Track updated successfully!',
          error: (e) =>
            e instanceof Error ? e.message : 'Something went wrong',
        }
      );
    });
  };

  const handleDelete = async () => {
    try {
      await deleteUpfrontTrack(track.id);
      if (refetch) {
        refetch();
      }
      toast.success('Track deleted');
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : 'Something went wrong';
      toast.error(errorMessage);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (isDragged) {
      setNodeRef?.(document.activeElement as HTMLElement);
      timerRef.current = setTimeout(() => {
        setIsFocused(false);
      }, 2000);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isDragged, setNodeRef]);

  const handleDragStart = () => {
    setIsDragged(true);
    setIsFocused(true);
  };

  const handleDragEnd = () => {
    setIsDragged(false);
    setIsFocused(false);
  };

  const options = useMemo(() => {
    if (!mixes) return allOptions;

    const fetchedOptions = mixes.flatMap((page) =>
      mixes.map((mix) => ({
        value: mix.id,
        label: mix.title,
      }))
    );

    const uniqueOptions = new Map();
    [...fetchedOptions, ...allOptions].forEach((option) => {
      uniqueOptions.set(option.value, option);
    });

    return Array.from(uniqueOptions.values());
  }, [mixes, allOptions]);

  const loadOptions = async (
    inputValue: string
  ): Promise<{ label: string; value: string }[]> => {
    setSearchTerm(inputValue);
    return options;
  };

  const artistsOptions = useMemo(() => {
    if (!artists) return artistOptions;

    const fetchedOptions = artists.flatMap((page) =>
      artists.map((artist) => ({
        value: artist.id,
        label: artist.name,
      }))
    );

    const uniqueOptions = new Map();
    [...fetchedOptions, ...artistOptions].forEach((option) => {
      uniqueOptions.set(option.value, option);
    });

    return Array.from(uniqueOptions.values());
  }, [artists, artistOptions]);

  const loadArtistsOptions = async (
    inputValue: string
  ): Promise<{ label: string; value: string }[]> => {
    setSearchArtist(inputValue);
    return artistsOptions;
  };

  const handleCreateArtist = async (inputValue: string) => {
    startTransition(async () => {
      const promise = addArtist({
        name: inputValue,
        trackId: track.trackId || '',
      });

      toast.promise(promise, {
        loading: 'Creating artist...',
        success: (newArtist) => {
          const newOption = { value: newArtist.id, label: newArtist.name };
          setArtistOptions((prev) => [...prev, newOption]);
          setSelectArtist(newOption);
          fetchArtists();
          return 'Artist created successfully!';
        },
        error: 'Failed to create artist.',
      });

      try {
        await promise;
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Something went wrong';
        toast.error(message);
      }
    });
  };

  const handleCreateMix = async (inputValue: string) => {
    startTransition(() => {
      toast.promise(
        addMix({
          title: inputValue,
          trackId: track.trackId || '',
        }).then((newMix) => {
          const newOption = { value: newMix.id, label: newMix.title };

          setAllOptions((prev) => [...prev, newOption]);
          setSelectedMixes((prev) => [...prev, newOption]);

          fetchMixes();
        }),
        {
          loading: 'Creating mix...',
          success: 'Mix created successfully!',
          error: 'Failed to create mix.',
        }
      );
    });
  };

  const fieldError = (): boolean => {
    const errors = error() || [];
    return Array.isArray(errors) && errors.length > index
      ? errors[index]
      : false;
  };

  return !isUpdateTrackPending ? (
    <div
      style={style}
      className='relative p-3 lg:p-4 flex items-center gap-2 lg:gap-4 shadow bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500  touch-none'
    >
      {fieldError() && (
        <div className='absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full'></div>
      )}
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        onFocus={handleDragStart}
        onBlur={handleDragEnd}
        className='bg-white p-1 lg:p-3 rounded cursor-pointer'
      >
        <GripVertical className='h-5 w-5 text-gray-400' />
      </div>
      <div className='text-xs text-gray-600'>{index + 1}.</div>
      {isEditing ? (
        <div className='flex-1 space-y-2'>
          <div className='w-full flex flex-col lg:flex-row gap-2 lg:gap-4'>
            <div className='w-full'>
              <Label>Title</Label>
              <Input
                placeholder='Title'
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                disabled
              />
            </div>
            <div className='w-full'>
              <Label>Artist</Label>
              <Select
                cacheOptions
                defaultOptions
                isClearable
                isLoading={isPending}
                loadOptions={loadArtistsOptions}
                onCreateOption={handleCreateArtist}
                value={selectArtist}
                onChange={(
                  newValue: { label: string; value: string } | null,
                  actionMeta: ActionMeta<{ label: string; value: string }>
                ) => {
                  setSelectArtist(newValue || { label: '', value: '' });
                }}
                placeholder='Search or create artist'
                className='w-full'
                styles={reactSelectStyle}
              />
            </div>
          </div>
          <div>
            <Label>
              Label{' '}
              <span className='text-xs text-muted-foreground'>(optional)</span>
            </Label>
            <Input
              placeholder='Label'
              value={editedTrack?.label || ''}
              onChange={(e) =>
                setEditedTrack((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    label: e.target.value,
                    createdAt: prev.createdAt ?? new Date(),
                    updatedAt: new Date(),
                  };
                })
              }
            />
          </div>
          <div>
            <Label>Mixes</Label>
            <Select
              isMulti
              cacheOptions
              defaultOptions
              isLoading={isPending}
              loadOptions={loadOptions}
              onCreateOption={handleCreateMix}
              value={selectedMixes}
              onChange={(
                newValue: MultiValue<{ label: string; value: string }>,
                actionMeta: ActionMeta<{ label: string; value: string }>
              ) => {
                setSelectedMixes([...newValue]); // Convert readonly array to mutable array
              }}
              placeholder='Search or create mixes'
              className='w-full'
              styles={reactSelectStyle}
            />
          </div>
        </div>
      ) : (
        <div className='flex-1 grid grid-cols-3 gap-4'>
          <span className='truncate'>{track?.track?.title}</span>
          <span className='truncate'>
            {track?.mixes
              ?.map((item) => item?.mix?.title)
              .filter(Boolean)
              .join(', ')}
          </span>
          <span className='truncate'>{track?.artists?.name}</span>
        </div>
      )}

      <div className='flex gap-1'>
        {isEditing ? (
          <>
            <Button
              size='icon'
              variant='ghost'
              onClick={handleSave}
              disabled={isPending}
            >
              <Save className='h-4 w-4' />
            </Button>
            <Button
              className='z-10'
              size='icon'
              variant='ghost'
              onClick={() => setIsEditing(false)}
            >
              <X className='h-4 w-4' />
            </Button>
          </>
        ) : (
          <>
            <Button
              className='z-10'
              size='icon'
              variant='ghost'
              onClick={() => setIsEditing(true)}
            >
              <Edit className='h-4 w-4' />
            </Button>
            <Button
              className='z-10'
              size='icon'
              variant='ghost'
              onClick={handleDelete}
            >
              <TfiTrash />
            </Button>
          </>
        )}
      </div>
    </div>
  ) : (
    <TracksLoading />
  );
}
