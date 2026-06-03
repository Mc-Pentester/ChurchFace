import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

// Single source of truth for NextAuth configuration.
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };