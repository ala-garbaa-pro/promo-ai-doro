import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import { headers } from "next/headers";
import {
  getDailyAnalytics,
  getProductivityByHour,
} from "@/lib/server/services/analytics-service";
import { getAIInsights } from "@/lib/server/services/ai-insights-service";

/**
 * GET /api/analytics/insights - Get AI-powered insights for the current user
 */
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
    const daysParam = searchParams.get("days");
    const days = daysParam ? parseInt(daysParam) : 30; // Default to 30 days

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Get daily analytics for the specified period
    const dailyAnalytics = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayAnalytics = await getDailyAnalytics(userId, currentDate);
      if (dayAnalytics) {
        dailyAnalytics.push(dayAnalytics);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Get productivity by hour
    const productivityByHour = await getProductivityByHour(
      userId,
      startDate,
      endDate
    );

    // Generate AI insights
    const insights = getAIInsights(dailyAnalytics, productivityByHour);

    // Return insights along with some context data
    return NextResponse.json({
      insights,
      dataPoints: dailyAnalytics.length,
      period: {
        startDate,
        endDate,
        days,
      },
      patterns: {
        mostProductiveHours: insights.find(
          (i) => i.title === "Peak Productivity Hours"
        )?.description,
        mostProductiveDays: insights.find((i) => i.title === "Productive Days")
          ?.description,
        optimalSessionLength: insights.find(
          (i) => i.title === "Optimal Session Length"
        )?.description,
        focusScoreTrend: insights.find(
          (i) => i.title === "Focus Improvement" || i.title === "Focus Decline"
        )?.description,
      },
    });
  } catch (error) {
    console.error("Error getting AI insights:", error);
    return NextResponse.json(
      { error: "Failed to get AI insights" },
      { status: 500 }
    );
  }
}
