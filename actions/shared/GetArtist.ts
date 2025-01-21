'use server';

import { db } from '@/db';

export const getArtist = async ({
  search = '',
  page = '1',
  trackId,
}: Record<string, string>) => {
  const pageNumber = parseInt(page) || 1;
  const limit = 10;

  const count = await db.artist.count({
    where: {
      AND: [
        {
          trackId: trackId,
        },
        {
          OR: [
            {
              name: { contains: search, mode: 'insensitive' },
              isDeleted: false,
            },
          ],
        },
      ],
    },
  });
  const totalPages = Math.ceil(count / limit);
  const artists = await db.artist.findMany({
    where: {
      AND: [
        {
          trackId: trackId,
        },
        {
          OR: [
            {
              name: { contains: search, mode: 'insensitive' },
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
    artists,
    check: trackId,
  };
};
