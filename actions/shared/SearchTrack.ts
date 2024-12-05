'use server';

import { db } from '@/db';

export async function SearchTrack(search: string) {
  try {
    const searchTracks = await db.tracks.findMany({
      where: search
        ? {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : {},
    });
    return searchTracks;
  } catch (e) {
    console.error(e);
    throw new Error('Failed to fetch tracks');
  }
}
