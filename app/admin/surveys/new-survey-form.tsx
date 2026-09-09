"use client";

import { useActionState } from "react";

export function NewSurveyForm({
  createSurveyAction,
}: {
  createSurveyAction: (
    prevState: { error?: string } | undefined,
    formData: FormData,
  ) => Promise<{ error?: string }>;
}) {
  const [state, formAction, pending] = useActionState(createSurveyAction, undefined);

  return (
    <form action={formAction} className="max-w-md space-y-3 rounded border p-4">
      <h2 className="font-medium">Neue Umfrage</h2>
      <input
        name="title"
        placeholder="Titel"
        required
        className="w-full rounded border px-3 py-2"
      />
      <input
        name="slug"
        placeholder="Slug (optional, wird aus Titel generiert)"
        className="w-full rounded border px-3 py-2"
      />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
      >
        {pending ? "Speichert…" : "Anlegen"}
      </button>
    </form>
  );
}
