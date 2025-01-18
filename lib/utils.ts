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

export const TracksLimit = 2;

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
    'Chart Position',
    'DJ Name',
    'Track Title',
    'Artist',
    'Mix',
    'Label',
  ].join(',');

  const rows = data.data.map((item: UserTrack) => {
    const mixTitles =
      item.mixes?.map((mix) => mix?.mix?.title)?.join('; ') || '';
    return [
      item.position,
      item.user?.name,
      item.track?.title,
      item.artists?.name || '',
      mixTitles,
      item.label,
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

//@ts-ignore
export const reactSelectStyle = {
  control: (provided: any, state: any) => ({
    ...provided,
    minHeight: '2rem',
    borderRadius: '0.375rem',
    border: state.isFocused ? '1px solid #5b6371' : '1px solid #D1D5DB',
    backgroundColor: 'transparent',
    fontSize: '0.875rem',
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '&:hover': {
      borderColor: state.isFocused ? '#9CA3AF' : '#D1D5DB',
    },
  }),
  input: (provided: any) => ({
    ...provided,
    padding: '',
    fontSize: '16px',
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: '#9CA3AF',
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: '#1F2937',
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#6B7280' : 'transparent',
    color: state.isSelected ? '#FFFFFF' : '#1F2937',
    '&:hover': {
      backgroundColor: '#6B7280',
      color: '#FFFFFF',
    },
  }),
};
