const GOAL_PER_PERSON = 10000;
const CHALLENGE_START = "2026-07-14";
const CHALLENGE_DAYS = 100;
const OLDCHELLA_START = new Date("2026-10-22T15:00:00");
const FACT_ROTATE_MS = 5600;
const DAILY_GOALS = {
  pushups: 100,
  squats: 100,
  planks: 240,
};
const STORAGE_KEY = "oldchella-10k-activities-v3";
const STATUS_KEY = "oldchella-10k-participation-v1";
const PIN_STORAGE_PREFIX = "rippedchella-pin-v1:";
const LAST_PERSON_KEY = "rippedchella-last-person-v1";

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

function activityDateKey(activity) {
  const date = new Date(activity.createdAt);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function dayGoalProgressLines(dayActivities) {
  const { totals, complete } = dayGoalProgress(dayActivities);
  return {
    complete,
    lines: [
      `${number.format(totals.pushups)} of ${number.format(DAILY_GOALS.pushups)} pushups`,
      `${number.format(totals.squats)} of ${number.format(DAILY_GOALS.squats)} squats`,
      `${number.format(totals.planks)} of ${number.format(DAILY_GOALS.planks)} seconds planking`,
      `${number.format(totals.other)} of 100 Other`,
    ],
  };
}

function dayGoalBreakdown(dayActivities) {
  const { lines } = dayGoalProgressLines(dayActivities);
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

function updateLogDailyGoalCard() {
  const linesEl = $("#log-daily-goal-lines");
  const completeEl = $("#log-daily-goal-complete");
  const card = $("#log-daily-goal");
  if (!linesEl || !completeEl || !card) return;
  const personId = $("#person-input")?.value;
  const dateKey = $("#activity-date-input")?.value;
  if (!personId || !dateKey) {
    linesEl.innerHTML = "";
    completeEl.hidden = true;
    card.classList.remove("is-complete");
    return;
  }
  const dayActivities = activities.filter(
    (activity) => activity.personId === personId && activityDateKey(activity) === dateKey,
  );
  const { lines, complete } = dayGoalProgressLines(dayActivities);
  linesEl.innerHTML = lines.map((line) => `<span>${escapeHtml(line)}</span>`).join("");
  completeEl.hidden = !complete;
  card.classList.toggle("is-complete", complete);
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

function activityLoggedAt(activity) {
  return new Date(activity.loggedAt || activity.createdAt).getTime();
}

function isJustAdded(activity) {
  if (!activity.loggedAt) return false;
  return Date.now() - new Date(activity.loggedAt).getTime() < 60_000;
}

function compareActivitiesRecentFirst(a, b) {
  const byTime = activityLoggedAt(b) - activityLoggedAt(a);
  if (byTime) return byTime;
  return activities.indexOf(b) - activities.indexOf(a);
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

function onTargetReps(asOf = new Date()) {
  const start = new Date(`${CHALLENGE_START}T12:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + CHALLENGE_DAYS);
  const now = new Date(asOf);
  if (now <= start) return 0;
  if (now >= end) return GOAL_PER_PERSON;
  const daysElapsed = Math.floor((now.getTime() - start.getTime()) / 86400000);
  const dailyTarget = GOAL_PER_PERSON / CHALLENGE_DAYS;
  return Math.min(GOAL_PER_PERSON, daysElapsed * dailyTarget);
}

function buildRotatingFacts({ total, goal, participants, categoryTotals, paceDelta, groupTarget }) {
  const remaining = Math.max(0, goal - total);
  const msLeft = Math.max(0, OLDCHELLA_START.getTime() - Date.now());
  const daysLeft = Math.floor(msLeft / 86400000);
  const hoursLeft = Math.floor((msLeft % 86400000) / 3600000);
  const pushupCals = Math.round(categoryTotals.pushups * 0.36);
  const squatCals = Math.round(categoryTotals.squats * 0.42);
  const plankMins = categoryTotals.planks / 60;
  const plankCals = Math.round(plankMins * 3.5);
  const burned = pushupCals + squatCals + plankCals;
  const perPerson = participants.length ? Math.round(total / participants.length) : 0;
  const dailyNeeded =
    daysLeft > 0 && participants.length
      ? Math.ceil(remaining / participants.length / daysLeft)
      : 0;

  return [
    burned > 0
      ? `Rough burn so far: ~${number.format(burned)} calories across push-ups, squats, and planks.`
      : "Add the first set and the calorie counter starts talking trash.",
    categoryTotals.pushups > 0
      ? `${number.format(categoryTotals.pushups)} push-ups ≈ ${number.format(pushupCals)} calories. Chest taxes paid.`
      : null,
    categoryTotals.squats > 0
      ? `${number.format(categoryTotals.squats)} squats ≈ ${number.format(squatCals)} calories. Knees filing a formal complaint.`
      : null,
    plankMins > 0
      ? `${durationNumber.format(plankMins)} plank minutes ≈ ${number.format(plankCals)} calories of desert stillness.`
      : null,
    daysLeft > 0
      ? `${daysLeft} days and ${hoursLeft} hours until Old-Chella check-in. The desert is patient. Your rotator cuff is not.`
      : "Old-Chella is live. Get ripped or get roasted.",
    goal > 0
      ? `${number.format(remaining)} group reps left. That is ${number.format(Math.ceil(remaining / Math.max(participants.length, 1)))} each if everybody shows up.`
      : null,
    dailyNeeded > 0
      ? `To finish on time: about ${number.format(dailyNeeded)} primary reps per in-bro per day.`
      : null,
    paceDelta > 0
      ? `Crew is ${number.format(paceDelta)} ahead of pace. Do not get cute. Momentum is a gift.`
      : paceDelta < 0
        ? `Crew is ${number.format(Math.abs(paceDelta))} behind pace. The fix is boring and effective: today.`
        : groupTarget > 0
          ? `Right on pace at ${number.format(groupTarget)}. Keep the line green.`
          : null,
    participants.length
      ? `${participants.length} bro${participants.length === 1 ? "" : "s"} in. Average haul: ${number.format(perPerson)}.`
      : "Nobody has opted in yet. Be the first adult in the room.",
    "After 40, muscle is a retirement account. Deposit daily.",
    "In your 40s, consistency beats hero sets. Show up ugly. Leave better.",
    "Recovery is training. Sleep is the illegal PED nobody tests for.",
    "Push-ups after 40: fewer excuses, more elbows tucked, still no mercy.",
    "Squats keep the engine. Desk chairs are the silent villain.",
    "Planks: the meeting that actually makes you stronger.",
    "Protein and patience. The desert will notice.",
    "You are not fragile. You are under-repped.",
    "The group chat can meme. Only what you add counts.",
    "Ten thousand each. One weekend. Zero good excuses left.",
    "Strong at 40 looks like showing up when nobody is watching.",
  ].filter(Boolean);
}

function activityCallout(activity) {
  const person = getPerson(activity.personId);
  if (!person) return null;
  const first = person.name.split(" ")[0];
  const exercise = activityExercise(activity);
  const amount = number.format(activity.reps);
  const label = exerciseName(activity);
  const seed = String(activity.id || "").split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);

  if (exercise === "planks") {
    const lines = [
      `Fresh drop: ${first} just locked in ${amount} seconds of plank.`,
      `${first} banked ${amount} plank seconds. Desert stillness unlocked.`,
      `+${amount} plank seconds from ${first}. Core tax collected.`,
    ];
    return lines[seed % lines.length];
  }
  if (exercise === "other") {
    const lines = [
      `Fresh drop: ${first} just added ${amount}% on Other — ${label}.`,
      `${first} slipped in ${amount}% Other (${label}). The side quest counts.`,
      `+${amount}% Other from ${first}: ${label}.`,
    ];
    return lines[seed % lines.length];
  }
  if (exercise === "squats") {
    const lines = [
      `Fresh drop: ${first} just added +${amount} squats.`,
      `${first} banked +${amount} squats. Knees filed the receipt.`,
      `+${amount} squats from ${first}. Engine still running.`,
    ];
    return lines[seed % lines.length];
  }
  const lines = [
    `Fresh drop: ${first} just added +${amount} push-ups.`,
    `${first} banked +${amount} push-ups. Chest taxes paid.`,
    `+${amount} push-ups from ${first}. Keep the feed hot.`,
  ];
  return lines[seed % lines.length];
}

function buildRecentActivityFacts(limit = 8) {
  return [...activities]
    .sort(compareActivitiesRecentFirst)
    .slice(0, limit)
    .map(activityCallout)
    .filter(Boolean);
}

let rotatingFacts = [];
let recentActivityFacts = [];
let factSignature = "";
let factIndex = 0;
let factTick = 0;
let factTimer = null;

function showNextFact(animate = true) {
  const el = $("#potential-copy");
  if (!el) return;
  if (!rotatingFacts.length && !recentActivityFacts.length) return;

  let next;
  if (recentActivityFacts.length && factTick % 3 === 2) {
    next = recentActivityFacts[Math.floor(factTick / 3) % recentActivityFacts.length];
  } else if (rotatingFacts.length) {
    next = rotatingFacts[factIndex % rotatingFacts.length];
    factIndex += 1;
  } else {
    next = recentActivityFacts[factTick % recentActivityFacts.length];
  }
  factTick += 1;

  if (!animate) {
    el.textContent = next;
    return;
  }
  el.classList.add("is-fading");
  window.setTimeout(() => {
    el.textContent = next;
    el.classList.remove("is-fading");
  }, 220);
}

function startFactRotation(facts) {
  recentActivityFacts = buildRecentActivityFacts();
  const signature = `${facts.join("|")}::${recentActivityFacts.join("|")}`;
  rotatingFacts = facts;
  if (!rotatingFacts.length && !recentActivityFacts.length) {
    window.clearInterval(factTimer);
    factTimer = null;
    factSignature = "";
    $("#potential-copy").textContent = "";
    return;
  }
  if (signature === factSignature && factTimer) return;
  factSignature = signature;
  factIndex = 0;
  factTick = 0;
  showNextFact(false);
  window.clearInterval(factTimer);
  factTimer = window.setInterval(() => showNextFact(true), FACT_ROTATE_MS);
}

function formatRankLabel(rank) {
  const value = Number(rank);
  if (!Number.isFinite(value) || value < 1) return "";
  const mod100 = value % 100;
  const suffix =
    mod100 >= 11 && mod100 <= 13
      ? "th"
      : value % 10 === 1
        ? "st"
        : value % 10 === 2
          ? "nd"
          : value % 10 === 3
            ? "rd"
            : "th";
  return `Ranked ${value}${suffix}`;
}

function formatPersonHeadline(name) {
  const parts = String(name).trim().split(/\s+/);
  if (parts.length < 2) return escapeHtml(name);
  const initial = parts.pop();
  return `${escapeHtml(parts.join(" "))}<span class="name-initial">${escapeHtml(initial)}</span>`;
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
  const groupTarget = participants.length * onTargetReps();
  const targetPercent = goal ? Math.min(100, Math.round((groupTarget / goal) * 100)) : 0;
  const paceDelta = total - groupTarget;
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
  $("#goal-percent-value").textContent = `${percent}%`;
  $("#goal-percent").setAttribute("aria-label", `${percent}% done`);
  $("#progress-fill").style.width = `${percent}%`;
  $("#progress-target").style.width = `${targetPercent}%`;
  $("#progress-pace").style.left = `${targetPercent}%`;
  $(".progress-track").setAttribute("aria-valuenow", String(total));
  $(".progress-track").setAttribute("aria-valuemax", String(goal));
  $(".progress-track").setAttribute(
    "aria-valuetext",
    `${number.format(total)} of ${number.format(goal)}, on-target pace ${number.format(groupTarget)}`,
  );
  $("#pace-copy").textContent =
    goal > 0 && total >= goal
      ? "Challenge complete!"
      : groupTarget <= 0
        ? "Oldchella awaits"
        : paceDelta === 0
          ? `On pace (${number.format(groupTarget)})`
          : paceDelta > 0
            ? `${number.format(paceDelta)} ahead of pace`
            : `${number.format(Math.abs(paceDelta))} behind pace`;
  startFactRotation(
    buildRotatingFacts({
      total,
      goal,
      participants,
      categoryTotals,
      paceDelta,
      groupTarget,
    }),
  );
  updateQuickAddButton();

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
          <span class="rank rank-${index === 0 ? "gold" : index === 1 ? "silver" : index === 2 ? "bronze" : "steel"}">${index + 1}</span>
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
    .sort(compareActivitiesRecentFirst)
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
    localStorage.setItem(LAST_PERSON_KEY, personId);
  } catch {
    // Saving still works if this browser blocks localStorage.
  }
}

function forgetPin(personId) {
  try {
    localStorage.removeItem(`${PIN_STORAGE_PREFIX}${personId}`);
    if (localStorage.getItem(LAST_PERSON_KEY) === personId) {
      const next = crew.find((person) => person.id !== personId && storedPin(person.id));
      if (next) localStorage.setItem(LAST_PERSON_KEY, next.id);
      else localStorage.removeItem(LAST_PERSON_KEY);
    }
  } catch {
    // Nothing else to clear.
  }
}

function rememberedPersonId() {
  try {
    const last = localStorage.getItem(LAST_PERSON_KEY);
    if (last && storedPin(last) && crew.some((person) => person.id === last)) return last;
    const match = crew.find((person) => storedPin(person.id));
    return match ? match.id : null;
  } catch {
    return null;
  }
}

function updateQuickAddButton() {
  const wrap = $("#hero-quick-add");
  const button = $("#quick-add-button");
  const label = $("#quick-add-label");
  if (!wrap || !button || !label) return;
  if (currentPersonId()) {
    wrap.hidden = true;
    return;
  }
  wrap.hidden = false;
  const personId = rememberedPersonId();
  if (personId) {
    const first = getPerson(personId).name.split(" ")[0].toUpperCase();
    button.dataset.personId = personId;
    label.textContent = `ADD REPS FOR ${first}`;
    button.setAttribute("aria-label", `Add reps for ${first}`);
  } else {
    delete button.dataset.personId;
    label.textContent = "ADD REPS";
    button.setAttribute("aria-label", "Add reps — pick who you are");
  }
}

function openPersonPicker() {
  const grid = $("#person-picker-grid");
  grid.innerHTML = crew
    .map(
      (person) => `
        <button class="person-picker-option" type="button" data-person-id="${person.id}">
          <img src="${person.image}" alt="" />
          <span>${escapeHtml(person.name)}</span>
        </button>
      `,
    )
    .join("");
  $("#person-picker-dialog").showModal();
}

function closePersonPicker() {
  const picker = $("#person-picker-dialog");
  if (picker.open) picker.close();
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

function parsePersonRoute() {
  const match = window.location.hash.match(/^#\/person\/([a-z]+)(?:\/(add))?\/?$/);
  if (!match || !crew.some((person) => person.id === match[1])) return null;
  return { personId: match[1], openAdd: match[2] === "add" };
}

function currentPersonId() {
  return parsePersonRoute()?.personId || null;
}

function renderPersonPage({ skipScroll = false } = {}) {
  const route = parsePersonRoute();
  const personId = route?.personId || null;
  const dashboard = $("#dashboard-page");
  const personPage = $("#person-page");

  if (!personId) {
    dashboard.hidden = false;
    personPage.hidden = true;
    updateQuickAddButton();
    return;
  }

  const person = getPerson(personId);
  const allStats = totalsByPerson();
  const ranking = allStats
    .filter((entry) => entry.status === "in")
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  const personStats = allStats.find((entry) => entry.id === personId);
  const rank = ranking.findIndex((entry) => entry.id === personId) + 1;
  const history = activities.filter((activity) => activity.personId === personId);
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
  historyByDate.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  historyByDate.forEach((group) => {
    group.activities.sort(compareActivitiesRecentFirst);
  });
  const sessionDays = { pushups: new Set(), squats: new Set(), planks: new Set(), other: new Set() };
  history.forEach((activity) => {
    sessionDays[activityExercise(activity)].add(activity.createdAt.slice(0, 10));
  });
  const averageFor = (exercise, value) => {
    const days = sessionDays[exercise].size;
    return days ? value / days : 0;
  };
  const personalPercent = Math.round((personStats.total / GOAL_PER_PERSON) * 100);
  const targetReps = onTargetReps();
  const targetPercent = Math.round((targetReps / GOAL_PER_PERSON) * 100);
  const paceDelta = personStats.total - targetReps;
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
  $("#person-avatar").src = person.image;
  $("#person-avatar").alt = `${person.name} profile photo`;
  const rankTile = $("#person-rank-tile");
  const rankBadge = $("#person-rank");
  const rankLabel =
    personStats.status === "out"
      ? "OUT"
      : personStats.status === "unknown"
        ? ""
        : rank
          ? formatRankLabel(rank)
          : "";
  rankBadge.textContent = rankLabel || "—";
  rankTile.hidden = !rankLabel;
  rankTile.classList.toggle("is-out", personStats.status === "out");
  $("#person-name").innerHTML = formatPersonHeadline(person.name);
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
  $("#person-progress-target").style.width = `${Math.min(100, targetPercent)}%`;
  $("#person-progress-pace").style.left = `${Math.min(100, targetPercent)}%`;
  $(".personal-progress-track").setAttribute("aria-valuenow", String(personStats.total));
  $(".personal-progress-track").setAttribute(
    "aria-valuetext",
    `${number.format(personStats.total)} of ${number.format(GOAL_PER_PERSON)}, on-target pace ${number.format(targetReps)}`,
  );
  $("#person-pace-copy").textContent =
    targetReps <= 0
      ? ""
      : paceDelta === 0
        ? ` · on pace (${number.format(targetReps)})`
        : paceDelta > 0
          ? ` · ${number.format(paceDelta)} ahead of pace`
          : ` · ${number.format(Math.abs(paceDelta))} behind pace`;
  $("#person-pushups-total").textContent = number.format(personStats.metrics.pushups);
  $("#person-squats-total").textContent = number.format(personStats.metrics.squats);
  $("#person-plank-minutes").textContent = durationNumber.format(plankMinutes);
  $("#person-other-days").textContent = number.format(fullOtherDays);
  $("#person-sessions").textContent = number.format(personStats.sessions);
  $("#person-sessions-label").textContent = personStats.sessions === 1 ? "session" : "sessions";
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
                  .map((activity) => {
                    const justAdded = isJustAdded(activity);
                    return `
                      <article class="activity-item is-editable${justAdded ? " is-just-added" : ""}" data-activity-id="${escapeHtml(activity.id)}" role="button" tabindex="0" aria-label="Edit ${escapeHtml(exerciseName(activity))} entry">
                        ${exerciseIcon(activity)}
                        <div class="activity-main">
                          <p><span class="activity-reps">+${number.format(activity.reps)}</span> ${escapeHtml(exerciseName(activity))}</p>
                          ${justAdded ? '<span class="just-added-tag">Just added</span>' : ""}
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
                    `;
                  })
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

  const justAddedMs = history
    .filter(isJustAdded)
    .map((activity) => 60_000 - (Date.now() - new Date(activity.loggedAt).getTime()));
  window.clearTimeout(window.__justAddedTimer);
  if (justAddedMs.length) {
    window.__justAddedTimer = window.setTimeout(() => {
      if (currentPersonId() === personId) renderPersonPage({ skipScroll: true });
    }, Math.max(1000, Math.min(...justAddedMs) + 50));
  }

  if (!skipScroll && !dialog.open) window.scrollTo({ top: 0, behavior: "smooth" });
  updateQuickAddButton();

  if (route?.openAdd) {
    window.history.replaceState(null, "", `#/person/${personId}`);
    // Don't reopen/reset if the log sheet is already up (e.g. mid-success).
    if (!dialog.open) {
      window.setTimeout(() => openLogDialog(personId), 0);
    }
  }
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
    const selected = button.dataset.exercise === exercise;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-selected", selected ? "true" : "false");
  });
  const tabs = $(".exercise-tabs");
  if (tabs) tabs.dataset.active = exercise;
  const quickReps = $(".quick-reps");
  if (quickReps) quickReps.dataset.active = exercise;
  $("#amount-unit").textContent = settings.unit;
  $("#reps-input").setAttribute("aria-label", settings.label);
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
    $(".slider-value span").textContent = `= ${percent}% bonus effort added`;
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
let logDialogClosing = false;

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

  personInput.value = personId;
  const person = getPerson(personId);
  $("#log-person-image").src = person.image;
  $("#log-person-image").alt = "";
  $("#activity-date-input").max = localDateValue();
  $("#activity-date-input").value = activityDate;
  $("#log-dialog-title").textContent = activity ? "+ Edit reps" : "+ Add reps";
  $("#log-form .submit-button").textContent = activity ? "SAVE CHANGES" : "ADD TO THE TOTAL";

  if (activity) {
    exerciseInput.value = activityExercise(activity);
    $("#other-input").value = activity.otherActivity || "";
    setAmount(activity.reps);
    updateExerciseFields({ keepAmount: true });
  } else {
    updateExerciseFields();
  }

  updateLogDailyGoalCard();
  dialog.classList.remove("is-closing");
  logDialogClosing = false;
  dialog.showModal();
}

function closeLogDialog() {
  if (!dialog.open || logDialogClosing) return Promise.resolve();
  logDialogClosing = true;
  editingActivityId = null;
  window.clearTimeout(logSuccessTimer);
  dialog.classList.add("is-closing");

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      dialog.removeEventListener("animationend", onEnd);
      dialog.classList.remove("is-closing");
      if (dialog.open) dialog.close();
      logDialogClosing = false;
      $("#log-success").hidden = true;
      $("#log-form").hidden = false;
      resolve();
    };
    const onEnd = (event) => {
      if (event.target !== dialog) return;
      finish();
    };
    dialog.addEventListener("animationend", onEnd);
    window.setTimeout(finish, 320);
  });
}

function showLogSuccess(personId, reps, exercise) {
  const person = getPerson(personId);
  const unit = exercise === "planks" ? "SECONDS" : exercise === "other" ? "% GOAL" : "REPS";
  const confettiColors = ["#f5c842", "#ff2d78", "#e8763a", "#f8ede1"];
  window.clearTimeout(logSuccessTimer);
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
  if (!dialog.open) dialog.showModal();

  logSuccessTimer = window.setTimeout(() => {
    closeLogDialog().then(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, 1400);
}

$("#person-log-button").addEventListener("click", () => openLogDialog(currentPersonId()));
$("#quick-add-button").addEventListener("click", () => {
  const personId = rememberedPersonId();
  if (personId) {
    window.location.hash = `/person/${personId}/add`;
    return;
  }
  openPersonPicker();
});
$("#person-picker-grid").addEventListener("click", (event) => {
  const option = event.target.closest("[data-person-id]");
  if (!option) return;
  closePersonPicker();
  window.location.hash = `/person/${option.dataset.personId}/add`;
});
$("#close-person-picker-button").addEventListener("click", () => closePersonPicker());
$("#person-picker-dialog").addEventListener("click", (event) => {
  if (event.target === $("#person-picker-dialog")) closePersonPicker();
});
$("#close-dialog-button").addEventListener("click", () => {
  closeLogDialog();
});
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeLogDialog();
});
dialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeLogDialog();
});
dialog.addEventListener("close", () => {
  editingActivityId = null;
  logDialogClosing = false;
  dialog.classList.remove("is-closing");
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

$("#reps-input").addEventListener("blur", (event) => setAmount(event.currentTarget.value));
$("#activity-date-input").addEventListener("change", () => updateLogDailyGoalCard());
$("#other-slider").addEventListener("input", (event) => {
  const percent = Number(event.currentTarget.value);
  setAmount(percent);
  $("#other-percent").textContent = `${percent}%`;
  $(".slider-value span").textContent = `= ${percent}% bonus effort added`;
});

$("#log-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const reps = Number($("#reps-input").value);
  const exercise = exerciseInput.value;
  if (!Number.isInteger(reps) || reps < 1 || reps > 1000) return;
  const personId = personInput.value;
  if (personId !== currentPersonId()) {
    closeLogDialog();
    showToast("Open a participant profile before adding activity.");
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
    showLogSuccess(personId, reps, exercise);
    render();
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

function tickOldchellaCountdown() {
  const diff = Math.max(0, OLDCHELLA_START.getTime() - Date.now());
  const dayCount = Math.floor(diff / 86400000);
  const days = $("#nav-cd-days");
  const hours = $("#nav-cd-hours");
  const mins = $("#nav-cd-mins");
  const secs = $("#nav-cd-secs");
  const goalDays = $("#goal-days-value");
  if (goalDays) {
    goalDays.textContent = String(dayCount);
    const goalDaysWrap = $("#goal-days");
    if (goalDaysWrap) {
      goalDaysWrap.setAttribute(
        "aria-label",
        dayCount === 1 ? "1 day left until Old-Chella" : `${dayCount} days left until Old-Chella`,
      );
    }
  }
  if (!days || !hours || !mins || !secs) return;
  days.textContent = String(dayCount).padStart(3, "0");
  hours.textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, "0");
  mins.textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
  secs.textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
}

$("#ripped-home-link").addEventListener("click", (event) => {
  event.preventDefault();
  window.location.hash = "";
});

window.addEventListener("hashchange", renderPersonPage);

updateExerciseFields();
render();
loadSharedState();
tickOldchellaCountdown();
window.setInterval(tickOldchellaCountdown, 1000);
