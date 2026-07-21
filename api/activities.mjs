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

const EXERCISES = new Set(["pushups", "squats", "planks", "other"]);

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return send(response, 405, { error: "Method not allowed." });
  }

  try {
    const body = parseBody(request);
    if (!body) throw httpError(400, "Send a valid JSON request.");

    const personId = typeof body.personId === "string" ? body.personId : "";
    if (!PEOPLE.has(personId)) throw httpError(400, "Unknown participant.");
    await authorize(request, personId, body.pin);

    const exercise = typeof body.exercise === "string" ? body.exercise : "";
    const reps = Number(body.reps);
    const otherActivity =
      typeof body.otherActivity === "string" ? body.otherActivity.trim() : "";
    if (!EXERCISES.has(exercise)) throw httpError(400, "Choose a valid activity type.");
    if (!Number.isInteger(reps) || reps < 1 || reps > 1000) {
      throw httpError(400, "Activity amount must be from 1 to 1,000.");
    }
    if (exercise === "other" && (!otherActivity || otherActivity.length > 50)) {
      throw httpError(400, "Describe the other activity in 50 characters or fewer.");
    }

    const activity = {
      id: crypto.randomUUID(),
      personId,
      exercise,
      otherActivity: exercise === "other" ? otherActivity : "",
      reps,
      percent: exercise === "other" ? reps : null,
      note: "",
      createdAt: new Date().toISOString(),
    };
    const state = await getState();
    state.activities.push(activity);
    state.participation[personId] = "in";
    await saveState(state);

    return send(response, 201, { activity, status: "in" });
  } catch (error) {
    return sendError(response, error);
  }
}
