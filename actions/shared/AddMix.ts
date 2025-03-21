'use server';

import { db } from '@/db';

export async function addMix({
  title,
  trackId,
}: {
  title: string;
  trackId: string;
}) {
  try {
    const newMix = await db.mix.create({
      data: { title, trackId },
    });
    return newMix;
  } catch (error) {
    throw new Error('Failed to create mix');
  }
}
