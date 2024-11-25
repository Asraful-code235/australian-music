'use client';

import { useEffect, useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GripVertical, Save, Edit, X } from 'lucide-react';
import { Track } from '@/types/track';
import { toast } from 'sonner';
import { updateTrack } from '@/actions/tracks/UpdateTrack';
import { QueryObserverResult } from '@tanstack/react-query';

interface TrackItemProps {
  track: Track;
  refetch?: () => Promise<QueryObserverResult>;
}

export function TrackItem({ track, refetch }: TrackItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTrack, setEditedTrack] = useState(track);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: track.id });

  const handleSave = async () => {
    const updatedTrack: Track = {
      ...editedTrack,
      status: editedTrack.status || null,
      djId: editedTrack.djId || '',
      isCustom: editedTrack.isCustom || null,
      position: editedTrack.position || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let payload = {
      id: updatedTrack.id,
      title: updatedTrack.title,
      artist: updatedTrack.artist,
      releaseDate: updatedTrack.releaseDate,
      status: updatedTrack.status,
      djId: updatedTrack.djId,
      isCustom: updatedTrack.isCustom,
      position: updatedTrack.position,
      createdAt: updatedTrack.createdAt,
      updatedAt: updatedTrack.updatedAt,
    };

    setIsEditing(false);

    try {
      await updateTrack(payload);
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

  const [isDragged, setIsDragged] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  return (
    <div
      style={style}
      className='p-4 flex items-center gap-4 shadow bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500  touch-none'
    >
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
        <div className='flex-1 grid grid-cols-3 gap-4'>
          <Input
            placeholder='Title'
            value={editedTrack.title}
            onChange={(e) =>
              setEditedTrack({ ...editedTrack, title: e.target.value })
            }
          />
          <Input
            placeholder='Artist'
            value={editedTrack.artist || ''}
            onChange={(e) =>
              setEditedTrack({ ...editedTrack, artist: e.target.value })
            }
          />
          <Input
            type='date'
            value={
              editedTrack.releaseDate
                ? new Date(editedTrack.releaseDate).toISOString().split('T')[0]
                : ''
            }
            onChange={(e) => {
              const dateString = e.target.value;
              const date = dateString ? new Date(dateString) : null;
              setEditedTrack({ ...editedTrack, releaseDate: date });
            }}
          />
        </div>
      ) : (
        <div className='flex-1 grid grid-cols-3 gap-4'>
          <span className='truncate'>{track.title}</span>
          <span className='truncate'>{track.artist}</span>
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
