"use client";

import { useActionState, useState } from "react";
import { submitResponse } from "./actions";
import { CHOICES, type Script } from "@/lib/db";

type Suggestion = { name: string; link: string; description: string };

export function SurveyForm({ slug, scripts }: { slug: string; scripts: Script[] }) {
  const [state, formAction, pending] = useActionState(
    submitResponse.bind(null, slug),
    undefined,
  );
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  function addSuggestion() {
    setSuggestions((prev) => [...prev, { name: "", link: "", description: "" }]);
  }

  function updateSuggestion(index: number, field: keyof Suggestion, value: string) {
    setSuggestions((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  function removeSuggestion(index: number) {
    setSuggestions((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="suggestions_json" value={JSON.stringify(suggestions)} />

      {scripts.map((script) => (
        <fieldset key={script.id} className="space-y-2 rounded border p-4">
          {/* ponytail: <img> statt next/image, siehe docs/superpowers/plans Phase 2 Global Constraints */}
          <img src={script.image_url} alt="" className="h-24 w-24 rounded object-cover" />
          <legend className="font-medium">{script.title}</legend>
          {script.description && <p className="text-sm text-gray-600">{script.description}</p>}
          <a href={script.link} target="_blank" className="text-sm text-blue-600 underline">
            {script.link}
          </a>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            {CHOICES.map((c) => (
              <label key={c.value} className="flex items-center gap-1">
                <input type="radio" name={`choice_${script.id}`} value={c.value} required />
                {c.label}
              </label>
            ))}
          </div>
          {state?.errors?.[script.id] && (
            <p className="text-sm text-red-600">{state.errors[script.id]}</p>
          )}
        </fieldset>
      ))}

      <fieldset className="space-y-3 rounded border p-4">
        <legend className="font-medium">Sonstiges</legend>
        {suggestions.map((suggestion, index) => (
          <div key={index} className="space-y-2 rounded border p-3">
            <input
              placeholder="Name"
              value={suggestion.name}
              onChange={(e) => updateSuggestion(index, "name", e.target.value)}
              maxLength={200}
              className="w-full rounded border px-3 py-2"
            />
            <input
              placeholder="Link"
              value={suggestion.link}
              onChange={(e) => updateSuggestion(index, "link", e.target.value)}
              maxLength={1000}
              className="w-full rounded border px-3 py-2"
            />
            <input
              placeholder="Beschreibung (optional)"
              value={suggestion.description}
              onChange={(e) => updateSuggestion(index, "description", e.target.value)}
              maxLength={1000}
              className="w-full rounded border px-3 py-2"
            />
            <button
              type="button"
              onClick={() => removeSuggestion(index)}
              className="text-sm text-red-600"
            >
              Entfernen
            </button>
          </div>
        ))}
        <button type="button" onClick={addSuggestion} className="text-sm underline">
          + eigenes Skript vorschlagen
        </button>
      </fieldset>

      {state?.generalError && <p className="text-sm text-red-600">{state.generalError}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {pending ? "Sendet…" : "Absenden"}
      </button>
    </form>
  );
}
