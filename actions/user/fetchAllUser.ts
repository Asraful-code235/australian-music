'use server';

import { db } from '@/db';
import { TracksLimit } from '@/lib/utils';

export const fetchAllUser = async (data: string) => {
  const params = new URLSearchParams(data);
  const search = params.get('search') || '';
  const page = parseInt(params.get('page') ?? '1') || 1;
  const limit = TracksLimit * 2;

  try {
    const count = await db.user.count({
      where: {
        AND: [
          {
            OR: [{ active: true }, { active: null }],
          },
          {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                email: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          },
        ],
      },
    });

    const totalPages = Math.ceil(count / limit);

    const users = await db.user.findMany({
      where: {
        AND: [
          {
            OR: [{ active: true }, { active: null }],
          },
          {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                email: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
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
      data: users,
    };
  } catch (e) {
    throw new Error('Failed to load users');
  }
};
