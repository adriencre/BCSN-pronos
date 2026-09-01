import { NextResponse } from "next/server";
import { checkAndSendAutomatedMatchReminders } from "@/lib/pushNotifications";

export const dynamic = "force-dynamic";

/**
 * Route API pour déclencher la vérification et l'envoi automatique des rappels de match
 * Accessible via GET /api/cron/reminders ou POST /api/cron/reminders
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const secret = process.env.CRON_SECRET;

    // Si une clé secrète est configurée dans l'environnement, on la valide
    if (secret && authHeader !== `Bearer ${secret}`) {
      const url = new URL(request.url);
      const queryKey = url.searchParams.get("key");
      if (queryKey !== secret) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
      }
    }

    const result = await checkAndSendAutomatedMatchReminders();
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (err: any) {
    console.error("Erreur API Cron Reminders:", err);
    return NextResponse.json(
      { error: err.message || "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
