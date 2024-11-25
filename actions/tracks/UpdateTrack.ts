'use server';

import { db } from '@/db';
import { getErrorMessage } from '@/lib/utils';
import { Track } from '@/types/track';

export async function updateTrack(items: Track) {
  try {
    const updatedTracks = await db.track.update({
      where: { id: items.id },
      data: {
        title: items.title,
        artist: items.artist,
        releaseDate: items.releaseDate,
      },
    });
    return updatedTracks;
  } catch (e) {
    console.log(e);
    return {
      error: getErrorMessage(e),
    };
  }
}
