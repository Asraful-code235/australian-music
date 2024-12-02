'use server';

import { db } from '@/db';
import { UserTrack } from '@/types/track';

export async function updateTrackStatus(items: UserTrack[]) {
  try {
    await db.$transaction(
      items.map((item: UserTrack) => {
        return db.commercialTrack.update({
          where: { id: item.id },
          data: { status: true },
        });
      })
    );
  } catch (e) {
    console.log(e);
  }
}
