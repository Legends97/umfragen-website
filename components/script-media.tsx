import type { MediaType } from "@/lib/db";

export function ScriptMedia({
  mediaType,
  imageUrl,
  youtubeUrl,
  alt,
  className,
}: {
  mediaType: MediaType;
  imageUrl: string | null;
  youtubeUrl: string | null;
  alt: string;
  className?: string;
}) {
  if (mediaType === "youtube" && youtubeUrl) {
    return (
      <iframe
        src={youtubeUrl}
        title={alt}
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className={`${className ?? ""} border-0`}
      />
    );
  }

  // ponytail: <img> statt next/image, siehe docs/superpowers/plans Phase 2 Global Constraints
  return <img src={imageUrl ?? ""} alt={alt} className={`${className ?? ""} object-cover`} />;
}
