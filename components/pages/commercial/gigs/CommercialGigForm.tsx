'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import * as z from 'zod';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formSchema } from '@/components/form-schema/GigFormSchema';
import { toast } from 'sonner';
import { AddCommercialGig } from '@/actions/gigs/commercial/AddCommercialGig';
import { useSession } from 'next-auth/react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function CommercialGigsForm() {
  const { data: session } = useSession();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hasPlayed: 'no',
      clubName: '',
      dayOfGig: undefined,
      startTime: '10:00',
      endTime: '11:00',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const newCommercialGig = await AddCommercialGig({
        hasPlayed: values.hasPlayed,
        clubName: values.clubName,
        dayOfGig: values.dayOfGig,
        startDate: values.startTime,
        endDate: values.endTime,
        userId: session?.user.id || '',
      });
      if (newCommercialGig.id) {
        toast.success('Commercial gig created successfully');
        form.reset();
      }
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Failed to create commercial gig';
      toast.error(message);
    }
  }

  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  return (
    <Card className='w-full mx-auto max-w-2xl shadow-none border-none'>
      <CardHeader>
        <CardTitle className='text-2xl font-bold'>
          Commercial Gig Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='hasPlayed'
              render={({ field }) => (
                <FormItem className='space-y-3'>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value || 'no'}
                      className='flex flex-col space-y-1'
                    >
                      <FormItem className='flex items-center space-x-3 space-y-0'>
                        <FormControl>
                          <RadioGroupItem value='yes' />
                        </FormControl>
                        <FormLabel className='font-normal'>
                          Yes, I played the following venues in the past 7 days
                        </FormLabel>
                      </FormItem>
                      <FormItem className='flex items-center space-x-3 space-y-0'>
                        <FormControl>
                          <RadioGroupItem value='no' />
                        </FormControl>
                        <FormLabel className='font-normal'>
                          No, I have not played this week
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='clubName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Club Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter club name'
                      value={field.value || ''} // Ensure controlled state
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='dayOfGig'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Day of Gig</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='startTime'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || '10:00'} // Controlled value
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select start time' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='endTime'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || '11:00'} // Controlled value
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select end time' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='flex justify-end space-x-4'>
              <Button variant='outline' type='button'>
                Cancel
              </Button>
              <Button type='submit'>Save</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
