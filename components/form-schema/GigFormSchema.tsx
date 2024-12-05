import { z } from 'zod';

export const formSchema = z.object({
  hasPlayed: z.enum(['yes', 'no'], {
    required_error: 'Please select an option',
  }),
  clubName: z.string().min(2, {
    message: 'Club name must be at least 2 characters.',
  }),
  dayOfGig: z.date({
    required_error: 'Please select a date',
  }),
  startTime: z.string({
    required_error: 'Please select a start time',
  }),
  endTime: z.string({
    required_error: 'Please select an end time',
  }),
});
