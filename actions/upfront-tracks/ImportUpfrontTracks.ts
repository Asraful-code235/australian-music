'use server';

import { db } from '@/db';

export async function ImportUpfrontTracks(userId: string) {
  try {
    const updatedTrack = await db.upfrontTrack.updateMany({
      where: { userId: userId },
      data: { status: false },
    });

    return { success: true, track: updatedTrack };
  } catch (error) {
    return { success: false, error: 'Failed to update track status' };
  }
}
