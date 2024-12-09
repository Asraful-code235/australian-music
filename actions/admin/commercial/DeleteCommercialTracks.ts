'use server';

import { db } from '@/db';
import dayjs from 'dayjs';

export const deleteCommercialTracks = async (
  period: 'all' | 'one_week' | 'one_month' | 'three_month' | 'six_month'
) => {
  let startDate;
  let endDate = dayjs().toDate();

  switch (period) {
    case 'one_week':
      startDate = dayjs().subtract(1, 'week').toDate();
      break;
    case 'one_month':
      startDate = dayjs().subtract(1, 'month').toDate();
      break;
    case 'three_month':
      startDate = dayjs().subtract(3, 'month').toDate();
      break;
    case 'six_month':
      startDate = dayjs().subtract(6, 'month').toDate();
      break;
    case 'all':
      startDate = null;
      break;
    default:
      throw new Error('Invalid period');
  }

  try {
    const deleteResult = await db.commercialTrack.deleteMany({
      where: {
        ...(startDate
          ? {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            }
          : {}),
      },
    });
  } catch (error) {
    console.error('Error deleting CommercialTracks:', error);
  }
};
