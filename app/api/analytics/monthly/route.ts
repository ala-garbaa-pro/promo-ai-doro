import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import { getMonthlyAnalytics } from "@/lib/server/services/analytics-service";
import { headers } from "next/headers";

// GET /api/analytics/monthly - Get monthly analytics for the current user
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
    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");

    // Convert parameters to appropriate types
    const now = new Date();
    const month = monthParam ? parseInt(monthParam) : now.getMonth() + 1; // 1-12
    const year = yearParam ? parseInt(yearParam) : now.getFullYear();

    // Get monthly analytics
    const analytics = await getMonthlyAnalytics(userId, month, year);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error getting monthly analytics:", error);
    return NextResponse.json(
      { error: "Failed to get monthly analytics" },
      { status: 500 }
    );
  }
}
