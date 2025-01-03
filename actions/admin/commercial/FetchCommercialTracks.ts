'use server';

import { db } from '@/db';
import { TracksLimit } from '@/lib/utils';

export const fetchCommercialTracks = async (data: string) => {
  const params = new URLSearchParams(data);
  const search = params.get('search') || '';
  const page = parseInt(params.get('page') ?? '1') || 1;
  const limit = TracksLimit * 2;

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
        isExport: false,
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
          user: {
            name: 'asc',
          },
        },
        {
          orderIndex: 'asc',
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
        artists: true,
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
    throw new Error('Failed to load CommercialTracks');
  }
};
