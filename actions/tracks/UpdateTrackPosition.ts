'use server';

import { db } from '@/db';
import { Track } from '@/types/track';

export async function updateTrackPosition(items: Track[]) {
  try {
    await db.$transaction(
      items.map((item: Track) => {
        return db.track.update({
          where: { id: item.id },
          data: { position: item.position },
        });
      })
    );
  } catch (e) {
    console.log(e);
  }
}
