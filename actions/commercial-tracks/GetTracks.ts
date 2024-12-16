'use server';

import { db } from '@/db';
import { getErrorMessage } from '@/lib/utils';

export async function getTracks(id: string | undefined) {
  try {
    const tracks = await db.commercialTrack.findMany({
      where: { userId: id, status: false },
      orderBy: { position: 'asc' },
      include: {
        track: true,
        mixes: {
          include: {
            mix: true,
          },
        },
        artists: true,
      },
    });

    return tracks.map((track) => ({
      ...track,
      mixes: track.mixes.filter((mixEntry) => mixEntry.mix !== null),
    }));
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
