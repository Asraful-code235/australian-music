'use server';

import { db } from '@/db';
import { GigsData } from '@/types/track';

export async function updateCommercialGigExportStatus(
  ids: string[]
): Promise<GigsData[]> {
  await db.commercialGigs.updateMany({
    where: { id: { in: ids } },
    data: { isExport: true },
  });

  const updatedGigs = await db.commercialGigs.findMany({
    where: { id: { in: ids } },
    include: {
      user: true,
    },
  });

  return updatedGigs as GigsData[];
}
