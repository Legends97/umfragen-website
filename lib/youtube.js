function parseYoutubeEmbedUrl(input) {
  let url;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\.|^m\./, "");
  let videoId = null;

  if (host === "youtu.be") {
    videoId = url.pathname.slice(1).split("/")[0];
  } else if (host === "youtube.com") {
    if (url.pathname === "/watch") {
      videoId = url.searchParams.get("v");
    } else if (url.pathname.startsWith("/embed/")) {
      videoId = url.pathname.slice("/embed/".length).split("/")[0];
    } else if (url.pathname.startsWith("/shorts/")) {
      videoId = url.pathname.slice("/shorts/".length).split("/")[0];
    }
  }

  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return null;
  }

  return `https://www.youtube.com/embed/${videoId}`;
}

module.exports = { parseYoutubeEmbedUrl };
