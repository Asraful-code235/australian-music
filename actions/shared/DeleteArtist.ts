'use server';

import { db } from '@/db';
import { revalidatePath } from 'next/cache';

export async function deleteArtist(id: string) {
  try {
    const artist = await db.artist.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });

    revalidatePath('/dashboard/tracks/artists');
    return artist;
  } catch (error) {
    throw new Error('Failed to delete artist');
  }
}
