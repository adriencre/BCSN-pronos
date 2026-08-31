import { getMatches, getCurrentUser } from "@/lib/actions";
import { redirect } from "next/navigation";
import AdminScoresView from "./AdminScoresView";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/matchs");
  }

  const matches = await getMatches();
  return <AdminScoresView matches={matches} />;
}
