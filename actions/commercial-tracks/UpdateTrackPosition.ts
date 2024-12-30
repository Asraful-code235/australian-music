'use server';

import { db } from '@/db';
import { UserTrack } from '@/types/track';

export async function updateTrackPosition(items: UserTrack[]) {
  try {
    const updates = items.map((item) =>
      db.commercialTrack.update({
        where: { id: item.id },
        data: { position: item.position },
      })
    );

    await db.$transaction(updates);
  } catch (e) {
    console.error('Error updating track positions:', e);
    throw new Error('Failed to update commercial track positions');
  }
}
