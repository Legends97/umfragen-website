const test = require("node:test");
const assert = require("node:assert/strict");
const { createSessionToken, verifySessionToken } = require("./auth");

test("verifySessionToken accepts a token created with the same secret", () => {
  const token = createSessionToken("s3cret");
  assert.equal(verifySessionToken(token, "s3cret"), true);
});

test("verifySessionToken rejects a token created with a different secret", () => {
  const token = createSessionToken("s3cret");
  assert.equal(verifySessionToken(token, "wrong"), false);
});

test("verifySessionToken rejects empty/undefined token", () => {
  assert.equal(verifySessionToken("", "s3cret"), false);
  assert.equal(verifySessionToken(undefined, "s3cret"), false);
});

test("verifySessionToken rejects a tampered token", () => {
  const token = createSessionToken("s3cret");
  const tampered = token.slice(0, -1) + (token.at(-1) === "0" ? "1" : "0");
  assert.equal(verifySessionToken(tampered, "s3cret"), false);
});
