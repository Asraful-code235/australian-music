'use server';

import { db } from '@/db';
import { TracksLimit } from '@/lib/utils';

export const getAllMixes = async (data: string) => {
  const params = new URLSearchParams(data);
  const search = params.get('search') || '';
  const page = parseInt(params.get('page') ?? '1') || 1;
  const limit = TracksLimit - 5;

  try {
    const count = await db.mix.count({
      where: {
        OR: [
          {
            title: { contains: search, mode: 'insensitive' },
            isDeleted: false,
          },
        ],
      },
    });
    const totalPages = Math.ceil(count / limit);

    const mixes = await db.mix.findMany({
      where: {
        OR: [
          {
            title: { contains: search, mode: 'insensitive' },
            isDeleted: false,
          },
        ],
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      count,
      page,
      limit,
      totalPages,
      data: mixes,
    };
  } catch (err) {
    throw new Error('Failed to load get all mixes');
  }
};
