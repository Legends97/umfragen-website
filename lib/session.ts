import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";

export async function requireAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret || !verifySessionToken(token, secret)) {
    throw new Error("unauthorized");
  }
}
