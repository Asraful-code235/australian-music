'use server';

import { db } from '@/db';
import { revalidatePath } from 'next/cache';

export async function deleteMix(id: string) {
  try {
    // Soft delete the mix by updating the deleted status
    const mix = await db.mix.update({
      where: { id },
      data: {
        isDeleted: true, // Set the deleted flag to true
      },
    });

    revalidatePath('/dashboard/tracks/mixes');
    return mix;
  } catch (error) {
    throw new Error('Failed to delete mix');
  }
}
