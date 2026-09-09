const crypto = require("node:crypto");

function createSessionToken(secret) {
  return crypto.createHmac("sha256", secret).update("admin-session").digest("hex");
}

function verifySessionToken(token, secret) {
  if (!token) return false;
  const expected = createSessionToken(secret);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

module.exports = { createSessionToken, verifySessionToken };
