import { getClubBySlug } from "@/lib/clubsData";
import ClubDetailView from "./ClubDetailView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClubDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const club = getClubBySlug(resolvedParams.id);
  return <ClubDetailView club={club} />;
}
