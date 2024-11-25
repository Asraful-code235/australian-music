'use server';

import { db } from '@/db';

type Tracks = {
  title: string;
  djId: string;
};

export async function addTracks({ title, djId }: Tracks) {
  try {
    const newTrack = await db.track.create({
      data: {
        title,
        dj: { connect: { id: djId } },
      },
    });

    return {
      message: 'Track added successfully',
      newTrack,
    };
  } catch (error: unknown) {
    console.error('Error creating track:', error);
  }
}
