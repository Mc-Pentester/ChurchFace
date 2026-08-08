import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PrayerSpacePage from "@/app/prayer-space/page";

interface ChurchPrayersPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ChurchPrayersPage({ params }: ChurchPrayersPageProps) {
  const { slug } = await params;
  const church = await prisma.church.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true },
  });

  if (!church) {
    notFound();
  }

  return (
    <PrayerSpacePage
      mode="church"
      churchId={church.id}
      churchName={church.name}
    />
  );
}
