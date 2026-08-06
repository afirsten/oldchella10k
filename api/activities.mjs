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

const EXERCISES = new Set(["pushups", "squats", "planks", "other", "weight"]);
const OTHER_TYPES = new Set(["workouts", "reps", "time"]);
const REPS_MAX = 200;
const REPS_OVER_LIMIT_MESSAGE =
  "Erok hit limit for internet machine. More that 200 times pushing the floor away is not possible for art nerds.";
const WEIGHT_MIN_LB = 99;
const WEIGHT_MAX_LB = 333;

function parseActivityFields(body) {
  const exercise = typeof body.exercise === "string" ? body.exercise : "";
  const reps = Number(body.reps);
  const otherActivity =
    typeof body.otherActivity === "string" ? body.otherActivity.trim() : "";
  const activityDate = typeof body.activityDate === "string" ? body.activityDate : "";
  const parsedActivityDate = new Date(`${activityDate}T12:00:00.000Z`);
  const rawOtherType = typeof body.otherType === "string" ? body.otherType.trim() : "";

  if (!EXERCISES.has(exercise)) throw httpError(400, "Choose a valid activity type.");
  if (exercise === "weight") {
    if (!Number.isInteger(reps) || reps < WEIGHT_MIN_LB || reps > WEIGHT_MAX_LB) {
      throw httpError(400, `Weight must be from ${WEIGHT_MIN_LB} to ${WEIGHT_MAX_LB} lb.`);
    }
  } else if (!Number.isInteger(reps) || reps < 1 || reps > REPS_MAX) {
    if (Number.isInteger(reps) && reps > REPS_MAX) {
      throw httpError(400, REPS_OVER_LIMIT_MESSAGE);
    }
    throw httpError(400, `Activity amount must be from 1 to ${REPS_MAX}.`);
  }
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(activityDate) ||
    Number.isNaN(parsedActivityDate.getTime()) ||
    parsedActivityDate.toISOString().slice(0, 10) !== activityDate
  ) {
    throw httpError(400, "Choose a valid workout date.");
  }
  if (activityDate > new Date().toISOString().slice(0, 10)) {
    throw httpError(400, "Workout dates cannot be in the future.");
  }
  if (exercise === "other" && (!otherActivity || otherActivity.length > 50)) {
    throw httpError(400, "Describe the other activity in 50 characters or fewer.");
  }
  if (exercise === "other" && rawOtherType && !OTHER_TYPES.has(rawOtherType)) {
    throw httpError(400, "Choose a valid other activity type.");
  }

  const injuryInput = exercise === "other" && Boolean(body.injuryInput);
  const otherType = exercise === "other" ? (OTHER_TYPES.has(rawOtherType) ? rawOtherType : "workouts") : "";

  return {
    exercise,
    reps,
    otherActivity: exercise === "other" ? otherActivity : "",
    otherType,
    injuryInput,
    percent: exercise === "other" && otherType === "workouts" ? reps : null,
    createdAt: parsedActivityDate.toISOString(),
  };
}

export default async function handler(request, response) {
  if (!["POST", "PUT", "DELETE"].includes(request.method)) {
    response.setHeader("Allow", "POST, PUT, DELETE");
    return send(response, 405, { error: "Method not allowed." });
  }

  try {
    const body = parseBody(request);
    if (!body) throw httpError(400, "Send a valid JSON request.");

    const personId = typeof body.personId === "string" ? body.personId : "";
    if (!PEOPLE.has(personId)) throw httpError(400, "Unknown participant.");
    await authorize(request, personId, body.pin);

    if (request.method === "DELETE") {
      const activityId = typeof body.activityId === "string" ? body.activityId : "";
      if (!activityId) throw httpError(400, "Choose an activity to delete.");

      const state = await getState();
      const activityIndex = state.activities.findIndex(
        (activity) => activity.id === activityId && activity.personId === personId,
      );
      if (activityIndex < 0) throw httpError(404, "That activity could not be found.");

      state.activities.splice(activityIndex, 1);
      await saveState(state);
      return send(response, 200, { deletedActivityId: activityId });
    }

    const fields = parseActivityFields(body);

    if (request.method === "PUT") {
      const activityId = typeof body.activityId === "string" ? body.activityId : "";
      if (!activityId) throw httpError(400, "Choose an activity to update.");

      const state = await getState();
      const activityIndex = state.activities.findIndex(
        (activity) => activity.id === activityId && activity.personId === personId,
      );
      if (activityIndex < 0) throw httpError(404, "That activity could not be found.");

      const activity = {
        ...state.activities[activityIndex],
        ...fields,
        id: activityId,
        personId,
        note: state.activities[activityIndex].note || "",
        loggedAt: state.activities[activityIndex].loggedAt || new Date().toISOString(),
      };
      state.activities[activityIndex] = activity;
      state.participation[personId] = "in";
      await saveState(state);
      return send(response, 200, { activity, status: "in" });
    }

    const activity = {
      id: crypto.randomUUID(),
      personId,
      note: "",
      ...fields,
      loggedAt: new Date().toISOString(),
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
