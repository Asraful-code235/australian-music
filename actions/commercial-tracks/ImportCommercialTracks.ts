'use server';

import { db } from '@/db';

export async function ImportCommercialTracks(userId: string) {
  try {
    const updatedTrack = await db.commercialTrack.updateMany({
      where: { userId: userId },
      data: { status: false },
    });

    return { success: true, track: updatedTrack };
  } catch (error) {
    return { success: false, error: 'Failed to update track status' };
  }
}
