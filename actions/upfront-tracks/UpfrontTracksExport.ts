'use server';

import { db } from '@/db';
import { CreateUserTrackInput } from '@/types/track';

export async function updateUpfrontExportStatus(
  ids: string[]
): Promise<CreateUserTrackInput[]> {
  await db.upfrontTrack.updateMany({
    where: { id: { in: ids } },
    data: { isExport: true },
  });

  const updatedUpfront = await db.upfrontTrack.findMany({
    where: { id: { in: ids } },
    include: {
      user: true,
    },
  });

  return updatedUpfront as CreateUserTrackInput[];
}
