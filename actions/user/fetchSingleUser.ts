'use server';

import { db } from '@/db';

export const fetchSingleUser = async (email: string) => {
  try {
    const user = await db.user.findFirst({
      where: {
        email,
      },
    });
    return { user };
  } catch (e) {
    throw new Error('Failed to load user');
  }
};
