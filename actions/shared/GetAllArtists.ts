'use server';

import { db } from '@/db';
import { TracksLimit } from '@/lib/utils';

export const getAllArtists = async (data: string) => {
  const params = new URLSearchParams(data);
  const search = params.get('search') || '';
  const page = parseInt(params.get('page') ?? '1') || 1;
  const limit = TracksLimit - 5;

  try {
    const count = await db.artist.count({
      where: {
        OR: [{ name: { contains: search, mode: 'insensitive' } }],
      },
    });
    const totalPages = Math.ceil(count / limit);

    const artists = await db.artist.findMany({
      where: {
        OR: [{ name: { contains: search, mode: 'insensitive' } }],
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
      data: artists,
    };
  } catch (err) {
    throw new Error('Failed to load get all artists');
  }
};
