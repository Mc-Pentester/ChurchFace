import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "./components/AdminSidebar";
import AdminStats from "./components/AdminStats";
import AdminMembers from "./components/AdminMembers";
import AdminPosts from "./components/AdminPosts";
import AdminEvents from "./components/AdminEvents";
import { userHasChurchRole } from "@/lib/church-perms";

export const runtime = "nodejs";

async function getChurch(slug: string) {
  const church = await prisma.church.findUnique({
    where: { slug },
    include: {
      admins: true,
    },
  });

  return church;
}

async function checkAdminAccess(churchId: string, userId: string) {
  const ok = await userHasChurchRole(churchId, userId, ["CHURCH_OWNER", "CHURCH_ADMIN", "PASTOR", "ADMIN"]);
  return ok;
}

export default async function AdminDashboard({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  const { slug } = await params;

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const church = await getChurch(slug);

  if (!church) {
    notFound();
  }

  const hasAccess = await checkAdminAccess(church.id, session.user.id);

  if (!hasAccess) {
    redirect(`/church/${slug}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar church={church} />
        
        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Tableau de bord - {church.name}
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez votre église et ses activités
            </p>
          </div>

          <div className="space-y-8">
            <AdminStats churchId={church.id} />
            <AdminMembers churchId={church.id} churchSlug={church.slug} />
            <AdminPosts churchId={church.id} churchSlug={church.slug} />
            <AdminEvents churchId={church.id} churchSlug={church.slug} />
          </div>
        </div>
      </div>
    </div>
  );
}
