'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../../prisma/db/prisma';
import { signIn } from 'next-auth/react';

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginFormInput = z.infer<typeof LoginSchema>;

export async function loginUser(data: LoginFormInput) {
  console.log();
  const validatedFields = LoginSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid input',
    };
  }

  try {
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      return {
        errors: null,
        message: 'Invalid credentials',
      };
    }

    return {
      message: 'Login successful',
    };
  } catch (error) {
    console.log(error);
    return {
      errors: null,
      message: 'An error occurred during login',
    };
  }
}

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['USER', 'ADMIN']),
});

export type RegisterFormInput = z.infer<typeof RegisterSchema>;

export async function registerUser(data: RegisterFormInput) {
  const validatedFields = RegisterSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid input',
    };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return {
        errors: null,
        message: 'User with this email already exists',
      };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      },
    });
    return {
      message: 'User registered successfully',
    };
  } catch (error) {
    console.log(error);
    return {
      errors: null,
      message: 'An error occurred during registration',
    };
  }
}

export async function updateUser(
  userId: string,
  data: Partial<RegisterFormInput>
) {
  try {
    const updateData = { ...data };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return {
      message: 'User updated successfully',
    };
  } catch (error) {
    console.log(error);
    return {
      errors: null,
      message: 'An error occurred while updating the user',
    };
  }
}

export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    return {
      message: 'User deleted successfully',
    };
  } catch (error) {
    console.log(error);
    return {
      errors: null,
      message: 'An error occurred while deleting the user',
    };
  }
}
