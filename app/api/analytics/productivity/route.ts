import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import { getProductivityByHour } from "@/lib/server/services/analytics-service";
import { headers } from "next/headers";

// GET /api/analytics/productivity - Get productivity by hour for the current user
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
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // Convert parameters to appropriate types
    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;

    // Get productivity by hour
    const productivity = await getProductivityByHour(
      userId,
      startDate,
      endDate
    );

    return NextResponse.json(productivity);
  } catch (error) {
    console.error("Error getting productivity by hour:", error);
    return NextResponse.json(
      { error: "Failed to get productivity by hour" },
      { status: 500 }
    );
  }
}
