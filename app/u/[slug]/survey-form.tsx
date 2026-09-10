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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {scripts.map((script) => (
          <fieldset
            key={script.id}
            className={`space-y-4 rounded-2xl border bg-gray-900 p-5 shadow-lg transition-colors ${
              state?.errors?.[script.id] ? "border-red-500" : "border-gray-800"
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
              <legend className="text-lg font-semibold text-gray-100">{script.title}</legend>
              {script.description && (
                <p className="mt-1 text-sm leading-relaxed text-gray-400">{script.description}</p>
              )}
              <a
                href={script.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block break-all text-sm font-medium text-indigo-400 underline underline-offset-2 hover:text-indigo-300"
              >
                {script.link}
              </a>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              {CHOICES.map((c) => (
                <label
                  key={c.value}
                  className="flex-1 cursor-pointer rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-center text-sm font-medium text-gray-300 transition-colors hover:border-gray-600 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-500 has-[:checked]:text-white"
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
              <p className="text-sm font-medium text-red-400">{state.errors[script.id]}</p>
            )}
          </fieldset>
        ))}
      </div>

      <fieldset className="space-y-4 rounded-2xl border border-gray-800 bg-gray-900 p-5 shadow-lg">
        <div>
          <legend className="text-lg font-semibold text-gray-100">Sonstiges</legend>
          <p className="mt-1 text-sm text-gray-400">Fehlt ein Skript? Schlag gerne eins vor.</p>
        </div>
        {suggestions.map((suggestion, index) => (
          <div key={index} className="space-y-2 rounded-xl border border-gray-800 bg-gray-950 p-4">
            <input
              placeholder="Name"
              value={suggestion.name}
              onChange={(e) => updateSuggestion(index, "name", e.target.value)}
              maxLength={200}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
            <input
              placeholder="Link"
              value={suggestion.link}
              onChange={(e) => updateSuggestion(index, "link", e.target.value)}
              maxLength={1000}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
            <input
              placeholder="Beschreibung (optional)"
              value={suggestion.description}
              onChange={(e) => updateSuggestion(index, "description", e.target.value)}
              maxLength={1000}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => removeSuggestion(index)}
              className="text-sm font-medium text-red-400 hover:text-red-300"
            >
              Entfernen
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addSuggestion}
          className="w-full rounded-lg border-2 border-dashed border-gray-700 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:border-indigo-500 hover:text-indigo-400"
        >
          + eigenes Skript vorschlagen
        </button>
      </fieldset>

      {state?.generalError && (
        <p className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm font-medium text-red-400">
          {state.generalError}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-600/30 transition-colors hover:bg-indigo-500 disabled:opacity-50"
      >
        {pending ? "Sendet…" : "Absenden"}
      </button>
    </form>
  );
}
