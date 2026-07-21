import { seedState } from "./seed.mjs";

export const PEOPLE = new Set([
  "andrew", "brian", "chris", "james", "jamie", "joe", "john", "matt", "mike",
]);

const STATE_KEY = "rippedchella:state:v1";
const RATE_LIMIT = 5;
const RATE_WINDOW_SECONDS = 30 * 60;
const LOCKOUT_MESSAGE =
  "Nice try, meathead. Five bad PINs bought you a 30-minute timeout.";

export async function redis(command) {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw httpError(503, "Shared storage is not configured.");

  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.error) {
    throw httpError(503, "Shared storage is temporarily unavailable.");
  }
  return payload.result;
}

export async function getState() {
  let raw = await redis(["GET", STATE_KEY]);
  if (!raw) {
    await redis(["SETNX", STATE_KEY, JSON.stringify(seedState)]);
    raw = await redis(["GET", STATE_KEY]);
  }
  try {
    const state = JSON.parse(raw);
    if (!Array.isArray(state.activities) || !state.participation) throw new Error();
    return state;
  } catch {
    throw httpError(500, "Shared data is invalid.");
  }
}

export async function saveState(state) {
  await redis(["SET", STATE_KEY, JSON.stringify(state)]);
}

export function parseBody(request) {
  if (request.body && typeof request.body === "object") return request.body;
  if (typeof request.body !== "string") return null;
  try {
    return JSON.parse(request.body);
  } catch {
    return null;
  }
}

export async function authorize(request, personId, suppliedPin) {
  let pins;
  try {
    pins = JSON.parse(process.env.PARTICIPANT_PINS || "{}");
  } catch {
    throw httpError(500, "PIN protection is not configured.");
  }
  if (!PEOPLE.has(personId) || typeof pins[personId] !== "string") {
    throw httpError(400, "Unknown participant.");
  }
  const masterPin = process.env.MASTER_PIN || "";
  if (!/^\d{4}$/.test(pins[personId]) || !/^\d{6}$/.test(masterPin)) {
    throw httpError(500, "PIN protection is not configured.");
  }

  const ip = String(request.headers["x-forwarded-for"] || request.socket?.remoteAddress || "unknown")
    .split(",")[0]
    .trim();
  const rateKey = `rippedchella:pin-attempts:${ip}:${personId}`;
  const candidate = typeof suppliedPin === "string" ? suppliedPin.trim() : "";
  const masterMatch = timingSafeEqual(candidate, masterPin);
  if (masterMatch) {
    await redis(["DEL", rateKey]);
    return;
  }

  const attempts = Number((await redis(["GET", rateKey])) || 0);
  if (attempts >= RATE_LIMIT) {
    const error = httpError(429, LOCKOUT_MESSAGE);
    error.retryAfter = RATE_WINDOW_SECONDS;
    throw error;
  }

  if (timingSafeEqual(candidate, pins[personId])) {
    await redis(["DEL", rateKey]);
    return;
  }

  const nextAttempts = Number(await redis(["INCR", rateKey]));
  if (nextAttempts === 1) await redis(["EXPIRE", rateKey, RATE_WINDOW_SECONDS]);
  if (nextAttempts >= RATE_LIMIT) {
    const error = httpError(429, LOCKOUT_MESSAGE);
    error.retryAfter = RATE_WINDOW_SECONDS;
    throw error;
  }

  const belongsToAnother = Object.entries(pins).some(
    ([id, pin]) => id !== personId && timingSafeEqual(candidate, pin),
  );
  throw httpError(
    belongsToAnother ? 403 : 401,
    belongsToAnother ? "That PIN cannot change this participant." : "Incorrect PIN.",
  );
}

function timingSafeEqual(left, right) {
  const a = String(left);
  const b = String(right);
  const length = Math.max(a.length, b.length);
  let difference = a.length ^ b.length;
  for (let index = 0; index < length; index += 1) {
    difference |= (a.charCodeAt(index) || 0) ^ (b.charCodeAt(index) || 0);
  }
  return difference === 0;
}

export function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export function send(response, status, body, headers = {}) {
  response.status(status);
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  Object.entries(headers).forEach(([name, value]) => response.setHeader(name, value));
  response.json(body);
}

export function sendError(response, error) {
  const status = Number(error.status) || 500;
  const headers = error.retryAfter ? { "Retry-After": String(error.retryAfter) } : {};
  send(
    response,
    status,
    { error: status >= 500 ? "The shared tracker is temporarily unavailable." : error.message },
    headers,
  );
}
