'use server';

import { db } from '@/db';
import { getErrorMessage } from '@/lib/utils';

export async function getTracks(id: string | undefined) {
  try {
    const tracks = await db.track.findMany({
      where: { djId: id },
      orderBy: { position: 'asc' },
      include: {
        dj: {
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            image: true,
          },
        },
        mixes: {
          include: {
            mix: true,
          },
        },
      },
    });
    return tracks;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
