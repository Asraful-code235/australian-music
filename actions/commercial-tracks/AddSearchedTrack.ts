'use server';

import { db } from '@/db';

type Tracks = {
  trackId: string;
  userId: string;
  position: number;
};

export async function addSearchedTrack({ trackId, userId, position }: Tracks) {
  try {
    const newTrackUser = await db.commercialTrack.create({
      data: {
        trackId: trackId,
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
