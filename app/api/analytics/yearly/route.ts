import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import { getMonthlyAnalytics } from "@/lib/server/services/analytics-service";
import { headers } from "next/headers";

// GET /api/analytics/yearly - Get yearly analytics for the current user
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
    const yearParam = searchParams.get("year");
    const dateParam = searchParams.get("date");

    // Convert parameters to appropriate types
    let year: number;

    if (dateParam) {
      // If date is provided, extract year from it
      year = new Date(dateParam).getFullYear();
    } else {
      // Otherwise use year param or current year
      year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
    }

    // Get analytics for each month of the year
    const monthlyData = [];
    let totalWorkSessions = 0;
    let completedWorkSessions = 0;
    let totalWorkMinutes = 0;
    let totalBreakMinutes = 0;
    let totalCompletedTasks = 0;
    let focusScoreSum = 0;
    let monthsWithFocusScore = 0;

    for (let month = 1; month <= 12; month++) {
      try {
        const monthData = await getMonthlyAnalytics(userId, month, year);
        monthlyData.push(monthData);

        // Aggregate data
        totalWorkSessions += monthData.totalWorkSessions;
        completedWorkSessions += monthData.completedWorkSessions;
        totalWorkMinutes += monthData.totalWorkMinutes;
        totalBreakMinutes += monthData.totalBreakMinutes;
        totalCompletedTasks += monthData.completedTasks;

        if (monthData.averageFocusScore > 0) {
          focusScoreSum += monthData.averageFocusScore;
          monthsWithFocusScore++;
        }
      } catch (error) {
        console.error(`Error getting data for month ${month}:`, error);
        // Continue with other months even if one fails
      }
    }

    // Calculate average focus score
    const avgFocusScore =
      monthsWithFocusScore > 0
        ? Math.round(focusScoreSum / monthsWithFocusScore)
        : 0;

    // Return yearly summary and monthly breakdown
    return NextResponse.json({
      year,
      totalWorkSessions,
      completedWorkSessions,
      totalWorkMinutes,
      totalBreakMinutes,
      completedTasks: totalCompletedTasks,
      avgFocusScore,
      monthlyData,
    });
  } catch (error) {
    console.error("Error getting yearly analytics:", error);
    return NextResponse.json(
      { error: "Failed to get yearly analytics" },
      { status: 500 }
    );
  }
}
