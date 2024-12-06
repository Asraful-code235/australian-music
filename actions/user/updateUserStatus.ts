'use server';

import { db } from '@/db';

export async function updateUserStatus(id: string) {
  try {
    const updateUser = await db.user.update({
      where: { id },
      data: { active: false },
    });

    return updateUser;
  } catch (e) {
    console.log(e);
    throw new Error('Failed to update commercial track position');
  }
}
