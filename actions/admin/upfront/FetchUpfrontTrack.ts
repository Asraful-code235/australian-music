'use server';

import { db } from '@/db';

export const fetchUpfrontTracks = async (data: string) => {
  const params = new URLSearchParams(data);
  const search = params.get('search') || '';
  const page = parseInt(params.get('page') ?? '1') || 1;
  const limit = 10;

  try {
    const count = await db.upfrontTrack.count({
      where: {
        user: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      },
    });

    const totalPages = Math.ceil(count / limit);

    const upfrontTracks = await db.upfrontTrack.findMany({
      where: {
        status: true,
        user: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        {
          updatedAt: 'desc', // Order by updatedAt in descending order
        },
        {
          position: 'asc', // Then order by position in ascending order
        },
      ],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        track: true,
        mixes: {
          include: {
            mix: true,
          },
        },
      },
    });

    console.log({ search, page, limit, totalPages, upfrontTracks });

    return {
      count,
      page,
      limit,
      totalPages,
      data: upfrontTracks,
    };
  } catch (error) {
    console.error('Error loading CommercialTracks:', error);
    throw new Error('Failed to load CommercialTracks');
  }
};
