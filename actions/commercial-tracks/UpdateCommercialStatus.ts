'use server';

import { db } from '@/db';
import { UserTrack } from '@/types/track';

export async function updateTrackStatus(items: UserTrack[]) {
  try {
    const maxOrderIndex = await db.commercialTrack.aggregate({
      _max: { orderIndex: true },
    });

    let currentOrderIndex = maxOrderIndex._max.orderIndex || 0;

    await db.$transaction(
      items.map((item: UserTrack) => {
        currentOrderIndex += 1;

        return db.commercialTrack.update({
          where: { id: item.id },
          data: {
            status: true,
            isExport: false,
            orderIndex: currentOrderIndex,
          },
        });
      })
    );
  } catch (e) {
    throw new Error('Failed to update commercial track status');
  }
}
