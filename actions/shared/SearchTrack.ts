'use server';

import { db } from '@/db';

export async function SearchTrack(search: string, category: string) {
  try {
    const searchTracks = await db.tracks.findMany({
      where: search
        ? {
            title: {
              contains: search,
              mode: 'insensitive',
            },
            category,
          }
        : {},
    });
    return searchTracks;
  } catch (e) {
    throw new Error('Failed to fetch tracks');
  }
}
