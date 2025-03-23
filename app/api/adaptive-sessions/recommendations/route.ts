import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { AdaptiveSessionsService } from "@/lib/server/services/adaptive-sessions-service";

export async function GET() {
  try {
    // Get the current user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get session recommendations
    const recommendations =
      await AdaptiveSessionsService.getSessionRecommendations(user.id);

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Error getting session recommendations:", error);
    return NextResponse.json(
      { error: "Failed to get session recommendations" },
      { status: 500 }
    );
  }
}
