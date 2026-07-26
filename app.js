const GOAL_PER_PERSON = 10000;
const CHALLENGE_START = "2026-07-14";
const CHALLENGE_DAYS = 100;
const OLDCHELLA_START = new Date("2026-10-22T15:00:00");
const FACT_ROTATE_MS = 5600;
const THEME_STORAGE_KEY = "rippedchella-theme-v1";
const DAILY_GOALS = {
  pushups: 100,
  squats: 100,
  planks: 240,
};
const STORAGE_KEY = "oldchella-10k-activities-v3";
const STATUS_KEY = "oldchella-10k-participation-v1";
const PIN_STORAGE_PREFIX = "rippedchella-pin-v1:";
const LAST_PERSON_KEY = "rippedchella-last-person-v1";
const RULES_COLLAPSE_KEY = "rippedchella-rules-collapsed-v1";

function getPreferredTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* ignore */
  }
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const toggle = document.getElementById("theme-toggle");
  const icon =
    document.getElementById("theme-toggle-icon") ||
    toggle?.querySelector(".theme-toggle__icon");
  const meta = document.getElementById("theme-color-meta");
  const isDark = theme === "dark";
  if (icon) icon.textContent = isDark ? "light_mode" : "dark_mode";
  if (toggle) {
    toggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  }
  if (meta) meta.setAttribute("content", isDark ? "#120a06" : "#f3ebe0");
}

function initThemeToggle() {
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;
  applyTheme(getPreferredTheme());
  toggle.addEventListener("click", () => {
    const next =
      document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    applyTheme(next);
  });
}

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
let pendingPulseReveal = null;
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
  if (activityExercise(activity) === "planks") return "MIN";
  if (activityExercise(activity) === "other") return "% GOAL";
  return "REPS";
}

function formatActivityAmount(activity) {
  const reps = Number(activity.reps) || 0;
  if (activityExercise(activity) === "planks") {
    return durationNumber.format(reps / 60);
  }
  return number.format(reps);
}

function formatActivityLead(activity) {
  const amount = formatActivityAmount(activity);
  if (activityExercise(activity) === "planks") return `+${amount} MIN`;
  return `+${amount}`;
}

function formatPlankMinutes(seconds) {
  return durationNumber.format((Number(seconds) || 0) / 60);
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

const DAILY_MOTIVATION = [
  { quote: "The moment you give up is the moment you let someone else win.", by: "Kobe Bryant" },
  { quote: "Job’s not finished.", by: "Kobe Bryant" },
  { quote: "I’ve failed over and over and over again in my life. And that is why I succeed.", by: "Michael Jordan" },
  { quote: "Some people want it to happen, some wish it would happen, others make it happen.", by: "Michael Jordan" },
  { quote: "Never die easy. Cross that white line and make them tackle you.", by: "Walter Payton" },
  { quote: "When you’re good at something, you’ll tell everyone. When you’re great at something, they’ll tell you.", by: "Walter Payton" },
  { quote: "Don’t count the days; make the days count.", by: "Muhammad Ali" },
  { quote: "He who is not courageous enough to take risks will accomplish nothing in life.", by: "Muhammad Ali" },
  { quote: "A champion is defined not by their wins but by how they can recover when they fall.", by: "Serena Williams" },
  { quote: "I don’t like to lose at anything.", by: "Serena Williams" },
  { quote: "I didn’t come this far to only come this far.", by: "Tom Brady" },
  { quote: "You have to believe in what you’re doing.", by: "Magic Johnson" },
  { quote: "The greatest thing about tomorrow is I will be better than I am today.", by: "Tiger Woods" },
  { quote: "Concentration and mental toughness are the margins of victory.", by: "Bill Russell" },
  { quote: "Excellence is not a singular act but a habit.", by: "Shaquille O’Neal" },
  { quote: "You miss 100% of the shots you don’t take.", by: "Wayne Gretzky" },
];

const motivationPicks = new Map();

function pickDailyMotivation(seed = localDateValue(), personId = "") {
  const key = `${personId || "_"}:${seed}`;
  if (!motivationPicks.has(key)) {
    const index = Math.floor(Math.random() * DAILY_MOTIVATION.length);
    motivationPicks.set(key, DAILY_MOTIVATION[index]);
  }
  return motivationPicks.get(key);
}

function dayGoalSummaryCard(dayActivities, dateKey = localDateValue(), personId = "", options = {}) {
  const compact = Boolean(options.compact);
  const { totals, percents, complete } = dayGoalProgress(dayActivities);
  const { lines } = dayGoalProgressLines(dayActivities);
  const boardScore = Math.round((percents.pushups + percents.squats + percents.planks) / 3);
  const fromPercents =
    !compact && pendingPulseReveal?.previousPercents ? pendingPulseReveal.previousPercents : null;
  const meters = [
    {
      key: "pushups",
      label: "PUSH-UPS",
      value: `${number.format(totals.pushups)} / ${number.format(DAILY_GOALS.pushups)}`,
      percent: percents.pushups,
    },
    {
      key: "squats",
      label: "SQUATS",
      value: `${number.format(totals.squats)} / ${number.format(DAILY_GOALS.squats)}`,
      percent: percents.squats,
    },
    {
      key: "planks",
      label: "PLANK",
      value: `${number.format(totals.planks)} / ${number.format(DAILY_GOALS.planks)} SEC`,
      percent: percents.planks,
    },
    {
      key: "other",
      label: "WORKOUTS",
      value: `${number.format(totals.other)}% BONUS`,
      percent: percents.other,
    },
  ];

  const quote = compact
    ? ""
    : (() => {
        const motivation = pickDailyMotivation(dateKey, personId);
        return `
          <blockquote class="daily-pulse-quote">
            <p>“${escapeHtml(motivation.quote)}”</p>
            <cite>— ${escapeHtml(motivation.by)}</cite>
          </blockquote>
        `;
      })();

  const revealClass = fromPercents ? " is-revealing" : "";
  // During post-submit reveal, defer banner + share so the card keeps its pre-submit height,
  // then inject them with the enter animation once the celebration starts.
  const showCompleteChrome = complete && !compact && !fromPercents;
  const banner = showCompleteChrome
    ? `<div class="daily-pulse-banner" role="status"><span>Daily goal met</span></div>`
    : "";
  const share =
    showCompleteChrome && personId
      ? `<button type="button" class="share-whatsapp-button daily-pulse-share" data-person-id="${escapeHtml(personId)}" data-date="${escapeHtml(dateKey)}">Share to WhatsApp</button>`
      : "";

  return `
    <div class="daily-goals-card daily-pulse${compact ? " is-compact" : ""}${complete ? " is-complete" : ""}${revealClass}" aria-label="Daily goal progress: ${escapeHtml(lines.join(", "))}">
      ${banner}
      ${share}
      <div class="daily-goals-card-head">
        <p class="label">DAILY PULSE</p>
        <span class="daily-goals-complete">${complete ? "BOARD CLEARED" : `${boardScore}% LOCKED IN`}</span>
      </div>
      <div class="daily-pulse-meters">
        ${meters
          .map((meter) => {
            const to = meter.percent;
            const from = fromPercents ? Math.min(to, Number(fromPercents[meter.key]) || 0) : to;
            return `
              <div class="daily-pulse-row is-${meter.key}">
                <div class="daily-pulse-meta">
                  <span>${meter.label}</span>
                  <strong>${escapeHtml(meter.value)}</strong>
                </div>
                <div class="daily-pulse-track" aria-hidden="true">
                  <i style="width:${from}%" data-from="${from}" data-to="${to}"></i>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
      ${quote}
    </div>
  `;
}

function dayGoalBreakdown(dayActivities) {
  const { lines } = dayGoalProgressLines(dayActivities);
  return `
    <span class="history-day-breakdown" tabindex="0" aria-label="Daily goal progress: ${escapeHtml(lines.join(", "))}">
      <span class="history-day-breakdown-inline">${escapeHtml(lines.join(" / "))}</span>
      <span class="history-day-breakdown-card" role="tooltip">
        ${dayGoalSummaryCard(dayActivities, "", "", { compact: true })}
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
  const amount = formatActivityAmount(activity);
  const label = exerciseName(activity);
  const seed = String(activity.id || "").split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);

  if (exercise === "planks") {
    const lines = [
      `Fresh drop: ${first} just locked in ${amount} min of plank.`,
      `${first} banked ${amount} plank minutes. Desert stillness unlocked.`,
      `+${amount} plank minutes from ${first}. Core tax collected.`,
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
  $("#planks-total").textContent = formatPlankMinutes(categoryTotals.planks);
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
              <strong>${formatPlankMinutes(person.metrics.planks)}</strong>
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
                <p><span class="activity-reps">${formatActivityLead(activity)}</span> ${escapeHtml(exerciseName(activity))}</p>
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

function clearLogFormError() {
  const el = $("#log-form-error");
  if (!el) return;
  el.hidden = true;
  el.textContent = "";
}

function showLogFormError(message) {
  const el = $("#log-form-error");
  if (!el || !dialog.open || $("#log-form").hidden) return false;
  el.hidden = false;
  el.textContent = message;
  el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  return true;
}

function showToast(message) {
  if (showLogFormError(message)) return;
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

async function ensureApiAvailable() {
  if (apiAvailable) return true;
  return loadSharedState();
}

function parseLocalActivityFields(body) {
  const exercise = typeof body.exercise === "string" ? body.exercise : "";
  const reps = Number(body.reps);
  const otherActivity =
    typeof body.otherActivity === "string" ? body.otherActivity.trim() : "";
  const activityDate = typeof body.activityDate === "string" ? body.activityDate : "";
  const parsedActivityDate = new Date(`${activityDate}T12:00:00.000Z`);
  const allowed = new Set(["pushups", "squats", "planks", "other"]);

  if (!allowed.has(exercise)) throw new ApiError("Choose a valid activity type.", 400);
  if (!Number.isInteger(reps) || reps < 1 || reps > 1000) {
    throw new ApiError("Activity amount must be from 1 to 1,000.", 400);
  }
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(activityDate) ||
    Number.isNaN(parsedActivityDate.getTime()) ||
    parsedActivityDate.toISOString().slice(0, 10) !== activityDate
  ) {
    throw new ApiError("Choose a valid workout date.", 400);
  }
  if (activityDate > new Date().toISOString().slice(0, 10)) {
    throw new ApiError("Workout dates cannot be in the future.", 400);
  }
  if (exercise === "other" && (!otherActivity || otherActivity.length > 50)) {
    throw new ApiError("Describe the other activity in 50 characters or fewer.", 400);
  }

  return {
    exercise,
    reps,
    otherActivity: exercise === "other" ? otherActivity : "",
    percent: exercise === "other" ? reps : null,
    createdAt: parsedActivityDate.toISOString(),
  };
}

/** Local-only mutations when the shared API is offline. Session memory only — refresh resets. */
function demoRequest(path, method, personId, body) {
  if (path === "/api/participation" && method === "PUT") {
    const status = body.status === "out" ? "out" : "in";
    participation[personId] = status;
    return { status };
  }

  if (path !== "/api/activities") {
    throw new ApiError("Unsupported demo action.", 400);
  }

  if (method === "DELETE") {
    const activityId = typeof body.activityId === "string" ? body.activityId : "";
    const index = activities.findIndex(
      (activity) => activity.id === activityId && activity.personId === personId,
    );
    if (index < 0) throw new ApiError("That activity could not be found.", 404);
    activities.splice(index, 1);
    return { deletedActivityId: activityId };
  }

  const fields = parseLocalActivityFields(body);

  if (method === "PUT") {
    const activityId = typeof body.activityId === "string" ? body.activityId : "";
    const index = activities.findIndex(
      (activity) => activity.id === activityId && activity.personId === personId,
    );
    if (index < 0) throw new ApiError("That activity could not be found.", 404);
    const activity = {
      ...activities[index],
      ...fields,
      id: activityId,
      personId,
      note: activities[index].note || "",
      loggedAt: activities[index].loggedAt || new Date().toISOString(),
    };
    activities[index] = activity;
    participation[personId] = "in";
    return { activity, status: "in" };
  }

  if (method === "POST") {
    const activity = {
      id: crypto.randomUUID(),
      personId,
      note: "",
      ...fields,
      loggedAt: new Date().toISOString(),
    };
    participation[personId] = "in";
    return { activity, status: "in" };
  }

  throw new ApiError("Unsupported demo action.", 400);
}

async function protectedRequest(path, method, personId, body) {
  if (!(await ensureApiAvailable())) {
    return demoRequest(path, method, personId, body);
  }

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
    const returningHome = wasShowingPersonPage;
    wasShowingPersonPage = false;
    dashboard.hidden = false;
    personPage.hidden = true;
    updateQuickAddButton();
    if (returningHome) scrollHomeToTop();
    return;
  }

  wasShowingPersonPage = true;

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
  const todayKey = localDateValue();
  $(".personal-total").hidden = !showProgress;
  $("#person-log-button").hidden = personStats.status !== "in";
  const quickAdd = $("#person-quick-add");
  if (quickAdd) quickAdd.hidden = personStats.status !== "in";
  $("#person-total").textContent = number.format(personStats.total);
  $("#person-total-label").textContent =
    personStats.primaryType === "other" ? "TOTAL ALTERNATIVE WORK" : "PUSH-UP COUNT";
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
  $("#person-plank-minutes").innerHTML =
    `${durationNumber.format(plankMinutes)}<span class="stat-unit">MIN</span>`;
  $("#person-other-days").textContent = number.format(fullOtherDays);
  $("#person-sessions").textContent = number.format(personStats.sessions);
  $("#person-sessions-label").textContent = personStats.sessions === 1 ? "day" : "days";
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
  const historyGroups = [...historyByDate];
  if (showProgress && !historyGroups.some((group) => group.dateKey === todayKey)) {
    historyGroups.unshift({
      dateKey: todayKey,
      date: new Date(`${todayKey}T12:00:00`),
      activities: [],
    });
  }
  $("#person-activity-list").innerHTML = historyGroups.length
    ? historyGroups
        .map((group) => {
          const isToday = group.dateKey === todayKey;
          return `
            <div class="history-day${isToday ? " is-today" : ""}">
              <div class="history-date-divider">
                ${dayGoalCheck(dayGoalProgress(group.activities).complete)}
                <span class="history-day-date">${group.date.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}</span>
                <span class="history-day-rule" aria-hidden="true"></span>
                ${isToday ? "" : dayGoalBreakdown(group.activities)}
              </div>
              ${isToday ? dayGoalSummaryCard(group.activities, group.dateKey, personId) : ""}
              <div class="history-day-activities">
                ${group.activities
                  .map((activity) => {
                    const justAdded = isJustAdded(activity);
                    return `
                      <article class="activity-item is-editable${justAdded ? " is-just-added" : ""}" data-activity-id="${escapeHtml(activity.id)}" role="button" tabindex="0" aria-label="Edit ${escapeHtml(exerciseName(activity))} entry">
                        ${exerciseIcon(activity)}
                        <div class="activity-main">
                          <p><span class="activity-reps">${formatActivityLead(activity)}</span> ${escapeHtml(exerciseName(activity))}</p>
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
          `;
        })
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
const EXERCISE_ORDER = ["pushups", "squats", "planks", "other"];

function emptyLogDrafts() {
  return {
    pushups: { reps: 0 },
    squats: { reps: 0 },
    planks: { reps: 0 },
    other: { reps: 0, otherActivity: "" },
  };
}

let logDrafts = emptyLogDrafts();

function setAmount(value) {
  const max = exerciseInput.value === "other" ? 100 : 1000;
  const amount = Math.max(0, Math.min(max, Math.round(Number(value) || 0)));
  const input = $("#reps-input");
  input.value = amount;
  if (exerciseInput.value === "other") {
    input.style.width = `${Math.max(1, String(amount).length)}ch`;
  } else {
    input.style.width = "";
  }
  const minus = $("#amount-minus");
  const plus = $("#amount-plus");
  if (minus) minus.disabled = amount <= 0;
  if (plus) plus.disabled = amount >= max;
}

function nudgeAmount(delta) {
  setAmount(Number($("#reps-input").value) + delta);
  saveCurrentDraft();
}

function readCurrentExerciseDraft() {
  const exercise = exerciseInput.value;
  const reps = Math.max(0, Math.min(1000, Math.round(Number($("#reps-input").value) || 0)));
  if (exercise === "other") {
    return {
      reps: Math.max(0, Math.min(100, reps)),
      otherActivity: $("#other-input").value.trim(),
    };
  }
  return { reps };
}

function saveCurrentDraft() {
  if (editingActivityId) return;
  logDrafts[exerciseInput.value] = readCurrentExerciseDraft();
  syncDraftTabIndicators();
  updateAddSubmitLabel();
}

function draftEntries() {
  return EXERCISE_ORDER.map((exercise) => {
    const draft = logDrafts[exercise];
    const reps = Number(draft?.reps) || 0;
    if (!Number.isInteger(reps) || reps < 1 || reps > 1000) return null;
    if (exercise === "other") {
      const otherActivity = (draft.otherActivity || "").trim();
      if (!otherActivity) return { exercise, reps, otherActivity: "", invalid: "name" };
      return { exercise, reps, otherActivity };
    }
    return { exercise, reps, otherActivity: "" };
  }).filter(Boolean);
}

function syncDraftTabIndicators() {
  exerciseButtons.forEach((button) => {
    const exercise = button.dataset.exercise;
    const draft = logDrafts[exercise];
    const hasValue = Number(draft?.reps) > 0;
    button.classList.toggle("has-value", hasValue);
    if (hasValue) {
      button.setAttribute("data-draft", String(draft.reps));
      button.title = `${draft.reps} ready to add`;
    } else {
      button.removeAttribute("data-draft");
      button.removeAttribute("title");
    }
  });
}

function updateAddSubmitLabel() {
  const submitButton = $("#log-form .submit-button");
  if (!submitButton) return;
  if (editingActivityId) {
    submitButton.textContent = "SAVE CHANGES";
    return;
  }
  const count = draftEntries().filter((entry) => !entry.invalid).length;
  submitButton.textContent = count > 1 ? `ADD ${count} ACTIVITIES` : "ADD TO THE TOTAL";
}

function applyDraftToFields(exercise) {
  const draft = logDrafts[exercise] || { reps: 0, otherActivity: "" };
  if (exercise === "other") {
    $("#other-input").value = draft.otherActivity || "";
  }
  setAmount(draft.reps || 0);
}

function updateExerciseFields({ keepAmount = false } = {}) {
  const exercise = exerciseInput.value;
  const settings = {
    pushups: { label: "Push-up reps", unit: "REPS", quick: [5, 10, 25, 50] },
    squats: { label: "Squat reps", unit: "REPS", quick: [5, 10, 25, 50] },
    planks: { label: "Plank time", unit: "SECONDS", quick: [30, 60, 90, 120] },
    other: { label: "Percent of daily goal", unit: "% EFFORT", quick: [25, 50, 75, 100] },
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
  const amountValue = $(".amount-value");
  if (amountValue) amountValue.classList.toggle("is-percent", exercise === "other");
  const suffix = $("#amount-suffix");
  if (suffix) {
    suffix.hidden = exercise !== "other";
    suffix.setAttribute("aria-hidden", exercise === "other" ? "false" : "true");
  }
  $("#reps-input").setAttribute("aria-label", settings.label);
  $("#reps-input").max = exercise === "other" ? "100" : "1000";
  $("#other-field").hidden = exercise !== "other";
  $("#other-input").required = false;
  quickButtons.forEach((button, index) => {
    const amount = settings.quick[index] || 0;
    button.hidden = !amount;
    button.dataset.increment = amount;
    button.textContent = exercise === "other" ? `+${amount}%` : `+${amount}`;
  });
  if (!keepAmount) {
    setAmount(0);
  } else if (exercise === "other") {
    setAmount($("#reps-input").value);
  }
  syncDraftTabIndicators();
  updateAddSubmitLabel();
}

exerciseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.exercise === exerciseInput.value) return;
    saveCurrentDraft();
    exerciseInput.value = button.dataset.exercise;
    applyDraftToFields(exerciseInput.value);
    updateExerciseFields({ keepAmount: true });
  });
});

const dialog = $("#log-dialog");
const pinDialog = $("#pin-dialog");
let logSuccessTimer = null;
let fireworksTimer = null;
let fireworksInterval = null;
let editingActivityId = null;
let logDialogClosing = false;

function localDateValue(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function unlockLogDialogHeight() {
  dialog.style.height = "";
  dialog.style.minHeight = "";
}

function lockLogDialogHeight() {
  const form = $("#log-form");
  const success = $("#log-success");
  const otherField = $("#other-field");
  if (!form) return;

  const formHidden = form.hidden;
  const successHidden = success?.hidden;
  const otherHidden = otherField?.hidden;

  form.hidden = false;
  if (success) success.hidden = true;
  dialog.style.height = "auto";
  dialog.style.minHeight = "";

  let height = 0;
  if (otherField) {
    otherField.hidden = true;
    height = Math.max(height, dialog.getBoundingClientRect().height);
    otherField.hidden = false;
    height = Math.max(height, dialog.getBoundingClientRect().height);
    otherField.hidden = otherHidden;
  } else {
    height = dialog.getBoundingClientRect().height;
  }

  const locked = `${Math.ceil(height)}px`;
  dialog.style.height = locked;
  dialog.style.minHeight = locked;
  form.hidden = formHidden;
  if (success) success.hidden = successHidden;
}

function openLogDialog(personId, options = {}) {
  if (!personId) return;
  const activity = options.activity || null;
  const activityDate = options.activityDate || localDateValue();
  editingActivityId = activity?.id || null;
  logDrafts = emptyLogDrafts();

  clearLogCelebrations();
  unlockLogDialogHeight();
  $("#log-form").hidden = false;
  $("#log-success").hidden = true;
  $("#log-success").classList.remove("is-board-cleared");
  $("#log-form").reset();
  clearLogFormError();

  personInput.value = personId;
  const person = getPerson(personId);
  $("#log-person-image").src = person.image;
  $("#log-person-image").alt = "";
  $("#activity-date-input").max = localDateValue();
  $("#activity-date-input").value = activityDate;
  $("#log-dialog-title").textContent = activity ? "+ Edit reps" : "+ Add reps";

  if (activity) {
    exerciseInput.value = activityExercise(activity);
    $("#other-input").value = activity.otherActivity || "";
    setAmount(activity.reps);
    updateExerciseFields({ keepAmount: true });
  } else {
    exerciseInput.value = "pushups";
    updateExerciseFields();
  }
  updateAddSubmitLabel();

  dialog.classList.remove("is-closing");
  logDialogClosing = false;
  dialog.showModal();
  lockLogDialogHeight();
}

function closeLogDialog() {
  if (!dialog.open || logDialogClosing) return Promise.resolve();
  logDialogClosing = true;
  editingActivityId = null;
  clearLogCelebrations();
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
      $("#log-success").classList.remove("is-board-cleared");
      $("#log-form").hidden = false;
      unlockLogDialogHeight();
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

function personDayActivities(personId, dateKey) {
  return activities.filter(
    (activity) => activity.personId === personId && activityDateKey(activity) === dateKey,
  );
}

function personDayComplete(personId, dateKey) {
  return dayGoalProgress(personDayActivities(personId, dateKey)).complete;
}

function clearLogCelebrations() {
  window.clearTimeout(logSuccessTimer);
  window.clearTimeout(fireworksTimer);
  window.clearInterval(fireworksInterval);
  logSuccessTimer = null;
  fireworksTimer = null;
  fireworksInterval = null;
  dialog?.classList.remove("is-fireworks");
  $("#log-success")?.classList.remove("is-fireworks");
}

function createLogCelebrationFire() {
  if (typeof confetti !== "function") return null;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;

  const host = $("#success-confetti");
  host.replaceChildren();
  const canvas = document.createElement("canvas");
  host.appendChild(canvas);
  return confetti.create(canvas, { resize: true, useWorker: true });
}

function fireLogConfetti(fire = createLogCelebrationFire()) {
  if (!fire) return null;
  const colors = ["#f5c842", "#ff2d78", "#e8763a", "#f8ede1", "#c9b3ff"];

  fire({
    particleCount: 70,
    spread: 68,
    startVelocity: 42,
    gravity: 1.05,
    ticks: 200,
    origin: { x: 0.5, y: 0.55 },
    colors,
  });
  fire({
    particleCount: 28,
    angle: 60,
    spread: 48,
    startVelocity: 36,
    origin: { x: 0.12, y: 0.7 },
    colors,
  });
  fire({
    particleCount: 28,
    angle: 120,
    spread: 48,
    startVelocity: 36,
    origin: { x: 0.88, y: 0.7 },
    colors,
  });
  return fire;
}

function fireLogFireworks(fire) {
  if (!fire) return;
  dialog.classList.add("is-fireworks");
  $("#log-success")?.classList.add("is-fireworks");
  const colors = ["#f5c842", "#ff2d78", "#e8763a", "#f8ede1", "#c9b3ff", "#4cdf8a"];
  const duration = 2200;
  const end = Date.now() + duration;

  fireworksInterval = window.setInterval(() => {
    if (Date.now() > end) {
      window.clearInterval(fireworksInterval);
      fireworksInterval = null;
      return;
    }
    fire({
      particleCount: 42,
      startVelocity: 30,
      spread: 360,
      ticks: 75,
      gravity: 0.95,
      origin: { x: 0.12 + Math.random() * 0.22, y: Math.random() * 0.32 },
      colors,
    });
    fire({
      particleCount: 42,
      startVelocity: 30,
      spread: 360,
      ticks: 75,
      gravity: 0.95,
      origin: { x: 0.66 + Math.random() * 0.22, y: Math.random() * 0.32 },
      colors,
    });
  }, 260);
}

function fillNormalLogSuccess(personId, list, activityDate = localDateValue()) {
  const person = getPerson(personId);
  $("#success-eyebrow").textContent = "ACTIVITY ADDED";
  if (list.length === 1) {
    const entry = list[0];
    const amount =
      entry.exercise === "planks" ? formatPlankMinutes(entry.reps) : number.format(entry.reps);
    const unit = entry.exercise === "planks" ? "MIN" : entry.exercise === "other" ? "% GOAL" : "REPS";
    $("#success-amount").textContent = `+${amount}`;
    $("#success-unit").textContent = unit;
    $("#success-copy").textContent = `Added to ${person.name.split(" ")[0]}’s personal progress.`;
  } else {
    $("#success-amount").textContent = `+${list.length}`;
    $("#success-unit").textContent = "ACTIVITIES";
    $("#success-copy").textContent = list
      .map((entry) => {
        const label =
          entry.exercise === "pushups"
            ? "push-ups"
            : entry.exercise === "squats"
              ? "squats"
              : entry.exercise === "planks"
                ? "plank"
                : entry.otherActivity || "other";
        const amount =
          entry.exercise === "planks" ? formatPlankMinutes(entry.reps) : number.format(entry.reps);
        const unit = entry.exercise === "planks" ? "min" : "";
        return `+${amount}${unit ? ` ${unit}` : ""} ${label}`;
      })
      .join(" · ");
  }
  setSuccessRemainingMessage(personId, activityDate);
}

function dailyGoalRemainingParts(personId, dateKey) {
  const { totals, complete } = dayGoalProgress(personDayActivities(personId, dateKey));
  if (complete) return [];
  const parts = [];
  const pushLeft = Math.max(0, DAILY_GOALS.pushups - totals.pushups);
  const squatLeft = Math.max(0, DAILY_GOALS.squats - totals.squats);
  const plankLeft = Math.max(0, DAILY_GOALS.planks - totals.planks);
  if (pushLeft) parts.push(`${number.format(pushLeft)} push-up${pushLeft === 1 ? "" : "s"}`);
  if (squatLeft) parts.push(`${number.format(squatLeft)} squat${squatLeft === 1 ? "" : "s"}`);
  if (plankLeft) {
    if (plankLeft >= 60 && plankLeft % 60 === 0) {
      const mins = plankLeft / 60;
      parts.push(`${durationNumber.format(mins)} min plank`);
    } else {
      parts.push(`${number.format(plankLeft)} sec plank`);
    }
  }
  return parts;
}

function setSuccessRemainingMessage(personId, dateKey, { boardCleared = false } = {}) {
  const remaining = $("#success-remaining");
  if (!remaining) return;
  if (boardCleared) {
    remaining.hidden = true;
    remaining.textContent = "";
    return;
  }
  const parts = dailyGoalRemainingParts(personId, dateKey);
  if (!parts.length) {
    remaining.hidden = true;
    remaining.textContent = "";
    return;
  }
  remaining.hidden = false;
  remaining.textContent = `${parts.join(" · ")} left today`;
}

function scrollPersonLogButtonIntoView() {
  const button = $("#person-log-button");
  if (!button || button.hidden) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const navHeight = $(".site-nav")?.offsetHeight || 64;
  const top = Math.max(0, button.getBoundingClientRect().top + window.scrollY - navHeight - 10);
  window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
}

function revealDailyPulseAfterLog() {
  const pulse = $(".history-day.is-today .daily-pulse:not(.is-compact)");
  if (!pulse) {
    pendingPulseReveal = null;
    return;
  }

  const fills = [...pulse.querySelectorAll(".daily-pulse-track i")];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const showBanner = Boolean(
    pendingPulseReveal?.boardCleared || pulse.classList.contains("is-complete"),
  );

  if (showBanner) {
    pulse.classList.add("is-complete");
  }

  // Lock pre-celebration height so injecting banner/share at 0 doesn't jump layout early.
  const lockedHeight = pulse.offsetHeight;
  pulse.style.minHeight = `${lockedHeight}px`;

  fills.forEach((fill) => {
    const from = Number(fill.dataset.from) || 0;
    fill.style.width = `${from}%`;
  });

  pulse.classList.add("is-revealing");
  // Force layout so the slide/fill transitions run from the starting state.
  void pulse.offsetWidth;

  const run = () => {
    if (showBanner) {
      let banner = pulse.querySelector(".daily-pulse-banner");
      if (!banner) {
        banner = document.createElement("div");
        banner.className = "daily-pulse-banner is-entering";
        banner.setAttribute("role", "status");
        banner.innerHTML = "<span>Daily goal met</span>";
        pulse.insertBefore(banner, pulse.firstChild);
        void banner.offsetWidth;
      }
      banner.classList.add("is-in");

      let share = pulse.querySelector(".daily-pulse-share");
      if (!share) {
        const personId = pendingPulseReveal?.personId || currentPersonId();
        const dateKey = pendingPulseReveal?.activityDate || localDateValue();
        share = document.createElement("button");
        share.type = "button";
        share.className = "share-whatsapp-button daily-pulse-share is-entering";
        share.dataset.personId = personId;
        share.dataset.date = dateKey;
        share.textContent = "Share to WhatsApp";
        banner.insertAdjacentElement("afterend", share);
        void share.offsetWidth;
      }
      share.classList.add("is-in");
      pendingShareGoal = {
        personId: share.dataset.personId,
        activityDate: share.dataset.date,
      };
      ensureDailyGoalShareBlob(share.dataset.personId, share.dataset.date).catch(() => {});
    }
    pulse.classList.add("is-animating");
    fills.forEach((fill) => {
      const to = Number(fill.dataset.to) || 0;
      fill.style.width = `${to}%`;
      fill.classList.toggle("is-maxed", to >= 100);
    });
    if (pendingPulseReveal?.boardCleared) pulse.classList.add("is-board-burst");
    window.setTimeout(() => {
      pulse.classList.remove("is-revealing", "is-animating", "is-board-burst");
      pulse.style.minHeight = "";
      const banner = pulse.querySelector(".daily-pulse-banner");
      if (banner) banner.classList.remove("is-entering", "is-in");
      const share = pulse.querySelector(".daily-pulse-share");
      if (share) share.classList.remove("is-entering", "is-in");
      fills.forEach((fill) => fill.classList.remove("is-maxed"));
      pendingPulseReveal = null;
    }, reduceMotion ? 0 : 4200);
  };

  if (reduceMotion) {
    run();
    return;
  }
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(run);
  });
}

function queuePulseReveal(personId, activityDate, boardCleared, previousPercents) {
  pendingPulseReveal = {
    personId,
    activityDate,
    boardCleared,
    previousPercents: { ...previousPercents },
  };
}

function loadShareImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Avatar could not be loaded."));
    image.src = src;
  });
}

function drawCoverImage(ctx, image, x, y, size) {
  const srcW = image.naturalWidth || image.width;
  const srcH = image.naturalHeight || image.height;
  if (!srcW || !srcH) return;
  const side = Math.min(srcW, srcH);
  const sx = (srcW - side) / 2;
  const sy = (srcH - side) / 2;
  ctx.drawImage(image, sx, sy, side, side, x, y, size, size);
}

function personChallengeStats(personId) {
  const personStats = totalsByPerson().find((entry) => entry.id === personId);
  const history = activities.filter((activity) => activity.personId === personId);
  const sessionDays = { pushups: new Set(), squats: new Set(), planks: new Set(), other: new Set() };
  history.forEach((activity) => {
    sessionDays[activityExercise(activity)].add(activity.createdAt.slice(0, 10));
  });
  const averageFor = (exercise, value) => {
    const days = sessionDays[exercise].size;
    return days ? value / days : 0;
  };
  const metrics = personStats?.metrics || { pushups: 0, squats: 0, planks: 0, other: 0 };
  const plankMinutes = metrics.planks / 60;
  const fullOtherDays = new Set(
    history
      .filter(
        (activity) =>
          activityExercise(activity) === "other" &&
          Number(activity.percent ?? activity.reps) >= 100,
      )
      .map((activity) => activity.createdAt.slice(0, 10)),
  ).size;
  return {
    pushups: metrics.pushups,
    squats: metrics.squats,
    plankMinutes,
    workouts: fullOtherDays,
    avgPushups: Math.round(averageFor("pushups", metrics.pushups)),
    avgSquats: Math.round(averageFor("squats", metrics.squats)),
    avgPlanks: averageFor("planks", plankMinutes),
    avgOther: Math.round(averageFor("other", metrics.other)),
  };
}

function roundRectPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawShareBar(ctx, x, y, width, height, percent, colors) {
  const radius = height / 2;
  roundRectPath(ctx, x, y, width, height, radius);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fill();
  const fillWidth = Math.max(height, (width * Math.min(100, percent)) / 100);
  const gradient = ctx.createLinearGradient(x, y, x + fillWidth, y);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(1, colors[1]);
  roundRectPath(ctx, x, y, fillWidth, height, radius);
  ctx.fillStyle = gradient;
  ctx.fill();
}

async function buildDailyGoalMetImage(personId, dateKey) {
  const person = getPerson(personId);
  const dayActivities = personDayActivities(personId, dateKey);
  const { totals, percents } = dayGoalProgress(dayActivities);
  const width = 1080;
  const height = 1450;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#1a0f0a");
  bg.addColorStop(0.55, "#120a06");
  bg.addColorStop(1, "#1c100c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Card panel
  const cardX = 64;
  const cardY = 72;
  const cardPad = 48;
  const footerH = 118;
  const cardW = width - 128;
  const cardH = height - cardY - footerH;
  roundRectPath(ctx, cardX, cardY, cardW, cardH, 36);
  ctx.fillStyle = "rgba(18, 10, 8, 0.92)";
  ctx.fill();
  ctx.strokeStyle = "rgba(76, 223, 138, 0.45)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Soft lavender wash
  const wash = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + 320);
  wash.addColorStop(0, "rgba(201, 179, 255, 0.12)");
  wash.addColorStop(1, "transparent");
  roundRectPath(ctx, cardX, cardY, cardW, cardH, 36);
  ctx.fillStyle = wash;
  ctx.fill();

  // Avatar top-left
  const avatarSize = 132;
  const avatarX = cardX + cardPad;
  const avatarY = cardY + cardPad;
  try {
    const avatar = await loadShareImage(person.image);
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    drawCoverImage(ctx, avatar, avatarX, avatarY, avatarSize);
    ctx.restore();
  } catch {
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = "#2a160d";
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(245, 200, 66, 0.45)";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Name
  ctx.fillStyle = "#fdf0e0";
  ctx.font = "800 54px Manrope, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(person.name, avatarX + avatarSize + 36, avatarY + avatarSize / 2 - 12);
  ctx.fillStyle = "#c9b3ff";
  ctx.font = "700 24px Manrope, sans-serif";
  ctx.fillText("BOARD CLEARED", avatarX + avatarSize + 36, avatarY + avatarSize / 2 + 34);

  // Daily goal met banner
  const bannerY = avatarY + avatarSize + 48;
  const bannerH = 86;
  roundRectPath(ctx, cardX + 48, bannerY, cardW - 96, bannerH, 22);
  const bannerGrad = ctx.createLinearGradient(cardX + 48, bannerY, cardX + cardW - 48, bannerY);
  bannerGrad.addColorStop(0, "rgba(76, 223, 138, 0.28)");
  bannerGrad.addColorStop(0.55, "rgba(245, 200, 66, 0.14)");
  bannerGrad.addColorStop(1, "rgba(76, 223, 138, 0.2)");
  ctx.fillStyle = bannerGrad;
  ctx.fill();
  ctx.strokeStyle = "rgba(76, 223, 138, 0.5)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#b8f5c8";
  ctx.font = "800 34px Manrope, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("DAILY GOAL MET", width / 2, bannerY + bannerH / 2 + 2);
  ctx.textAlign = "left";

  // Pulse header
  let y = bannerY + bannerH + 56;
  ctx.fillStyle = "#c9b3ff";
  ctx.font = "800 26px Manrope, sans-serif";
  ctx.fillText("DAILY PULSE", cardX + 48, y);
  ctx.fillStyle = "#4cdf8a";
  ctx.textAlign = "right";
  ctx.fillText("BOARD CLEARED", cardX + cardW - 48, y);
  ctx.textAlign = "left";

  const rows = [
    {
      label: "PUSH-UPS",
      value: `${number.format(totals.pushups)} / ${number.format(DAILY_GOALS.pushups)}`,
      percent: percents.pushups,
      colors: ["#ff2d78", "#ff6b9d"],
    },
    {
      label: "SQUATS",
      value: `${number.format(totals.squats)} / ${number.format(DAILY_GOALS.squats)}`,
      percent: percents.squats,
      colors: ["#e8763a", "#f0a06a"],
    },
    {
      label: "PLANK",
      value: `${number.format(totals.planks)} / ${number.format(DAILY_GOALS.planks)} SEC`,
      percent: percents.planks,
      colors: ["#d4a017", "#f5c842"],
    },
  ];

  y += 48;
  rows.forEach((row) => {
    ctx.fillStyle = "#7a5c48";
    ctx.font = "700 22px Manrope, sans-serif";
    ctx.fillText(row.label, cardX + 48, y);
    ctx.fillStyle = "#fdf0e0";
    ctx.font = "700 28px Manrope, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(row.value, cardX + cardW - 48, y);
    ctx.textAlign = "left";
    drawShareBar(ctx, cardX + 48, y + 18, cardW - 96, 18, row.percent, row.colors);
    y += 96;
  });

  // Quote block
  y += 24;
  roundRectPath(ctx, cardX + 48, y, cardW - 96, 170, 24);
  ctx.fillStyle = "rgba(201, 179, 255, 0.06)";
  ctx.fill();
  const motivation = pickDailyMotivation(dateKey, personId);
  ctx.fillStyle = "#fdf0e0";
  ctx.font = "italic 300 36px 'Cormorant Garamond', Georgia, serif";
  const quote = `“${motivation.quote}”`;
  const maxQuoteWidth = cardW - 144;
  const words = quote.split(" ");
  let line = "";
  let quoteY = y + 56;
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxQuoteWidth && line) {
      ctx.fillText(line, cardX + 72, quoteY);
      quoteY += 44;
      line = word;
    } else {
      line = test;
    }
  });
  if (line) ctx.fillText(line, cardX + 72, quoteY);
  ctx.fillStyle = "#c9b3ff";
  ctx.font = "700 22px Manrope, sans-serif";
  ctx.fillText(`— ${motivation.by.toUpperCase()}`, cardX + 72, y + 148);

  // Challenge totals (personal breakdown)
  const stats = personChallengeStats(personId);
  const statsX = cardX + cardPad;
  const statsW = cardW - cardPad * 2;
  const statsTop = y + 170 + 36;
  const statsBottom = cardY + cardH - cardPad;
  const statsH = Math.max(0, statsBottom - statsTop);
  roundRectPath(ctx, statsX, statsTop, statsW, statsH, 28);
  ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
  ctx.fill();
  ctx.strokeStyle = "rgba(122, 92, 72, 0.4)";
  ctx.lineWidth = 2;
  ctx.stroke();

  const cols = [
    {
      label: "PUSH-UPS",
      value: number.format(stats.pushups),
      avg: number.format(stats.avgPushups),
    },
    {
      label: "SQUATS",
      value: number.format(stats.squats),
      avg: number.format(stats.avgSquats),
    },
    {
      label: "PLANKS",
      value: durationNumber.format(stats.plankMinutes),
      unit: "MIN",
      avg: durationNumber.format(stats.avgPlanks),
    },
    {
      label: "WORKOUTS",
      value: number.format(stats.workouts),
      avg: number.format(stats.avgOther),
    },
  ];
  const colW = statsW / cols.length;
  const labelY = statsTop + statsH * 0.18;
  const valueY = statsTop + statsH * 0.42;
  const ruleY = statsTop + statsH * 0.58;
  const avgLabelY = statsTop + statsH * 0.72;
  const avgValueY = statsTop + statsH * 0.88;

  cols.forEach((col, index) => {
    const left = statsX + colW * index;
    const cx = left + colW / 2;
    if (index > 0) {
      ctx.beginPath();
      ctx.moveTo(left, statsTop + 28);
      ctx.lineTo(left, statsTop + statsH - 28);
      ctx.strokeStyle = "rgba(122, 92, 72, 0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#7a5c48";
    ctx.font = "700 20px Manrope, sans-serif";
    ctx.fillText(col.label, cx, labelY);

    ctx.fillStyle = "#fdf0e0";
    ctx.font = "800 52px Manrope, sans-serif";
    if (col.unit) {
      const valueWidth = ctx.measureText(col.value).width;
      ctx.font = "800 22px Manrope, sans-serif";
      const unitWidth = ctx.measureText(col.unit).width;
      const totalWidth = valueWidth + 10 + unitWidth;
      const startX = cx - totalWidth / 2;
      ctx.textAlign = "left";
      ctx.font = "800 52px Manrope, sans-serif";
      ctx.fillText(col.value, startX, valueY);
      ctx.fillStyle = "#7a5c48";
      ctx.font = "800 22px Manrope, sans-serif";
      ctx.fillText(col.unit, startX + valueWidth + 10, valueY + 6);
      ctx.textAlign = "center";
    } else {
      ctx.fillText(col.value, cx, valueY);
    }

    ctx.beginPath();
    ctx.moveTo(left + 28, ruleY);
    ctx.lineTo(left + colW - 28, ruleY);
    ctx.strokeStyle = "rgba(122, 92, 72, 0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#7a5c48";
    ctx.font = "700 18px Manrope, sans-serif";
    ctx.fillText("DAILY AVG", cx, avgLabelY);
    ctx.fillStyle = "#fdf0e0";
    ctx.font = "800 34px Manrope, sans-serif";
    ctx.fillText(col.avg, cx, avgValueY);
  });
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  // Footer
  const dateLabel = new Date(`${dateKey}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  ctx.fillStyle = "#7a5c48";
  ctx.font = "700 24px Manrope, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(dateLabel.toUpperCase(), width / 2, height - 70);
  ctx.fillStyle = "#c4a882";
  ctx.font = "700 26px Manrope, sans-serif";
  ctx.fillText("rippedchella.vercel.app", width / 2, height - 36);
  ctx.textAlign = "left";

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("Share image could not be created."));
      else resolve(blob);
    }, "image/png");
  });
}

function buildDailyGoalShareCaption(personId, dateKey) {
  const person = getPerson(personId);
  const { totals } = dayGoalProgress(personDayActivities(personId, dateKey));
  const first = person.name.split(" ")[0];
  const plankMin = formatPlankMinutes(totals.planks);
  return `${first} cleared the board — ${number.format(totals.pushups)} push-ups, ${number.format(totals.squats)} squats, ${plankMin} min plank. rippedchella.vercel.app`;
}

let pendingShareGoal = null;
let pendingShareBlob = null;
let pendingShareBlobPromise = null;

function downloadShareBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function openWhatsAppCaption(caption) {
  const href = `https://wa.me/?text=${encodeURIComponent(caption)}`;
  const link = document.createElement("a");
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function ensureDailyGoalShareBlob(personId, dateKey) {
  if (
    pendingShareBlob &&
    pendingShareGoal?.personId === personId &&
    pendingShareGoal?.activityDate === dateKey
  ) {
    return pendingShareBlob;
  }
  if (
    pendingShareBlobPromise &&
    pendingShareGoal?.personId === personId &&
    pendingShareGoal?.activityDate === dateKey
  ) {
    return pendingShareBlobPromise;
  }
  pendingShareBlobPromise = buildDailyGoalMetImage(personId, dateKey)
    .then((blob) => {
      pendingShareBlob = blob;
      return blob;
    })
    .finally(() => {
      pendingShareBlobPromise = null;
    });
  return pendingShareBlobPromise;
}

async function shareDailyGoalMetToWhatsApp(personId, dateKey, buttonEl = null) {
  const button = buttonEl || document.querySelector(".daily-pulse-share");
  if (button) {
    button.disabled = true;
    button.textContent = "Preparing…";
  }
  try {
    const blob = await ensureDailyGoalShareBlob(personId, dateKey);
    const file = new File([blob], `rippedchella-daily-goal-${dateKey}.png`, { type: "image/png" });
    const caption = buildDailyGoalShareCaption(personId, dateKey);
    const canShareFiles =
      typeof navigator.share === "function" &&
      (!navigator.canShare || navigator.canShare({ files: [file] }));

    if (canShareFiles) {
      await navigator.share({
        files: [file],
        title: "Daily goal met",
        text: caption,
      });
      return true;
    }

    if (typeof navigator.share === "function") {
      downloadShareBlob(blob, file.name);
      try {
        await navigator.share({ title: "Daily goal met", text: caption });
        showToast("Image saved — attach the download in WhatsApp.");
        return true;
      } catch (error) {
        if (error?.name === "AbortError") return false;
      }
    }

    downloadShareBlob(blob, file.name);
    openWhatsAppCaption(caption);
    showToast("Image saved — attach it in WhatsApp.");
    return true;
  } catch (error) {
    if (error?.name === "AbortError") return false;
    showToast(error.message || "Could not share to WhatsApp.");
    return false;
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Share to WhatsApp";
    }
  }
}

function showLogSuccess(personId, entries, options = {}) {
  const list = Array.isArray(entries) ? entries : [entries];
  const boardCleared = Boolean(options.boardCleared);
  const activityDate = options.activityDate || localDateValue();
  clearLogCelebrations();

  const form = $("#log-form");
  const success = $("#log-success");
  success.classList.toggle("is-board-cleared", boardCleared);
  pendingShareGoal = boardCleared ? { personId, activityDate } : null;
  pendingShareBlob = null;
  pendingShareBlobPromise = null;

  if (boardCleared) {
    $("#success-eyebrow").textContent = "BOARD CLEARED";
    $("#success-amount").textContent = "LET'S F@#%!ING GO!";
    $("#success-unit").textContent = "PUSH · SQUAT · PLANK";
    $("#success-copy").textContent =
      list.length === 1
        ? "Daily goals locked in. Absolute menace."
        : `${list.length} activities in — daily goals locked in.`;
    setSuccessRemainingMessage(personId, activityDate, { boardCleared: true });
    ensureDailyGoalShareBlob(personId, activityDate).catch(() => {});
  } else {
    fillNormalLogSuccess(personId, list, activityDate);
  }

  form.hidden = true;
  success.hidden = false;
  if (!dialog.open) {
    dialog.showModal();
    lockLogDialogHeight();
  }

  const fire = fireLogConfetti();
  if (boardCleared && fire) {
    fireworksTimer = window.setTimeout(() => fireLogFireworks(fire), 650);
  }

  logSuccessTimer = window.setTimeout(() => {
    closeLogDialog().then(() => {
      scrollPersonLogButtonIntoView();
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.setTimeout(() => revealDailyPulseAfterLog(), reduceMotion ? 40 : 560);
    });
  }, boardCleared ? 6300 : 2700);
}

$("#person-log-button").addEventListener("click", () => openLogDialog(currentPersonId()));

async function quickAddActivity(button) {
  const personId = currentPersonId();
  if (!personId || !button || button.classList.contains("is-success")) return;
  const exercise = button.dataset.quickExercise;
  const reps = Number(button.dataset.quickReps);
  const otherActivity = button.dataset.quickOther || "";
  if (!exercise || !Number.isInteger(reps) || reps < 1) return;

  const activityDate = localDateValue();
  const previousPercents = dayGoalProgress(personDayActivities(personId, activityDate)).percents;
  const wasComplete = personDayComplete(personId, activityDate);
  const grid = button.closest(".person-quick-add-grid");
  const buttons = grid ? [...grid.querySelectorAll("button")] : [button];
  buttons.forEach((entry) => {
    entry.disabled = true;
  });
  try {
    const result = await protectedRequest("/api/activities", "POST", personId, {
      exercise,
      otherActivity: exercise === "other" ? otherActivity || "Workout" : "",
      reps,
      activityDate,
    });
    if (!result) {
      buttons.forEach((entry) => {
        entry.disabled = false;
      });
      return;
    }
    activities.push(result.activity);
    participation[personId] = result.status;
    const boardCleared = !wasComplete && personDayComplete(personId, activityDate);
    queuePulseReveal(personId, activityDate, boardCleared, previousPercents);
    playQuickAddButtonSuccess(button, { boardCleared });
    render();

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      scrollDailyPulseIntoView();
      window.setTimeout(() => revealDailyPulseAfterLog(), reduceMotion ? 40 : 280);
    }, reduceMotion ? 60 : 420);

    window.setTimeout(
      () => {
        clearQuickAddButtonSuccess(button);
        buttons.forEach((entry) => {
          entry.disabled = false;
        });
      },
      reduceMotion ? 900 : boardCleared ? 2400 : 1800,
    );
  } catch (error) {
    showToast(error.message || "Activity could not be saved.");
    buttons.forEach((entry) => {
      entry.disabled = false;
    });
  }
}

function playQuickAddButtonSuccess(button, { boardCleared = false } = {}) {
  if (!button) return;
  if (!button.dataset.quickLabelHtml) {
    button.dataset.quickLabelHtml = button.innerHTML;
  }
  button.classList.add("is-success");
  button.classList.toggle("is-board-cleared", boardCleared);
  button.innerHTML = `
    <span class="quick-add-confetti" aria-hidden="true"></span>
    <strong>✓</strong>
    <span>${boardCleared ? "CLEARED" : "ADDED"}</span>
  `;
  fireQuickAddConfetti(button.querySelector(".quick-add-confetti"), { boardCleared });
}

function clearQuickAddButtonSuccess(button) {
  if (!button) return;
  button.classList.remove("is-success", "is-board-cleared");
  if (button.dataset.quickLabelHtml) {
    button.innerHTML = button.dataset.quickLabelHtml;
    delete button.dataset.quickLabelHtml;
  }
}

function fireQuickAddConfetti(host, { boardCleared = false } = {}) {
  if (!host || typeof confetti !== "function") return null;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  host.replaceChildren();
  const canvas = document.createElement("canvas");
  host.appendChild(canvas);
  const fire = confetti.create(canvas, { resize: true, useWorker: true });
  const colors = boardCleared
    ? ["#f5c842", "#ff2d78", "#e8763a", "#4cdf8a", "#c9b3ff"]
    : ["#f5c842", "#e8763a", "#4cdf8a", "#f8ede1"];
  fire({
    particleCount: boardCleared ? 28 : 18,
    spread: boardCleared ? 70 : 55,
    startVelocity: boardCleared ? 22 : 16,
    gravity: 1.15,
    ticks: 120,
    scalar: 0.7,
    origin: { x: 0.5, y: 0.65 },
    colors,
  });
  return fire;
}

function scrollDailyPulseIntoView() {
  const pulse =
    $(".history-day.is-today .daily-pulse:not(.is-compact)") || $(".history-day.is-today");
  if (!pulse) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const navHeight = $(".site-nav")?.offsetHeight || 64;
  const top = Math.max(0, pulse.getBoundingClientRect().top + window.scrollY - navHeight - 12);
  window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
}

$("#person-quick-add")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-quick-exercise]");
  if (!button) return;
  quickAddActivity(button);
});

document.addEventListener("click", async (event) => {
  const shareButton = event.target.closest(".daily-pulse-share");
  if (!shareButton) return;
  const personId = shareButton.dataset.personId;
  const activityDate = shareButton.dataset.date;
  if (!personId || !activityDate) return;
  pendingShareGoal = { personId, activityDate };
  await shareDailyGoalMetToWhatsApp(personId, activityDate, shareButton);
});
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
    saveCurrentDraft();
  });
});

$("#amount-minus")?.addEventListener("click", () => nudgeAmount(-1));
$("#amount-plus")?.addEventListener("click", () => nudgeAmount(1));

$("#reps-input").addEventListener("input", () => {
  saveCurrentDraft();
});
$("#reps-input").addEventListener("blur", (event) => {
  setAmount(event.currentTarget.value);
  saveCurrentDraft();
});
$("#activity-date-input").addEventListener("change", () => {
  saveCurrentDraft();
});
$("#other-input").addEventListener("input", () => {
  saveCurrentDraft();
});

$("#log-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const personId = personInput.value;
  clearLogFormError();
  if (personId !== currentPersonId()) {
    closeLogDialog();
    showToast("Open a participant profile before adding activity.");
    return;
  }

  const submitButton = form.querySelector(".submit-button");
  const activityId = editingActivityId;
  submitButton.disabled = true;
  try {
    if (activityId) {
      const reps = Number($("#reps-input").value);
      const exercise = exerciseInput.value;
      if (!Number.isInteger(reps) || reps < 1 || reps > 1000) {
        showToast("Enter an amount from 1 to 1,000.");
        return;
      }
      if (exercise === "other" && !$("#other-input").value.trim()) {
        showToast("Name your other activity.");
        return;
      }
      const activityDate = $("#activity-date-input").value;
      const previousPercents = dayGoalProgress(personDayActivities(personId, activityDate)).percents;
      const wasComplete = personDayComplete(personId, activityDate);
      const result = await protectedRequest("/api/activities", "PUT", personId, {
        activityId,
        exercise,
        otherActivity: exercise === "other" ? $("#other-input").value.trim() : "",
        reps,
        activityDate,
      });
      if (!result) return;

      const index = activities.findIndex((entry) => entry.id === activityId);
      if (index >= 0) activities[index] = result.activity;
      else activities.push(result.activity);
      participation[personId] = result.status;
      editingActivityId = null;
      const boardCleared = !wasComplete && personDayComplete(personId, activityDate);
      queuePulseReveal(personId, activityDate, boardCleared, previousPercents);
      showLogSuccess(
        personId,
        [{ exercise, reps, otherActivity: result.activity.otherActivity || "" }],
        { boardCleared, activityDate },
      );
      render();
      return;
    }

    saveCurrentDraft();
    const entries = draftEntries();
    const missingName = entries.find((entry) => entry.invalid === "name");
    if (missingName) {
      exerciseInput.value = "other";
      applyDraftToFields("other");
      updateExerciseFields({ keepAmount: true });
      showToast("Name your other activity.");
      $("#other-input").focus();
      return;
    }
    const toAdd = entries.filter((entry) => !entry.invalid);
    if (!toAdd.length) {
      showToast("Add an amount for at least one workout type.");
      return;
    }

    const activityDate = $("#activity-date-input").value;
    const previousPercents = dayGoalProgress(personDayActivities(personId, activityDate)).percents;
    const wasComplete = personDayComplete(personId, activityDate);
    const added = [];
    try {
      for (const entry of toAdd) {
        const result = await protectedRequest("/api/activities", "POST", personId, {
          exercise: entry.exercise,
          otherActivity: entry.otherActivity,
          reps: entry.reps,
          activityDate,
        });
        if (!result) {
          if (added.length) {
            render();
            showToast(
              added.length === 1
                ? "Saved 1 activity. Remaining entries were not added."
                : `Saved ${added.length} activities. Remaining entries were not added.`,
            );
          }
          return;
        }
        activities.push(result.activity);
        participation[personId] = result.status;
        added.push(entry);
      }
    } catch (error) {
      if (added.length) render();
      throw error;
    }

    logDrafts = emptyLogDrafts();
    const boardCleared = !wasComplete && personDayComplete(personId, activityDate);
    queuePulseReveal(personId, activityDate, boardCleared, previousPercents);
    showLogSuccess(personId, added, { boardCleared, activityDate });
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
        `Delete this ${formatActivityAmount(activity)} ${exerciseUnit(activity).toLowerCase()} ${exerciseName(activity).toLowerCase()} entry?`,
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

function scrollHomeToTop() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? "auto" : "smooth" });
}

$("#ripped-home-link").addEventListener("click", (event) => {
  event.preventDefault();
  window.location.hash = "";
  scrollHomeToTop();
});

window.addEventListener("hashchange", renderPersonPage);

function isCookiedVisitor() {
  try {
    if (localStorage.getItem(LAST_PERSON_KEY)) return true;
    if (localStorage.getItem(STORAGE_KEY) || localStorage.getItem(STATUS_KEY)) return true;
    if (localStorage.getItem(RULES_COLLAPSE_KEY) !== null) return true;
    return crew.some((person) => Boolean(storedPin(person.id)));
  } catch {
    return false;
  }
}

let wasShowingPersonPage = Boolean(parsePersonRoute());
let homeNestleDone = false;

function nestleReadyToGoUnit({ force = false } = {}) {
  if (currentPersonId() || !isCookiedVisitor()) return;
  if (!force && homeNestleDone) return;
  const target = $("#hero-quick-add");
  if (!target || target.hidden) return;
  homeNestleDone = true;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const run = () => {
    if (currentPersonId() || target.hidden) return;
    const navHeight = $(".site-nav")?.offsetHeight || 64;
    const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - navHeight - 12);
    if (Math.abs(window.scrollY - top) < 6) return;
    window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
  };

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(run);
  });
}

function rulesShouldStartCollapsed() {
  try {
    const saved = localStorage.getItem(RULES_COLLAPSE_KEY);
    if (saved === "1") return true;
    if (saved === "0") return false;
    return isCookiedVisitor();
  } catch {
    return false;
  }
}

function setRulesCollapsed(collapsed) {
  const card = $("#rules-card");
  const toggle = $("#rules-toggle");
  if (!card || !toggle) return;
  card.classList.toggle("is-collapsed", collapsed);
  toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
  toggle.setAttribute("aria-label", collapsed ? "Expand our goal" : "Collapse our goal");
  try {
    localStorage.setItem(RULES_COLLAPSE_KEY, collapsed ? "1" : "0");
  } catch {
    // Preference is optional if storage is blocked.
  }
}

function initRulesCollapse() {
  const toggle = $("#rules-toggle");
  if (!toggle) return;
  setRulesCollapsed(rulesShouldStartCollapsed());
  toggle.addEventListener("click", () => {
    setRulesCollapsed(!$("#rules-card")?.classList.contains("is-collapsed"));
  });
}

updateExerciseFields();
initThemeToggle();
initRulesCollapse();
render();
nestleReadyToGoUnit();
loadSharedState();
tickOldchellaCountdown();
window.setInterval(tickOldchellaCountdown, 1000);
