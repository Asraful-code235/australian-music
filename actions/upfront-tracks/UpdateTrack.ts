'use server';

import { db } from '@/db';

type UpdateUpfrontMixParams = {
  upfrontId: string;
  trackId: string;
  title?: string;
  artistId?: string;
  mixIds?: string[];
  label?: string;
};

export async function updateUpfrontTrackWithMixes({
  upfrontId,
  trackId,
  title,
  artistId,
  mixIds,
  label,
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

    if (artistId !== undefined) {
      if (artistId === '') {
        throw new Error('Artist field is required');
      }

      await tx.upfrontTrack.update({
        where: { id: upfrontId },
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

      await tx.upfrontMixTrack.deleteMany({
        where: { upfrontTrackId: upfrontId },
      });

      await tx.upfrontMixTrack.createMany({
        data: mixIds.map((mixId) => ({
          upfrontTrackId: upfrontId,
          mixId,
        })),
      });
    }

    return {
      message: 'Track updated successfully',
    };
  });
}
