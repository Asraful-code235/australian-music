'use client';

import { TableCell, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { useState, useTransition, useEffect, useMemo } from 'react';
import { UserTrack } from './tracks-table';
import { QueryObserverResult } from '@tanstack/react-query';
import { Edit, Loader2 } from 'lucide-react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import Select from 'react-select/async-creatable';
import { toast } from 'sonner';
import { getArtist } from '@/actions/shared/GetArtist';
import { getMix } from '@/actions/shared/GetMix';
import { addArtist } from '@/actions/shared/AddArtist';
import { addMix } from '@/actions/shared/AddMix';
import { updateSong } from '@/actions/shared/UpdateSong';
import { updateCommercialTrackWithMixes } from '@/actions/commercial-tracks/UpdateTracks';
import { updateUpfrontTrackWithMixes } from '@/actions/upfront-tracks/UpdateTrack';
import { reactSelectStyle } from '@/lib/utils';
import { Artist, Mix } from '@/types/track';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { ActionMeta } from 'react-select';
import { EditCommercialTrackModal } from './EditCommercialTrackModal';
import { EditUpfrontTrackModal } from './EditUpfrontTrackModal';

interface TracksTableRowProps {
  index: number;
  data: {
    data: UserTrack[];
    count: number;
    limit: number;
    page: number;
    totalPages: number;
  };
  items: UserTrack;
  refetch?: () => Promise<QueryObserverResult>;
  trackType: 'commercial' | 'upfront';
}

export default function TracksTableRow({
  index,
  data,
  items,
  refetch,
  trackType,
}: TracksTableRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isLoadingArtists, setIsLoadingArtists] = useState(false);
  const [isLoadingMixes, setIsLoadingMixes] = useState(false);
  const [trackTitle, setTrackTitle] = useState(items?.track?.title || '');
  const [mixes, setMixes] = useState<Mix[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [allOptions, setAllOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [selectedMixes, setSelectedMixes] = useState(
    items?.mixes
      ?.filter((item) => item?.mix?.title && item?.mix?.id)
      .map((item) => ({
        label: item.mix?.title || '',
        value: item.mix?.id || '',
      })) || []
  );
  const [artistOptions, setArtistOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [searchArtist, setSearchArtist] = useState('');
  const [selectArtist, setSelectArtist] = useState<{
    value: string;
    label: string;
  }>({
    value: items?.artists?.id || '',
    label: items?.artists?.name || '',
  });

  const [label, setLabel] = useState(items?.label || '');

  const fetchArtists = async () => {
    try {
      setIsLoadingArtists(true);
      const data = await getArtist({
        search: searchArtist,
        page: '1',
        trackId: items.track?.id || '',
      });
      setArtists(data.artists);
    } catch (err) {
      toast.error('Failed to fetch artists');
    } finally {
      setIsLoadingArtists(false);
    }
  };

  const fetchMixes = async () => {
    try {
      setIsLoadingMixes(true);
      const data = await getMix({
        search: searchTerm,
        page: '1',
        trackId: items.track?.id || '',
      });
      setMixes(data.mixes);
    } catch (err) {
      toast.error('Failed to fetch mixes');
    } finally {
      setIsLoadingMixes(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const toastId = toast.loading('Loading track data...');
      Promise.all([fetchArtists(), fetchMixes()])
        .then(() => {
          toast.success('Track data loaded successfully', {
            id: toastId,
          });
        })
        .catch(() => {
          toast.error('Failed to load some track data', {
            id: toastId,
          });
        });
    }
  }, [isOpen]);

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
        trackId: items.track?.id || '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectArtist?.value === '') {
        throw new Error('Artist field is required!');
      }

      if (selectedMixes.length === 0) {
        throw new Error('Mixes field is required!');
      }

      startTransition(async () => {
        await updateSong({ id: items.track?.id || '', title: trackTitle });

        if (trackType === 'commercial') {
          await updateCommercialTrackWithMixes({
            commercialId: items.id || '',
            trackId: items.track?.id || '',
            title: trackTitle,
            artistId: selectArtist.value,
            mixIds: selectedMixes.map((mix) => mix.value),
            label,
          });
        } else {
          await updateUpfrontTrackWithMixes({
            upfrontId: items.id || '',
            trackId: items.track?.id || '',
            title: trackTitle,
            artistId: selectArtist.value,
            mixIds: selectedMixes.map((mix) => mix.value),
            label,
          });
        }

        toast.success('Track updated successfully');
        refetch?.();
        setIsOpen(false);
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update track'
      );
    }
  };

  return (
    <TableRow>
      <TableCell>{index + 1 + (data.page - 1) * data.limit}</TableCell>
      <TableCell>{items.position}</TableCell>
      <TableCell>{items.user?.name}</TableCell>
      <TableCell>{items.track?.title}</TableCell>
      <TableCell>{items.artists?.name}</TableCell>
      <TableCell>
        {items.mixes
          ?.map((item) => item?.mix?.title)
          .filter(Boolean)
          .join(', ')}
      </TableCell>
      <TableCell>
        {trackType === 'commercial' ? (
          <EditCommercialTrackModal track={items} refetch={refetch} />
        ) : (
          <EditUpfrontTrackModal track={items} refetch={refetch} />
        )}
      </TableCell>
    </TableRow>
  );
}
