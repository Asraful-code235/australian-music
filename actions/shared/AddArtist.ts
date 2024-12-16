'use server';

import { db } from '@/db';

export async function addArtist({
  name,
  trackId,
}: {
  name: string;
  trackId: string;
}) {
  try {
    const newMix = await db.artist.create({
      data: { name, trackId },
    });
    return newMix;
  } catch (error) {
    throw new Error('Failed to create mix');
  }
}
