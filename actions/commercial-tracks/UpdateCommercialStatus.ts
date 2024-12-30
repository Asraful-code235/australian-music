'use server';

import { db } from '@/db';
import { UserTrack } from '@/types/track';

export async function updateTrackStatus(items: UserTrack[]) {
  try {
    const maxOrderIndex = await db.commercialTrack.aggregate({
      _max: { orderIndex: true },
    });

    await db.$transaction(
      items.map((item: UserTrack) => {
        return db.commercialTrack.update({
          where: { id: item.id },
          data: {
            status: true,
            isExport: false,
          },
        });
      })
    );
  } catch (e) {
    console.log({ e });
    throw new Error('Failed to update commercial track status');
  }
}
