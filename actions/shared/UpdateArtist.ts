'use server';

import { db } from '@/db';
import { revalidatePath } from 'next/cache';

interface UpdateArtistParams {
  name: string;
  id: string;
}

export async function updateArtist({ name, id }: UpdateArtistParams) {
  try {
    const artist = await db.artist.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });

    revalidatePath('/dashboard/tracks/artists');
    return artist;
  } catch (error) {
    console.error('Error updating artist:', error);
    throw error;
  }
}
