import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    // Match all paths except these specific patterns
    "/((?!api/auth/.*|login|_next/static|_next/image|favicon.ico).*)",
  ],
};
