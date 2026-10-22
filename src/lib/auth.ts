import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { authConfig } from "@/auth.config";

const loginSchema = z.object({
  identifier: z.string(),
  password: z.string(),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        identifier: { label: "Phone or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { identifier, password } = parsed.data;

        const isPhone = identifier.startsWith("+");
        const user = isPhone
          ? await prisma.user.findUnique({ where: { phone: identifier } })
          : await prisma.user.findUnique({ where: { username: identifier } });
        if (!user || !user.isActive) return null;

        // User hasn't set a password yet — can't log in until they do
        if (user.passwordHash === "") {
          return null;
        }

        const passwordMatch = await compare(password, user.passwordHash);
        if (!passwordMatch) return null;

        return {
          id: user.id,
          phone: user.phone,
          username: user.username ?? undefined,
          name: user.name,
          email: user.email ?? undefined,
          role: user.role,
          image: user.avatarUrl ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = (user as { phone?: string }).phone;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as { phone?: string }).phone = token.phone as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});
