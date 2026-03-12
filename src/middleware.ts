import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard",
    "/jobs",
    "/resumes",
    "/api/jobs/:path*",
    "/api/resume/:path*",
  ],
};
