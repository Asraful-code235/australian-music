'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UserTrack } from './tracks-table';
import { Edit } from 'lucide-react';
import Select from 'react-select/async-creatable';
import { toast } from 'sonner';
import { getArtist } from '@/actions/shared/GetArtist';
import { getMix } from '@/actions/shared/GetMix';
import { addArtist } from '@/actions/shared/AddArtist';
import { addMix } from '@/actions/shared/AddMix';
import { reactSelectStyle } from '@/lib/utils';
import { ActionMeta, MultiValue } from 'react-select';
import { Artist, Mix } from '@/types/track';
import { QueryObserverResult } from '@tanstack/react-query';
import { updateUpfrontTrackWithMixes } from '@/actions/upfront-tracks/UpdateTrack';

interface EditTrackModalProps {
  track: UserTrack;
  refetch?: () => Promise<QueryObserverResult>;
}

export function EditUpfrontTrackModal({ track, refetch }: EditTrackModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [trackTitle, setTrackTitle] = useState(track?.track?.title || '');
  const [trackId] = useState(track?.track?.id || '');
  const [mixes, setMixes] = useState<Mix[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchArtist, setSearchArtist] = useState('');
  const [allOptions, setAllOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [selectedMixes, setSelectedMixes] = useState(
    track?.mixes
      ?.filter((item) => item?.mix?.title && item?.mix?.id)
      .map((item) => ({
        label: item.mix?.title || '',
        value: item.mix?.id || '',
      })) || []
  );
  const [artistOptions, setArtistOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [label, setLabel] = useState(track?.label || '');
  const [isPending, startTransition] = useTransition();
  const [selectArtist, setSelectArtist] = useState<{
    value: string;
    label: string;
  }>({
    value: track?.artists?.id || '',
    label: track?.artists?.name || '',
  });

  useEffect(() => {
    const loadData = async () => {
      if (!isOpen) return;

      const toastId = 'loading-data-toast';
      toast.loading('Loading track data...', { id: toastId });

      try {
        const [artistData, mixData] = await Promise.all([
          getArtist({
            search: searchArtist,
            page: '1',
            trackId: track.track.id || '',
          }),
          getMix({
            search: searchTerm,
            page: '1',
            trackId: track.track.id || '',
          }),
        ]);

        setArtists(artistData.artists);
        setMixes(mixData.mixes);

        toast.success('Data loaded successfully', { id: toastId });
      } catch (error) {
        toast.error('Failed to load data', { id: toastId });
      }
    };

    loadData();
  }, [isOpen, track.track.id]);

  const loadArtistsOptions = async (inputValue: string) => {
    setSearchArtist(inputValue);
    const toastId = 'loading-data-toast';
    // toast.loading('Loading artists...', { id: toastId });

    try {
      const data = await getArtist({
        search: inputValue,
        page: '1',
        trackId: track.track.id || '',
      });
      setArtists(data.artists);

      const options = data.artists.map((artist) => ({
        value: artist.id,
        label: artist.name,
      }));

      setArtistOptions((prev) => {
        const uniqueOptions = new Map();
        [...prev, ...options].forEach((option) => {
          uniqueOptions.set(option.value, option);
        });
        return Array.from(uniqueOptions.values());
      });

      // toast.success('Artists loaded', { id: toastId });
      return options;
    } catch (error) {
      toast.error('Failed to load artists', { id: toastId });
      return [];
    }
  };

  const loadOptions = async (inputValue: string) => {
    setSearchTerm(inputValue);
    const toastId = 'loading-data-toast';
    // toast.loading('Loading mixes...', { id: toastId });

    try {
      const data = await getMix({
        search: inputValue,
        page: '1',
        trackId: track.track.id || '',
      });
      setMixes(data.mixes);

      const options = data.mixes.map((mix) => ({
        value: mix.id,
        label: mix.title,
      }));

      setAllOptions((prev) => {
        const uniqueOptions = new Map();
        [...prev, ...options].forEach((option) => {
          uniqueOptions.set(option.value, option);
        });
        return Array.from(uniqueOptions.values());
      });

      // toast.success('Mixes loaded', { id: toastId });
      return options;
    } catch (error) {
      toast.error('Failed to load mixes', { id: toastId });
      return [];
    }
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

  const handleCreateArtist = async (inputValue: string) => {
    startTransition(async () => {
      const promise = addArtist({
        name: inputValue,
        trackId: track.track.id || '',
      });

      toast.promise(promise, {
        loading: 'Creating artist...',
        success: (newArtist) => {
          const newOption = { value: newArtist.id, label: newArtist.name };
          setArtistOptions((prev) => [...prev, newOption]);
          setSelectArtist(newOption);
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
          trackId: track.track.id || '',
        }).then((newMix) => {
          const newOption = { value: newMix.id, label: newMix.title };

          setAllOptions((prev) => [...prev, newOption]);
          setSelectedMixes((prev) => [...prev, newOption]);

          return 'Mix created successfully!';
        }),
        {
          loading: 'Creating mix...',
          error: 'Failed to create mix.',
        }
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await updateUpfrontTrackWithMixes({
        upfrontId: track.id || '',
        trackId: track.track.id || '',
        title: trackTitle,
        artistId: selectArtist.value,
        mixIds: selectedMixes.map((mix) => mix.value),
        label,
      });
      toast.success('Track updated successfully');
      if (refetch) refetch();
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to update track');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='ghost' size='icon'>
          <Edit className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Edit Track</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid gap-2'>
            <Label htmlFor='title'>Title</Label>
            <Input
              id='title'
              value={trackTitle}
              onChange={(e) => setTrackTitle(e.target.value)}
              placeholder='Enter title'
            />
          </div>
          <div className='w-full'>
            <Label>Artist</Label>
            <Select
              cacheOptions
              defaultOptions
              isClearable
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
                setSelectedMixes([...newValue]);
              }}
              placeholder='Search or create mixes'
              className='w-full'
              styles={reactSelectStyle}
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='label'>Label</Label>
            <Input
              id='label'
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder='Enter label'
            />
          </div>
          <div className='flex justify-end gap-2'>
            <Button
              variant='outline'
              type='button'
              onClick={() => setIsOpen(false)}
              disabled={isLoading || isPending}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading || isPending}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
