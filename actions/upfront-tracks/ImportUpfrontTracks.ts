'use server';

import { db } from '@/db';

export async function ImportUpfrontTracks(userId: string) {
  try {
    // First, get the maximum position from existing tracks (where status is false)
    const existingTracks = await db.upfrontTrack.findMany({
      where: {
        userId,
        status: false,
      },
      orderBy: {
        position: 'desc',
      },
      take: 1,
    });

    const startPosition = existingTracks.length > 0 
      ? (existingTracks[0].position || 0) + 1 
      : 1;

    // Fetch all tracks for the user where status is true, ordered by orderIndex
    const tracksToImport = await db.upfrontTrack.findMany({
      where: {
        userId,
        status: true,
      },
      orderBy: { orderIndex: 'asc' },
    });

    if (tracksToImport.length === 0) {
      return { success: false, message: 'No tracks found to update' };
    }

    // Assign new positions continuing from the last existing position
    const updates = await Promise.all(
      tracksToImport.map((track, index) => {
        return db.upfrontTrack.update({
          where: { id: track.id },
          data: {
            position: startPosition + index,
            status: false,
          },
        });
      })
    );

    return { success: true, message: 'Track positions updated successfully' };
  } catch (error) {
    console.error('Error updating track order:', error);
    return { success: false, error: 'Failed to update track positions' };
  }
}
