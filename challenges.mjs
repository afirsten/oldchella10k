/** Challenge registry. Stored ids must match `id`. Add a future challenge here. */
export const DEFAULT_CHALLENGE_ID = "first-100";

export const CHALLENGES = [
  {
    id: "first-100",
    name: "Ripped-Chella",
    start: "2026-07-14",
    days: 100,
    goal: 10000,
    theme: "ripped",
  },
  {
    id: "wrap-2026",
    name: "2027 LFG",
    start: "2026-10-23",
    days: 70,
    goal: 7000,
    theme: "lfg",
  },
];

export function challengeById(id) {
  return CHALLENGES.find((challenge) => challenge.id === id) || null;
}

export function shiftDateKey(dateKey, days) {
  const [year, month, day] = String(dateKey).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function challengeEndKey(challenge) {
  return shiftDateKey(challenge.start, challenge.days - 1);
}

/** Calendar date → challenge id. Empty when the day is outside every challenge. */
export function challengeIdForDate(dateKey) {
  const match = CHALLENGES.find((challenge) => {
    return dateKey >= challenge.start && dateKey <= challengeEndKey(challenge);
  });
  return match ? match.id : "";
}

/**
 * Participation:
 * - `state.participation[personId]` is the original Ripped-Chella in/out string.
 * - `state.challengeParticipation[challengeId][personId]` is every later challenge.
 * Old rows stay strings so existing users are unchanged.
 */
export function readChallengeParticipation(state, personId, challengeId) {
  if (challengeId === DEFAULT_CHALLENGE_ID) {
    const legacy = state?.participation?.[personId];
    return legacy === "in" || legacy === "out" ? legacy : "";
  }
  const scoped = state?.challengeParticipation?.[challengeId]?.[personId];
  return scoped === "in" || scoped === "out" ? scoped : "";
}

export function setChallengeParticipation(state, personId, challengeId, status) {
  if (!challengeById(challengeId)) return;
  if (status !== "in" && status !== "out") return;
  if (challengeId === DEFAULT_CHALLENGE_ID) {
    state.participation[personId] = status;
    return;
  }
  if (!state.challengeParticipation || typeof state.challengeParticipation !== "object") {
    state.challengeParticipation = {};
  }
  const bucket = state.challengeParticipation[challengeId];
  state.challengeParticipation[challengeId] =
    bucket && typeof bucket === "object" && !Array.isArray(bucket) ? bucket : {};
  state.challengeParticipation[challengeId][personId] = status;
}

const challengeApi = {
  CHALLENGES,
  DEFAULT_CHALLENGE_ID,
  challengeById,
  challengeEndKey,
  challengeIdForDate,
  readChallengeParticipation,
  setChallengeParticipation,
};

if (typeof globalThis.window !== "undefined") {
  globalThis.window.RIPPED_CHALLENGE_DATA = challengeApi;
}
