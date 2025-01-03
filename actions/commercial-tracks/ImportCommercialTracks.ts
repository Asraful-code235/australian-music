'use server';

import { db } from '@/db';

export async function ImportCommercialTracks(userId: string) {
  try {
    // Fetch all tracks for the user where status is false, ordered by `orderIndex`
    const tracks = await db.commercialTrack.findMany({
      where: {
        userId,
        status: true, // Include only tracks where status is false
      },
      orderBy: { orderIndex: 'asc' }, // Ensure tracks are sorted by `orderIndex`
    });

    if (tracks.length === 0) {
      console.log('No tracks found with status: false for this user.');
      return { success: false, message: 'No tracks found to update' };
    }

    console.log('Tracks fetched:', tracks);

    // Assign a new position based on the sorted order and update the database
    const updates = await Promise.all(
      tracks.map((track, index) => {
        console.log(`Updating track ID: ${track.id} to position: ${index + 1}`);
        return db.commercialTrack.update({
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
