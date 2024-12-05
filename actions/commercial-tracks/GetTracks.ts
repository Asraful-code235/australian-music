'use server';

import { db } from '@/db';
import { getErrorMessage } from '@/lib/utils';

export async function getTracks(id: string | undefined) {
  try {
    const tracks = await db.commercialTrack.findMany({
      where: { userId: id, status: false },
      orderBy: { position: 'asc' },
      include: {
        track: true, // Include the track details
        mixes: {
          include: {
            mix: true, // Include the mix details from UpfrontMixTrack
          },
        },
      },
    });

    return tracks;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
