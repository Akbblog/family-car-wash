import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/mongoClient';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

// --- WE HAVE REMOVED THE BROKEN 'getCookieDomain' FUNCTION ---

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        await connectDB();

        const user = await User.findOne({
          email: credentials.email as string,
        }).select('+password');

        if (!user) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (passwordsMatch) {
          // This is a minimal, correct response
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
          };
        }
        
        return null;
      },
    }),
  ],
  
  // --- WE HAVE REMOVED THE BROKEN 'cookies' BLOCK ---
  // NextAuth's default settings are more secure and will work correctly.

  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET, // This is read from Vercel (which you've added)
  pages: {
    signIn: '/login',
  },

  // --- WE HAVE REMOVED THE 'callbacks' BLOCK ---
});