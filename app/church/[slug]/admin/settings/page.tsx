import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ChurchSettingsClient from "./ChurchSettingsClient";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ChurchSettingsPage({ params }: PageProps) {
  const { slug } = await params;

  const church = await prisma.church.findUnique({
    where: { slug },
  });

  if (!church) {
    notFound();
  }

  return <ChurchSettingsClient church={church} />;
}
