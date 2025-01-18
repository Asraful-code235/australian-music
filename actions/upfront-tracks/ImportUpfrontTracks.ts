'use server';

import { db } from '@/db';

export async function ImportUpfrontTracks(userId: string) {
  try {
    // Fetch all tracks for the user where status is false, ordered by `orderIndex`
    const tracks = await db.upfrontTrack.findMany({
      where: {
        userId,
        status: true, // Include only tracks where status is false
      },
      orderBy: { orderIndex: 'asc' }, // Ensure tracks are sorted by `orderIndex`
    });

    if (tracks.length === 0) {
      return { success: false, message: 'No tracks found to update' };
    }

    // Assign a new position based on the sorted order and update the database
    const updates = await Promise.all(
      tracks.map((track, index) => {
        return db.upfrontTrack.update({
          where: { id: track.id },
          data: {
            position: index + 1, // Assign position starting from 1
            status: false, // Ensure the status remains false
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
