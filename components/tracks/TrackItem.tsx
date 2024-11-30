'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GripVertical, Save, Edit, X } from 'lucide-react';
import { Tracks, UserTrack } from '@/types/track';
import { toast } from 'sonner';
import { updateTrackWithMixes } from '@/actions/tracks/UpdateTrack';
import {
  QueryObserverResult,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';
import { getMix } from '@/actions/tracks/GetMix';
import { MultiValue, ActionMeta } from 'react-select';
import { addMix } from '@/actions/tracks/AddMix';
import Select from 'react-select/async-creatable';

interface TrackItemProps {
  track: UserTrack;
  refetch?: () => Promise<QueryObserverResult>;
  error: () => Array<boolean> | undefined;
  index: number;
}

const useMixes = (search: string) => {
  return useInfiniteQuery({
    queryKey: ['mixes', search],
    queryFn: ({ pageParam = 1 }) =>
      getMix({ search, page: pageParam.toString() }),
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};

export function TrackItem({ track, refetch, error, index }: TrackItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTrack, setEditedTrack] = useState(track.track);
  const [isDragged, setIsDragged] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedMixes, setSelectedMixes] = useState(
    track?.track?.mixes
      ?.filter((item) => item?.mix?.title && item?.mix?.id)
      .map((item) => ({
        label: item.mix?.title || '',
        value: item.mix?.id || '',
      })) || []
  );

  const [allOptions, setAllOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMixes(searchTerm);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: track.id });

  const handleSave = async () => {
    if (!editedTrack) return;
    const updatedTrack: Tracks = {
      ...editedTrack,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setIsEditing(false);

    try {
      if (!editedTrack) return;
      await updateTrackWithMixes({
        trackId: editedTrack?.id,
        mixIds: selectedMixes.map((item) => item.value || ''),
        title: updatedTrack.title,
        artist: updatedTrack.artist !== null ? updatedTrack.artist : '',
      });
      if (refetch) {
        refetch();
      }
      toast.success('Track updated');
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
    if (!data) return allOptions;

    const fetchedOptions = data.pages.flatMap((page) =>
      page.mixes.map((mix) => ({
        value: mix.id,
        label: mix.title,
      }))
    );

    const uniqueOptions = new Map();
    [...fetchedOptions, ...allOptions].forEach((option) => {
      uniqueOptions.set(option.value, option);
    });

    return Array.from(uniqueOptions.values());
  }, [data, allOptions]);

  const loadOptions = async (
    inputValue: string
  ): Promise<{ label: string; value: string }[]> => {
    setSearchTerm(inputValue);
    return options;
  };

  const handleCreateMix = async (inputValue: string) => {
    try {
      const newMix = await addMix({ title: inputValue });
      const newOption = { value: newMix.id, label: newMix.title };

      // Update options and selected mixes
      setAllOptions((prev) => [...prev, newOption]);
      setSelectedMixes((prev) => [...prev, newOption]);

      toast.success('Mix created successfully!');
    } catch (error) {
      toast.error('Failed to create mix.');
    }
  };

  const fieldError = (): boolean => {
    const errors = error() || [];
    return Array.isArray(errors) && errors.length > index
      ? errors[index]
      : false;
  };

  return (
    <div
      style={style}
      className='relative p-4 flex items-center gap-4 shadow bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500  touch-none'
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
        className='bg-white p-3 rounded cursor-pointer'
      >
        <GripVertical className='h-5 w-5 text-gray-400' />
      </div>

      {isEditing ? (
        <div className='flex-1 space-y-2'>
          <div className='w-full flex gap-4'>
            <Input
              placeholder='Title'
              value={editedTrack?.title}
              onChange={(e) =>
                setEditedTrack((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    title: e.target.value,
                    createdAt: prev.createdAt ?? new Date(),
                    updatedAt: new Date(),
                  };
                })
              }
            />
            <Input
              placeholder='Artist'
              value={editedTrack?.artist || ''}
              onChange={(e) =>
                setEditedTrack((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    artist: e.target.value,
                    createdAt: prev.createdAt ?? new Date(),
                    updatedAt: new Date(),
                  };
                })
              }
            />
          </div>
          <div>
            <Select
              isMulti
              cacheOptions
              defaultOptions
              loadOptions={loadOptions}
              onCreateOption={handleCreateMix}
              value={selectedMixes}
              onChange={(
                newValue: MultiValue<{ label: string; value: string }>,
                actionMeta: ActionMeta<{ label: string; value: string }>
              ) => {
                setSelectedMixes([...newValue]); // Convert readonly array to mutable array
              }}
              onMenuScrollToBottom={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
              placeholder='Search or create mixes'
              className='w-full'
            />
          </div>
        </div>
      ) : (
        <div className='flex-1 grid grid-cols-3 gap-4'>
          <span className='truncate'>{track?.track?.title}</span>
          <span className='truncate'>{track?.track?.artist}</span>
          {/* <span>{track.releaseDate}</span> */}
        </div>
      )}

      <div className='flex gap-2'>
        {isEditing ? (
          <>
            <Button size='icon' variant='ghost' onClick={handleSave}>
              <Save className='h-4 w-4' />
            </Button>
            <Button
              className='z-[9999]'
              size='icon'
              variant='ghost'
              onClick={() => setIsEditing(false)}
            >
              <X className='h-4 w-4' />
            </Button>
          </>
        ) : (
          <Button
            className='z-[9999]'
            size='icon'
            variant='ghost'
            onClick={() => setIsEditing(true)}
          >
            <Edit className='h-4 w-4' />
          </Button>
        )}
      </div>
    </div>
  );
}
