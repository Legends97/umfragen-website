"use client";

import { upload } from "@vercel/blob/client";
import { useState } from "react";
import { createScript, updateScript } from "./actions";
import type { MediaType, Script } from "@/lib/db";

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
  const [mode, setMode] = useState<MediaType>(script?.media_type ?? "image");
  const isEdit = script !== undefined;

  async function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("mediaType", mode);

    if (mode === "image") {
      const file = formData.get("image");
      const hasFile = file instanceof File && file.size > 0;
      if (!isEdit && !hasFile) {
        setError("Bild ist Pflicht");
        return;
      }
      if (hasFile) {
        setUploading(true);
        try {
          const blob = await upload((file as File).name, file as File, {
            access: "public",
            handleUploadUrl: "/api/blob-upload",
          });
          formData.set("imageUrl", blob.url);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Upload fehlgeschlagen");
          setUploading(false);
          return;
        }
        setUploading(false);
      }
    }

    setUploading(true);
    try {
      if (isEdit) {
        await updateScript(surveyId, script.id, formData);
      } else {
        await createScript(surveyId, formData);
      }
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
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

      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-1">
          <input type="radio" checked={mode === "image"} onChange={() => setMode("image")} />
          Bild
        </label>
        <label className="flex items-center gap-1">
          <input type="radio" checked={mode === "youtube"} onChange={() => setMode("youtube")} />
          YouTube-Video
        </label>
      </div>

      {mode === "image" ? (
        <>
          <input name="image" type="file" accept="image/*" required={!isEdit} className="w-full" />
          {isEdit && (
            <p className="text-xs text-gray-500">Bild nur hochladen, wenn du es ersetzen willst.</p>
          )}
        </>
      ) : (
        <input
          name="youtubeUrl"
          type="url"
          placeholder="YouTube-Link (z.B. https://youtu.be/...)"
          defaultValue={script?.youtube_url ?? undefined}
          required
          className="w-full rounded border px-3 py-2"
        />
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
