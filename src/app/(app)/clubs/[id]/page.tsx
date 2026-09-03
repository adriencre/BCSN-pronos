import { getClubBySlug } from "@/lib/clubsData";
import ClubDetailView from "./ClubDetailView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClubDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.id || "");
  const club = getClubBySlug(slug);
  return <ClubDetailView club={club} />;
}
