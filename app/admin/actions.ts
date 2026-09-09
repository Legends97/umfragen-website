"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionToken } from "@/lib/auth";

export async function login(
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const password = formData.get("password");
  if (typeof password !== "string" || password.length === 0) {
    return { error: "Passwort erforderlich" };
  }
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return { error: "Falsches Passwort" };
  }
  const token = createSessionToken(process.env.ADMIN_PASSWORD);
  const cookieStore = await cookies();
  cookieStore.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/admin/surveys");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin");
}
