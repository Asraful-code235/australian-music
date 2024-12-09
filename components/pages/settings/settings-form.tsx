'use client';

import { fetchSingleUser } from '@/actions/user/fetchSingleUser';
import { formSchema } from '@/components/form-schema/GigFormSchema';
import { updateProfileSchema } from '@/components/form-schema/ProfileUpdateFormSchema';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { User } from '@/types/track';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { CalendarIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FaRegEye } from 'react-icons/fa';
import { FaRegEyeSlash } from 'react-icons/fa';
import { toast } from 'sonner';
import { UpdateUser } from '@/actions/user/UpdateUser';

type FormData = z.infer<typeof updateProfileSchema>;

export default function SettingsForm() {
  const [togglePassword, setTogglePassword] = useState(false);
  const [toggleConfirmPassword, setToggleConfirmPassword] = useState(false);
  const { data: session, status } = useSession();

  const {
    isLoading: userLoading,
    data: userData,
    error: userError,
    refetch,
  } = useQuery({
    queryKey: ['user', session?.user?.email],
    queryFn: async () => {
      if (!session?.user?.email) {
        return Promise.reject('User email is not available');
      }
      return fetchSingleUser(session.user.email)
        .then((data) => data)
        .catch((error) => {
          throw error;
        });
    },
    enabled: !!session?.user?.email,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: userData?.user?.name || '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (userData) {
      form.reset({
        name: userData?.user?.name || '',
        email: userData?.user?.email || '',
        password: userData?.user?.plainPassword || '',
        confirmPassword: '',
      });
    }
  }, [userData, form]);

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      role: userData?.user ? userData?.user?.role : 'USER',
    };
    try {
      if (!session?.user?.email) return;
      await UpdateUser({ data: payload, id: userData?.user?.id || '' });
      toast.success('User updated successfully');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update user';
      toast.error(message);
    }
  };

  return (
    <div className='w-full max-w-2xl shadow-none border-none'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Enter your name'
                    value={field.value || ''}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    disabled
                    placeholder='Enter your email'
                    value={field.value || ''}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <div className='relative'>
                  <FormControl>
                    <Input
                      placeholder='Enter your password'
                      type={togglePassword ? 'text' : 'password'}
                      value={field.value || ''}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  {!togglePassword ? (
                    <FaRegEye
                      className='absolute top-[6px] right-2 w-6 h-6 p-1 cursor-pointer'
                      onClick={() => setTogglePassword(true)}
                    />
                  ) : (
                    <FaRegEyeSlash
                      className='absolute top-[6px] right-2 w-6 h-6 p-1 cursor-pointer'
                      onClick={() => setTogglePassword(false)}
                    />
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <div className='relative'>
                  <FormControl>
                    <Input
                      placeholder='Enter your password'
                      type={toggleConfirmPassword ? 'text' : 'password'}
                      value={field.value || ''}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  {!toggleConfirmPassword ? (
                    <FaRegEye
                      className='absolute top-[6px] right-2 w-6 h-6 p-1 cursor-pointer'
                      onClick={() => setToggleConfirmPassword(true)}
                    />
                  ) : (
                    <FaRegEyeSlash
                      className='absolute top-[6px] right-2 w-6 h-6 p-1 cursor-pointer'
                      onClick={() => setToggleConfirmPassword(false)}
                    />
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='flex justify-end space-x-4'>
            <Button type='submit'>Save</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
