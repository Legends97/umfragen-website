const test = require("node:test");
const assert = require("node:assert/strict");
const { slugify } = require("./slug");

test("slugify lowercases and replaces spaces with hyphens", () => {
  assert.equal(slugify("Skript Umfrage 2026"), "skript-umfrage-2026");
});

test("slugify strips accents", () => {
  assert.equal(slugify("Prioritäten Übersicht"), "prioritaten-ubersicht");
});

test("slugify trims leading/trailing hyphens and collapses repeats", () => {
  assert.equal(slugify("  --Hallo!!  Welt--  "), "hallo-welt");
});

test("slugify truncates to 80 chars", () => {
  const long = "a".repeat(200);
  assert.equal(slugify(long).length, 80);
});
