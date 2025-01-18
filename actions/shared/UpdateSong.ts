'use server';

import { db } from '@/db';

interface UpdateSongInput {
  id: string;
  title: string;
}

export async function updateSong({ id, title }: UpdateSongInput) {
  try {
    const updatedSong = await db.tracks.update({
      where: {
        id: id,
      },
      data: {
        title: title,
      },
      select: {
        id: true,
        title: true,
      },
    });

    return { success: true, data: updatedSong };
  } catch (error) {
    console.error('Error updating song:', error);
    return { success: false, error: 'Failed to update song' };
  }
}
