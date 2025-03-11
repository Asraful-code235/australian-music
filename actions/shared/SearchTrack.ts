'use server';

import { db } from '@/db';
import { Tracks } from '@/types/track';

export async function SearchTrack(search: string, category: string) {
  try {
    const trimmedSearch = search.trim();

    const searchTracks = await db.tracks.findMany({
      where: trimmedSearch
        ? {
            title: {
              contains: trimmedSearch,
              mode: 'insensitive',
            },
            category,
          }
        : {},
    });

    const exactMatch = await db.tracks.findFirst({
      where: {
        title: {
          equals: trimmedSearch,
          mode: 'insensitive',
        },
        category,
      },
    });

    return {
      results: searchTracks,
      hasExactMatch: !!exactMatch,
    };
  } catch (e) {
    throw new Error('Failed to fetch tracks');
  }
}
