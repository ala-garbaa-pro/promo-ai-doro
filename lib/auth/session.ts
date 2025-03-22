import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/server/db";
import { users } from "@/lib/server/db/schema";
import { eq } from "drizzle-orm";

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Session payload type
export type SessionPayload = {
  userId: string;
  email: string;
  name?: string;
};

/**
 * Create a new session for a user
 */
export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Token expires in 7 days
    .sign(new TextEncoder().encode(JWT_SECRET));

  const cookieStore = cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
    sameSite: "lax",
  });

  return token;
}

/**
 * Get the current session
 */
export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET),
      {
        algorithms: ["HS256"],
      }
    );

    return payload as SessionPayload;
  } catch (error) {
    console.error("Failed to verify session:", error);
    return null;
  }
}

/**
 * Delete the current session (logout)
 */
export async function deleteSession() {
  const cookieStore = cookies();
  cookieStore.delete("session");
}

/**
 * Verify the current session and redirect to login if not authenticated
 * This function is cached to avoid unnecessary verification during a render pass
 */
export const verifySession = cache(async () => {
  const session = await getSession();

  if (!session?.userId) {
    redirect("/auth/login");
  }

  return session;
});

/**
 * Get the current user from the session
 * This function is cached to avoid unnecessary database queries during a render pass
 */
export const getCurrentUser = cache(async () => {
  const session = await verifySession();

  try {
    const userResults = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatar: users.avatar,
        preferences: users.preferences,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    const user = userResults[0];

    if (!user) {
      // Session exists but user doesn't - this shouldn't happen
      // Delete the invalid session and redirect to login
      await deleteSession();
      redirect("/auth/login");
    }

    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
});
