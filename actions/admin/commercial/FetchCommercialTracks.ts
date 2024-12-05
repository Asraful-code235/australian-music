'use server';

import { db } from '@/db';

export const fetchCommercialTracks = async (data: string) => {
  const params = new URLSearchParams(data);
  const search = params.get('search') || '';
  const page = parseInt(params.get('page') ?? '1') || 1;
  const limit = 10;

  try {
    const count = await db.commercialTrack.count({
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

    const commercialTracks = await db.commercialTrack.findMany({
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
          orderIndex: 'asc',
        },
        {
          position: 'asc',
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

    return {
      count,
      page,
      limit,
      totalPages,
      data: commercialTracks,
    };
  } catch (error) {
    console.error('Error loading CommercialTracks:', error);
    throw new Error('Failed to load CommercialTracks');
  }
};
