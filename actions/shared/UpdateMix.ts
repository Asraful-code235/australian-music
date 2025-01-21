'use server';

import { db } from '@/db';
import { revalidatePath } from 'next/cache';

interface UpdateMixParams {
  title: string;
  id: string;
}

export async function updateMix({ title, id }: UpdateMixParams) {
  try {
    const mix = await db.mix.update({
      where: {
        id,
      },
      data: {
        title,
      },
    });

    revalidatePath('/dashboard/tracks/mixes');
    return mix;
  } catch (error) {
    console.error('Error updating mix:', error);
    throw error;
  }
}
