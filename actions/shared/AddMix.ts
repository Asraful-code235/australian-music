'use server';

import { db } from '@/db';

export async function addMix({ title }: { title: string }) {
  try {
    const newMix = await db.mix.create({
      data: { title },
    });
    return newMix;
  } catch (error) {
    console.log(error);
    throw new Error('Failed to create mix');
  }
}
