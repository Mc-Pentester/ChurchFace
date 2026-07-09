import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";

/**
 * 🔐 NEXTAUTH CONFIG CLEAN & ROBUST
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",

      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    /**
     * 🔥 JWT (FAST + SAFE)
     */
    async jwt({ token, user }) {
      const ROLE_REFRESH_MS = 5 * 60 * 1000;

      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.roleCheckedAt = Date.now();
        return token;
      }

      const lastCheck = (token.roleCheckedAt as number) || 0;
      const shouldRefresh =
        token.id && Date.now() - lastCheck > ROLE_REFRESH_MS;

      if (shouldRefresh) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
        }
        token.roleCheckedAt = Date.now();
      }

      return token;
    },

    /**
     * 📦 SESSION (FRONT ACCESS)
     */
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role ?? "USER";
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const STUDIO_ROLES = ["ADMIN", "SUPER_ADMIN", "RADIO_HOST"];

/**
 * Accès studio radio (ADMIN, SUPER_ADMIN, RADIO_HOST) — lu depuis Prisma.
 */
export async function requireStudioAccess() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, image: true, role: true },
  });

  if (!dbUser || !STUDIO_ROLES.includes(dbUser.role)) return null;

  return {
    ...session!.user,
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    image: dbUser.image,
    role: dbUser.role,
  };
}

export async function canManageRadio(radioId: string, userId: string) {
  const radio = await prisma.radio.findUnique({
    where: { id: radioId },
    select: { userId: true },
  });
  if (!radio) return false;
  if (radio.userId === userId) return true;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
}

/**
 * Vérifie le rôle admin directement en base (source de vérité Prisma Studio).
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;

  if (!userId) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, image: true, role: true },
  });

  if (
  !dbUser ||
  !["ADMIN", "SUPER_ADMIN"].includes(dbUser.role)
) {
  return null;
}

  return {
    ...session!.user,
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    image: dbUser.image,
    role: dbUser.role,
  };
}