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

import {
  QueryObserverResult,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';
import { getMix } from '@/actions/shared/GetMix';
import { MultiValue, ActionMeta } from 'react-select';
import { addMix } from '@/actions/shared/AddMix';
import Select from 'react-select/async-creatable';
import { updateUpfrontTrackWithMixes } from '@/actions/upfront-tracks/UpdateTrack';
import { Label } from '@/components/ui/label';
import { TfiTrash } from 'react-icons/tfi';
import { deleteUpfrontTrack } from '@/actions/upfront-tracks/DeleteUpfrontTrack';

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
  const [editedTrack, setEditedTrack] = useState(track);
  const [isDragged, setIsDragged] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
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
  const [searchTerm, setSearchTerm] = useState('');
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMixes(searchTerm);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: track.id });

  const handleSave = async () => {
    if (!editedTrack) return;

    setIsEditing(false);

    try {
      if (!editedTrack) return;
      await updateUpfrontTrackWithMixes({
        upfrontId: editedTrack?.id,
        trackId: editedTrack?.trackId || '',
        mixIds: selectedMixes.map((item) => item.value || ''),
        title: trackTitle || '',
        artist: editedTrack?.artist !== null ? editedTrack?.artist : '',
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
            <div>
              <Label>Title</Label>
              <Input
                placeholder='Title'
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
              />
            </div>
            <div>
              <Label>Artist</Label>
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
          </div>
          <div>
            <Label>Label</Label>
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
              styles={{
                control: (provided, state) => ({
                  ...provided,

                  minHeight: '2rem',
                  borderRadius: '0.375rem',
                  border: state.isFocused
                    ? '1px solid #5b6371'
                    : '1px solid #D1D5DB',
                  backgroundColor: 'transparent',
                  fontSize: '0.875rem',
                  boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                  '&:hover': {
                    borderColor: state.isFocused ? '#9CA3AF' : '#D1D5DB',
                  },
                }),
                input: (provided) => ({
                  ...provided,
                  padding: '',
                  fontSize: '16px',
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: '#9CA3AF',
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: '#1F2937',
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected ? '#6B7280' : 'transparent',
                  color: state.isSelected ? '#FFFFFF' : '#1F2937',
                  '&:hover': {
                    backgroundColor: '#6B7280',
                    color: '#FFFFFF',
                  },
                }),
              }}
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
          <span className='truncate'>{track?.artist}</span>
          {/* <span>{track.releaseDate}</span> */}
        </div>
      )}

      <div className='flex gap-1'>
        {isEditing ? (
          <>
            <Button size='icon' variant='ghost' onClick={handleSave}>
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
  );
}
