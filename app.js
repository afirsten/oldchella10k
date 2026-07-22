const GOAL_PER_PERSON = 10000;
const DAILY_GOALS = {
  pushups: 100,
  squats: 100,
  planks: 240,
};
const STORAGE_KEY = "oldchella-10k-activities-v3";
const STATUS_KEY = "oldchella-10k-participation-v1";
const PIN_STORAGE_PREFIX = "rippedchella-pin-v1:";

const crew = [
  { id: "andrew", name: "Andrew F", image: "./assets/people/andrew.png" },
  { id: "brian", name: "Brian M", image: "./assets/people/brian.png" },
  { id: "chris", name: "Chris E", image: "./assets/people/chris.png" },
  { id: "james", name: "James Z", image: "./assets/people/james.png" },
  { id: "jamie", name: "Jamie D", image: "./assets/people/jamie.png" },
  { id: "joe", name: "Joe D", image: "./assets/people/joe.png" },
  { id: "john", name: "John Z", image: "./assets/people/john.png" },
  { id: "matt", name: "Matt H", image: "./assets/people/matt.png" },
  { id: "mike", name: "Mike B", image: "./assets/people/mike.png" },
];

function seedWorkout(personId, date, { pushups, squats, planks, pushupNote, setNote, run = false }) {
  const entries = [];
  const createdAt = `${date}T18:00:00`;
  if (pushups) {
    entries.push({
      id: `${personId}-${date}-pushups`,
      personId,
      exercise: "pushups",
      reps: pushups,
      note: pushupNote || setNote,
      createdAt,
    });
  }
  if (squats) {
    entries.push({
      id: `${personId}-${date}-squats`,
      personId,
      exercise: "squats",
      reps: squats,
      note: setNote,
      createdAt,
    });
  }
  if (planks) {
    entries.push({
      id: `${personId}-${date}-planks`,
      personId,
      exercise: "planks",
      reps: planks * 60,
      note: `${planks} × 1 min`,
      createdAt,
    });
  }
  if (run) {
    entries.push({
      id: `${personId}-${date}-run`,
      personId,
      exercise: "other",
      otherActivity: "Run",
      reps: 100,
      percent: 100,
      note: "",
      createdAt,
    });
  }
  return entries;
}

const seedActivities = [
  ...seedWorkout("matt", "2026-07-17", { pushups: 100, pushupNote: "5 reps × 20" }),
  ...seedWorkout("matt", "2026-07-18", { pushups: 100, pushupNote: "10 reps × 4, 5 reps × 12" }),
  ...seedWorkout("matt", "2026-07-19", { pushups: 100, pushupNote: "1 × 15, 2 × 10, 13 × 5" }),
  ...seedWorkout("matt", "2026-07-20", { pushups: 100, pushupNote: "20 sets of 5" }),

  ...seedWorkout("joe", "2026-07-15", { pushups: 100, squats: 100, planks: 4, setNote: "4 sets of 25" }),
  ...seedWorkout("joe", "2026-07-16", { pushups: 100, squats: 100, planks: 4, setNote: "4 sets of 25" }),
  ...seedWorkout("joe", "2026-07-17", { pushups: 100, squats: 100, planks: 4, setNote: "4 sets of 25" }),
  ...seedWorkout("joe", "2026-07-18", { pushups: 100, squats: 100, planks: 4, setNote: "4 sets of 25" }),
  ...seedWorkout("joe", "2026-07-19", { pushups: 100, squats: 100, planks: 4, setNote: "4 sets of 25" }),
  ...seedWorkout("joe", "2026-07-20", { pushups: 100, squats: 100, planks: 4, setNote: "4 sets of 25" }),

  ...seedWorkout("andrew", "2026-07-15", { pushups: 50, squats: 50, planks: 2, setNote: "2 sets of 25" }),
  ...seedWorkout("andrew", "2026-07-16", { pushups: 50, squats: 50, planks: 2, setNote: "2 sets of 25", run: true }),
  ...seedWorkout("andrew", "2026-07-17", { pushups: 50, squats: 50, planks: 2, setNote: "2 sets of 25" }),
  ...seedWorkout("andrew", "2026-07-18", { pushups: 75, squats: 75, planks: 3, setNote: "3 sets of 25" }),
  ...seedWorkout("andrew", "2026-07-19", { pushups: 75, squats: 75, planks: 3, setNote: "3 sets of 25" }),
  ...seedWorkout("andrew", "2026-07-20", { pushups: 75, squats: 75, planks: 3, setNote: "3 sets of 25", run: true }),
];

const $ = (selector) => document.querySelector(selector);
const number = new Intl.NumberFormat("en-US");
const durationNumber = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

function loadActivities() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : seedActivities;
  } catch {
    return seedActivities;
  }
}

let activities = loadActivities();
let participation = {};
let apiAvailable = false;
try {
  participation = JSON.parse(localStorage.getItem(STATUS_KEY) || "{}");
} catch {
  participation = {};
}

function personStatus(personId) {
  if (participation[personId]) return participation[personId];
  return activities.some((activity) => activity.personId === personId) ? "in" : "unknown";
}

function getPerson(id) {
  return crew.find((person) => person.id === id) ?? crew[0];
}

function activityExercise(activity) {
  return activity.exercise ?? "pushups";
}

function exerciseName(activity) {
  const exercise = activityExercise(activity);
  if (exercise === "squats") return "Squats";
  if (exercise === "planks") return "Plank";
  if (exercise === "other") return activity.otherActivity || "Other activity";
  return "Push-ups";
}

function exerciseUnit(activity) {
  if (activityExercise(activity) === "planks") return "SEC";
  if (activityExercise(activity) === "other") return "% GOAL";
  return "REPS";
}

function dayGoalProgress(dayActivities) {
  const totals = dayActivities.reduce(
    (sums, activity) => {
      sums[activityExercise(activity)] += Number(activity.reps) || 0;
      return sums;
    },
    { pushups: 0, squats: 0, planks: 0, other: 0 },
  );
  const percents = {
    pushups: Math.min(100, Math.round((totals.pushups / DAILY_GOALS.pushups) * 100)),
    squats: Math.min(100, Math.round((totals.squats / DAILY_GOALS.squats) * 100)),
    planks: Math.min(100, Math.round((totals.planks / DAILY_GOALS.planks) * 100)),
    other: Math.min(100, Math.round((totals.other / 100) * 100)),
  };
  const complete =
    percents.pushups >= 100 && percents.squats >= 100 && percents.planks >= 100;

  return { totals, percents, complete };
}

function dayGoalCheck(complete) {
  if (!complete) return "";
  return `
    <span class="history-day-goal is-complete" aria-label="Daily goals complete">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 13 4 4L19 7" /></svg>
    </span>
  `;
}

function dayGoalBreakdown(dayActivities) {
  const { totals } = dayGoalProgress(dayActivities);
  const lines = [
    `${number.format(totals.pushups)} of ${number.format(DAILY_GOALS.pushups)} pushups`,
    `${number.format(totals.squats)} of ${number.format(DAILY_GOALS.squats)} squats`,
    `${number.format(totals.planks)} of ${number.format(DAILY_GOALS.planks)} seconds planking`,
    `${number.format(totals.other)} of 100 Other`,
  ];
  return `
    <span class="history-day-breakdown" tabindex="0" aria-label="Daily goal progress: ${lines.join(", ")}">
      <span class="history-day-breakdown-inline">${lines.join(" / ")}</span>
      <span class="history-day-breakdown-card" role="tooltip">
        <span class="label">DAILY GOAL</span>
        ${lines.map((line) => `<span>${line}</span>`).join("")}
      </span>
    </span>
  `;
}

function exerciseIcon(activity) {
  const exercise = activityExercise(activity);
  const labels = {
    pushups: "PU",
    squats: "SQ",
    planks: "PL",
    other: "O",
  };
  const label = labels[exercise] || "PU";
  return `<span class="activity-icon is-${exercise}" aria-hidden="true">${label}</span>`;
}

function totalsByPerson() {
  return crew.map((person) => {
    const personActivities = activities.filter((activity) => activity.personId === person.id);
    const pushupActivities = personActivities.filter(
      (activity) => activityExercise(activity) === "pushups",
    );
    const metrics = personActivities.reduce(
      (totals, activity) => {
        totals[activityExercise(activity)] += activity.reps;
        return totals;
      },
      { pushups: 0, squats: 0, planks: 0, other: 0 },
    );
    const primaryType = metrics.pushups > 0 ? "pushups" : metrics.other > 0 ? "other" : "pushups";
    return {
      ...person,
      metrics,
      primaryType,
      total: metrics[primaryType],
      status: personStatus(person.id),
      sessions: new Set(personActivities.map((activity) => activity.createdAt.slice(0, 10))).size,
      pushupSessions: pushupActivities.length,
    };
  });
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value);
  return div.innerHTML;
}

function render() {
  const ranking = totalsByPerson().sort(
    (a, b) =>
      Number(a.status === "out") - Number(b.status === "out") ||
      Number(a.status === "unknown") - Number(b.status === "unknown") ||
      b.total - a.total ||
      a.name.localeCompare(b.name),
  );
  const participants = ranking.filter((person) => person.status === "in");
  const optedOut = ranking.filter((person) => person.status === "out");
  const goal = participants.length * GOAL_PER_PERSON;
  const total = participants.reduce((sum, person) => sum + person.total, 0);
  const percent = goal ? Math.min(100, Math.round((total / goal) * 100)) : 0;
  const participantIds = new Set(participants.map((person) => person.id));
  const categoryTotals = activities
    .filter((activity) => participantIds.has(activity.personId))
    .reduce(
    (totals, activity) => {
      totals[activityExercise(activity)] += activity.reps;
      return totals;
    },
    { pushups: 0, squats: 0, planks: 0, other: 0 },
  );

  $("#group-total").textContent = number.format(total);
  $("#goal-target").textContent = number.format(goal);
  $("#pushups-total").textContent = number.format(categoryTotals.pushups);
  $("#squats-total").textContent = number.format(categoryTotals.squats);
  $("#planks-total").textContent = number.format(categoryTotals.planks);
  $("#other-total").textContent = number.format(categoryTotals.other);
  $("#crew-status-total").textContent = `${participants.length} / ${optedOut.length}`;
  $("#remaining-total").textContent = number.format(Math.max(0, goal - total));
  $("#goal-percent").textContent = `${percent}%`;
  $("#progress-fill").style.width = `${percent}%`;
  $(".progress-track").setAttribute("aria-valuenow", String(total));
  $(".progress-track").setAttribute("aria-valuemax", String(goal));
  $("#pace-copy").textContent =
    goal > 0 && total >= goal ? "Challenge complete!" : "Oldchella awaits";
  $("#potential-copy").textContent =
    participants.length === crew.length
      ? "All nine said yes. The rotator cuffs have been notified."
      : `If all ${crew.length} joined: ${number.format(crew.length * GOAL_PER_PERSON)} reps. The group chat chose mercy.`;

  $("#leaderboard").innerHTML = ranking
    .map(
      (person, index) => {
        const rowState =
          person.status === "out"
            ? " is-out"
            : person.status === "unknown"
              ? " is-undecided"
              : "";
        const subtitle =
          person.status === "out"
            ? "Out"
            : person.status === "unknown"
              ? "Undecided"
              : `${person.sessions} ${person.sessions === 1 ? "session" : "sessions"}${person.primaryType === "other" ? " · alternative" : ""}`;
        return `
        <a class="leader-row${rowState}" href="#/person/${person.id}" data-person-id="${person.id}" aria-label="View ${escapeHtml(person.name)}'s progress">
          <span class="rank">${String(index + 1).padStart(2, "0")}</span>
          <span class="avatar-wrap">
            <img class="avatar" src="${person.image}" alt="" />
            ${person.status === "out" ? '<span class="out-stamp">OUT</span>' : ""}
          </span>
          <div>
            <p class="leader-name">${escapeHtml(person.name)}</p>
            <p class="leader-sub">${subtitle}</p>
          </div>
          <div class="leader-reps">
            <span class="${person.primaryType === "pushups" ? "is-primary" : ""}">
              <strong>${number.format(person.metrics.pushups)}</strong>
              <small>PUSH</small>
            </span>
            <span>
              <strong>${number.format(person.metrics.squats)}</strong>
              <small>SQUAT</small>
            </span>
            <span>
              <strong>${number.format(person.metrics.planks)}</strong>
              <small>PLANK</small>
            </span>
            <span class="${person.primaryType === "other" ? "is-primary" : ""}">
              <strong>${number.format(person.metrics.other)}</strong>
              <small>OTHER</small>
            </span>
          </div>
        </a>
      `;
      },
    )
    .join("");

  const recent = [...activities]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  $("#activity-list").innerHTML = recent.length
    ? recent
        .map((activity) => {
          const person = getPerson(activity.personId);
          return `
            <a class="activity-item is-feed" href="#/person/${person.id}" data-person-id="${person.id}" aria-label="View ${escapeHtml(person.name)}'s ${escapeHtml(exerciseName(activity))} entry">
              <div class="activity-stack" aria-hidden="true">
                <img class="activity-avatar" src="${person.image}" alt="" />
                ${exerciseIcon(activity)}
              </div>
              <div class="activity-main">
                <p class="activity-person">${escapeHtml(person.name)}</p>
                <span>${formatDate(activity.createdAt)}</span>
              </div>
              <div class="activity-meta">
                <p><span class="activity-reps">+${number.format(activity.reps)}</span> ${escapeHtml(exerciseName(activity))}</p>
              </div>
            </a>
          `;
        })
        .join("")
    : '<div class="empty-state">No reps yet. Be the first to get moving.</div>';

  renderPersonPage();
}

function formatDate(value) {
  const date = new Date(value);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return "Today";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.status = status;
  }
}

function setConnectionState(isLive) {
  const pill = $(".live-pill");
  pill.classList.toggle("is-demo", !isLive);
  pill.innerHTML = `<span></span> ${isLive ? "LIVE" : "DEMO"}`;
}

async function loadSharedState() {
  try {
    const response = await fetch("/api/state", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Shared API did not respond.");
    const state = await response.json();
    if (!Array.isArray(state.activities) || !state.participation || typeof state.participation !== "object") {
      throw new Error("Shared API returned invalid data.");
    }
    activities = state.activities;
    participation = state.participation;
    apiAvailable = true;
    setConnectionState(true);
    render();
    return true;
  } catch {
    apiAvailable = false;
    setConnectionState(false);
    return false;
  }
}

async function apiRequest(path, method, body) {
  let response;
  try {
    response = await fetch(path, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Shared API unavailable. Deploy or start the Vercel app before making changes.");
  }

  let result = {};
  try {
    result = await response.json();
  } catch {
    result = {};
  }
  if (!response.ok) {
    if (response.status === 404 || response.status >= 500) {
      apiAvailable = false;
      setConnectionState(false);
    }
    throw new ApiError(
      result.error ||
        (response.status === 404
          ? "Shared API unavailable. Deploy or start the Vercel app before making changes."
          : "The shared tracker could not save that change."),
      response.status,
    );
  }
  return result;
}

function storedPin(personId) {
  try {
    return localStorage.getItem(`${PIN_STORAGE_PREFIX}${personId}`) || "";
  } catch {
    return "";
  }
}

function rememberPin(personId, pin) {
  try {
    localStorage.setItem(`${PIN_STORAGE_PREFIX}${personId}`, pin);
  } catch {
    // Saving still works if this browser blocks localStorage.
  }
}

function forgetPin(personId) {
  try {
    localStorage.removeItem(`${PIN_STORAGE_PREFIX}${personId}`);
  } catch {
    // Nothing else to clear.
  }
}

let resolvePinPrompt = null;

function requestPin(personId, errorMessage = "") {
  const person = getPerson(personId);
  $("#pin-person-name").textContent = person.name;
  $("#pin-error").textContent = errorMessage;
  $("#pin-error").hidden = !errorMessage;
  $("#pin-form").reset();
  $("#pin-dialog").showModal();
  window.setTimeout(() => $("#pin-input").focus(), 0);

  return new Promise((resolve) => {
    resolvePinPrompt = resolve;
  });
}

function closePinPrompt(value = null) {
  const resolve = resolvePinPrompt;
  resolvePinPrompt = null;
  $("#pin-dialog").close();
  if (resolve) resolve(value);
}

async function protectedRequest(path, method, personId, body) {
  let pin = storedPin(personId);
  let pinError = "";

  while (true) {
    if (!pin) {
      pin = await requestPin(personId, pinError);
      if (!pin) return null;
    }

    try {
      const result = await apiRequest(path, method, { ...body, personId, pin });
      rememberPin(personId, pin);
      return result;
    } catch (error) {
      if (error.status !== 401 && error.status !== 403) throw error;
      forgetPin(personId);
      pin = "";
      pinError = error.message;
    }
  }
}

function currentPersonId() {
  const match = window.location.hash.match(/^#\/person\/([a-z]+)$/);
  return match && crew.some((person) => person.id === match[1]) ? match[1] : null;
}

function renderPersonPage() {
  const personId = currentPersonId();
  const dashboard = $("#dashboard-page");
  const personPage = $("#person-page");
  const backButton = $("#back-button");

  if (!personId) {
    dashboard.hidden = false;
    personPage.hidden = true;
    backButton.hidden = true;
    return;
  }

  const person = getPerson(personId);
  const allStats = totalsByPerson();
  const ranking = allStats
    .filter((entry) => entry.status === "in")
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  const personStats = allStats.find((entry) => entry.id === personId);
  const rank = ranking.findIndex((entry) => entry.id === personId) + 1;
  const history = activities
    .filter((activity) => activity.personId === personId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const historyByDate = history.reduce((groups, activity) => {
    const date = new Date(activity.createdAt);
    const dateKey = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
    const existingGroup = groups.find((group) => group.dateKey === dateKey);
    if (existingGroup) {
      existingGroup.activities.push(activity);
    } else {
      groups.push({ dateKey, date, activities: [activity] });
    }
    return groups;
  }, []);
  const sessionDays = { pushups: new Set(), squats: new Set(), planks: new Set(), other: new Set() };
  history.forEach((activity) => {
    sessionDays[activityExercise(activity)].add(activity.createdAt.slice(0, 10));
  });
  const averageFor = (exercise, value) => {
    const days = sessionDays[exercise].size;
    return days ? value / days : 0;
  };
  const personalPercent = Math.round((personStats.total / GOAL_PER_PERSON) * 100);
  const plankMinutes = personStats.metrics.planks / 60;
  const fullOtherDays = new Set(
    history
      .filter(
        (activity) =>
          activityExercise(activity) === "other" &&
          Number(activity.percent ?? activity.reps) >= 100,
      )
      .map((activity) => activity.createdAt.slice(0, 10)),
  ).size;

  dashboard.hidden = true;
  personPage.hidden = false;
  backButton.hidden = false;
  $("#person-avatar").src = person.image;
  $("#person-avatar").alt = `${person.name} profile photo`;
  $("#person-name").textContent = person.name;
  $("#person-summary").textContent =
    personStats.status === "out"
      ? `${person.name.split(" ")[0]} is sitting this challenge out.`
      : history.length
        ? `${person.name.split(" ")[0]} has put in ${personStats.sessions} ${personStats.sessions === 1 ? "session" : "sessions"} on the road to Joshua Tree.`
        : `${person.name.split(" ")[0]} is ready to choose whether to join the challenge.`;
  const participationCard = $("#participation-card");
  participationCard.hidden = history.length > 0;
  participationCard.querySelectorAll("[data-participation]").forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.participation === personStats.status);
  });
  const showProgress = history.length > 0 || personStats.status === "in";
  $(".personal-total").hidden = !showProgress;
  $(".personal-breakdown").hidden = !showProgress;
  $(".stat-grid").hidden = !showProgress;
  $("#person-log-button").hidden = personStats.status !== "in";
  $("#person-total").textContent = number.format(personStats.total);
  $("#person-total-label").textContent =
    personStats.primaryType === "other" ? "TOTAL ALTERNATIVE WORK" : "TOTAL PUSH-UPS";
  $("#person-goal-percent").textContent = `${personalPercent}%`;
  $("#person-goal-current").textContent = number.format(personStats.total);
  $("#person-progress-fill").style.width = `${Math.min(100, personalPercent)}%`;
  $(".personal-progress-track").setAttribute("aria-valuenow", String(personStats.total));
  $("#person-pushups-total").textContent = number.format(personStats.metrics.pushups);
  $("#person-squats-total").textContent = number.format(personStats.metrics.squats);
  $("#person-plank-minutes").textContent = durationNumber.format(plankMinutes);
  $("#person-other-days").textContent = number.format(fullOtherDays);
  $("#person-sessions").textContent = number.format(personStats.sessions);
  $("#person-avg-pushups").textContent = number.format(
    Math.round(averageFor("pushups", personStats.metrics.pushups)),
  );
  $("#person-avg-squats").textContent = number.format(
    Math.round(averageFor("squats", personStats.metrics.squats)),
  );
  $("#person-avg-planks").textContent = durationNumber.format(
    averageFor("planks", plankMinutes),
  );
  $("#person-avg-other").textContent = number.format(
    Math.round(averageFor("other", personStats.metrics.other)),
  );
  $("#person-rank").textContent =
    personStats.status === "out" ? "OUT" : personStats.status === "unknown" ? "—" : rank ? `#${rank}` : "—";
  $("#person-button-name").textContent = person.name.split(" ")[0].toUpperCase();
  $("#person-activity-list").innerHTML = history.length
    ? historyByDate
        .map(
          (group) => `
            <div class="history-day">
              <div class="history-date-divider">
                ${dayGoalCheck(dayGoalProgress(group.activities).complete)}
                <span class="history-day-date">${group.date.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}</span>
                <span class="history-day-rule" aria-hidden="true"></span>
                ${dayGoalBreakdown(group.activities)}
              </div>
              <div class="history-day-activities">
                ${group.activities
                  .map(
                    (activity) => `
                      <article class="activity-item is-editable" data-activity-id="${escapeHtml(activity.id)}" role="button" tabindex="0" aria-label="Edit ${escapeHtml(exerciseName(activity))} entry">
                        ${exerciseIcon(activity)}
                        <div class="activity-main">
                          <p><span class="activity-reps">+${number.format(activity.reps)}</span> ${escapeHtml(exerciseName(activity))}</p>
                        </div>
                        <button
                          class="delete-activity-button"
                          type="button"
                          data-delete-activity-id="${escapeHtml(activity.id)}"
                          aria-label="Delete ${escapeHtml(exerciseName(activity))} entry"
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M4 7h16M9 7V4h6v3m-9 0 1 13h10l1-13M10 11v5m4-5v5" />
                          </svg>
                        </button>
                      </article>
                    `,
                  )
                  .join("")}
              </div>
              <button class="add-to-date-button" type="button" data-log-date="${group.dateKey}">
                <span aria-hidden="true">+</span>
                ADD REPS TO THIS DAY
              </button>
            </div>
          `,
        )
        .join("")
    : '<div class="empty-state">No sessions yet. Time to get on the board.</div>';

  window.scrollTo({ top: 0, behavior: "smooth" });
}

const personInput = $("#person-input");

const exerciseInput = $("#exercise-input");
const exerciseButtons = [...document.querySelectorAll("[data-exercise]")];
const quickButtons = [...document.querySelectorAll("[data-increment]")];

function setAmount(value) {
  const amount = Math.max(0, Math.min(1000, Math.round(Number(value) || 0)));
  $("#reps-input").value = amount;
}

function updateExerciseFields({ keepAmount = false } = {}) {
  const exercise = exerciseInput.value;
  const settings = {
    pushups: { label: "Push-up reps", unit: "REPS", quick: [1, 5, 10, 25] },
    squats: { label: "Squat reps", unit: "REPS", quick: [1, 5, 10, 25] },
    planks: { label: "Plank time", unit: "SECONDS", quick: [1, 30, 60, 90] },
    other: { label: "Daily goal", unit: "%", quick: [] },
  }[exercise];

  exerciseButtons.forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.exercise === exercise);
  });
  $("#amount-label").textContent = settings.label;
  $("#amount-unit").textContent = settings.unit;
  $("#other-field").hidden = exercise !== "other";
  $("#other-input").required = exercise === "other";
  $("#counter-field").hidden = exercise === "other";
  $("#other-slider-field").hidden = exercise !== "other";
  quickButtons.forEach((button, index) => {
    button.dataset.increment = settings.quick[index] || 0;
    button.textContent = `+${settings.quick[index] || 0}`;
  });
  if (exercise === "other") {
    const percent = keepAmount
      ? Math.max(0, Math.min(100, Number($("#reps-input").value) || 0))
      : Number($("#other-slider").value);
    $("#other-slider").value = percent;
    setAmount(percent);
    $("#other-percent").textContent = `${percent}%`;
    $(".slider-value span").textContent = `= ${percent}% bonus effort logged`;
  } else if (!keepAmount) {
    setAmount(0);
  }
}

exerciseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    exerciseInput.value = button.dataset.exercise;
    updateExerciseFields();
  });
});

const dialog = $("#log-dialog");
const pinDialog = $("#pin-dialog");
let logSuccessTimer = null;
let editingActivityId = null;

function localDateValue(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function openLogDialog(personId, options = {}) {
  if (!personId) return;
  const activity = options.activity || null;
  const activityDate = options.activityDate || localDateValue();
  editingActivityId = activity?.id || null;

  window.clearTimeout(logSuccessTimer);
  $("#log-form").hidden = false;
  $("#log-success").hidden = true;
  $("#log-form").reset();

  const person = getPerson(personId);
  personInput.value = personId;
  $("#activity-date-input").max = localDateValue();
  $("#activity-date-input").value = activityDate;
  $("#log-person-image").src = person.image;
  $("#log-person-image").alt = `${person.name} profile photo`;
  $("#log-person-name").textContent = person.name;
  $("#log-dialog .dialog-heading h2").textContent = activity ? "Edit your reps" : "Log your reps";
  $("#log-dialog .dialog-heading .eyebrow").textContent = activity ? "EDIT ACTIVITY" : "ADD ACTIVITY";
  $("#log-form .submit-button").textContent = activity ? "SAVE CHANGES" : "ADD TO THE TOTAL";

  if (activity) {
    exerciseInput.value = activityExercise(activity);
    $("#other-input").value = activity.otherActivity || "";
    setAmount(activity.reps);
    updateExerciseFields({ keepAmount: true });
  } else {
    updateExerciseFields();
  }

  dialog.showModal();
}

function showLogSuccess(personId, reps, exercise) {
  const person = getPerson(personId);
  const unit = exercise === "planks" ? "SECONDS" : exercise === "other" ? "% GOAL" : "REPS";
  const confettiColors = ["#f5c842", "#ff2d78", "#e8763a", "#f8ede1"];
  $("#success-confetti").innerHTML = Array.from({ length: 20 }, (_, index) => {
    const direction = index % 2 === 0 ? -1 : 1;
    const distance = 45 + ((index * 37) % 180);
    const drop = 110 + ((index * 29) % 150);
    const rotation = direction * (160 + ((index * 47) % 300));
    const delay = (index % 5) * 35;
    return `<i style="--x:${direction * distance}px;--y:${drop}px;--r:${rotation}deg;--delay:${delay}ms;--confetti:${confettiColors[index % confettiColors.length]}"></i>`;
  }).join("");
  $("#success-amount").textContent = `+${number.format(reps)}`;
  $("#success-unit").textContent = unit;
  $("#success-copy").textContent = `Added to ${person.name.split(" ")[0]}’s personal progress.`;
  $("#log-form").hidden = true;
  $("#log-success").hidden = false;

  logSuccessTimer = window.setTimeout(() => {
    $("#log-success").hidden = true;
    $("#log-form").hidden = false;
    if (dialog.open) dialog.close();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 1400);
}

$("#person-log-button").addEventListener("click", () => openLogDialog(currentPersonId()));
$("#close-dialog-button").addEventListener("click", () => {
  editingActivityId = null;
  dialog.close();
});
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    editingActivityId = null;
    dialog.close();
  }
});
dialog.addEventListener("close", () => {
  editingActivityId = null;
});

$("#pin-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const pin = $("#pin-input").value.trim();
  if (!/^(?:\d{4}|\d{6})$/.test(pin)) {
    $("#pin-error").textContent = "Enter a 4-digit participant PIN or 6-digit master PIN.";
    $("#pin-error").hidden = false;
    return;
  }
  closePinPrompt(pin);
});
$("#close-pin-button").addEventListener("click", () => closePinPrompt());
pinDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closePinPrompt();
});
pinDialog.addEventListener("click", (event) => {
  if (event.target === pinDialog) closePinPrompt();
});

quickButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setAmount(Number($("#reps-input").value) + Number(button.dataset.increment));
  });
});

$("#reset-amount-button").addEventListener("click", () => setAmount(0));
$("#reps-input").addEventListener("blur", (event) => setAmount(event.currentTarget.value));
$("#other-slider").addEventListener("input", (event) => {
  const percent = Number(event.currentTarget.value);
  setAmount(percent);
  $("#other-percent").textContent = `${percent}%`;
  $(".slider-value span").textContent = `= ${percent}% bonus effort logged`;
});

$("#log-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const reps = Number($("#reps-input").value);
  const exercise = exerciseInput.value;
  if (!Number.isInteger(reps) || reps < 1 || reps > 1000) return;
  const personId = personInput.value;
  if (personId !== currentPersonId()) {
    dialog.close();
    showToast("Open a participant profile before logging activity.");
    return;
  }

  const submitButton = form.querySelector(".submit-button");
  const activityId = editingActivityId;
  submitButton.disabled = true;
  try {
    const result = await protectedRequest(
      "/api/activities",
      activityId ? "PUT" : "POST",
      personId,
      {
        activityId,
        exercise,
        otherActivity: exercise === "other" ? $("#other-input").value.trim() : "",
        reps,
        activityDate: $("#activity-date-input").value,
      },
    );
    if (!result) return;

    if (activityId) {
      const index = activities.findIndex((entry) => entry.id === activityId);
      if (index >= 0) activities[index] = result.activity;
      else activities.push(result.activity);
    } else {
      activities.push(result.activity);
    }
    participation[personId] = result.status;
    editingActivityId = null;
    render();
    form.reset();
    updateExerciseFields();
    showLogSuccess(personId, reps, exercise);
  } catch (error) {
    showToast(error.message || "Activity could not be saved.");
  } finally {
    submitButton.disabled = false;
  }
});

document.querySelectorAll("[data-participation]").forEach((button) => {
  button.addEventListener("click", async () => {
    const personId = currentPersonId();
    if (!personId) return;
    button.disabled = true;
    try {
      const result = await protectedRequest("/api/participation", "PUT", personId, {
        status: button.dataset.participation,
      });
      if (!result) return;
      participation[personId] = result.status;
      render();
      showToast(result.status === "in" ? "You’re in. Let’s move." : "Status set to out.");
    } catch (error) {
      showToast(error.message || "Participation could not be saved.");
    } finally {
      button.disabled = false;
    }
  });
});

$("#person-activity-list").addEventListener("click", async (event) => {
  const addButton = event.target.closest("[data-log-date]");
  if (addButton) {
    openLogDialog(currentPersonId(), { activityDate: addButton.dataset.logDate });
    return;
  }

  const deleteButton = event.target.closest("[data-delete-activity-id]");
  if (deleteButton) {
    event.stopPropagation();
    const activity = activities.find((entry) => entry.id === deleteButton.dataset.deleteActivityId);
    const personId = currentPersonId();
    if (!activity || !personId || activity.personId !== personId) return;
    if (
      !window.confirm(
        `Delete this ${number.format(activity.reps)} ${exerciseUnit(activity).toLowerCase()} ${exerciseName(activity).toLowerCase()} entry?`,
      )
    ) {
      return;
    }

    deleteButton.disabled = true;
    try {
      const result = await protectedRequest("/api/activities", "DELETE", personId, {
        activityId: activity.id,
      });
      if (!result) return;

      activities = activities.filter((entry) => entry.id !== result.deletedActivityId);
      render();
      showToast("Activity deleted. Totals updated.");
    } catch (error) {
      showToast(error.message || "Activity could not be deleted.");
    } finally {
      deleteButton.disabled = false;
    }
    return;
  }

  const item = event.target.closest("[data-activity-id]");
  if (!item) return;
  const activity = activities.find((entry) => entry.id === item.dataset.activityId);
  const personId = currentPersonId();
  if (!activity || !personId || activity.personId !== personId) return;
  openLogDialog(personId, {
    activity,
    activityDate: localDateValue(new Date(activity.createdAt)),
  });
});

$("#person-activity-list").addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const item = event.target.closest("[data-activity-id]");
  if (!item || event.target.closest("[data-delete-activity-id]")) return;
  event.preventDefault();
  item.click();
});

$("#leaderboard").addEventListener("click", (event) => {
  const row = event.target.closest("[data-person-id]");
  if (row) window.location.hash = `/person/${row.dataset.personId}`;
});

$("#back-button").addEventListener("click", () => {
  window.location.hash = "";
});

window.addEventListener("hashchange", renderPersonPage);

updateExerciseFields();
render();
loadSharedState();
