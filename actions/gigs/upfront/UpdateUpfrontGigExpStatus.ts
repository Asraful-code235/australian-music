'use server';

import { db } from '@/db';
import { GigsData } from '@/types/track';

export async function updateUpfrontGigExportStatus(
  ids: string[]
): Promise<GigsData[]> {
  await db.upfrontGigs.updateMany({
    where: { id: { in: ids } },
    data: { isExport: true },
  });

  const updatedGigs = await db.upfrontGigs.findMany({
    where: { id: { in: ids } },
    include: {
      user: true,
    },
  });

  return updatedGigs as GigsData[];
}
