import { getActiveMatch, getCurrentUser, getUserPrediction, getPastMatches, getUpcomingMatches } from "@/lib/actions";
import { redirect } from "next/navigation";
import ActiveMatchView from "./ActiveMatchView";

export default async function MatchsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [active, pastMatches, upcomingMatches] = await Promise.all([
    getActiveMatch(),
    getPastMatches(),
    getUpcomingMatches(),
  ]);

  let existingPrediction = null;
  if (active) {
    existingPrediction = await getUserPrediction(active.match.id);
  }

  return (
    <ActiveMatchView
      active={
        active
          ? {
              match: {
                ...active.match,
                dateTime: active.match.dateTime.toISOString(),
                createdAt: active.match.createdAt.toISOString(),
                predictions: (active.match.predictions || []).map((p) => ({
                  ...p,
                  user: {
                    id: p.user?.id ?? 0,
                    pseudo: p.user?.pseudo ?? "Anonyme",
                    avatarEmoji: p.user?.avatarEmoji ?? "🏀",
                    role: p.user?.role ?? "SUPPORTER",
                  },
                })),
              },
              opensAt: active.opensAt.toISOString(),
              closesAt: active.closesAt.toISOString(),
              isVotingOpen: active.isVotingOpen,
            }
          : null
      }
      existingPrediction={existingPrediction}
      currentUserId={user.id}
      currentUserPseudo={user.pseudo}
      currentUserAvatar={user.avatarEmoji}
      upcomingMatches={upcomingMatches.map((m) => ({
        id: m.id,
        opponent: m.opponent,
        dateTime: m.dateTime.toISOString(),
        isHome: m.isHome,
        matchday: m.matchday,
      }))}
      pastMatches={pastMatches.slice(0, 5).map((m) => ({
        id: m.id,
        opponent: m.opponent,
        dateTime: m.dateTime.toISOString(),
        isHome: m.isHome,
        scoreBcsn: m.scoreBcsn,
        scoreOpponent: m.scoreOpponent,
        matchday: m.matchday,
      }))}
    />
  );
}
