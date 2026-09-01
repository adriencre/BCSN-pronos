"use server";

import { supabase } from "./supabase";
import { cookies } from "next/headers";
import { AVATAR_OPTIONS } from "./constants";

// ─── Types & Helper Transformers ──────────────────────────────────────────────
export interface UserRecord {
  id: number;
  pseudo: string;
  pinCode: string;
  totalScore: number;
  role: string;
  avatarEmoji: string;
  theme?: string;
  createdAt: Date;
  predictions?: PredictionRecord[];
}

export interface MatchRecord {
  id: number;
  opponent: string;
  dateTime: Date;
  isHome: boolean;
  scoreBcsn: number | null;
  scoreOpponent: number | null;
  status: string;
  matchday: number;
  createdAt: Date;
  predictions?: PredictionRecord[];
}

export interface PredictionRecord {
  id: number;
  userId: number;
  matchId: number;
  predictedBcsn: number;
  predictedOpponent: number;
  pointsEarned: number;
  user?: UserRecord;
  match?: MatchRecord;
}

function transformUser(row: any): UserRecord {
  return {
    id: row.id,
    pseudo: row.pseudo,
    pinCode: row.pin_code,
    totalScore: row.total_score ?? 0,
    role: row.role ?? "SUPPORTER",
    avatarEmoji: row.avatar_emoji ?? "🏀",
    theme: row.theme ?? "dark",
    createdAt: new Date(row.created_at),
    predictions: row.predictions ? row.predictions.map(transformPrediction) : [],
  };
}

function transformMatch(row: any): MatchRecord {
  const preds = row.predictions ? row.predictions.map(transformPrediction) : [];
  const publicPreds = preds.filter(
    (p: any) => !p.user || (p.user.role !== "ADMIN" && p.user.role !== "COACH")
  );

  return {
    id: row.id,
    opponent: row.opponent,
    dateTime: new Date(row.date_time),
    isHome: row.is_home,
    scoreBcsn: row.score_bcsn,
    scoreOpponent: row.score_opponent,
    status: row.status ?? "PENDING",
    matchday: row.matchday ?? 0,
    createdAt: new Date(row.created_at),
    predictions: publicPreds,
  };
}

function transformPrediction(row: any): PredictionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    matchId: row.match_id,
    predictedBcsn: row.predicted_bcsn,
    predictedOpponent: row.predicted_opponent,
    pointsEarned: row.points_earned ?? 0,
    user: row.user ? transformUser(row.user) : undefined,
    match: row.match ? transformMatch(row.match) : undefined,
  };
}

// ─── Points Calculation ───────────────────────────────────────────────────────
export async function calculatePoints(
  prediction: { predictedBcsn: number; predictedOpponent: number },
  actualMatch: { scoreBcsn: number; scoreOpponent: number }
): Promise<number> {
  const { predictedBcsn, predictedOpponent } = prediction;
  const { scoreBcsn, scoreOpponent } = actualMatch;

  if (predictedBcsn === scoreBcsn && predictedOpponent === scoreOpponent) {
    return 10;
  }

  const predictedWinner =
    predictedBcsn > predictedOpponent
      ? "BCSN"
      : predictedBcsn < predictedOpponent
      ? "OPPONENT"
      : "DRAW";

  const actualWinner =
    scoreBcsn > scoreOpponent
      ? "BCSN"
      : scoreBcsn < scoreOpponent
      ? "OPPONENT"
      : "DRAW";

  if (predictedWinner !== actualWinner) {
    return 0;
  }

  const predictedDiff = Math.abs(predictedBcsn - predictedOpponent);
  const actualDiff = Math.abs(scoreBcsn - scoreOpponent);
  const diffGap = Math.abs(predictedDiff - actualDiff);

  if (diffGap === 0) return 5;
  if (diffGap <= 3) return 3;
  return 1;
}

// ─── Voting Window ────────────────────────────────────────────────────────────
export async function getVotingWindow(matchDateTime: Date): Promise<{ opensAt: Date; closesAt: Date }> {
  const closesAt = new Date(matchDateTime);
  const opensAt = new Date(matchDateTime);
  const day = opensAt.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  opensAt.setDate(opensAt.getDate() - daysFromMonday);
  opensAt.setHours(0, 0, 0, 0);

  return { opensAt, closesAt };
}

export async function getActiveMatch() {
  const now = new Date();

  const { data, error } = await supabase
    .from("matches")
    .select("*, predictions(*, user:users(*))")
    .eq("status", "PENDING")
    .order("date_time", { ascending: true })
    .limit(1);

  if (error || !data || data.length === 0) return null;

  const nextMatch = transformMatch(data[0]);
  const { opensAt, closesAt } = await getVotingWindow(nextMatch.dateTime);
  const isVotingOpen = now >= opensAt && now < closesAt;

  return {
    match: nextMatch,
    opensAt,
    closesAt,
    isVotingOpen,
  };
}

export async function getUpcomingMatches() {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("status", "PENDING")
    .order("date_time", { ascending: true });

  if (error || !data) return [];
  return data.map(transformMatch);
}

// ─── Auth Actions ─────────────────────────────────────────────────────────────
export async function registerUser(
  pseudo: string,
  pinCode: string,
  role: string = "SUPPORTER",
  avatarEmoji: string = "🏀"
) {
  if (!pseudo || pseudo.length < 2) {
    return { error: "Le pseudo doit contenir au moins 2 caractères" };
  }
  if (pseudo.length > 16) {
    return { error: "Le pseudo ne doit pas dépasser 16 caractères" };
  }
  if (!/^\d{4}$/.test(pinCode)) {
    return { error: "Le code PIN doit être composé de 4 chiffres" };
  }
  if (!["JOUEUR", "SUPPORTER"].includes(role)) {
    return { error: "Rôle invalide" };
  }
  const isCustomPhoto =
    typeof avatarEmoji === "string" &&
    (avatarEmoji.startsWith("data:image/") ||
      avatarEmoji.startsWith("http://") ||
      avatarEmoji.startsWith("https://"));

  if (!AVATAR_OPTIONS.includes(avatarEmoji) && !isCustomPhoto) {
    avatarEmoji = "🏀";
  }

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("pseudo", pseudo)
    .limit(1);

  if (existing && existing.length > 0) {
    return { error: "Ce pseudo est déjà pris" };
  }

  const { data: newUser, error } = await supabase
    .from("users")
    .insert({ pseudo, pin_code: pinCode, role, avatar_emoji: avatarEmoji })
    .select()
    .single();

  if (error || !newUser) {
    return { error: "Erreur lors de la création du compte: " + (error?.message || "") };
  }

  const cookieStore = await cookies();
  cookieStore.set("userId", String(newUser.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  return { success: true, userId: newUser.id };
}

export async function loginUser(pseudo: string, pinCode: string) {
  if (!pseudo || !pinCode) {
    return { error: "Pseudo et code PIN requis" };
  }

  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .eq("pseudo", pseudo)
    .limit(1);

  const user = users && users.length > 0 ? users[0] : null;

  if (error || !user || user.pin_code !== pinCode) {
    return { error: "Pseudo ou code PIN incorrect" };
  }

  const cookieStore = await cookies();
  cookieStore.set("userId", String(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  return { success: true, userId: user.id };
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("userId");
  return { success: true };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userIdCookie = cookieStore.get("userId");
  if (!userIdCookie) return null;

  const userId = parseInt(userIdCookie.value, 10);
  if (isNaN(userId)) return null;

  const { data: users, error } = await supabase
    .from("users")
    .select("*, predictions(*)")
    .eq("id", userId)
    .limit(1);

  if (error || !users || users.length === 0) return null;

  return transformUser(users[0]);
}

export async function updateProfile(avatarEmoji: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Non connecté" };

  const isCustomPhoto =
    typeof avatarEmoji === "string" &&
    (avatarEmoji.startsWith("data:image/") ||
      avatarEmoji.startsWith("http://") ||
      avatarEmoji.startsWith("https://"));

  if (!AVATAR_OPTIONS.includes(avatarEmoji) && !isCustomPhoto) {
    return { error: "Avatar invalide" };
  }

  const { error } = await supabase
    .from("users")
    .update({ avatar_emoji: avatarEmoji })
    .eq("id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}


export async function updateUserTheme(theme: "dark" | "light") {
  const user = await getCurrentUser();
  if (!user) return { error: "Non connecté" };

  const { error } = await supabase
    .from("users")
    .update({ theme })
    .eq("id", user.id);

  if (error) {
    console.warn("Notice: theme column update error (if DB schema not migrated yet):", error.message);
  }
  return { success: true };
}

// ─── Match Actions ────────────────────────────────────────────────────────────
export async function getMatches() {
  const { data, error } = await supabase
    .from("matches")
    .select("*, predictions(*)")
    .order("date_time", { ascending: true });

  if (error || !data) return [];
  return data.map(transformMatch);
}

export async function getMatch(id: number) {
  const { data, error } = await supabase
    .from("matches")
    .select("*, predictions(*, user:users(*))")
    .eq("id", id)
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return transformMatch(data[0]);
}

export async function createMatch(data: {
  opponent: string;
  dateTime: string;
  isHome: boolean;
  matchday?: number;
}) {
  const { data: newMatch, error } = await supabase
    .from("matches")
    .insert({
      opponent: data.opponent,
      date_time: new Date(data.dateTime).toISOString(),
      is_home: data.isHome,
      matchday: data.matchday ?? 0,
    })
    .select()
    .single();

  if (error || !newMatch) throw new Error(error?.message || "Impossible de créer le match");
  return transformMatch(newMatch);
}

export async function finishMatch(
  matchId: number,
  scoreBcsn: number,
  scoreOpponent: number
) {
  const { data: updatedMatch, error: matchErr } = await supabase
    .from("matches")
    .update({
      score_bcsn: scoreBcsn,
      score_opponent: scoreOpponent,
      status: "FINISHED",
    })
    .eq("id", matchId)
    .select()
    .single();

  if (matchErr || !updatedMatch) throw new Error(matchErr?.message || "Erreur match");

  const { data: predictions } = await supabase
    .from("predictions")
    .select("*")
    .eq("match_id", matchId);

  if (predictions && predictions.length > 0) {
    for (const pred of predictions) {
      const points = await calculatePoints(
        {
          predictedBcsn: pred.predicted_bcsn,
          predictedOpponent: pred.predicted_opponent,
        },
        { scoreBcsn, scoreOpponent }
      );

      await supabase
        .from("predictions")
        .update({ points_earned: points })
        .eq("id", pred.id);
    }

    // Recalculate user total scores dynamically from all predictions
    const { data: users } = await supabase.from("users").select("id");
    if (users) {
      for (const u of users) {
        const { data: uPreds } = await supabase
          .from("predictions")
          .select("points_earned")
          .eq("user_id", u.id);

        const sum = uPreds ? uPreds.reduce((acc, curr) => acc + (curr.points_earned ?? 0), 0) : 0;
        await supabase.from("users").update({ total_score: sum }).eq("id", u.id);
      }
    }
  }

  return transformMatch(updatedMatch);
}

export async function submitMatchResult(
  matchId: number,
  scoreBcsn: number,
  scoreOpponent: number
) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "COACH")) {
    return { error: "Accès réservé aux administrateurs" };
  }

  try {
    await finishMatch(matchId, scoreBcsn, scoreOpponent);
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Erreur lors de la validation du score" };
  }
}

export async function verifyAdminCode(secretPin: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Non connecté" };

  const masterPin = process.env.ADMIN_SECRET_PIN || "2026";
  if (secretPin !== masterPin) {
    return { error: "Code secret administrateur incorrect" };
  }

  const { error } = await supabase
    .from("users")
    .update({ role: "ADMIN" })
    .eq("id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

// ─── Prediction Actions ───────────────────────────────────────────────────────
export async function submitPrediction(
  matchId: number,
  predictedBcsn: number,
  predictedOpponent: number
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Vous devez être connecté" };

  const active = await getActiveMatch();
  if (!active || active.match.id !== matchId) {
    return { error: "Ce match n'est pas ouvert aux pronostics" };
  }
  if (!active.isVotingOpen) {
    return { error: "Les votes sont fermés pour ce match" };
  }

  const { data: existingList } = await supabase
    .from("predictions")
    .select("id")
    .eq("user_id", user.id)
    .eq("match_id", matchId);

  if (existingList && existingList.length > 0) {
    return { error: "Vous avez déjà validé votre pronostic pour ce match." };
  }

  const { data: inserted, error } = await supabase
    .from("predictions")
    .insert({
      user_id: user.id,
      match_id: matchId,
      predicted_bcsn: predictedBcsn,
      predicted_opponent: predictedOpponent,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { success: true, prediction: transformPrediction(inserted) };
}

export async function getUserPrediction(matchId: number) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .eq("user_id", user.id)
    .eq("match_id", matchId)
    .order("id", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return transformPrediction(data[0]);
}

export async function getUserAllPredictions(userId: number) {
  const { data, error } = await supabase
    .from("predictions")
    .select("*, match:matches(*)")
    .eq("user_id", userId)
    .order("id", { ascending: false });

  if (error || !data) return [];
  return data.map(transformPrediction);
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────
export async function getLeaderboard() {
  const { data, error } = await supabase
    .from("users")
    .select("id, pseudo, total_score, role, avatar_emoji, predictions(id, points_earned, match:matches(status, date_time))")
    .neq("role", "ADMIN")
    .order("total_score", { ascending: false });

  if (error || !data) return [];

  return data.map((u) => {
    // Extract finished match predictions sorted by date descending
    const rawPreds = Array.isArray(u.predictions) ? u.predictions : [];
    const finishedPreds = rawPreds
      .filter((p: any) => p.match && p.match.status === "FINISHED")
      .sort((a: any, b: any) => new Date(b.match.date_time).getTime() - new Date(a.match.date_time).getTime());

    // Take last 5 finished match outcomes (recent form)
    const recentForm = finishedPreds.slice(0, 5).map((p: any) => p.points_earned ?? 0).reverse();

    // Calculate current win streak (consecutive predictions with > 0 pts)
    let streak = 0;
    for (const p of finishedPreds) {
      if ((p.points_earned ?? 0) > 0) {
        streak++;
      } else {
        break;
      }
    }

    return {
      id: u.id,
      pseudo: u.pseudo,
      totalScore: u.total_score ?? 0,
      role: u.role ?? "SUPPORTER",
      avatarEmoji: u.avatar_emoji ?? "🏀",
      recentForm,
      streak,
      _count: { predictions: rawPreds.length },
    };
  });
}

// ─── Past Matches ─────────────────────────────────────────────────────────────
export async function getPastMatches() {
  const { data, error } = await supabase
    .from("matches")
    .select("*, predictions(*, user:users(*))")
    .eq("status", "FINISHED")
    .order("date_time", { ascending: false });

  if (error || !data) return [];
  return data.map(transformMatch);
}

// ─── Seed Official 2026-2027 Schedule ───────────────────────────────────────
export async function seedSampleMatches() {
  const { count } = await supabase
    .from("matches")
    .select("*", { count: "exact", head: true });

  if (count && count > 0) return { message: "Des matchs existent déjà" };

  const matches = [
    {
      opponent: "Longueau (Amical)",
      date_time: new Date("2026-08-29T18:30:00+02:00").toISOString(),
      is_home: false,
      matchday: 0,
    },
    {
      opponent: "Lillers (Amical)",
      date_time: new Date("2026-09-02T20:00:00+02:00").toISOString(),
      is_home: true,
      matchday: 0,
    },
    {
      opponent: "Lesquin (Amical)",
      date_time: new Date("2026-09-05T20:30:00+02:00").toISOString(),
      is_home: false,
      matchday: 0,
    },
    {
      opponent: "Amiens (Amical)",
      date_time: new Date("2026-09-12T20:30:00+02:00").toISOString(),
      is_home: true,
      matchday: 0,
    },
    {
      opponent: "Hornaing D2 (Coupe de France)",
      date_time: new Date("2026-09-15T20:30:00+02:00").toISOString(),
      is_home: false,
      matchday: 0,
    },
    {
      opponent: "Gouvieux",
      date_time: new Date("2026-09-19T20:30:00+02:00").toISOString(),
      is_home: false,
      matchday: 1,
    },
    {
      opponent: "Crépy",
      date_time: new Date("2026-09-26T20:30:00+02:00").toISOString(),
      is_home: true,
      matchday: 2,
    },
    {
      opponent: "St Quentin",
      date_time: new Date("2026-10-10T20:30:00+02:00").toISOString(),
      is_home: false,
      matchday: 3,
    },
    {
      opponent: "Margny",
      date_time: new Date("2026-10-17T20:30:00+02:00").toISOString(),
      is_home: false,
      matchday: 4,
    },
    {
      opponent: "Gricourt",
      date_time: new Date("2026-11-07T20:30:00+02:00").toISOString(),
      is_home: true,
      matchday: 5,
    },
    {
      opponent: "Gouvieux",
      date_time: new Date("2026-11-14T20:30:00+02:00").toISOString(),
      is_home: true,
      matchday: 6,
    },
    {
      opponent: "Crépy",
      date_time: new Date("2026-11-21T20:30:00+02:00").toISOString(),
      is_home: false,
      matchday: 7,
    },
    {
      opponent: "St Quentin",
      date_time: new Date("2026-11-28T20:30:00+02:00").toISOString(),
      is_home: true,
      matchday: 8,
    },
    {
      opponent: "Margny",
      date_time: new Date("2026-12-05T20:30:00+02:00").toISOString(),
      is_home: true,
      matchday: 9,
    },
    {
      opponent: "Gricourt",
      date_time: new Date("2026-12-12T20:30:00+02:00").toISOString(),
      is_home: false,
      matchday: 10,
    },
  ];

  await supabase.from("matches").insert(matches);
  return { success: true };
}
