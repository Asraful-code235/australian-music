'use server';

import { db } from '@/db';

type Tracks = {
  title: string;
  userId: string;
  position: number;
};

export async function addTracks({ title, userId, position }: Tracks) {
  try {
    const newTrack = await db.tracks.create({
      data: {
        title,
      },
    });

    const newTrackUser = await db.upfrontTrack.create({
      data: {
        trackId: newTrack.id,
        userId,
        position,
      },
    });

    return {
      message: 'Track added successfully',
      newTrackUser,
    };
  } catch (error: unknown) {
    console.error('Error creating track:', error);
    throw new Error('Failed to create track');
  }
}
