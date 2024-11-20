import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import NextAuth, { RequestInternal, SessionStrategy } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

const prisma = new PrismaClient();

const authOptions = {
  session: {
    strategy: 'jwt' as SessionStrategy,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'hello@example.com',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(
        credentials: Record<'email' | 'password', string> | undefined,
        req: Pick<RequestInternal, 'body' | 'query' | 'headers' | 'method'>
      ): Promise<User | null> {
        if (!credentials) {
          throw new Error('Missing credentials');
        }

        const { email, password } = credentials;
        if (!email || !password) {
          throw new Error('Email and password are required');
        }

        console.log({ email, password });

        const user = await prisma.user.findUnique({
          where: { email },
        });

        console.log('User found:', user);

        if (!user || !(await bcrypt.compare(password, user?.password ?? ''))) {
          return null;
        }

        return {
          id: user.id,
          email: user.email ?? '',
          name: user.name ?? '',
          role: user.role as string,
        };
      },
    }),
  ],

  pages: {
    signIn: '/login',
    error: '/login',
  },

  secret: process.env.NEXT_PUBLIC_AUTH_SECRET,

  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      if (token?.user) {
        session.user = token.user;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
