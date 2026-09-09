"use client";

import { upload } from "@vercel/blob/client";
import { useState } from "react";
import { createScript } from "./actions";

export function ScriptForm({ surveyId }: { surveyId: number }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const file = formData.get("image");
    if (!(file instanceof File) || file.size === 0) {
      setError("Bild ist Pflicht");
      return;
    }
    setUploading(true);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/blob-upload",
      });
      formData.set("imageUrl", blob.url);
      await createScript(surveyId, formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-3 rounded border p-4">
      <input name="title" placeholder="Titel" required className="w-full rounded border px-3 py-2" />
      <textarea
        name="description"
        placeholder="Beschreibung (optional)"
        className="w-full rounded border px-3 py-2"
      />
      <input name="link" type="url" placeholder="Link" required className="w-full rounded border px-3 py-2" />
      <input name="image" type="file" accept="image/*" required className="w-full" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={uploading}
        className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
      >
        {uploading ? "Lädt hoch…" : "Skript hinzufügen"}
      </button>
    </form>
  );
}
