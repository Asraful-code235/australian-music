'use server';

import { db } from '@/db';

type UpdateUpfrontMixParams = {
  commercialId: string;
  trackId: string;
  title?: string;
  artistId?: string;
  mixIds?: string[];
  label?: string;
};

export async function updateCommercialTrackWithMixes({
  commercialId,
  trackId,
  title,
  artistId,
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

    if (artistId !== undefined) {
      if (artistId === '') {
        throw new Error('Artist field is required');
      }

      await tx.commercialTrack.update({
        where: { id: commercialId },
        data: {
          artistId,
          label,
        },
      });
    }

    if (mixIds !== undefined) {
      if (mixIds.length === 0) {
        throw new Error('Mixes field is required');
      }

      if (mixIds.some((mixId) => mixId === '')) {
        throw new Error('Mixes field is required');
      }

      await tx.commercialMixTrack.deleteMany({
        where: { commercialTrackId: commercialId },
      });

      await tx.commercialMixTrack.createMany({
        data: mixIds.map((mixId) => ({
          commercialTrackId: commercialId,
          mixId,
        })),
      });
    }

    return {
      message: 'Track updated successfully',
    };
  });
}
