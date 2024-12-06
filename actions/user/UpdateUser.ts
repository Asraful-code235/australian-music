'use server';

import { db } from '@/db';

import bcrypt from 'bcryptjs';
import { RegisterFormInput } from '../auth';

type UpdateUserInput = {
  id: string;
  data: RegisterFormInput;
};

export const UpdateUser = async ({ data, id }: UpdateUserInput) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  try {
    const updateUser = await db.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        hashedPassword,
        plainPassword: data.password,
        role: data.role,
      },
    });
    return updateUser;
  } catch (e) {
    console.log(e);
    throw new Error('Failed to User');
  }
};
