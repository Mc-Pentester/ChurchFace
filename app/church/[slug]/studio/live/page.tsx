import { redirect } from "next/navigation";

export default function ChurchStudioLivePage({ params }: { params: Promise<{ slug: string }> }) {
  params.then(({ slug }) => {
    redirect(`/church/${slug}/admin/live`);
  });

  return null;
}
