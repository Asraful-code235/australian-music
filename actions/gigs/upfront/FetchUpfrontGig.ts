'use server';

import { db } from '@/db';
import { TracksLimit } from '@/lib/utils';

export const FetchUpfrontGigs = async (data: string) => {
  const params = new URLSearchParams(data);
  const search = params.get('search') || '';
  const page = parseInt(params.get('page') ?? '1') || 1;
  const limit = TracksLimit * 2;
  try {
    const count = await db.upfrontGigs.count({
      where: {
        clubName: {
          contains: search,
          mode: 'insensitive',
        },
      },
    });

    const totalPages = Math.ceil(count / limit);

    const upfrontGigs = await db.upfrontGigs.findMany({
      where: {
        AND: [
          {
            isExport: false,
          },
          {
            OR: [
              {
                clubName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                user: {
                  name: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          },
        ],
      },
      skip: (page - 1) * limit,
      take: limit,
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
      },
      orderBy: [
        {
          dayOfGig: 'asc',
        },
      ],
    });

    return { count, page, limit, totalPages, data: upfrontGigs };
  } catch (e) {
    console.log(e);
    throw new Error('Failed to fetch commercial gigs');
  }
};
