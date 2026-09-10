const test = require("node:test");
const assert = require("node:assert/strict");
const { parseYoutubeEmbedUrl } = require("./youtube");

test("parses watch?v= URLs", () => {
  assert.equal(
    parseYoutubeEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
  );
});

test("parses watch?v= URLs with extra query params", () => {
  assert.equal(
    parseYoutubeEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL123&t=42s"),
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
  );
});

test("parses youtu.be short URLs", () => {
  assert.equal(
    parseYoutubeEmbedUrl("https://youtu.be/dQw4w9WgXcQ"),
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
  );
});

test("parses youtu.be URLs with trailing query params", () => {
  assert.equal(
    parseYoutubeEmbedUrl("https://youtu.be/dQw4w9WgXcQ?t=10"),
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
  );
});

test("passes through already-embed URLs", () => {
  assert.equal(
    parseYoutubeEmbedUrl("https://www.youtube.com/embed/dQw4w9WgXcQ"),
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
  );
});

test("parses shorts URLs", () => {
  assert.equal(
    parseYoutubeEmbedUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ"),
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
  );
});

test("handles m.youtube.com host", () => {
  assert.equal(
    parseYoutubeEmbedUrl("https://m.youtube.com/watch?v=dQw4w9WgXcQ"),
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
  );
});

test("rejects non-YouTube URLs", () => {
  assert.equal(parseYoutubeEmbedUrl("https://vimeo.com/12345"), null);
});

test("rejects malformed URLs", () => {
  assert.equal(parseYoutubeEmbedUrl("not a url"), null);
});

test("rejects YouTube URLs without a valid video id", () => {
  assert.equal(parseYoutubeEmbedUrl("https://www.youtube.com/watch?v=short"), null);
  assert.equal(parseYoutubeEmbedUrl("https://www.youtube.com/"), null);
});
