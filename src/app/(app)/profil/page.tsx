import { getCurrentUser, getLeaderboard, getUserAllPredictions } from "@/lib/actions";
import { redirect } from "next/navigation";
import ProfileView from "./ProfileView";

export default async function ProfilPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [leaderboard, rawPredictions] = await Promise.all([
    getLeaderboard(),
    getUserAllPredictions(user.id),
  ]);

  const rank = leaderboard.findIndex((u) => u.id === user.id) + 1;

  const predictions = rawPredictions.map((pred) => ({
    matchId: pred.matchId,
    opponent: pred.match?.opponent ?? "Adversaire",
    isHome: pred.match?.isHome ?? true,
    dateTime: pred.match?.dateTime ? pred.match.dateTime.toISOString() : new Date().toISOString(),
    matchday: pred.match?.matchday ?? 0,
    status: pred.match?.status ?? "PENDING",
    scoreBcsn: pred.match?.scoreBcsn ?? null,
    scoreOpponent: pred.match?.scoreOpponent ?? null,
    predictedBcsn: pred.predictedBcsn,
    predictedOpponent: pred.predictedOpponent,
    pointsEarned: pred.pointsEarned,
  }));

  return (
    <ProfileView
      user={{
        id: user.id,
        pseudo: user.pseudo,
        totalScore: user.totalScore,
        role: user.role,
        avatarEmoji: user.avatarEmoji,
        theme: user.theme ?? "dark",
        createdAt: user.createdAt.toISOString(),
        predictionsCount: predictions.length,
      }}
      rank={rank}
      totalPlayers={leaderboard.length}
      predictions={predictions}
    />
  );
}
