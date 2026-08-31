import { getMatches, getCurrentUser } from "@/lib/actions";
import { redirect } from "next/navigation";
import AdminScoresView from "./AdminScoresView";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/matchs");
  }

  const matches = await getMatches();
  const formattedMatches = matches.map((m) => ({
    ...m,
    dateTime: m.dateTime.toISOString(),
  }));

  return <AdminScoresView matches={formattedMatches} />;
}
