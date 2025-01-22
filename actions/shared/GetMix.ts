'use server';

import { db } from '@/db';

export const getMix = async ({
  search = '',
  page = '1',
  trackId,
}: Record<string, string>) => {
  const pageNumber = parseInt(page) || 1;
  const limit = 10;

  const count = await db.mix.count({
    where: {
      AND: [
        {
          trackId: trackId,
        },
        {
          OR: [
            {
              title: { contains: search, mode: 'insensitive' },
              isDeleted: false,
            },
          ],
        },
      ],
    },
  });
  const totalPages = Math.ceil(count / limit);
  const mixes = await db.mix.findMany({
    where: {
      AND: [
        {
          trackId: trackId,
        },
        {
          OR: [
            {
              title: { contains: search, mode: 'insensitive' },
              isDeleted: false,
            },
          ],
        },
      ],
    },
    skip: (pageNumber - 1) * limit,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return {
    count,
    page: pageNumber,
    limit,
    totalPages,
    mixes,
    check: trackId,
  };
};
