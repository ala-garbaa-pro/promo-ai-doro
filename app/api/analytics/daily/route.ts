import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import { getDailyAnalytics } from "@/lib/server/services/analytics-service";
import { headers } from "next/headers";

// GET /api/analytics/daily - Get daily analytics for the current user
export async function GET(request: NextRequest) {
  try {
    // Get the session using better-auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get("date");

    // Convert parameters to appropriate types
    const date = dateParam ? new Date(dateParam) : new Date();

    // Get daily analytics
    const analytics = await getDailyAnalytics(userId, date);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error getting daily analytics:", error);
    return NextResponse.json(
      { error: "Failed to get daily analytics" },
      { status: 500 }
    );
  }
}
