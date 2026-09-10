"use client";

import { useActionState, useState } from "react";
import { submitResponse } from "./actions";
import { CHOICES, type Script } from "@/lib/db";
import { ScriptMedia } from "@/components/script-media";

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
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="suggestions_json" value={JSON.stringify(suggestions)} />

      {scripts.map((script) => (
        <fieldset
          key={script.id}
          className={`space-y-4 rounded-2xl border bg-white p-5 shadow-sm transition-colors ${
            state?.errors?.[script.id] ? "border-red-400" : "border-gray-200"
          }`}
        >
          <ScriptMedia
            mediaType={script.media_type}
            imageUrl={script.image_url}
            youtubeUrl={script.youtube_url}
            alt=""
            className="w-full max-w-sm aspect-video rounded-xl"
          />
          <div>
            <legend className="text-lg font-semibold text-gray-900">{script.title}</legend>
            {script.description && (
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{script.description}</p>
            )}
            <a
              href={script.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm font-medium text-blue-600 underline underline-offset-2 hover:text-blue-800"
            >
              {script.link}
            </a>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            {CHOICES.map((c) => (
              <label
                key={c.value}
                className="flex-1 cursor-pointer rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition-colors has-[:checked]:border-black has-[:checked]:bg-black has-[:checked]:text-white"
              >
                <input
                  type="radio"
                  name={`choice_${script.id}`}
                  value={c.value}
                  required
                  className="sr-only"
                />
                {c.label}
              </label>
            ))}
          </div>
          {state?.errors?.[script.id] && (
            <p className="text-sm font-medium text-red-600">{state.errors[script.id]}</p>
          )}
        </fieldset>
      ))}

      <fieldset className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <legend className="text-lg font-semibold text-gray-900">Sonstiges</legend>
          <p className="mt-1 text-sm text-gray-600">Fehlt ein Skript? Schlag gerne eins vor.</p>
        </div>
        {suggestions.map((suggestion, index) => (
          <div key={index} className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <input
              placeholder="Name"
              value={suggestion.name}
              onChange={(e) => updateSuggestion(index, "name", e.target.value)}
              maxLength={200}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            />
            <input
              placeholder="Link"
              value={suggestion.link}
              onChange={(e) => updateSuggestion(index, "link", e.target.value)}
              maxLength={1000}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            />
            <input
              placeholder="Beschreibung (optional)"
              value={suggestion.description}
              onChange={(e) => updateSuggestion(index, "description", e.target.value)}
              maxLength={1000}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => removeSuggestion(index)}
              className="text-sm font-medium text-red-600 hover:text-red-800"
            >
              Entfernen
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addSuggestion}
          className="w-full rounded-lg border-2 border-dashed border-gray-300 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-800"
        >
          + eigenes Skript vorschlagen
        </button>
      </fieldset>

      {state?.generalError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.generalError}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-black px-4 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Sendet…" : "Absenden"}
      </button>
    </form>
  );
}
