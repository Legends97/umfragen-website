"use client";

import { useState } from "react";
import { resetResponses } from "./actions";

export function ResetResponsesButton({ surveyId }: { surveyId: number }) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (
      !window.confirm(
        "Alle Antworten und Vorschläge dieser Umfrage unwiderruflich löschen? Die Skripte selbst bleiben erhalten.",
      )
    ) {
      return;
    }
    setPending(true);
    try {
      await resetResponses(surveyId);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="text-sm text-red-600 underline disabled:opacity-50"
    >
      {pending ? "Löscht…" : "Stimmen zurücksetzen"}
    </button>
  );
}
