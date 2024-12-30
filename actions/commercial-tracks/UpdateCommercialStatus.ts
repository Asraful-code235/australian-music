'use server';

import { db } from '@/db';
import { UserTrack } from '@/types/track';

export async function updateTrackStatus(items: UserTrack[]) {
  try {
    const trackIds = items.map((item) => item.id);

    await db.commercialTrack.updateMany({
      where: {
        id: { in: trackIds },
      },
      data: {
        status: true,
        isExport: false,
      },
    });
  } catch (e) {
    console.error('Error updating track status:', e);
    throw new Error('Failed to update commercial track status');
  }
}
