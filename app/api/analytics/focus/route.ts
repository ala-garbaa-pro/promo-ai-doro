import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getFocusMetrics,
  updateFocusAnalytics,
} from "@/lib/server/services/focus-analysis-service";

export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get focus metrics
    const metrics = await getFocusMetrics(user.id);

    if (!metrics) {
      return NextResponse.json(
        { error: "Failed to retrieve focus metrics" },
        { status: 500 }
      );
    }

    // Update analytics in the background
    updateFocusAnalytics(user.id).catch((error) => {
      console.error("Error updating focus analytics:", error);
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error in focus analytics API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
