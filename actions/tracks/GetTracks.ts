'use server';

import { db } from '@/db';
import { getErrorMessage } from '@/lib/utils';

export async function getTracks(id: string | undefined) {
  try {
    const tracks = await db.userTrack.findMany({
      where: { userId: id },
      orderBy: { position: 'asc' },
      include: {
        track: {
          include: {
            mixes: {
              include: {
                mix: true,
              },
            },
          },
        },
      },
    });

    return tracks;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
