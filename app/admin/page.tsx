"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <form action={formAction} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold">Admin-Login</h1>
        <input
          type="password"
          name="password"
          placeholder="Passwort"
          required
          className="w-full rounded border px-3 py-2"
        />
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-black px-3 py-2 text-white disabled:opacity-50"
        >
          {pending ? "Prüfe…" : "Einloggen"}
        </button>
      </form>
    </main>
  );
}
