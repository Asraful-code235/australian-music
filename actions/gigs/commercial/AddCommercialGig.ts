'use server';

import { db } from '@/db';

type AddCommercialGigInput = {
  hasPlayed: 'yes' | 'no';
  clubName: string;
  dayOfGig: Date;
  startDate: string;
  endDate: string;
  userId: string;
};

export const AddCommercialGig = async ({
  hasPlayed,
  clubName,
  dayOfGig,
  startDate,
  endDate,
  userId,
}: AddCommercialGigInput) => {
  try {
    const newCommercialGig = await db.commercialGigs.create({
      data: {
        hasPlayed,
        clubName,
        dayOfGig,
        startDate,
        endDate,
        userId,
      },
    });
    return newCommercialGig;
  } catch (error) {
    throw new Error('Failed to create commercial gig');
  }
};
