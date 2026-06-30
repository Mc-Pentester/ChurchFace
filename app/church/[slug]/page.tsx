import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ChurchHero from "./components/ChurchHero";
import ChurchSidebar from "./components/ChurchSidebar";
import ChurchFeed from "./components/ChurchFeed";
import Navbar from "@/components/layout/Navbar";

export const runtime = "nodejs";

async function getChurch(slug: string) {
  const session = await getServerSession(authOptions);

  const church = await prisma.church.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          members: true,
          followers: true,
          events: true,
          posts: true,
        },
      },
      admins: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      lives: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!church) {
    return null;
  }

  // Check if user is following this church
  let isFollowing = false;
  if (session?.user) {
    const follow = await prisma.churchFollow.findUnique({
      where: {
        churchId_userId: {
          churchId: church.id,
          userId: session.user.id,
        },
      },
    });
    isFollowing = !!follow;
  }

  return {
    ...church,
    isFollowing,
  };
}

export default async function ChurchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const church = await getChurch(slug);

  if (!church) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50">
      <Navbar />
      <ChurchHero church={church} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Feed */}
          <div className="flex-1">
            <ChurchFeed churchId={church.id} churchSlug={slug} />
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-80">
            <ChurchSidebar church={church} />
          </div>
        </div>
      </div>
    </div>
  );
}
