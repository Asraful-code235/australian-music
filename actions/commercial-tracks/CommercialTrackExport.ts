'use server';

import { db } from '@/db';
import { CreateUserTrackInput } from '@/types/track';

export async function updateCommercialExportStatus(
  ids: string[]
): Promise<CreateUserTrackInput[]> {
  await db.commercialTrack.updateMany({
    where: { id: { in: ids } },
    data: { isExport: true },
  });

  const updatedCommercial = await db.commercialTrack.findMany({
    where: { id: { in: ids } },
    include: {
      user: true,
    },
  });

  return updatedCommercial as CreateUserTrackInput[];
}
