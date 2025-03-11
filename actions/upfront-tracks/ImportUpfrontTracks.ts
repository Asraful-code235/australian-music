'use server';

import { db } from '@/db';

export async function ImportUpfrontTracks(userId: string) {
  try {
    // Get all existing tracks that aren't saved (status: false)
    const existingTracks = await db.upfrontTrack.findMany({
      where: {
        userId,
        status: false,
      },
      orderBy: {
        position: 'asc',
      },
    });

    // Get tracks to import (saved playlist tracks)
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

    // Start transaction to update all positions atomically
    await db.$transaction(async (prisma) => {
      // First, update imported tracks to take positions starting from 1
      await Promise.all(
        tracksToImport.map((track, index) =>
          prisma.upfrontTrack.update({
            where: { id: track.id },
            data: {
              position: index + 1,
              status: false,
            },
          })
        )
      );

      // Then, shift existing tracks to start after imported tracks
      if (existingTracks.length > 0) {
        await Promise.all(
          existingTracks.map((track, index) =>
            prisma.upfrontTrack.update({
              where: { id: track.id },
              data: {
                position: tracksToImport.length + index + 1,
              },
            })
          )
        );
      }
    });

    return { success: true, message: 'Track positions updated successfully' };
  } catch (error) {
    console.error('Error updating track order:', error);
    return { success: false, error: 'Failed to update track positions' };
  }
}
