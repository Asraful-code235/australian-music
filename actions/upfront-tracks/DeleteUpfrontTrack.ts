'use server';

import { db } from '@/db';

export const deleteUpfrontTrack = async (id: string) => {
  try {
    const res = await db.upfrontTrack.delete({
      where: { id },
    });
    return res;
  } catch (e) {
    console.error(e);
    throw new Error('Failed to delete track');
  }
};
