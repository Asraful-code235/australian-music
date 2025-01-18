'use server';

import { db } from '@/db';

export const fetchAllCommercialTracks = async (search: string = '') => {
  try {
    const [commercialTrack, totalCount] = await Promise.all([
      db.commercialTrack.findMany({
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
          track: {
            select: {
              id: true,
              title: true,
            },
          },
          artists: {
            select: {
              id: true,
              name: true,
            },
          },
          mixes: {
            include: {
              mix: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      }),
      db.commercialTrack.count({
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
      }),
    ]);

    return {
      data: commercialTrack,
      count: totalCount,
    };
  } catch (error) {
    console.error('Error fetching all upfront tracks:', error);
    throw error;
  }
};
