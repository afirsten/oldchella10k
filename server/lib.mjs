import { seedState } from "./seed.mjs";

export const PEOPLE = new Set([
  "andrew", "brian", "chris", "eliot", "eric", "erok", "evan", "james", "jamie", "joe", "john", "kelly", "matt", "mike",
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

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stripHonoraryFields(record) {
  if (!isPlainObject(record)) return false;
  let changed = false;
  if (Object.prototype.hasOwnProperty.call(record, "honorary")) {
    delete record.honorary;
    changed = true;
  }
  if (record.memberType === "honorary") {
    delete record.memberType;
    changed = true;
  }
  if (record.rank === "honorary") {
    delete record.rank;
    changed = true;
  }
  return changed;
}

function normalizeParticipationMap(map) {
  if (!isPlainObject(map)) return false;
  let changed = false;
  for (const [id, status] of Object.entries(map)) {
    if (status === "honorary") {
      map[id] = "in";
      changed = true;
    }
  }
  return changed;
}

function rememberHonoraryId(ids, entry) {
  if (typeof entry === "string" && entry) ids.add(entry);
  else if (isPlainObject(entry) && typeof entry.id === "string" && entry.id) ids.add(entry.id);
}

/**
 * Every stored person is a normal member. Honorary flags, ranks, and
 * participation values are cleared in place. People and their logs stay.
 * Returns true when the document changed and should be written back.
 */
export function normalizeSharedState(state) {
  if (!isPlainObject(state)) return false;
  let changed = false;
  const honoraryIds = new Set();

  if (Array.isArray(state.activities)) {
    for (const activity of state.activities) {
      if (stripHonoraryFields(activity)) changed = true;
    }
  }

  if (normalizeParticipationMap(state.participation)) changed = true;

  if (isPlainObject(state.challengeParticipation)) {
    for (const map of Object.values(state.challengeParticipation)) {
      if (normalizeParticipationMap(map)) changed = true;
    }
  }

  for (const key of ["members", "people", "crew", "roster"]) {
    if (!Array.isArray(state[key])) continue;
    for (const person of state[key]) {
      if (stripHonoraryFields(person)) changed = true;
    }
  }

  if (Array.isArray(state.honoraryMembers)) {
    for (const entry of state.honoraryMembers) {
      rememberHonoraryId(honoraryIds, entry);
      if (!isPlainObject(entry) || typeof entry.id !== "string") continue;
      for (const key of ["members", "people", "crew", "roster"]) {
        if (!Array.isArray(state[key])) continue;
        if (state[key].some((person) => person && person.id === entry.id)) continue;
        const next = { ...entry };
        stripHonoraryFields(next);
        state[key].push(next);
      }
    }
    delete state.honoraryMembers;
    changed = true;
  }

  if (Array.isArray(state.honorary)) {
    state.honorary.forEach((entry) => rememberHonoraryId(honoraryIds, entry));
    delete state.honorary;
    changed = true;
  } else if (isPlainObject(state.honorary)) {
    Object.keys(state.honorary).forEach((id) => {
      if (id) honoraryIds.add(id);
    });
    delete state.honorary;
    changed = true;
  }

  if (honoraryIds.size) {
    if (!isPlainObject(state.participation)) state.participation = {};
    for (const id of honoraryIds) {
      const current = state.participation[id];
      if (current !== "in" && current !== "out") {
        state.participation[id] = "in";
      }
    }
    changed = true;
  }

  return changed;
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
    if (normalizeSharedState(state)) await saveState(state);
    return state;
  } catch (error) {
    if (error.status) throw error;
    throw httpError(500, "Shared data is invalid.");
  }
}

export async function saveState(state) {
  normalizeSharedState(state);
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

function parsePinMap(raw, label) {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("not an object");
    }
    return parsed;
  } catch {
    throw httpError(500, `${label} is not configured.`);
  }
}

export async function authorize(request, personId, suppliedPin) {
  // PARTICIPANT_PINS_EXTRA lets us add people without reading the sensitive base map.
  const pins = {
    ...parsePinMap(process.env.PARTICIPANT_PINS, "PIN protection"),
    ...parsePinMap(process.env.PARTICIPANT_PINS_EXTRA, "PIN protection"),
  };
  if (!PEOPLE.has(personId)) {
    throw httpError(400, "Unknown participant.");
  }

  const masterPin = process.env.MASTER_PIN || "";
  if (!/^\d{6}$/.test(masterPin)) {
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

  const personPin = typeof pins[personId] === "string" ? pins[personId] : "";
  if (!/^\d{4}$/.test(personPin)) {
    throw httpError(
      400,
      "PIN not configured for this participant. Add them to PARTICIPANT_PINS or PARTICIPANT_PINS_EXTRA in Vercel, then redeploy. (Master PIN still works.)",
    );
  }

  const attempts = Number((await redis(["GET", rateKey])) || 0);
  if (attempts >= RATE_LIMIT) {
    const error = httpError(429, LOCKOUT_MESSAGE);
    error.retryAfter = RATE_WINDOW_SECONDS;
    throw error;
  }

  if (timingSafeEqual(candidate, personPin)) {
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
