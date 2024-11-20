'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { LoginFormInput } from '@/actions/auth';
import { signIn, SignInResponse } from 'next-auth/react';

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function LoginForm() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const previousURL = searchParams.get('callbackUrl');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInput>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginFormInput) => {
    startTransition(async () => {
      const result: SignInResponse | undefined = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: '/dashboard',
      });

      if (result) {
        if (result.ok && result.status === 200) {
          toast.success('Login successfully');
          router.push(previousURL ?? '/dashboard');
        } else {
          toast.error('Wrong username or password');
        }
      } else {
        console.error('Login failed: signIn returned undefined');
        toast.error('An error occurred during login');
      }
    });
  };

  return (
    <div className='flex h-screen w-full items-center justify-center px-4'>
      <Card className='mx-auto max-w-sm'>
        <CardHeader>
          <CardTitle className='text-2xl'>Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className='grid gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='m@example.com'
                {...register('email')}
              />
              {errors.email && (
                <p className='text-sm text-red-500'>{errors.email.message}</p>
              )}
            </div>
            <div className='grid gap-2'>
              <Input id='password' type='password' {...register('password')} />
              {errors.password && (
                <p className='text-sm text-red-500'>
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button type='submit' className='w-full' disabled={isPending}>
              {isPending ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
