import { auth } from "@/lib/auth/better-auth";
import { toNextJsHandler } from "better-auth/next-js";

// Export the handler for GET and POST requests
export const { GET, POST } = toNextJsHandler(auth.handler);
