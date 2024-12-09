import {
  GigsData,
  GigsDataResponse,
  PaginatedTracks,
  UserTrack,
} from '@/types/track';
import { clsx, type ClassValue } from 'clsx';
import dayjs from 'dayjs';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getErrorMessage = (error: unknown) => {
  let message;

  if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = String(error.message);
  } else if (typeof error === 'string') {
    message = error;
  } else {
    message = 'Something went wrong';
  }

  return message;
};

export const TracksLimit = 20;

export function generateQueryString(params: any) {
  const isEmpty = Object.values(params).every((value) => value === '');

  if (isEmpty) {
    return '';
  }

  const queryString = Object.entries(params)
    // eslint-disable-next-line no-unused-vars
    .filter(([key, value]) => value !== '')
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(
          value as unknown as string
        )}`
    )
    .join('&');

  return `?${queryString}`;
}

export const exportToCSV = (data: PaginatedTracks, filename: string) => {
  if (!data || !data.data) return;

  const headers = [
    'Position',
    'Artist',
    'Created At',
    'Updated At',
    'User Name',
    'User Email',
    'Track Title',
    'Mix Titles',
  ].join(',');

  const rows = data.data.map((item: UserTrack) => {
    const mixTitles =
      item.mixes?.map((mix) => mix?.mix?.title)?.join('; ') || '';
    return [
      item.position,
      item.artist,
      dayjs(item.createdAt).format('DD-MM-YYYY'),
      dayjs(item.updatedAt).format('DD-MM-YYYY'),
      item.user?.name,
      item.user?.email,
      item.track?.title,
      mixTitles,
    ]
      .map((value) => `"${value || ''}"`)
      .join(',');
  });

  const csvContent = `${headers}\n${rows.join('\n')}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const gigsCsv = (data: GigsDataResponse, filename: string) => {
  if (!data || !data.data) return;

  const headers = [
    'DJ Name',
    'Club Name',
    'Day',
    'Time Slot',
    'Has Played',
    'Created At',
  ].join(',');

  const rows = data.data.map((item: GigsData) => {
    return [
      item.user?.name,
      item.clubName,
      dayjs(item.dayOfGig).format('dddd'),
      item.startDate + '-' + item.startDate,
      item.hasPlayed === 'yes' ? 'Yes' : 'No',
      dayjs(item.createdAt).format('DD-MM-YYYY'),
    ]
      .map((value) => `"${value || ''}"`)
      .join(',');
  });

  const csvContent = `${headers}\n${rows.join('\n')}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
