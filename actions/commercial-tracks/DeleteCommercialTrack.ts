'use server';

import { db } from '@/db';

export const deleteCommercialTrack = async (id: string) => {
  try {
    const res = await db.commercialTrack.delete({
      where: { id },
    });
    return res;
  } catch (e) {
    throw new Error('Failed to delete track');
  }
};
