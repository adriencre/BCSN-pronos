import { getLeaderboard, getCurrentUser } from "@/lib/actions";
import { redirect } from "next/navigation";
import LeaderboardView from "./LeaderboardView";

export default async function ClassementPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const leaderboard = await getLeaderboard();

  return <LeaderboardView leaderboard={leaderboard} currentUserId={user.id} />;
}
