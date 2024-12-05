'use server';

import { db } from '@/db';
import { UserTrack } from '@/types/track';

export async function updateTrackPosition(items: UserTrack[]) {
  try {
    await db.$transaction(
      items.map((item: UserTrack) => {
        return db.commercialTrack.update({
          where: { id: item.id },
          data: { position: item.position },
        });
      })
    );
  } catch (e) {
    console.log(e);
    throw new Error('Failed to update commercial track position');
  }
}
