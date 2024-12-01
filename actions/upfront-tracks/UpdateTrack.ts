'use server';

import { db } from '@/db';
import { getErrorMessage } from '@/lib/utils';

type UpdateUpfrontMixParams = {
  upfrontId: string; // The ID of the upfront to update
  trackId: string; // The ID of the track to update
  title?: string; // Optional: the new title of the track
  artist?: string; // Optional: the new artist of the track
  mixIds?: string[]; // Optional: array of mix IDs to associate with the track
};

export async function updateUpfrontTrackWithMixes({
  upfrontId,
  trackId,
  title,
  artist,
  mixIds,
}: UpdateUpfrontMixParams) {
  return await db.$transaction(async (tx) => {
    console.log({ trackId });

    // Find the upfront track
    const track = await tx.upfrontTrack.findUnique({
      where: { id: upfrontId },
    });
    if (!track) {
      throw new Error(`Track with ID ${trackId} not found.`);
    }

    // Update track details if `title` is provided
    if (title !== undefined) {
      await tx.tracks.update({
        where: { id: trackId },
        data: {
          title,
        },
      });
    }

    // Update artist if provided
    if (artist !== undefined) {
      await tx.upfrontTrack.update({
        where: { id: upfrontId },
        data: {
          artist,
        },
      });
    }

    // Update upfront mix relations if `mixIds` are provided
    if (mixIds !== undefined) {
      // Clear old upfront relations
      await tx.upfrontMixTrack.deleteMany({
        where: { upfrontTrackId: upfrontId },
      });

      // Create new upfront relations
      if (mixIds.length > 0) {
        await tx.upfrontMixTrack.createMany({
          data: mixIds.map((mixId) => ({
            upfrontTrackId: upfrontId,
            mixId,
          })),
        });
      }
    }

    // Return the updated track with a success message
    return {
      message: 'Track updated successfully',
    };
  });
}
