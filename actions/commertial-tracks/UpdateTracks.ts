'use server';

import { db } from '@/db';
import { getErrorMessage } from '@/lib/utils';

type UpdateUpfrontMixParams = {
  commercialId: string; // The ID of the upfront to update
  trackId: string; // The ID of the track to update
  title?: string; // Optional: the new title of the track
  artist?: string; // Optional: the new artist of the track
  mixIds: string[]; // Array of mix IDs to associate with the track
};

export async function updateUpfrontTrackWithMixes({
  commercialId,
  trackId,
  title,
  artist,
  mixIds,
}: UpdateUpfrontMixParams) {
  if (!trackId || !Array.isArray(mixIds) || mixIds.length === 0) {
    throw new Error("Invalid input: 'trackId' and 'mixIds' are required.");
  }

  return await db.$transaction(async (tx) => {
    console.log({ trackId });
    const track = await tx.commercialTrack.findUnique({
      where: { id: commercialId },
    });
    if (!track) {
      throw new Error(`Track with ID ${trackId} not found.`);
    }

    // Update track details
    const updatedTrack = await tx.tracks.update({
      where: { id: trackId },
      data: {
        title: title ?? '',
      },
    });

    // Update artist if provided
    if (artist) {
      await tx.commercialTrack.update({
        where: { id: commercialId },
        data: {
          artist,
        },
      });
    }

    // Clear old upfront relations
    await tx.commercialTrack.deleteMany({
      where: { trackId: commercialId },
    });

    // Create new upfront relations
    await tx.commercialMixTrack.createMany({
      data: mixIds.map((mixId) => ({
        commercialTrackId: commercialId,
        mixId,
      })),
    });

    // Return the updated track with upfront mixes
    return {
      message: 'Track updated successfully',
    };
  });
}
