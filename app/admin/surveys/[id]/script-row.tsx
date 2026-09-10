"use client";

import { useState } from "react";
import type { Script } from "@/lib/db";
import { ScriptForm } from "./script-form";
import { ScriptMedia } from "@/components/script-media";
import { deleteScript, moveScriptUp, moveScriptDown } from "./actions";

export function ScriptRow({ surveyId, script }: { surveyId: number; script: Script }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="rounded border p-3">
        <ScriptForm surveyId={surveyId} script={script} onDone={() => setEditing(false)} />
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="mt-2 text-sm underline"
        >
          Abbrechen
        </button>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 rounded border p-3">
      <ScriptMedia
        mediaType={script.media_type}
        imageUrl={script.image_url}
        youtubeUrl={script.youtube_url}
        alt=""
        className="w-40 aspect-video rounded"
      />
      <div className="flex-1">
        <p className="font-medium">{script.title}</p>
        <a
          href={script.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 underline"
        >
          {script.link}
        </a>
      </div>
      <button type="button" onClick={() => setEditing(true)} className="text-sm underline">
        Bearbeiten
      </button>
      <form action={moveScriptUp.bind(null, surveyId, script.id)}>
        <button type="submit" aria-label="Nach oben">
          ↑
        </button>
      </form>
      <form action={moveScriptDown.bind(null, surveyId, script.id)}>
        <button type="submit" aria-label="Nach unten">
          ↓
        </button>
      </form>
      <form action={deleteScript.bind(null, surveyId, script.id)}>
        <button type="submit" className="text-red-600">
          Löschen
        </button>
      </form>
    </li>
  );
}
