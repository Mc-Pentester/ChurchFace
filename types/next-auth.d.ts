import NextAuth, { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      churchId?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    churchId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: string;
    churchId?: string | null;
    roleCheckedAt?: number;
  }
}