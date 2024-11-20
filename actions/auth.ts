"use server";

import { signIn, signOut } from "@/auth";
import { db } from "@/db";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";

const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });
    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const login = async (provider: string) => {
  await signIn(provider, { redirectTo: "/" });
  revalidatePath("/");
};

export const logout = async () => {
  await signOut({ redirectTo: "/" });
  revalidatePath("/");
};

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFormInput = z.infer<typeof LoginSchema>;

export const loginUser = async (data: LoginFormInput) => {
  const validatedFields = LoginSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid input",
    };
  }
  const existingUser = await getUserByEmail(data.email);
  console.log(existingUser);

  try {
    await signIn("credentials", data);
  } catch (error: any) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }

    throw error;
  }
  revalidatePath("/");
};

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["USER", "ADMIN"]),
});

export type RegisterFormInput = z.infer<typeof RegisterSchema>;

export async function registerUser(data: RegisterFormInput) {
  const validatedFields = RegisterSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid input",
    };
  }

  try {
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return {
        errors: null,
        message: "User with this email already exists",
      };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        hashedPassword,
        role: data.role,
      },
    });
    return {
      message: "User registered successfully",
    };
  } catch (error) {
    console.log(error);
    return {
      errors: null,
      message: "An error occurred during registration",
    };
  }
}
