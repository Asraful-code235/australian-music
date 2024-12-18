'use server';

import { db } from '@/db';

export async function checkImport(id: string): Promise<boolean> {
  try {
    const count = await db.commercialTrack.count({
      where: { userId: id, status: true },
    });
    return count > 0;
  } catch (error) {
    return false;
  }
}
