import {
  PEOPLE,
  authorize,
  getState,
  httpError,
  parseBody,
  saveState,
  send,
  sendError,
} from "../server/lib.mjs";
import {
  DEFAULT_CHALLENGE_ID,
  challengeById,
  setChallengeParticipation,
} from "../challenges.mjs";

export default async function handler(request, response) {
  if (request.method !== "PUT") {
    response.setHeader("Allow", "PUT");
    return send(response, 405, { error: "Method not allowed." });
  }

  try {
    const body = parseBody(request);
    if (!body) throw httpError(400, "Send a valid JSON request.");

    const personId = typeof body.personId === "string" ? body.personId : "";
    if (!PEOPLE.has(personId)) throw httpError(400, "Unknown participant.");
    if (body.status !== "in" && body.status !== "out") {
      throw httpError(400, "Participation status must be in or out.");
    }
    await authorize(request, personId, body.pin);

    const challengeId = typeof body.challengeId === "string" && body.challengeId
      ? body.challengeId
      : DEFAULT_CHALLENGE_ID;
    if (!challengeById(challengeId)) throw httpError(400, "Unknown challenge.");

    const state = await getState();
    setChallengeParticipation(state, personId, challengeId, body.status);
    await saveState(state);
    return send(response, 200, {
      personId,
      status: body.status,
      challengeId,
      participation: state.participation,
      challengeParticipation: state.challengeParticipation || {},
    });
  } catch (error) {
    return sendError(response, error);
  }
}
