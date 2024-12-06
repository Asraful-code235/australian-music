'use client';

import { RegisterFormInput, registerUser } from '@/actions/auth';
import ModalForm from '@/components/shared/shared-modal';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['USER', 'ADMIN']),
});

type EditUserDialogProps = {
  handleSubmit: any;
  onSubmit: any;
  isLoading?: boolean;
  serverError?: string;
  errors: any;
  control: any;
  register: any;
  isValid?: boolean;
};

export function EditUserDialog({
  handleSubmit,
  onSubmit,
  isLoading,
  serverError,
  errors,
  control,
  register,
  isValid,
}: EditUserDialogProps) {
  return (
    <form className='grid gap-4 py-4'>
      <div className='grid gap-2'>
        <Label htmlFor='djName'>DJ Name</Label>
        <Input id='djName' placeholder='Name' {...register('name')} />
        {errors.name && (
          <p className='text-sm text-red-500'>{errors.name.message}</p>
        )}
      </div>
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
        <Label htmlFor='password'>Password</Label>
        <Input
          id='password'
          type='text'
          placeholder='********'
          {...register('password')}
        />
        {errors.password && (
          <p className='text-sm text-red-500'>{errors.password.message}</p>
        )}
      </div>
      <div className='grid gap-2'>
        <Label htmlFor='role'>User Type</Label>
        <Controller
          name='role'
          control={control}
          defaultValue='USER'
          render={({ field }) => (
            <Select
              onValueChange={(value) => field.onChange(value)}
              value={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select user type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ADMIN'>Admin</SelectItem>
                <SelectItem value='USER'>User</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.role && (
          <p className='text-sm text-red-500'>{errors.role.message}</p>
        )}
      </div>

      {serverError && <p className='text-sm text-red-500'>{serverError}</p>}
    </form>
  );
}
