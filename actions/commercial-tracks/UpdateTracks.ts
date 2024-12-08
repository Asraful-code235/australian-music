'use server';

import { db } from '@/db';

type UpdateUpfrontMixParams = {
  commercialId: string;
  trackId: string;
  title?: string;
  artist?: string;
  mixIds?: string[];
  label?: string;
};

export async function updateUpfrontTrackWithMixes({
  commercialId,
  trackId,
  title,
  artist,
  mixIds,
  label,
}: UpdateUpfrontMixParams) {
  return await db.$transaction(async (tx) => {
    const track = await tx.commercialTrack.findUnique({
      where: { id: commercialId },
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
      await tx.commercialTrack.update({
        where: { id: commercialId },
        data: {
          artist,
          label,
        },
      });
    }

    if (mixIds !== undefined) {
      await tx.commercialMixTrack.deleteMany({
        where: { commercialTrackId: commercialId },
      });

      if (mixIds.length > 0) {
        await tx.commercialMixTrack.createMany({
          data: mixIds.map((mixId) => ({
            commercialTrackId: commercialId,
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
