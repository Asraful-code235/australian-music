'use server';

import { db } from '@/db';
import { getErrorMessage } from '@/lib/utils';

export async function getTracks() {
  try {
    const tracks = await db.track.findMany({ orderBy: { position: 'asc' } });
    return tracks;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
