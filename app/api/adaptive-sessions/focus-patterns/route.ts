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

    // Get user focus patterns
    const focusPatterns = await AdaptiveSessionsService.getUserFocusPattern(
      user.id
    );

    return NextResponse.json(focusPatterns);
  } catch (error) {
    console.error("Error getting user focus patterns:", error);
    return NextResponse.json(
      { error: "Failed to get user focus patterns" },
      { status: 500 }
    );
  }
}
