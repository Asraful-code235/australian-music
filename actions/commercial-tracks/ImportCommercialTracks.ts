'use server';

import { db } from '@/db';

export async function ImportCommercialTracks(userId: string) {
  try {
    const existingTracks = await db.commercialTrack.findMany({
      where: {
        userId,
        status: false,
      },
      orderBy: {
        position: 'asc',
      },
    });

    const tracksToImport = await db.commercialTrack.findMany({
      where: {
        userId,
        status: true,
      },
      orderBy: { orderIndex: 'asc' },
    });

    if (tracksToImport.length === 0) {
      return { success: false, message: 'No tracks found to update' };
    }

    await db.$transaction(async (prisma) => {
      await Promise.all(
        tracksToImport.map((track, index) =>
          prisma.commercialTrack.update({
            where: { id: track.id },
            data: {
              position: index + 1,
              status: false,
            },
          })
        )
      );

      if (existingTracks.length > 0) {
        await Promise.all(
          existingTracks.map((track, index) =>
            prisma.commercialTrack.update({
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
