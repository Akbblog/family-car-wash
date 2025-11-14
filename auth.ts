import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongoClient";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        await connectDB();

        const user = await User.findOne({ email: String(credentials.email) }).select("+password");

        if (!user) return null;

        const passwordsMatch = await bcrypt.compare(
          String(credentials.password),
          user.password
        );

        if (!passwordsMatch) return null;

        // ✅ Must include emailVerified for AdapterUser
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          emailVerified: null, // required
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  secret: process.env.AUTH_SECRET,

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.emailVerified = user.emailVerified ?? null; // ✅ include emailVerified
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
          emailVerified: token.emailVerified ?? null, // ✅ required
        };
      }
      return session;
    },
  },
});
