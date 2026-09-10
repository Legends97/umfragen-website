"use client";

import { upload } from "@vercel/blob/client";
import { useState } from "react";
import { createScript, updateScript } from "./actions";
import type { Script } from "@/lib/db";

export function ScriptForm({
  surveyId,
  script,
  onDone,
}: {
  surveyId: number;
  script?: Script;
  onDone?: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = script !== undefined;

  async function handleSubmit(formData: FormData) {
    setError(null);
    const file = formData.get("image");
    const hasFile = file instanceof File && file.size > 0;
    if (!isEdit && !hasFile) {
      setError("Bild ist Pflicht");
      return;
    }
    setUploading(true);
    try {
      if (hasFile) {
        const blob = await upload((file as File).name, file as File, {
          access: "public",
          handleUploadUrl: "/api/blob-upload",
        });
        formData.set("imageUrl", blob.url);
      } else {
        formData.delete("imageUrl");
      }
      if (isEdit) {
        await updateScript(surveyId, script.id, formData);
      } else {
        await createScript(surveyId, formData);
      }
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-3 rounded border p-4">
      <input
        name="title"
        placeholder="Titel"
        defaultValue={script?.title}
        required
        className="w-full rounded border px-3 py-2"
      />
      <textarea
        name="description"
        placeholder="Beschreibung (optional)"
        defaultValue={script?.description ?? ""}
        className="w-full rounded border px-3 py-2"
      />
      <input
        name="link"
        type="url"
        placeholder="Link"
        defaultValue={script?.link}
        required
        className="w-full rounded border px-3 py-2"
      />
      <input name="image" type="file" accept="image/*" required={!isEdit} className="w-full" />
      {isEdit && (
        <p className="text-xs text-gray-500">Bild nur hochladen, wenn du es ersetzen willst.</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={uploading}
        className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
      >
        {uploading ? "Lädt hoch…" : isEdit ? "Speichern" : "Skript hinzufügen"}
      </button>
    </form>
  );
}
