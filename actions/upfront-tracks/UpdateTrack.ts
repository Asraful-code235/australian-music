'use server';

import { db } from '@/db';
import { getErrorMessage } from '@/lib/utils';

type UpdateUpfrontMixParams = {
  upfrontId: string;
  trackId: string;
  title?: string;
  artist?: string;
  mixIds?: string[];
};

export async function updateUpfrontTrackWithMixes({
  upfrontId,
  trackId,
  title,
  artist,
  mixIds,
}: UpdateUpfrontMixParams) {
  return await db.$transaction(async (tx) => {
    const track = await tx.upfrontTrack.findUnique({
      where: { id: upfrontId },
    });

    if (!track) {
      throw new Error(`Track with ID ${trackId} not found.`);
    }

    if (title !== undefined) {
      await tx.tracks.update({
        where: { id: trackId },
        data: {
          title,
        },
      });
    }

    if (artist !== undefined) {
      await tx.upfrontTrack.update({
        where: { id: upfrontId },
        data: {
          artist,
        },
      });
    }

    if (mixIds !== undefined) {
      await tx.upfrontMixTrack.deleteMany({
        where: { upfrontTrackId: upfrontId },
      });

      if (mixIds.length > 0) {
        await tx.upfrontMixTrack.createMany({
          data: mixIds.map((mixId) => ({
            upfrontTrackId: upfrontId,
            mixId,
          })),
        });
      }
    }

    return {
      message: 'Track updated successfully',
    };
  });
}
