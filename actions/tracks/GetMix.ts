'use server';

import { db } from '@/db';

export const getMix = async ({
  search = '',
  page = '1',
}: Record<string, string>) => {
  const pageNumber = parseInt(page) || 1;
  const limit = 10;

  const count = await db.mix.count({
    where: {
      OR: [{ title: { contains: search, mode: 'insensitive' } }],
    },
  });
  const totalPages = Math.ceil(count / limit);
  const mixes = await db.mix.findMany({
    where: {
      OR: [{ title: { contains: search, mode: 'insensitive' } }],
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
  };
};
