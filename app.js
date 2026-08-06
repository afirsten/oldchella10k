const GOAL_PER_PERSON = 10000;
const CHALLENGE_START = "2026-07-14";
const CHALLENGE_DAYS = 100;
const WEIGHT_MIN_LB = 99;
const WEIGHT_MAX_LB = 333;
const OLDCHELLA_START = new Date("2026-10-22T15:00:00");
const OLD_CHELLA_URL = "https://goingtoliveforever.com/";
const RECIPES_SHEET_ID = "1UkuA5apWL5PZ2XQkZP_r9horqKtial1FCrk5Vn3HK88";
const RECIPES_SHEET_GID = "0";
const INSPIRATION_SHEET_GID = "1013060614";
const RECIPES_SHEET_URL = `https://docs.google.com/spreadsheets/d/${RECIPES_SHEET_ID}/edit?usp=sharing`;
const RECIPES_CSV_URL = `https://docs.google.com/spreadsheets/d/${RECIPES_SHEET_ID}/export?format=csv&gid=${RECIPES_SHEET_GID}`;
const RECIPES_CSV_FALLBACK_URL = `https://docs.google.com/spreadsheets/d/${RECIPES_SHEET_ID}/gviz/tq?tqx=out:csv&gid=${RECIPES_SHEET_GID}`;
const INSPIRATION_CSV_URL = `https://docs.google.com/spreadsheets/d/${RECIPES_SHEET_ID}/gviz/tq?tqx=out:csv&gid=${INSPIRATION_SHEET_GID}`;
const FACT_ROTATE_MS = 11200;
const THEME_STORAGE_KEY = "rippedchella-theme-v1";
const DAILY_GOALS = {
  pushups: 100,
  squats: 100,
  planks: 240,
};
/** 30 min misc timed ≈ 100% Other / 100 push-up injury credit. */
const OTHER_TIME_GOAL_MIN = 30;
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
  { id: "erok", name: "Erok L", image: "./assets/people/erok.png", honorary: true },
  { id: "evan", name: "Evan F", image: "./assets/people/evan.png", honorary: true },
  { id: "james", name: "James Z", image: "./assets/people/james.png" },
  { id: "jamie", name: "Jamie D", image: "./assets/people/jamie.png" },
  { id: "joe", name: "Joe D", image: "./assets/people/joe.png" },
  { id: "john", name: "John Z", image: "./assets/people/john.png" },
  { id: "kelly", name: "Kelly D", image: "./assets/people/kelly.png", honorary: true },
  { id: "matt", name: "Matt H", image: "./assets/people/matt.png" },
  { id: "mike", name: "Mike B", image: "./assets/people/mike.png" },
];

function isHonorary(personOrId) {
  if (!personOrId) return false;
  if (typeof personOrId === "object") return Boolean(personOrId.honorary);
  return Boolean(crew.find((person) => person.id === personOrId)?.honorary);
}

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
      otherType: "workouts",
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
/** Other workouts are logged as % effort; 100% = 1 workout unit (e.g. 50+50+75 → 1.75). */
const workoutNumber = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

function otherWorkoutUnits(otherPercentSum) {
  return (Number(otherPercentSum) || 0) / 100;
}

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
  if (isHonorary(personId)) return "in";
  if (participation[personId]) return participation[personId];
  return activities.some((activity) => activity.personId === personId) ? "in" : "unknown";
}

function getPerson(id) {
  return crew.find((person) => person.id === id) ?? crew[0];
}

function normalizePersonKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");
}

function matchCrewPerson(contributor) {
  const raw = normalizePersonKey(contributor);
  if (!raw) return null;

  const exactName = crew.find((person) => normalizePersonKey(person.name) === raw);
  if (exactName) return exactName;

  const exactId = crew.find((person) => person.id === raw);
  if (exactId) return exactId;

  const tokens = raw.split(" ");
  const first = tokens[0];
  const firstMatches = crew.filter(
    (person) => normalizePersonKey(person.name).split(" ")[0] === first,
  );
  if (firstMatches.length === 1 && tokens.length === 1) return firstMatches[0];

  const withInitial = crew.find((person) => {
    const parts = normalizePersonKey(person.name).split(" ");
    if (parts.length < 2) return false;
    const initial = parts[1][0];
    return (
      raw === `${parts[0]} ${initial}` ||
      raw === `${parts[0]}${initial}` ||
      raw === normalizePersonKey(person.name)
    );
  });
  if (withInitial) return withInitial;

  if (firstMatches.length === 1) return firstMatches[0];
  return null;
}

function activityExercise(activity) {
  return activity.exercise ?? "pushups";
}

function isWeightActivity(activity) {
  return activityExercise(activity) === "weight";
}

/** Other subtype: workouts (%) | reps (misc count) | time (minutes). Legacy Other → workouts. */
function otherTypeOf(activity) {
  if (activityExercise(activity) !== "other") return "";
  const type = activity.otherType;
  if (type === "reps" || type === "time") return type;
  return "workouts";
}

function isInjuryInput(activity) {
  return activityExercise(activity) === "other" && Boolean(activity.injuryInput);
}

/**
 * Convert any Other subtype into % effort for WORKOUTS / OTHER totals.
 * Same scale as injury push-up credit: 100% misc workout, 100 misc rep,
 * or 30 min misc timed → 100%.
 */
function otherPercentContribution(activity) {
  if (activityExercise(activity) !== "other") return 0;
  const amount = Number(activity.reps) || 0;
  const type = otherTypeOf(activity);
  if (type === "time") return Math.round(amount * (100 / OTHER_TIME_GOAL_MIN));
  // Misc Workout (%) and Misc Rep share the 100 → 100% scale.
  return amount;
}

/**
 * Push-up credit when Other is logged with Injury Input on:
 * - Workouts %: 100% → 100 reps (percent/100 × daily push-up goal)
 * - Misc reps: count as-is (100 → 100)
 * - Time: minutes × (100/30)
 */
function injuryPushupCredit(activity) {
  if (!isInjuryInput(activity)) return 0;
  const amount = Number(activity.reps) || 0;
  const type = otherTypeOf(activity);
  if (type === "reps") return Math.round(amount);
  if (type === "time") return Math.round(amount * (100 / OTHER_TIME_GOAL_MIN));
  return Math.round((amount / 100) * DAILY_GOALS.pushups);
}

function dayHasInjuryPushupCredit(dayActivities) {
  return dayActivities.some((activity) => injuryPushupCredit(activity) > 0);
}

function exerciseName(activity) {
  const exercise = activityExercise(activity);
  if (exercise === "squats") return "Squats";
  if (exercise === "planks") return "Plank";
  if (exercise === "weight") return "Weight";
  if (exercise === "other") {
    const name = activity.otherActivity || "Other activity";
    return isInjuryInput(activity) ? `${name} + Injury Credits` : name;
  }
  return "Push-ups";
}

function exerciseUnit(activity) {
  const exercise = activityExercise(activity);
  if (exercise === "planks") return "MIN";
  if (exercise === "weight") return "LB";
  if (exercise === "other") {
    const type = otherTypeOf(activity);
    if (type === "reps") return "REPS";
    if (type === "time") return "MIN";
    return "% GOAL";
  }
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
  const exercise = activityExercise(activity);
  if (exercise === "planks") return `+${amount} MIN`;
  if (exercise === "weight") return `${amount} LB`;
  if (exercise === "other") {
    const type = otherTypeOf(activity);
    if (type === "time") return `+${amount} MIN`;
    if (type === "workouts") return `+${amount}%`;
  }
  return `+${amount}`;
}

/** Add activity amounts into challenge metrics (skips personal-only weight). */
function accumulateChallengeMetrics(totals, activity) {
  const exercise = activityExercise(activity);
  if (exercise === "weight") return totals;
  if (exercise === "other") {
    totals.other += otherPercentContribution(activity);
  } else if (Object.prototype.hasOwnProperty.call(totals, exercise)) {
    totals[exercise] += Number(activity.reps) || 0;
  }
  totals.pushups += injuryPushupCredit(activity);
  return totals;
}

function formatPlankMinutes(seconds) {
  return durationNumber.format((Number(seconds) || 0) / 60);
}

/** Compact metric font tiers for tight numeric clusters: default <1k, is-k ≥1k, is-10k ≥10k. */
const COMPACT_MAG_CLASSES = ["is-k", "is-10k"];

function compactMagnitudeClass(value) {
  const n = Math.abs(Number(value) || 0);
  if (n >= 10000) return "is-10k";
  if (n >= 1000) return "is-k";
  return "";
}

function compactMagnitudeFromValues(values) {
  let max = 0;
  for (const value of values) {
    const n = Math.abs(Number(value) || 0);
    if (n > max) max = n;
  }
  return compactMagnitudeClass(max);
}

function compactMagnitudeAttr(values) {
  const cls = Array.isArray(values)
    ? compactMagnitudeFromValues(values)
    : compactMagnitudeClass(values);
  return cls ? ` ${cls}` : "";
}

function setCompactMagnitude(el, ...values) {
  if (!el) return;
  el.classList.remove(...COMPACT_MAG_CLASSES);
  const cls = compactMagnitudeFromValues(values);
  if (cls) el.classList.add(cls);
}

/**
 * Rough kcal rates for crew burn (~BURN + SAV OFFSETS). Generic means only —
 * generous fun scale (~2–2.5× conservative estimates), not a lab measurement.
 * - Push-ups / squats: kcal per rep (~85 per 100 push-ups)
 * - Planks: kcal per minute (activity.reps stored as seconds)
 * - Other/workouts: logged as % of daily goal; 100% ≈ one daily push-up
 *   goal's burn → (other% / 100) * DAILY_GOALS.pushups * KCAL_PER_PUSHUP
 *   (Misc Rep / Misc Timed convert into other% on the same 100→100% scale)
 */
const KCAL_PER_PUSHUP = 0.85;
const KCAL_PER_SQUAT = 1.0;
const KCAL_PER_PLANK_MIN = 6;

function estimateCategoryCalories(categoryTotals) {
  const pushupCals = (categoryTotals.pushups || 0) * KCAL_PER_PUSHUP;
  const squatCals = (categoryTotals.squats || 0) * KCAL_PER_SQUAT;
  const plankCals = ((categoryTotals.planks || 0) / 60) * KCAL_PER_PLANK_MIN;
  // 100% other ≈ DAILY_GOALS.pushups × KCAL_PER_PUSHUP (one push-up goal day).
  const otherCals =
    ((categoryTotals.other || 0) / 100) * DAILY_GOALS.pushups * KCAL_PER_PUSHUP;
  return Math.round(pushupCals + squatCals + plankCals + otherCals);
}

/**
 * Cheeky Savannah food/drink offsets for the Stats "SAV Offsets" row.
 * Each constant is a rough kcal per item; burned calories ÷ kcal = how many
 * of that item the crew's burn would offset / buy.
 */
const KCAL_PER_RAIL_PUB_BEER = 150; // typical draft pint
const KCAL_PER_VINNIE_PIZZA_SLICE = 285; // one large Vinnie Van GoGo's slice
const KCAL_PER_WET_WILLIES_CALL_A_CAB = 380; // frozen Call-a-Cab cocktail
const KCAL_PER_LADY_AND_SONS_BISCUIT = 200; // cheese biscuit
const KCAL_PER_WAREHOUSE_WING = 90; // one sauced wing

function desertMathFromBurn(burned) {
  const cals = Math.max(0, Math.round(burned) || 0);
  return {
    beers: Math.round(cals / KCAL_PER_RAIL_PUB_BEER),
    pizzaSlices: Math.round(cals / KCAL_PER_VINNIE_PIZZA_SLICE),
    callACabs: Math.round(cals / KCAL_PER_WET_WILLIES_CALL_A_CAB),
    biscuits: Math.round(cals / KCAL_PER_LADY_AND_SONS_BISCUIT),
    wings: Math.round(cals / KCAL_PER_WAREHOUSE_WING),
  };
}

/** Sunday–Saturday local calendar week; labels match feedDayParts (SUN…SAT). */
const WEEKDAY_ABBR = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function weekDateKeys(anchor = new Date()) {
  const local = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
  const start = new Date(local);
  start.setDate(local.getDate() - local.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return localDateValue(day);
  });
}

/** Best crew day this week (Sun–Sat), plus daily totals for the sparkline. */
function bestGroupDay(participantIds) {
  const weekKeys = weekDateKeys();
  const byDay = new Map(weekKeys.map((key) => [key, 0]));
  for (const activity of activities) {
    if (!participantIds.has(activity.personId)) continue;
    if (activityExercise(activity) === "planks") continue;
    if (isWeightActivity(activity)) continue;
    // Local calendar day so bucketing matches weekDateKeys / feed.
    const day = activityDateKey(activity);
    if (!byDay.has(day)) continue;
    byDay.set(day, (byDay.get(day) || 0) + (Number(activity.reps) || 0));
  }
  const days = weekKeys.map((date, index) => ({
    date,
    reps: byDay.get(date) || 0,
    label: WEEKDAY_ABBR[index],
  }));
  let bestReps = 0;
  let bestDate = "";
  let bestLabel = "";
  for (const day of days) {
    if (day.reps > bestReps) {
      bestReps = day.reps;
      bestDate = day.date;
      bestLabel = day.label;
    }
  }
  return { days, reps: bestReps, date: bestDate, label: bestLabel };
}

/**
 * Local calendar date key for challenge day N (1 = CHALLENGE_START … CHALLENGE_DAYS).
 */
function challengeDayDateKey(dayNumber) {
  const start = new Date(`${CHALLENGE_START}T12:00:00`);
  start.setDate(start.getDate() + (dayNumber - 1));
  return localDateValue(start);
}

/**
 * Per-day stack for the person chart: goal-fraction units so categories are comparable.
 * 1.0 = one daily goal (100 PU / 100 SQ / 4 min plank / 100% Other).
 * Weight logs skipped. Misc Rep / Misc Timed convert into Other % (100 reps or 30 min ≈ 100%).
 */
function personChallengeDayStacks(personId) {
  const days = Array.from({ length: CHALLENGE_DAYS }, (_, index) => ({
    day: index + 1,
    dateKey: challengeDayDateKey(index + 1),
    totals: { pushups: 0, squats: 0, planks: 0, other: 0 },
  }));
  const startMs = new Date(`${CHALLENGE_START}T12:00:00`).getTime();

  for (const activity of activities) {
    if (activity.personId !== personId) continue;
    if (isWeightActivity(activity)) continue;
    const key = activityDateKey(activity);
    const idx = Math.floor((new Date(`${key}T12:00:00`).getTime() - startMs) / 86400000);
    if (idx < 0 || idx >= CHALLENGE_DAYS) continue;
    accumulateChallengeMetrics(days[idx].totals, activity);
  }

  return days.map((day) => {
    const { totals } = day;
    const units = {
      pushups: totals.pushups / DAILY_GOALS.pushups,
      squats: totals.squats / DAILY_GOALS.squats,
      planks: totals.planks / DAILY_GOALS.planks,
      other: totals.other / 100,
    };
    const totalUnits = units.pushups + units.squats + units.planks + units.other;
    return { ...day, units, totalUnits };
  });
}

function formatDayChartTitle(day) {
  const { day: n, totals, totalUnits } = day;
  if (totalUnits <= 0) return `Day ${n} · no activity`;
  const parts = [];
  if (totals.pushups) parts.push(`${number.format(totals.pushups)} PU`);
  if (totals.squats) parts.push(`${number.format(totals.squats)} SQ`);
  if (totals.planks) parts.push(`${formatPlankMinutes(totals.planks)} MIN PL`);
  if (totals.other) parts.push(`${number.format(totals.other)}% OT`);
  return `Day ${n} · ${parts.join(" · ")}`;
}

function renderPersonDayChart(personId) {
  const barsEl = $("#person-day-chart-bars");
  if (!barsEl) return;

  const days = personChallengeDayStacks(personId);
  const maxUnits = Math.max(1, ...days.map((day) => day.totalUnits));
  const todayKey = localDateValue();

  barsEl.innerHTML = days
    .map((day) => {
      const isToday = day.dateKey === todayKey;
      const isFuture = day.dateKey > todayKey;
      const dayState = `${isToday ? " is-today" : ""}${isFuture ? " is-future" : ""}`;
      const title = escapeHtml(formatDayChartTitle(day));
      if (day.totalUnits <= 0) {
        return `<div class="personal-day-chart__col is-empty${dayState}" title="${title}"><div class="personal-day-chart__bar is-empty"></div></div>`;
      }
      const heightPct = Math.max(4, (day.totalUnits / maxUnits) * 100);
      const segs = ["pushups", "squats", "planks", "other"]
        .filter((key) => day.units[key] > 0)
        .map(
          (key) =>
            `<span class="is-${key}" style="flex:${day.units[key].toFixed(4)} 0 0"></span>`,
        )
        .join("");
      return `<div class="personal-day-chart__col${dayState}" title="${title}"><div class="personal-day-chart__bar" style="height:${heightPct.toFixed(2)}%">${segs}</div></div>`;
    })
    .join("");
}

function dayGoalProgress(dayActivities) {
  const totals = dayActivities.reduce(
    (sums, activity) => accumulateChallengeMetrics(sums, activity),
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

const BOARD_GOAL_KEYS = ["pushups", "squats", "planks"];
const BOARD_GOAL_SHORT = { pushups: "PU", squats: "SQ", planks: "PL" };
const BOARD_GOAL_LABELS = {
  pushups: "push-ups",
  squats: "squats",
  planks: "plank",
};

function closedBoardCategories(percents) {
  return Object.fromEntries(
    BOARD_GOAL_KEYS.map((key) => [key, (percents?.[key] || 0) >= 100]),
  );
}

function closedBoardCount(closed) {
  return BOARD_GOAL_KEYS.filter((key) => closed[key]).length;
}

function feedClearedCategoryStack(closed = {}, { legend = false, decorative = false } = {}) {
  const labels = BOARD_GOAL_KEYS.filter((key) => closed[key]).map(
    (key) => BOARD_GOAL_LABELS[key],
  );
  const aria = decorative
    ? 'aria-hidden="true"'
    : legend
      ? 'aria-label="Push-ups, squats, and plank — closed categories light up"'
      : labels.length
        ? `aria-label="Closed ${labels.join(", ")}"`
        : 'aria-hidden="true"';
  return `
    <span class="feed-cleared-cats${legend ? " is-legend" : ""}" ${aria}>
      ${BOARD_GOAL_KEYS.map((key, index) => {
        const isClosed = Boolean(closed[key]);
        return `
          <span
            class="feed-cleared-cat is-${key}${isClosed ? " is-closed" : " is-open"}"
            style="--cat-i:${index}"
            title="${BOARD_GOAL_LABELS[key]}${isClosed ? " closed" : " open"}"
          >${BOARD_GOAL_SHORT[key]}</span>
        `;
      }).join("")}
    </span>
  `;
}

function personBoardProgress(personId, dateKey = localDateValue()) {
  const dayActivities = activities.filter(
    (activity) => activity.personId === personId && activityDateKey(activity) === dateKey,
  );
  const progress = dayGoalProgress(dayActivities);
  const closed = closedBoardCategories(progress.percents);
  return {
    ...progress,
    closed,
    closedCount: closedBoardCount(closed),
  };
}

function peopleWhoClearedDailyGoal(dateKey = localDateValue()) {
  return crew
    .filter((person) => !person.honorary && personStatus(person.id) !== "out")
    .filter((person) => personBoardProgress(person.id, dateKey).complete)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Group closeout tallies across in-crew person-days.
 * Uses the same board rules as daily pulse / Daily closers feed:
 * a category is closed at ≥100% of DAILY_GOALS; a trifecta is all three (PU/SQ/PL).
 * - pushupClosers: person-days with push-ups closed
 * - repClosers: sum of PU+SQ+PL category closes across person-days
 * - trifectas: person-days with full board clear (all three closed)
 */
function groupCloseoutStats(participantIds) {
  const byPersonDay = new Map();
  for (const activity of activities) {
    if (!participantIds.has(activity.personId)) continue;
    if (isWeightActivity(activity)) continue;
    const dateKey = activityDateKey(activity);
    const key = `${activity.personId}|${dateKey}`;
    let dayActivities = byPersonDay.get(key);
    if (!dayActivities) {
      dayActivities = [];
      byPersonDay.set(key, dayActivities);
    }
    dayActivities.push(activity);
  }

  let pushupClosers = 0;
  let repClosers = 0;
  let trifectas = 0;

  for (const dayActivities of byPersonDay.values()) {
    const { percents, complete } = dayGoalProgress(dayActivities);
    const closed = closedBoardCategories(percents);
    if (closed.pushups) pushupClosers += 1;
    repClosers += closedBoardCount(closed);
    if (complete) trifectas += 1;
  }

  return { pushupClosers, repClosers, trifectas };
}

/** Bros who locked ≥1 of push / squat / plank for the day (includes full clears). */
function peopleWithBoardClosingProgress(dateKey = localDateValue()) {
  return crew
    .filter((person) => !person.honorary && personStatus(person.id) !== "out")
    .map((person) => ({ person, progress: personBoardProgress(person.id, dateKey) }))
    .filter(({ progress }) => progress.closedCount > 0)
    .sort((a, b) => {
      if (a.progress.complete !== b.progress.complete) {
        return a.progress.complete ? -1 : 1;
      }
      if (b.progress.closedCount !== a.progress.closedCount) {
        return b.progress.closedCount - a.progress.closedCount;
      }
      return a.person.name.localeCompare(b.person.name);
    });
}

const FEED_DAY_WINDOW = 14;
let feedSelectedDateKey = null;

function shiftLocalDateKey(dateKey, deltaDays) {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + deltaDays);
  return localDateValue(date);
}

/** Full local-calendar days between dateKey and today (0 = today). */
function historyDayAgeDays(dateKey, todayKey = localDateValue()) {
  const today = new Date(`${todayKey}T12:00:00`);
  const day = new Date(`${dateKey}T12:00:00`);
  return Math.round((today.getTime() - day.getTime()) / 86400000);
}

/** Days younger than 2 keep full cards; age ≥ 2 → condensed list. */
function isCondensedHistoryDay(dateKey, todayKey = localDateValue()) {
  return historyDayAgeDays(dateKey, todayKey) >= 2;
}

const PERSON_HISTORY_PAGE_SIZE = 10;
/** How many condensed History days are visible on the person page (session memory). */
let personHistoryVisibleDays = PERSON_HISTORY_PAGE_SIZE;
let personHistoryForPersonId = null;

/** Compact one-line summary: Plank · +3 MIN · 3×1 min */
function formatCondensedActivityLine(activity) {
  const bits = [exerciseName(activity), formatActivityLead(activity)];
  const note = activityNoteText(activity);
  if (note) bits.push(note);
  return bits.join(" · ");
}

function feedDayKeys() {
  const todayKey = localDateValue();
  const keys = [];
  for (let offset = FEED_DAY_WINDOW - 1; offset >= 0; offset -= 1) {
    const key = shiftLocalDateKey(todayKey, -offset);
    if (key < CHALLENGE_START) continue;
    if (key > todayKey) continue;
    keys.push(key);
  }
  if (!keys.includes(todayKey)) keys.push(todayKey);
  return keys;
}

function ensureFeedSelectedDate() {
  const todayKey = localDateValue();
  const keys = feedDayKeys();
  if (!feedSelectedDateKey || !keys.includes(feedSelectedDateKey)) {
    feedSelectedDateKey = todayKey;
  }
  return feedSelectedDateKey;
}

function formatFeedDayLabel(dateKey, { long = false } = {}) {
  const todayKey = localDateValue();
  if (dateKey === todayKey) return long ? "today" : "Today";
  const date = new Date(`${dateKey}T12:00:00`);
  if (long) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
}

function feedDayParts(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);
  return {
    num: String(date.getDate()),
    dow: date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
  };
}

function scrollFeedDayFilterToSelected({ smooth = false } = {}) {
  const track = $("#feed-day-filter");
  const scroller = track?.closest(".feed-day-filter");
  const selectedBtn = track?.querySelector(".feed-day-filter__day.is-selected");
  if (!track || !scroller || !selectedBtn) return;

  const feedPage = $("#feed-page");
  if (feedPage?.hidden) return;

  const run = () => {
    const pad = 8;
    const target =
      selectedBtn.offsetLeft - (scroller.clientWidth - selectedBtn.offsetWidth) / 2;
    const max = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    // Prefer keeping today/selected fully in view near the end when it's the last day.
    const endBias =
      selectedBtn === track.lastElementChild
        ? Math.max(0, selectedBtn.offsetLeft + selectedBtn.offsetWidth + pad - scroller.clientWidth)
        : target;
    const next = Math.max(0, Math.min(max, selectedBtn === track.lastElementChild ? endBias : target));
    if (smooth && typeof scroller.scrollTo === "function") {
      scroller.scrollTo({ left: next, behavior: "smooth" });
    } else {
      scroller.scrollLeft = next;
    }
  };

  requestAnimationFrame(() => requestAnimationFrame(run));
}

function renderFeedDayFilter({ smoothScroll = false } = {}) {
  const track = $("#feed-day-filter");
  if (!track) return;

  const todayKey = localDateValue();
  const selectedKey = ensureFeedSelectedDate();
  const keys = feedDayKeys();

  track.innerHTML = keys
    .map((key) => {
      const { num, dow } = feedDayParts(key);
      const selected = key === selectedKey;
      const isToday = key === todayKey;
      const label = formatFeedDayLabel(key);
      return `
        <button
          type="button"
          class="feed-day-filter__day${selected ? " is-selected" : ""}${isToday ? " is-today" : ""}"
          role="tab"
          aria-selected="${selected ? "true" : "false"}"
          aria-label="${escapeHtml(label)}"
          data-feed-date="${key}"
          ${selected ? 'tabindex="0"' : 'tabindex="-1"'}
        >
          <span class="feed-day-filter__num">${num}</span>
          <span class="feed-day-filter__dow">${isToday ? "TODAY" : dow}</span>
        </button>
      `;
    })
    .join("");

  scrollFeedDayFilterToSelected({ smooth: smoothScroll });
}

function updateFeedPageCopy(dateKey) {
  const todayKey = localDateValue();
  const isToday = dateKey === todayKey;
  const shortLabel = formatFeedDayLabel(dateKey);
  const longLabel = formatFeedDayLabel(dateKey, { long: true });

  const hero = $("#feed-hero-copy");
  if (hero) {
    hero.textContent = isToday
      ? "See who closed out their goals and what they knocked out to get there."
      : `See who closed out their goals for ${longLabel} and what they knocked out to get there.`;
  }

  const eyebrow = $("#feed-cleared-eyebrow");
  if (eyebrow) eyebrow.textContent = isToday ? "TODAY’S BOARD" : `${shortLabel} BOARD`;

  const activityEyebrow = $("#feed-activity-eyebrow");
  if (activityEyebrow) activityEyebrow.textContent = isToday ? "LATEST" : shortLabel;

  const activityHeading = $("#feed-activity-heading");
  if (activityHeading) activityHeading.textContent = isToday ? "All activity" : "Day’s activity";
}

function feedClearedPersonAria(person, progress) {
  if (progress.complete) return `${person.name} cleared the board`;
  const locked = BOARD_GOAL_KEYS.filter((key) => progress.closed[key]).map(
    (key) => BOARD_GOAL_LABELS[key],
  );
  if (!locked.length) return `${person.name} — no categories closed`;
  return `${person.name} closing the board — ${locked.join(", ")} locked`;
}

function renderFeedClearedPerson({ person, progress }) {
  const complete = progress.complete;
  return `
    <li>
      <a
        class="feed-cleared-person${complete ? " is-complete" : " is-closing"}"
        href="#/person/${person.id}"
        data-person-id="${person.id}"
        aria-label="${escapeHtml(feedClearedPersonAria(person, progress))}"
      >
        <span class="feed-cleared-person__avatar">
          <img src="${person.image}" alt="" />
          ${
            complete
              ? `<span class="feed-cleared-person__badge" aria-hidden="true">check</span>`
              : ""
          }
        </span>
        ${feedClearedCategoryStack(progress.closed, { decorative: true })}
      </a>
    </li>
  `;
}

function renderFeedClearedToday({ smoothDayScroll = false } = {}) {
  const list = $("#feed-cleared-list");
  const countEl = $("#feed-cleared-count");
  const headingEl = $("#feed-cleared-heading");
  const subEl = document.querySelector("#feed-page .feed-cleared-card__sub");
  if (!list) return;

  const dateKey = ensureFeedSelectedDate();
  updateFeedPageCopy(dateKey);
  renderFeedDayFilter({ smoothScroll: smoothDayScroll });

  const eligible = crew.filter(
    (person) => !person.honorary && personStatus(person.id) !== "out",
  );
  const closing = peopleWithBoardClosingProgress(dateKey);
  const cleared = closing.filter(({ progress }) => progress.complete);
  const partials = closing.filter(({ progress }) => !progress.complete);
  if (countEl) countEl.textContent = `${cleared.length} / ${eligible.length}`;

  const isToday = dateKey === localDateValue();
  const longLabel = formatFeedDayLabel(dateKey, { long: true });

  if (headingEl) {
    headingEl.textContent = "Daily closers";
  }
  if (subEl) {
    if (cleared.length) {
      subEl.textContent =
        "Push-ups, squats, and plank — the full daily pulse. Bonus workouts are gravy.";
    } else if (partials.length) {
      subEl.textContent = isToday
        ? "Categories lighting up — lock all three to clear the board."
        : "Categories locked that day — all three make a full clear.";
    } else {
      subEl.textContent =
        "Push-ups, squats, and plank — the full daily pulse. Bonus workouts are gravy.";
    }
  }

  if (!closing.length) {
    list.innerHTML = `
      <div class="feed-cleared-empty" role="status">
        ${feedClearedCategoryStack({}, { legend: true })}
        <p><strong>${
          isToday
            ? "Nobody’s closing the board yet today."
            : `Nobody closed a category on ${escapeHtml(longLabel)}.`
        }</strong></p>
        <p>${
          isToday
            ? "Hit push-ups, squats, or plank — light up a ring, then clear the desert daily."
            : "No category locks that day — push-ups, squats, and plank make the board."
        }</p>
      </div>
    `;
    return;
  }

  list.innerHTML = `
    <ul class="feed-cleared-people">
      ${closing.map(renderFeedClearedPerson).join("")}
    </ul>
  `;
}

function activityCompactMagnitude(activity) {
  const reps = Number(activity.reps) || 0;
  return compactMagnitudeAttr(
    activityExercise(activity) === "planks" ? reps / 60 : reps,
  );
}

function activityFeedItemHtml(activity) {
  const person = getPerson(activity.personId);
  const honoraryClass = person.honorary ? " is-honorary" : "";
  const repsMag = activityCompactMagnitude(activity);
  return `
      <a class="activity-item is-feed${honoraryClass}" href="#/person/${person.id}" data-person-id="${person.id}" aria-label="View ${escapeHtml(person.name)}'s ${escapeHtml(exerciseName(activity))} entry">
        <div class="activity-stack" aria-hidden="true">
          <img class="activity-avatar" src="${person.image}" alt="" />
          ${exerciseIcon(activity)}
        </div>
        <div class="activity-main">
          <p class="activity-person">${escapeHtml(person.name)}${person.honorary ? ' <span class="honorary-tag">Honorary</span>' : ""}</p>
          <span>${formatDate(activity.createdAt)}</span>
        </div>
        <div class="activity-meta">
          <p><span class="activity-reps${repsMag}">${formatActivityLead(activity)}</span> ${escapeHtml(exerciseName(activity))}</p>
        </div>
      </a>
    `;
}

function renderFeedPageActivityList() {
  const feedPageList = $("#feed-page-list");
  if (!feedPageList) return;

  const dateKey = ensureFeedSelectedDate();
  const dayActivities = [...activities]
    .filter((activity) => activityDateKey(activity) === dateKey && !isWeightActivity(activity))
    .sort(compareActivitiesRecentFirst);
  const isToday = dateKey === localDateValue();
  const emptyFeed = isToday
    ? '<div class="empty-state">No reps yet. Be the first to get moving.</div>'
    : '<div class="empty-state">No logs on this day yet.</div>';

  feedPageList.innerHTML = dayActivities.length
    ? dayActivities.map(activityFeedItemHtml).join("")
    : emptyFeed;
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
      `${formatPlankMinutes(totals.planks)} of ${formatPlankMinutes(DAILY_GOALS.planks)} min planking`,
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
  const hasInjuryPushupCredit = dayHasInjuryPushupCredit(dayActivities);
  const boardScore = Math.round((percents.pushups + percents.squats + percents.planks) / 3);
  const fromPercents =
    !compact && pendingPulseReveal?.previousPercents ? pendingPulseReveal.previousPercents : null;
  const meters = [
    {
      key: "pushups",
      label: "PUSH-UPS",
      value: `${number.format(totals.pushups)} / ${number.format(DAILY_GOALS.pushups)}`,
      percent: percents.pushups,
      injury: hasInjuryPushupCredit,
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
      value: `${formatPlankMinutes(totals.planks)} / ${formatPlankMinutes(DAILY_GOALS.planks)} MIN`,
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

  // Only stamp the slide-up entrance when the dialog flow needs it. Quick Add skips it
  // so the card doesn't jump down (translateY/margin) and then animate back up.
  const revealClass =
    fromPercents && !pendingPulseReveal?.skipEntrance ? " is-revealing" : "";
  // Defer banner/share only on the board-clear celebration so they can animate in.
  // If the board was already clear, keep them in the HTML so Quick Add doesn't rebuild
  // the card and make Daily Pulse grow/shrink on every tap.
  const deferCompleteChrome = Boolean(fromPercents && pendingPulseReveal?.boardCleared);
  const showCompleteChrome = complete && !compact && !deferCompleteChrome;
  const banner = showCompleteChrome
    ? `<div class="daily-pulse-banner" role="status"><span>Daily goal met</span></div>`
    : "";
  const share =
    showCompleteChrome && personId && isPersonPageOwner(personId)
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
            const injuryClass = meter.injury ? " is-injury" : "";
            const injuryTag = meter.injury
              ? ` <span class="daily-pulse-injury-tag">INJURY</span>`
              : "";
            return `
              <div class="daily-pulse-row is-${meter.key}${injuryClass}">
                <div class="daily-pulse-meta">
                  <span>${meter.label}${injuryTag}</span>
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
  const { totals } = dayGoalProgress(dayActivities);
  const chips = [
    { key: "pushups", amount: totals.pushups, value: number.format(totals.pushups) },
    { key: "squats", amount: totals.squats, value: number.format(totals.squats) },
    { key: "planks", amount: totals.planks, value: formatPlankMinutes(totals.planks) },
    { key: "other", amount: totals.other, value: number.format(totals.other) },
  ];
  return `
    <span class="history-day-breakdown" tabindex="0" aria-label="Daily goal progress: ${escapeHtml(lines.join(", "))}">
      <span class="history-day-breakdown-inline" aria-hidden="true">${chips
        .map((chip) => {
          // Zero amounts keep the base .history-condensed-dot --quiet (unrealized) style.
          const dotClass = chip.amount
            ? `history-condensed-dot is-${chip.key}`
            : "history-condensed-dot";
          return `<span class="history-day-breakdown-chip"><span class="${dotClass}"></span>${escapeHtml(chip.value)}</span>`;
        })
        .join("")}</span>
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
    weight: "WT",
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
      (totals, activity) => accumulateChallengeMetrics(totals, activity),
      { pushups: 0, squats: 0, planks: 0, other: 0 },
    );
    const primaryType = metrics.pushups > 0 ? "pushups" : metrics.other > 0 ? "other" : "pushups";
    return {
      ...person,
      metrics,
      primaryType,
      total: metrics[primaryType],
      status: personStatus(person.id),
      sessions: new Set(
        personActivities
          .filter((activity) => !isWeightActivity(activity))
          .map((activity) => activity.createdAt.slice(0, 10)),
      ).size,
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
  // Inclusive of today so daily-need pacing matches days still available to train.
  const daysLeft = challengeDaysLeftInclusive();
  const daysUntilCheckIn = challengeDaysRemaining();
  const hoursLeft = Math.floor((msLeft % 86400000) / 3600000);
  const pushupCals = Math.round(categoryTotals.pushups * KCAL_PER_PUSHUP);
  const squatCals = Math.round(categoryTotals.squats * KCAL_PER_SQUAT);
  const plankMins = categoryTotals.planks / 60;
  const plankCals = Math.round(plankMins * KCAL_PER_PLANK_MIN);
  const otherCals = Math.round(
    ((categoryTotals.other || 0) / 100) * DAILY_GOALS.pushups * KCAL_PER_PUSHUP,
  );
  const burned = estimateCategoryCalories(categoryTotals);
  const perPerson = participants.length ? Math.round(total / participants.length) : 0;
  const dailyNeeded =
    daysLeft > 0 && participants.length
      ? Math.ceil(remaining / participants.length / daysLeft)
      : 0;

  return [
    burned > 0
      ? `Rough burn so far: ~${number.format(burned)} calories across push-ups, squats, planks, and other workouts.`
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
    categoryTotals.other > 0
      ? `${number.format(categoryTotals.other)}% other workouts ≈ ${number.format(otherCals)} calories (100% ≈ one daily push-up goal).`
      : null,
    msLeft > 0
      ? `${daysUntilCheckIn} days and ${hoursLeft} hours until Old-Chella check-in. The desert is patient. Your rotator cuff is not.`
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
    const type = otherTypeOf(activity);
    if (type === "reps") {
      const lines = [
        `Fresh drop: ${first} just logged ${amount} misc rep — ${label}.`,
        `${first} banked ${amount} misc rep (${label}). Side quest secured.`,
        `+${amount} misc rep from ${first}: ${label}.`,
      ];
      return lines[seed % lines.length];
    }
    if (type === "time") {
      const lines = [
        `Fresh drop: ${first} just logged ${amount} min misc timed — ${label}.`,
        `${first} put in ${amount} min misc timed (${label}). Clock still counts.`,
        `+${amount} min misc timed from ${first}: ${label}.`,
      ];
      return lines[seed % lines.length];
    }
    const lines = [
      `Fresh drop: ${first} just added ${amount}% misc workout — ${label}.`,
      `${first} slipped in ${amount}% misc workout (${label}). The side quest counts.`,
      `+${amount}% misc workout from ${first}: ${label}.`,
    ];
    return lines[seed % lines.length];
  }
  if (exercise === "weight") {
    return null;
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

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function setPotentialCopyText(text, { animate = true } = {}) {
  const root = $("#potential-copy");
  const track = $("#potential-copy-track");
  if (!root || !track) return;

  const value = String(text || "").trim();
  root.classList.toggle("is-empty", !value);
  root.setAttribute("aria-label", value || "No live updates");

  if (!value) {
    track.classList.remove("is-crawling");
    track.textContent = "";
    root.classList.remove("is-fading");
    return;
  }

  const reduceMotion = prefersReducedMotion();

  if (reduceMotion) {
    if (!animate) {
      track.classList.remove("is-crawling");
      track.textContent = value;
      root.classList.remove("is-fading");
      return;
    }
    root.classList.add("is-fading");
    window.setTimeout(() => {
      track.classList.remove("is-crawling");
      track.textContent = value;
      root.classList.remove("is-fading");
    }, 220);
    return;
  }

  track.classList.remove("is-crawling");
  track.textContent = value;
  root.classList.remove("is-fading");
  // Restart crawl so each fact enters from the right.
  void track.offsetWidth;
  // Keep crawl paced with fact rotation (~2× the prior ~5.4s board speed).
  track.style.setProperty("--ticker-duration", `${Math.max(8.5, FACT_ROTATE_MS / 1000 - 0.2)}s`);
  track.classList.add("is-crawling");
}

function showNextFact(animate = true) {
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
  setPotentialCopyText(next, { animate });
}

function startFactRotation(facts) {
  recentActivityFacts = buildRecentActivityFacts();
  const signature = `${facts.join("|")}::${recentActivityFacts.join("|")}`;
  rotatingFacts = facts;
  if (!rotatingFacts.length && !recentActivityFacts.length) {
    window.clearInterval(factTimer);
    factTimer = null;
    factSignature = "";
    setPotentialCopyText("");
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

function render({ skipScroll = false } = {}) {
  const ranking = totalsByPerson().sort(
    (a, b) =>
      Number(a.status === "out") - Number(b.status === "out") ||
      Number(a.status === "unknown") - Number(b.status === "unknown") ||
      b.total - a.total ||
      a.name.localeCompare(b.name),
  );
  const participants = ranking.filter((person) => person.status === "in" && !person.honorary);
  const honoraryMembers = ranking.filter((person) => person.honorary);
  const optedOut = ranking.filter((person) => person.status === "out" && !person.honorary);
  const goal = participants.length * GOAL_PER_PERSON;
  const total = participants.reduce((sum, person) => sum + person.total, 0);
  const honoraryTotal = honoraryMembers.reduce((sum, person) => sum + person.total, 0);
  const percent = goal ? Math.min(100, Math.round((total / goal) * 100)) : 0;
  let honoraryPercent = goal ? Math.min(100, Math.round((honoraryTotal / goal) * 100)) : 0;
  if (honoraryPercent + percent > 100) {
    honoraryPercent = Math.max(0, 100 - percent);
  }
  const groupTarget = participants.length * onTargetReps();
  const targetPercent = goal ? Math.min(100, Math.round((groupTarget / goal) * 100)) : 0;
  const paceDelta = total - groupTarget;
  const participantIds = new Set(participants.map((person) => person.id));
  const categoryTotals = activities
    .filter((activity) => participantIds.has(activity.personId))
    .reduce(
    (totals, activity) => accumulateChallengeMetrics(totals, activity),
    { pushups: 0, squats: 0, planks: 0, other: 0 },
  );

  const applyGroupProgressBar = ({
    track,
    fill,
    honoraryFill,
    target,
    pace,
    breakdown = {},
  }) => {
    if (!track || !fill) return;
    const hasHonorary = honoraryPercent > 0;
    const hasPrimary = percent > 0;
    track.classList.toggle("has-honorary", hasHonorary);
    track.classList.toggle("has-primary", hasPrimary);
    if (honoraryFill) {
      honoraryFill.style.width = `${honoraryPercent}%`;
      honoraryFill.classList.toggle("is-empty", !hasHonorary);
      honoraryFill.hidden = !hasHonorary;
    }
    fill.style.left = `${honoraryPercent}%`;
    fill.style.width = `${percent}%`;
    if (target) target.style.width = `${targetPercent}%`;
    if (pace) pace.style.left = `${targetPercent}%`;
    const setBreakdown = (el, value) => {
      if (el) el.textContent = number.format(value);
    };
    setBreakdown(breakdown.goal, goal);
    setBreakdown(breakdown.daily, groupTarget);
    setBreakdown(breakdown.bros, total);
    setBreakdown(breakdown.honorary, honoraryTotal);
  };

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
  applyGroupProgressBar({
    track: $("#progress-track") || $(".progress-track"),
    fill: $("#progress-fill"),
    honoraryFill: $("#progress-honorary"),
    target: $("#progress-target"),
    pace: $("#progress-pace"),
    breakdown: {
      goal: $("#progress-breakdown-goal"),
      daily: $("#progress-breakdown-daily"),
      bros: $("#progress-breakdown-bros"),
      honorary: $("#progress-breakdown-honorary"),
    },
  });
  const homeTrack = $("#progress-track") || $(".progress-track");
  if (homeTrack) {
    homeTrack.setAttribute("aria-valuenow", String(total));
    homeTrack.setAttribute("aria-valuemax", String(goal));
    homeTrack.setAttribute(
      "aria-valuetext",
      honoraryTotal > 0
        ? `${number.format(total)} of ${number.format(goal)}, plus ${number.format(honoraryTotal)} honorary`
        : `${number.format(total)} of ${number.format(goal)}, on-target pace ${number.format(groupTarget)}`,
    );
  }
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

  let competitiveIndex = 0;
  const leaderboardHtml = ranking
    .map((person) => {
      const rowState = person.honorary
        ? " is-honorary"
        : person.status === "out"
          ? " is-out"
          : person.status === "unknown"
            ? " is-undecided"
            : "";
      const subtitle = person.honorary
        ? `Honorary · ${person.sessions} ${person.sessions === 1 ? "session" : "sessions"}`
        : person.status === "out"
          ? "Out"
          : person.status === "unknown"
            ? "Undecided"
            : `${person.sessions} ${person.sessions === 1 ? "session" : "sessions"}${person.primaryType === "other" ? " · alternative" : ""}`;
      const rankHtml = person.honorary
        ? `<span class="rank rank-honorary" title="Honorary · not counted in group total">★</span>`
        : (() => {
            const index = competitiveIndex;
            competitiveIndex += 1;
            const tone = index === 0 ? "gold" : index === 1 ? "silver" : index === 2 ? "bronze" : "steel";
            return `<span class="rank rank-${tone}">${index + 1}</span>`;
          })();
      const plankMinutes = (Number(person.metrics.planks) || 0) / 60;
      const repsMag = compactMagnitudeAttr([
        person.metrics.pushups,
        person.metrics.squats,
        plankMinutes,
        person.metrics.other,
      ]);
      return `
        <a class="leader-row${rowState}" href="#/person/${person.id}" data-person-id="${person.id}" aria-label="View ${escapeHtml(person.name)}'s progress">
          ${rankHtml}
          <span class="avatar-wrap">
            <img class="avatar" src="${person.image}" alt="" />
            ${person.status === "out" ? '<span class="out-stamp">OUT</span>' : ""}
            ${person.honorary ? '<span class="honorary-stamp">H</span>' : ""}
          </span>
          <div>
            <p class="leader-name">${escapeHtml(person.name)}</p>
            <p class="leader-sub">${subtitle}</p>
          </div>
          <div class="leader-reps${repsMag}">
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
    })
    .join("");
  $("#leaderboard").innerHTML = leaderboardHtml;
  const leaderboardPageList = $("#leaderboard-page-list");
  if (leaderboardPageList) leaderboardPageList.innerHTML = leaderboardHtml;

  const recent = [...activities]
    .filter((activity) => !isWeightActivity(activity))
    .sort(compareActivitiesRecentFirst);
  const emptyFeed = '<div class="empty-state">No reps yet. Be the first to get moving.</div>';
  $("#activity-list").innerHTML = recent.length
    ? recent.slice(0, 8).map(activityFeedItemHtml).join("")
    : emptyFeed;
  const activityPageList = $("#activity-page-list");
  if (activityPageList) {
    activityPageList.innerHTML = recent.length
      ? recent.map(activityFeedItemHtml).join("")
      : emptyFeed;
  }
  renderFeedPageActivityList();
  renderFeedClearedToday();

  // Mirror key stats onto the Stats page.
  const setText = (id, value) => {
    const el = $(id);
    if (el) el.textContent = value;
  };
  setText("#activity-group-total", number.format(total));
  setText("#activity-goal-target", number.format(goal));
  setText("#activity-pushups-total", number.format(categoryTotals.pushups));
  setText("#activity-squats-total", number.format(categoryTotals.squats));
  setText("#activity-planks-total", formatPlankMinutes(categoryTotals.planks));
  setText("#activity-other-total", number.format(categoryTotals.other));
  setText("#activity-crew-status-total", `${participants.length} / ${optedOut.length}`);
  setText("#activity-remaining-total", number.format(Math.max(0, goal - total)));
  setText("#activity-goal-percent-value", `${percent}%`);
  const activityGoalPercent = $("#activity-goal-percent");
  if (activityGoalPercent) activityGoalPercent.setAttribute("aria-label", `${percent}% done`);
  applyGroupProgressBar({
    track: $("#activity-progress-track"),
    fill: $("#activity-progress-fill"),
    honoraryFill: $("#activity-progress-honorary"),
    target: $("#activity-progress-target"),
    pace: $("#activity-progress-pace"),
    breakdown: {
      goal: $("#activity-progress-breakdown-goal"),
      daily: $("#activity-progress-breakdown-daily"),
      bros: $("#activity-progress-breakdown-bros"),
      honorary: $("#activity-progress-breakdown-honorary"),
    },
  });
  const activityTrack = $("#activity-progress-track");
  if (activityTrack) {
    activityTrack.setAttribute("aria-valuenow", String(total));
    activityTrack.setAttribute("aria-valuemax", String(goal));
    activityTrack.setAttribute(
      "aria-valuetext",
      honoraryTotal > 0
        ? `${number.format(total)} of ${number.format(goal)}, plus ${number.format(honoraryTotal)} honorary`
        : `${number.format(total)} of ${number.format(goal)}, on-target pace ${number.format(groupTarget)}`,
    );
  }
  setText(
    "#activity-pace-copy",
    goal > 0 && total >= goal
      ? "Challenge complete!"
      : groupTarget <= 0
        ? "Oldchella awaits"
        : paceDelta === 0
          ? `On pace (${number.format(groupTarget)})`
          : paceDelta > 0
            ? `${number.format(paceDelta)} ahead of pace`
            : `${number.format(Math.abs(paceDelta))} behind pace`,
  );

  const remaining = Math.max(0, goal - total);
  // Inclusive of today for daily-need pacing (Day D … Day 100).
  const daysLeft = challengeDaysLeftInclusive();
  const avgPerson = participants.length ? Math.round(total / participants.length) : 0;
  const dailyNeed =
    daysLeft > 0 && participants.length
      ? Math.ceil(remaining / participants.length / daysLeft)
      : 0;
  const eachLeft = participants.length ? Math.ceil(remaining / participants.length) : remaining;
  const burned = estimateCategoryCalories(categoryTotals);
  const desertMath = desertMathFromBurn(burned);
  // Challenge calendar progress (same D as purple DAY); D + remaining days === 100.
  const daysGoal = CHALLENGE_DAYS;
  const daysLogged = currentChallengeDay();
  const bestDay = bestGroupDay(participantIds);
  const activeCrew = participants.filter((person) => person.sessions > 0).length;
  const personalPace = onTargetReps();

  setText("#activity-avg-person", number.format(avgPerson));
  setText("#activity-daily-need", number.format(dailyNeed));
  setText("#activity-pace-target", number.format(Math.round(groupTarget)));
  setText("#activity-each-left", number.format(eachLeft));
  setText("#activity-cal-burn", burned > 0 ? `~${number.format(burned)}` : "0");
  setCompactMagnitude($("#activity-avg-person"), avgPerson);
  setCompactMagnitude($("#activity-each-left"), eachLeft);
  setCompactMagnitude($("#activity-cal-burn"), burned);
  setCompactMagnitude($("#activity-pace-target"), Math.round(groupTarget));
  setText("#activity-fun-beers", number.format(desertMath.beers));
  setText("#activity-fun-pizza", number.format(desertMath.pizzaSlices));
  setText("#activity-fun-cabs", number.format(desertMath.callACabs));
  setText("#activity-fun-biscuits", number.format(desertMath.biscuits));
  setText("#activity-fun-wings", number.format(desertMath.wings));
  const closeouts = groupCloseoutStats(participantIds);
  setText("#activity-closeout-pushups", number.format(closeouts.pushupClosers));
  setText("#activity-closeout-reps", number.format(closeouts.repClosers));
  setText("#activity-closeout-trifectas", number.format(closeouts.trifectas));
  setText("#activity-sessions-total", number.format(daysLogged));
  setText("#activity-days-goal", number.format(daysGoal));
  if (bestDay.reps > 0 && bestDay.label) {
    setText("#activity-best-day", `${bestDay.label} · ${number.format(bestDay.reps)}`);
    setText("#activity-best-day-label", "REPS");
  } else {
    setText("#activity-best-day", "—");
    setText("#activity-best-day-label", "0 REPS");
  }
  const bestBars = $(".activity-best__bars");
  if (bestBars) {
    const maxReps = Math.max(1, ...bestDay.days.map((day) => day.reps));
    bestBars.innerHTML = bestDay.days
      .map((day) => {
        const pct =
          day.reps > 0 ? Math.max(10, Math.round((day.reps / maxReps) * 100)) : 10;
        const peakClass = bestDay.date && day.date === bestDay.date ? " is-peak" : "";
        return `
          <div class="activity-best__col">
            <div class="activity-best__bar-slot">
              <span class="${peakClass.trim()}" style="--h: ${pct}%"></span>
            </div>
            <em>${day.label}</em>
          </div>
        `;
      })
      .join("");
  }
  const bestBlock = $(".activity-best");
  if (bestBlock) {
    bestBlock.setAttribute(
      "aria-label",
      bestDay.reps > 0 && bestDay.label
        ? `Best day this week ${bestDay.label} with ${number.format(bestDay.reps)} reps`
        : "Best day this week — no reps logged yet",
    );
  }
  setText("#activity-active-crew", `${activeCrew} / ${participants.length}`);

  const daysBlock = $("#activity-days-block");
  if (daysBlock) {
    daysBlock.setAttribute(
      "aria-label",
      `Day ${number.format(daysLogged)} of ${number.format(daysGoal)}`,
    );
  }

  // Pulse-row mini-viz: AVG/BRO, PUSH-UPS REMAINING, ~BURN, PACE TARGET.
  const avgFill = $("#activity-avg-fill");
  const avgMark = $("#activity-avg-mark");
  const avgPct = Math.min(100, Math.round((avgPerson / GOAL_PER_PERSON) * 100));
  const avgPacePct = Math.min(100, Math.round((personalPace / GOAL_PER_PERSON) * 100));
  if (avgFill) avgFill.style.width = `${avgPct}%`;
  if (avgMark) avgMark.style.left = `${avgPacePct}%`;

  const leftTicks = $("#activity-left-ticks");
  if (leftTicks) {
    const tickCount = 8;
    const leftShare = Math.min(1, Math.max(0, eachLeft / GOAL_PER_PERSON));
    const leftCount = Math.round(leftShare * tickCount);
    const doneCount = tickCount - leftCount;
    let ticksHtml = "";
    for (let i = 0; i < tickCount; i += 1) {
      ticksHtml += `<i class="${i < doneCount ? "is-done" : "is-left"}"></i>`;
    }
    leftTicks.innerHTML = ticksHtml;
  }

  const burnFill = $("#activity-burn-fill");
  const burnViz = $("#activity-burn-viz");
  const burnRef = Math.max(
    1,
    Math.round(participants.length * Math.max(personalPace, 1) * 0.39),
  );
  const burnPct = Math.min(100, Math.round((burned / burnRef) * 100));
  if (burnFill) burnFill.style.width = `${burnPct}%`;
  if (burnViz) burnViz.classList.toggle("is-hot", burnPct >= 70);

  const paceFill = $("#activity-pace-fill");
  const paceMark = $("#activity-pace-mark");
  const paceViz = $("#activity-pace-viz");
  const paceScale = Math.max(goal, groupTarget, total, 1);
  const actualPct = Math.min(100, Math.round((total / paceScale) * 100));
  const targetPctMini = Math.min(100, Math.round((groupTarget / paceScale) * 100));
  if (paceFill) paceFill.style.width = `${actualPct}%`;
  if (paceMark) paceMark.style.left = `${targetPctMini}%`;
  if (paceViz) {
    paceViz.classList.toggle("is-ahead", paceDelta > 0);
    paceViz.classList.toggle("is-on", paceDelta === 0 && groupTarget > 0);
  }

  // Activity-page visual storytelling (gauges, mix bar, day ticks).
  const fairDaily = GOAL_PER_PERSON / CHALLENGE_DAYS;
  const challengeDone = goal > 0 && total >= goal;
  const dailyPressure = challengeDone
    ? 100
    : dailyNeed <= 0
      ? 0
      : Math.min(100, Math.round((dailyNeed / Math.max(fairDaily, 1)) * 55));
  const dailyGaugeArc = $("#activity-daily-gauge-arc");
  if (dailyGaugeArc) dailyGaugeArc.style.strokeDasharray = `${dailyPressure} 100`;
  const dailyGauge = $("#activity-daily-gauge");
  if (dailyGauge) {
    dailyGauge.classList.toggle("is-easy", challengeDone || (dailyNeed > 0 && dailyNeed <= fairDaily));
    dailyGauge.classList.toggle(
      "is-warm",
      !challengeDone && dailyNeed > fairDaily && dailyNeed <= fairDaily * 1.5,
    );
    dailyGauge.classList.toggle("is-hot", !challengeDone && dailyNeed > fairDaily * 1.5);
    dailyGauge.setAttribute(
      "aria-label",
      dailyNeed > 0
        ? `Daily goal progress: ${number.format(dailyNeed)} reps per bro per day`
        : challengeDone
          ? "Challenge complete — daily goal met"
          : "Daily goal progress pending",
    );
  }

  const activeShare =
    participants.length > 0 ? Math.round((activeCrew / participants.length) * 100) : 0;
  const activeArc = $("#activity-active-arc");
  if (activeArc) activeArc.style.strokeDasharray = `${activeShare} 100`;
  const activeRing = $("#activity-active-ring");
  if (activeRing) {
    activeRing.setAttribute(
      "aria-label",
      `${activeCrew} of ${participants.length} active bros logging`,
    );
  }

  const plankMinutes = Math.max(0, Math.round((categoryTotals.planks || 0) / 60));
  const mixParts = {
    pushups: Math.max(0, categoryTotals.pushups || 0),
    squats: Math.max(0, categoryTotals.squats || 0),
    planks: plankMinutes,
    other: Math.max(0, categoryTotals.other || 0),
  };
  const mixSum = mixParts.pushups + mixParts.squats + mixParts.planks + mixParts.other;
  const setMixSegment = (id, value) => {
    const el = $(id);
    if (!el) return;
    el.style.flexGrow = String(mixSum > 0 ? value : 0);
  };
  setMixSegment("#activity-mix-pushups", mixParts.pushups);
  setMixSegment("#activity-mix-squats", mixParts.squats);
  setMixSegment("#activity-mix-planks", mixParts.planks);
  setMixSegment("#activity-mix-other", mixParts.other);
  const mixBar = $("#activity-mix-bar");
  if (mixBar) {
    mixBar.classList.toggle("is-empty", mixSum <= 0);
    const mixLabel =
      mixSum > 0
        ? `Exercise mix: ${number.format(mixParts.pushups)} push-ups, ${number.format(mixParts.squats)} squats, ${number.format(mixParts.planks)} plank min, ${number.format(mixParts.other)} other`
        : "Exercise mix empty";
    mixBar.setAttribute("aria-label", mixLabel);
  }

  const sessionsTicks = $("#activity-sessions-ticks");
  if (sessionsTicks) {
    const tickCount = daysGoal;
    const lit = Math.min(tickCount, daysLogged);
    let ticksHtml = "";
    for (let i = 0; i < tickCount; i += 1) {
      ticksHtml += `<i class="${i < lit ? "is-on" : ""}"></i>`;
    }
    sessionsTicks.innerHTML = ticksHtml;
  }

  renderPersonPage({ skipScroll });
  updateSiteMenu();
}

function formatDate(value) {
  const date = new Date(value);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return "Today";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatEnteredAt(activity) {
  const value = activity.loggedAt || activity.createdAt;
  if (!value) return "";
  const date = new Date(value);
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const day = formatDate(value);
  return day === "Today" ? `Today at ${time}` : `${day} at ${time}`;
}

function activityNoteText(activity) {
  return String(activity?.note || "").trim();
}

function clearLogFormError() {
  const el = $("#log-form-error");
  if (!el) return;
  el.hidden = true;
  el.textContent = "";
}

function clearWeightFormError() {
  const el = $("#weight-form-error");
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

function showWeightFormError(message) {
  const el = $("#weight-form-error");
  if (!el || !dialog.open || $("#weight-form")?.hidden) return false;
  el.hidden = false;
  el.textContent = message;
  el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  return true;
}

function hideToastSoon(toast, ms = 2400) {
  window.clearTimeout(window.__toastHideTimer);
  window.__toastHideTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible", "is-success");
  }, ms);
}

function showToast(message) {
  if (showLogFormError(message)) return;
  if (showWeightFormError(message)) return;
  const toast = $("#toast");
  if (!toast) return;
  toast.classList.remove("is-success");
  toast.textContent = message;
  toast.classList.add("is-visible");
  hideToastSoon(toast);
}

/** Fixed toast with check — does not change layout or scroll. */
function showWeightUpdatedToast() {
  const toast = $("#toast");
  if (!toast) return;
  toast.classList.add("is-success");
  toast.innerHTML =
    '<span class="toast__check" aria-hidden="true">✓</span><span class="toast__text">Weight updated</span>';
  toast.classList.add("is-visible");
  hideToastSoon(toast, 2600);
}

/**
 * Close weight dialog, refresh UI, keep scroll position, then show success toast.
 */
async function finishWeightSave(personId) {
  const scrollY = window.scrollY;
  const restoreScroll = () => {
    if (Math.abs(window.scrollY - scrollY) > 1) {
      window.scrollTo({ top: scrollY, left: 0, behavior: "auto" });
    }
  };

  renderWeightChart(personId);
  editingActivityId = null;
  await closeLogDialog();
  render({ skipScroll: true });
  restoreScroll();
  requestAnimationFrame(() => {
    restoreScroll();
    showWeightUpdatedToast();
  });
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

function rememberLastPerson(personId) {
  if (!personId || !crew.some((person) => person.id === personId)) return;
  try {
    localStorage.setItem(LAST_PERSON_KEY, personId);
  } catch {
    // Navigation still works if this browser blocks localStorage.
  }
  updateHomeWelcome();
}

/** New = no selected/confirmed person yet (LAST_PERSON or remembered PIN). */
function isNewVisitor() {
  return !storedLastPersonId() && !rememberedPersonId();
}

function updateHomeWelcome() {
  const hero = $("#home-hero");
  const dashboard = $("#dashboard-page");
  if (!hero) return;
  const isNew = isNewVisitor();
  hero.classList.toggle("is-new", isNew);
  dashboard?.classList.toggle("is-new-home", isNew);
  document.documentElement.classList.toggle("has-known-person", !isNew);
  const welcome = $("#hero-welcome");
  if (welcome) welcome.hidden = !isNew;
  const addReps = $("#hero-add-reps");
  if (addReps) addReps.hidden = !isNew;
  const howto = $("#hero-howto");
  if (howto) howto.hidden = !isNew;
  if (isNew) setRulesCollapsed(false);
}

function rememberPin(personId, pin) {
  try {
    localStorage.setItem(`${PIN_STORAGE_PREFIX}${personId}`, pin);
    rememberLastPerson(personId);
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
  updateHomeWelcome();
}

function storedLastPersonId() {
  try {
    const last = localStorage.getItem(LAST_PERSON_KEY);
    if (last && crew.some((person) => person.id === last)) return last;
    return null;
  } catch {
    return null;
  }
}

function rememberedPersonId() {
  try {
    const last = storedLastPersonId();
    if (last && storedPin(last)) return last;
    const match = crew.find((person) => storedPin(person.id));
    return match ? match.id : null;
  } catch {
    return null;
  }
}

/** True when the viewer is the person whose page is showing (PIN / remembered / last). */
function isPersonPageOwner(personId) {
  if (!personId) return false;
  const remembered = rememberedPersonId();
  if (remembered) return remembered === personId;
  const last = storedLastPersonId();
  return last === personId;
}

/** Person for the personalized menu home row (PIN optional — nav only). */
function menuHomePersonId() {
  return rememberedPersonId() || currentPersonId() || storedLastPersonId();
}

function updateQuickAddButton() {
  const navButton = $("#nav-add-reps-button");
  const personId = rememberedPersonId();
  const first = personId ? getPerson(personId).name.split(" ")[0].toUpperCase() : "";

  if (navButton) {
    if (personId) navButton.dataset.personId = personId;
    else delete navButton.dataset.personId;
    navButton.setAttribute("aria-label", personId ? `Add reps for ${first}` : "Add reps");
  }
}

function startAddRepsFlow() {
  const personId = rememberedPersonId();
  if (personId) {
    window.location.hash = `/person/${personId}/add`;
    return;
  }
  openPersonPicker();
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

function syncPinCodeCells() {
  const input = $("#pin-input");
  const code = $("#pin-code");
  if (!input || !code) return "";
  const digits = String(input.value || "").replace(/\D+/g, "").slice(0, 6);
  if (input.value !== digits) input.value = digits;
  code.dataset.digits = String(digits.length);
  const expanded = digits.length > 4;
  const complete = digits.length === 4 || digits.length === 6;
  code.querySelectorAll(".pin-code__cell").forEach((cell) => {
    const index = Number(cell.dataset.index);
    cell.classList.toggle("is-filled", index < digits.length);
    cell.classList.toggle(
      "is-active",
      !complete && index === digits.length && (expanded || index < 4),
    );
  });
  return digits;
}

let pinAutoSubmitTimer = null;

function resetPinCodeUI() {
  window.clearTimeout(pinAutoSubmitTimer);
  pinAutoSubmitTimer = null;
  const input = $("#pin-input");
  if (input) input.value = "";
  syncPinCodeCells();
}

function requestPin(personId, errorMessage = "") {
  const person = getPerson(personId);
  $("#pin-person-name").textContent = person.name;
  $("#pin-error").textContent = errorMessage;
  $("#pin-error").hidden = !errorMessage;
  resetPinCodeUI();
  $("#pin-dialog").showModal();
  window.setTimeout(() => {
    const input = $("#pin-input");
    if (!input) return;
    input.focus({ preventScroll: true });
    syncPinCodeCells();
  }, 0);

  return new Promise((resolve) => {
    resolvePinPrompt = resolve;
  });
}

function closePinPrompt(value = null) {
  window.clearTimeout(pinAutoSubmitTimer);
  pinAutoSubmitTimer = null;
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
  const allowed = new Set(["pushups", "squats", "planks", "other", "weight"]);
  const otherTypes = new Set(["workouts", "reps", "time"]);
  const rawOtherType = typeof body.otherType === "string" ? body.otherType.trim() : "";

  if (!allowed.has(exercise)) throw new ApiError("Choose a valid activity type.", 400);
  if (exercise === "weight") {
    if (!Number.isInteger(reps) || reps < WEIGHT_MIN_LB || reps > WEIGHT_MAX_LB) {
      throw new ApiError(`Weight must be from ${WEIGHT_MIN_LB} to ${WEIGHT_MAX_LB} lb.`, 400);
    }
  } else if (!Number.isInteger(reps) || reps < 1 || reps > 1000) {
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
  if (exercise === "other" && rawOtherType && !otherTypes.has(rawOtherType)) {
    throw new ApiError("Choose a valid other activity type.", 400);
  }

  const injuryInput = exercise === "other" && Boolean(body.injuryInput);
  const otherType =
    exercise === "other" ? (otherTypes.has(rawOtherType) ? rawOtherType : "workouts") : "";

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

function parseAppRoute() {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  const personMatch = path.match(/^\/person\/([a-z]+)(?:\/(add))?\/?$/);
  if (personMatch && crew.some((person) => person.id === personMatch[1])) {
    return { type: "person", personId: personMatch[1], openAdd: personMatch[2] === "add" };
  }
  if (path === "/leaderboard" || path.startsWith("/leaderboard/")) return { type: "leaderboard" };
  if (path === "/activity" || path.startsWith("/activity/")) return { type: "activity" };
  if (
    path === "/feed" ||
    path.startsWith("/feed/") ||
    path === "/activity-feed" ||
    path.startsWith("/activity-feed/")
  ) {
    return { type: "feed" };
  }
  if (path === "/recipes" || path.startsWith("/recipes/")) return { type: "recipes" };
  if (path === "/inspiration" || path.startsWith("/inspiration/")) return { type: "inspiration" };
  return { type: "challenge" };
}

function parsePersonRoute() {
  const route = parseAppRoute();
  if (route.type !== "person") return null;
  return { personId: route.personId, openAdd: route.openAdd };
}

function currentPersonId() {
  return parsePersonRoute()?.personId || null;
}

function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  const input = String(text || "").replace(/^\uFEFF/, "");

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];
    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((entry) => entry.some((value) => String(value).trim()));
}

function sheetItemTitleFromUrl(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host.includes("instagram")) return "Instagram post";
    if (host.includes("youtube") || host.includes("youtu.be")) return "YouTube video";
    if (host.includes("tiktok")) return "TikTok video";
    const parts = parsed.pathname.split("/").filter(Boolean);
    const slug = parts[parts.length - 1] || "";
    const titled = slug
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/[-_]+/g, " ")
      .trim()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
    return titled || host;
  } catch {
    return "Link";
  }
}

function isGenericLinkTitle(title) {
  const value = String(title || "").trim();
  if (!value) return true;
  return /^(youtube(\s+video)?|instagram(\s+post)?|tiktok(\s+video)?|link|video)$/i.test(value);
}

function youtubeIdFromUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.split("/").filter(Boolean)[0] || "";
    }
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.searchParams.get("v")) return parsed.searchParams.get("v");
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live") {
        return parts[1] || "";
      }
    }
  } catch {
    /* ignore */
  }
  return "";
}

const youtubeTitleCache = new Map();

function decodeHtmlEntitiesClient(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .trim();
}

async function fetchYoutubeOEmbedTitle(pageUrl) {
  const cacheKey = youtubeIdFromUrl(pageUrl) || pageUrl;
  if (youtubeTitleCache.has(cacheKey)) return youtubeTitleCache.get(cacheKey);
  const promise = (async () => {
    try {
      const endpoint = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(pageUrl)}`;
      const response = await fetch(endpoint, { headers: { Accept: "application/json" } });
      if (!response.ok) return "";
      const payload = await response.json();
      return decodeHtmlEntitiesClient(payload?.title || "");
    } catch {
      return "";
    }
  })();
  youtubeTitleCache.set(cacheKey, promise);
  const title = await promise;
  youtubeTitleCache.set(cacheKey, Promise.resolve(title));
  return title;
}

async function enrichSheetItemTitles(items) {
  return Promise.all(
    items.map(async (item) => {
      if (!isGenericLinkTitle(item.title) && item.title !== sheetItemTitleFromUrl(item.url)) {
        return item;
      }
      if (!youtubeIdFromUrl(item.url)) return item;
      const title = await fetchYoutubeOEmbedTitle(item.url);
      if (!title || isGenericLinkTitle(title)) return item;
      return { ...item, title };
    }),
  );
}

function parseSheetLinkCsv(text) {
  const rows = parseCsvRows(text);
  if (!rows.length) return [];
  const headers = rows[0].map((header) => String(header).trim().toLowerCase());
  const linkIdx = headers.findIndex(
    (header) =>
      header.includes("link") ||
      header.includes("url") ||
      /^(recipe|inspiration)$/.test(header),
  );
  const contributorIdx = headers.findIndex((header) =>
    /contributor|author|by|name|who/.test(header),
  );
  const imageIdx = headers.findIndex((header) => /image|thumb|photo|pic/.test(header));
  const descriptionIdx = headers.findIndex((header) =>
    /description|note|notes|blurb|caption|about/.test(header),
  );
  const titleIdx = headers.findIndex(
    (header) =>
      /^(title|recipe title|video title|link title)$/.test(header) ||
      (header.includes("title") &&
        !header.includes("subtitle") &&
        !/contributor|author|description|note/.test(header)),
  );
  const urlColumn = linkIdx >= 0 ? linkIdx : 0;
  const whoColumn = contributorIdx >= 0 ? contributorIdx : 1;

  return rows
    .slice(1)
    .map((row) => {
      const url = String(row[urlColumn] || "").trim();
      if (!/^https?:\/\//i.test(url)) return null;
      const contributor = String(row[whoColumn] || "").trim();
      const sheetImage = imageIdx >= 0 ? String(row[imageIdx] || "").trim() : "";
      const note = descriptionIdx >= 0 ? String(row[descriptionIdx] || "").trim() : "";
      const sheetTitle = titleIdx >= 0 ? String(row[titleIdx] || "").trim() : "";
      const yt = youtubeIdFromUrl(url);
      const image = /^https?:\/\//i.test(sheetImage)
        ? sheetImage
        : yt
          ? `https://img.youtube.com/vi/${yt}/hqdefault.jpg`
          : "";
      let host = "";
      try {
        host = new URL(url).hostname.replace(/^www\./, "");
      } catch {
        host = "";
      }
      const title =
        sheetTitle && !isGenericLinkTitle(sheetTitle) ? sheetTitle : sheetItemTitleFromUrl(url);
      return {
        title,
        url,
        contributor,
        note,
        description: note,
        linkDescription: "",
        image,
        host,
      };
    })
    .filter(Boolean);
}

const sheetFeedState = {
  recipes: { cache: null, promise: null },
  inspiration: { cache: null, promise: null },
};

async function fetchSheetCsv(url) {
  const response = await fetch(url, { headers: { Accept: "text/csv,text/plain,*/*" } });
  if (!response.ok) throw new Error("Sheet could not be loaded.");
  const csv = await response.text();
  if (
    /^\s*<!DOCTYPE html/i.test(csv) ||
    /accounts\.google\.com/i.test(csv) ||
    /Sign in/i.test(csv)
  ) {
    throw new Error("Sheet is still private.");
  }
  return parseSheetLinkCsv(csv);
}

async function fetchSheetFeed(kind) {
  const apiPath = kind === "inspiration" ? "/api/inspiration" : "/api/recipes";
  const csvUrls =
    kind === "inspiration"
      ? [INSPIRATION_CSV_URL]
      : [RECIPES_CSV_URL, RECIPES_CSV_FALLBACK_URL];
  let items = null;
  try {
    const response = await fetch(apiPath);
    if (response.ok) {
      const payload = await response.json();
      items = Array.isArray(payload.items)
        ? payload.items
        : Array.isArray(payload.recipes)
          ? payload.recipes
          : null;
    }
  } catch {
    // Fall through to direct sheet CSV.
  }
  if (!items) {
    let lastError = new Error("Sheet could not be loaded.");
    for (const csvUrl of csvUrls) {
      try {
        items = await fetchSheetCsv(csvUrl);
        break;
      } catch (error) {
        lastError = error;
      }
    }
    if (!items) throw lastError;
  }
  // Local static hosts skip /api/*, so CSV fallbacks still need YouTube titles.
  return enrichSheetItemTitles(items);
}

function renderSheetFeedList(kind, items) {
  const isInspiration = kind === "inspiration";
  const list = $(isInspiration ? "#inspiration-list" : "#recipes-list");
  const status = $(isInspiration ? "#inspiration-status" : "#recipes-status");
  if (!list) return;
  const emptyCopy = "Nothing here yet.";
  const countLabel = isInspiration
    ? `${items.length} spark${items.length === 1 ? "" : "s"}`
    : `${items.length} recipe${items.length === 1 ? "" : "s"}`;

  if (!items.length) {
    list.innerHTML = `<div class="empty-state">${emptyCopy}</div>`;
    if (status) {
      status.hidden = true;
      status.textContent = "";
    }
    return;
  }
  if (status) {
    status.hidden = false;
    status.textContent = countLabel;
  }
  list.innerHTML = items
    .map((item) => {
      const matchedPerson = item.contributor ? matchCrewPerson(item.contributor) : null;
      const who = item.contributor
        ? matchedPerson
          ? `<span class="recipe-card__meta">From <a class="recipe-card__person" href="#/person/${escapeHtml(matchedPerson.id)}">${escapeHtml(item.contributor)}</a></span>`
          : `<span class="recipe-card__meta">From ${escapeHtml(item.contributor)}</span>`
        : "";
      const linkDescription = item.linkDescription
        ? `<span class="recipe-card__desc">${escapeHtml(item.linkDescription)}</span>`
        : "";
      const submitterNote = (item.note || item.description || "").trim();
      const note = submitterNote
        ? `<span class="recipe-card__note">${escapeHtml(submitterNote)}</span>`
        : "";
      const host = item.host
        ? `<a class="recipe-card__host" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.host)}</a>`
        : "";
      const fallback = item.host?.includes("instagram")
        ? "IG"
        : item.host?.includes("youtube") || item.host?.includes("youtu.be")
          ? "YT"
          : "RC";
      const thumb = item.image
        ? `<img class="recipe-card__image" src="${escapeHtml(item.image)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" />`
        : `<span class="recipe-card__thumb-fallback" aria-hidden="true">${fallback}</span>`;
      return `
        <article class="recipe-card">
          <a class="recipe-card__thumb" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" aria-hidden="true" tabindex="-1">${thumb}</a>
          <div class="recipe-card__copy">
            <a class="recipe-card__title" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer"><strong>${escapeHtml(item.title)}</strong></a>
            ${linkDescription}
            ${note}
            ${who}
          </div>
          ${host}
        </article>
      `;
    })
    .join("");
}

async function loadSheetFeedPage(kind, { force = false } = {}) {
  const isInspiration = kind === "inspiration";
  const list = $(isInspiration ? "#inspiration-list" : "#recipes-list");
  const status = $(isInspiration ? "#inspiration-status" : "#recipes-status");
  const state = sheetFeedState[kind];
  if (!list || !state) return;
  const loadingCopy = isInspiration ? "Loading tips etc…" : "Loading recipes…";
  const syncCopy = "Syncing from Google Sheet…";
  const failCopy = isInspiration
    ? "Tips etc could not be loaded."
    : "Eats could not be loaded.";
  const privateCopy =
    "This Google Sheet is still private. Share it as Anyone with the link → Viewer, then refresh.";

  const showFeedError = (error) => {
    const message = /private/i.test(error?.message || "")
      ? privateCopy
      : error?.message || failCopy;
    list.innerHTML = `<div class="empty-state">${escapeHtml(message)}</div>`;
    if (status) {
      status.hidden = false;
      status.textContent = /private/i.test(error?.message || "")
        ? "Sheet is private"
        : "Could not load right now. Try again later.";
    }
  };

  if (!force && state.cache) {
    renderSheetFeedList(kind, state.cache);
    return;
  }
  if (!force && state.promise) {
    list.innerHTML = `<div class="empty-state">${loadingCopy}</div>`;
    if (status) {
      status.hidden = false;
      status.textContent = syncCopy;
    }
    try {
      renderSheetFeedList(kind, await state.promise);
    } catch (error) {
      showFeedError(error);
    }
    return;
  }

  list.innerHTML = `<div class="empty-state">${loadingCopy}</div>`;
  if (status) {
    status.hidden = false;
    status.textContent = syncCopy;
  }
  state.promise = fetchSheetFeed(kind)
    .then((items) => {
      state.cache = items;
      return items;
    })
    .finally(() => {
      state.promise = null;
    });
  try {
    renderSheetFeedList(kind, await state.promise);
  } catch (error) {
    showFeedError(error);
  }
}

function renderResourcePages() {
  const route = parseAppRoute();
  if (route.type === "recipes") loadSheetFeedPage("recipes");
  if (route.type === "inspiration") loadSheetFeedPage("inspiration");
}

function showAppPage(pageId, { skipScroll = false } = {}) {
  const pages = {
    challenge: $("#dashboard-page"),
    person: $("#person-page"),
    activity: $("#activity-page"),
    feed: $("#feed-page"),
    leaderboard: $("#leaderboard-page"),
    recipes: $("#recipes-page"),
    inspiration: $("#inspiration-page"),
  };
  Object.entries(pages).forEach(([id, el]) => {
    if (el) el.hidden = id !== pageId;
  });
  const homeLink = $("#ripped-home-link");
  if (homeLink) {
    if (pageId === "challenge") homeLink.setAttribute("aria-current", "page");
    else homeLink.removeAttribute("aria-current");
  }
  if (!skipScroll && pageId !== "person") {
    window.scrollTo({ top: 0, behavior: "auto" });
  }
  if (pageId === "feed") {
    scrollFeedDayFilterToSelected({ smooth: false });
  }
}

function renderPersonPage({ skipScroll = false } = {}) {
  const appRoute = parseAppRoute();

  if (appRoute.type !== "person") {
    const returningHome = wasShowingPersonPage;
    wasShowingPersonPage = false;
    showAppPage(appRoute.type, { skipScroll });
    updateQuickAddButton();
    renderResourcePages();
    if (returningHome && appRoute.type === "challenge" && !skipScroll) scrollHomeToTop();
    return;
  }

  const personId = appRoute.personId;
  const route = { personId, openAdd: appRoute.openAdd };
  wasShowingPersonPage = true;
  const isOwner = isPersonPageOwner(personId);
  if (isOwner) rememberLastPerson(personId);
  showAppPage("person", { skipScroll: true });

  const person = getPerson(personId);
  const allStats = totalsByPerson();
  const ranking = allStats
    .filter((entry) => entry.status === "in" && !entry.honorary)
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
    const exercise = activityExercise(activity);
    if (exercise === "weight") return;
    sessionDays[exercise].add(activity.createdAt.slice(0, 10));
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
  const workoutUnits = otherWorkoutUnits(personStats.metrics.other);
  const latestWeight =
    history
      .filter((activity) => isWeightActivity(activity))
      .sort(compareActivitiesRecentFirst)[0] || null;

  $("#person-avatar").src = person.image;
  $("#person-avatar").alt = `${person.name} profile photo`;
  const rankTile = $("#person-rank-tile");
  const rankBadge = $("#person-rank");
  const rankLabel = person.honorary
    ? "HONORARY"
    : personStats.status === "out"
      ? "OUT"
      : personStats.status === "unknown"
        ? ""
        : rank
          ? formatRankLabel(rank)
          : "";
  rankBadge.textContent = rankLabel || "—";
  rankTile.hidden = !rankLabel;
  rankTile.classList.toggle("is-out", personStats.status === "out");
  rankTile.classList.toggle("is-honorary", Boolean(person.honorary));
  $("#person-name").innerHTML = formatPersonHeadline(person.name);
  $("#person-summary").textContent = person.honorary
    ? `${person.name.split(" ")[0]} is an honorary bro — logs show up, but don’t count toward the crew total.`
    : personStats.status === "out"
      ? `${person.name.split(" ")[0]} is sitting this challenge out.`
      : history.length
        ? `${person.name.split(" ")[0]} has put in ${personStats.sessions} ${personStats.sessions === 1 ? "session" : "sessions"} on the road to Joshua Tree.`
        : `${person.name.split(" ")[0]} is ready to choose whether to join the challenge.`;
  const participationCard = $("#participation-card");
  participationCard.hidden = !isOwner || person.honorary || history.length > 0;
  participationCard.querySelectorAll("[data-participation]").forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.participation === personStats.status);
  });
  const showProgress = person.honorary || history.length > 0 || personStats.status === "in";
  const todayKey = localDateValue();
  $(".personal-total").hidden = !showProgress;
  $(".personal-total")?.classList.toggle("is-honorary", Boolean(person.honorary));
  $("#person-log-button").hidden = !isOwner || personStats.status !== "in";
  const quickAdd = $("#person-quick-add");
  if (quickAdd) quickAdd.hidden = !isOwner || personStats.status !== "in";
  $("#person-total").textContent = number.format(personStats.total);
  $("#person-total-label").textContent = person.honorary
    ? personStats.primaryType === "other"
      ? "HONORARY ALTERNATIVE"
      : "HONORARY PUSH-UPS"
    : personStats.primaryType === "other"
      ? "TOTAL ALTERNATIVE WORK"
      : "PUSH-UP COUNT";
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
  $("#person-other-days").textContent = workoutNumber.format(workoutUnits);
  setCompactMagnitude(
    $(".personal-breakdown"),
    personStats.metrics.pushups,
    personStats.metrics.squats,
    plankMinutes,
    workoutUnits,
  );
  $("#person-avg-pushups").textContent = number.format(
    Math.round(averageFor("pushups", personStats.metrics.pushups)),
  );
  $("#person-avg-squats").textContent = number.format(
    Math.round(averageFor("squats", personStats.metrics.squats)),
  );
  $("#person-avg-planks").textContent = durationNumber.format(
    averageFor("planks", plankMinutes),
  );
  $("#person-avg-other").textContent = workoutNumber.format(
    averageFor("other", workoutUnits),
  );
  renderPersonDayChart(personId);
  const weightSection = $("#person-weight-section");
  const updateWeightBtn = $("#person-update-weight");
  const canTrackWeight = isOwner && personStats.status === "in";
  const showWeightSection =
    showProgress && (Boolean(latestWeight) || canTrackWeight);
  if (weightSection) weightSection.hidden = !showWeightSection;
  if (updateWeightBtn) {
    updateWeightBtn.hidden = !canTrackWeight;
    updateWeightBtn.textContent = latestWeight ? "Update weight" : "Add weight";
  }
  if (showWeightSection) {
    paintWeightChart("#person-weight-chart", personId);
  }
  $("#person-button-name").textContent = person.name.split(" ")[0].toUpperCase();
  const historyGroups = [...historyByDate];
  if (showProgress) {
    const presentKeys = new Set(historyGroups.map((group) => group.dateKey));
    // Fill every challenge day through today so empty days still show + Add Reps.
    for (let day = 1; day <= CHALLENGE_DAYS; day += 1) {
      const dateKey = challengeDayDateKey(day);
      if (dateKey > todayKey) break;
      if (presentKeys.has(dateKey)) continue;
      historyGroups.push({
        dateKey,
        date: new Date(`${dateKey}T12:00:00`),
        activities: [],
      });
      presentKeys.add(dateKey);
    }
    historyGroups.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }
  if (personHistoryForPersonId !== personId) {
    personHistoryForPersonId = personId;
    personHistoryVisibleDays = PERSON_HISTORY_PAGE_SIZE;
  }
  const recentHistoryGroups = historyGroups.filter(
    (group) => !isCondensedHistoryDay(group.dateKey, todayKey),
  );
  const condensedHistoryGroups = historyGroups.filter((group) =>
    isCondensedHistoryDay(group.dateKey, todayKey),
  );
  const visibleCondensedHistory = condensedHistoryGroups.slice(0, personHistoryVisibleDays);
  const hasMoreHistoryDays = condensedHistoryGroups.length > personHistoryVisibleDays;
  const visibleHistoryGroups = [...recentHistoryGroups, ...visibleCondensedHistory];
  const historyMoreBtn = $("#person-history-more");
  if (historyMoreBtn) historyMoreBtn.hidden = !hasMoreHistoryDays;
  $("#person-activity-list").innerHTML = visibleHistoryGroups.length
    ? (() => {
        const parts = [];
        let timelineStarted = false;
        let yesterdayHeadingStarted = false;
        let historyHeadingStarted = false;
        visibleHistoryGroups.forEach((group) => {
          const isToday = group.dateKey === todayKey;
          const dayAge = historyDayAgeDays(group.dateKey, todayKey);
          const condensed = isCondensedHistoryDay(group.dateKey, todayKey);
          const emptyDayCopy =
            '<p class="history-day-empty" role="status">No reps recorded</p>';
          const activitiesHtml = !group.activities.length
            ? emptyDayCopy
            : condensed
              ? `<div class="history-day-condensed${person.honorary ? " is-honorary" : ""}">
                  <ul class="history-condensed-list">
                    ${group.activities
                      .map((activity) => {
                        const line = escapeHtml(formatCondensedActivityLine(activity));
                        const name = escapeHtml(exerciseName(activity));
                        const exercise = activityExercise(activity);
                        const colorDot = `<span class="history-condensed-dot is-${escapeHtml(exercise)}" aria-hidden="true"></span>`;
                        if (isOwner) {
                          return `
                            <li
                              class="history-condensed-row is-editable"
                              data-activity-id="${escapeHtml(activity.id)}"
                              role="button"
                              tabindex="0"
                              aria-label="Edit ${name} entry"
                            >
                              ${colorDot}
                              <span class="history-condensed-text">${line}</span>
                              <button
                                class="delete-activity-button"
                                type="button"
                                data-delete-activity-id="${escapeHtml(activity.id)}"
                                aria-label="Delete ${name} entry"
                              >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                  <path d="M4 7h16M9 7V4h6v3m-9 0 1 13h10l1-13M10 11v5m4-5v5" />
                                </svg>
                              </button>
                            </li>
                          `;
                        }
                        return `
                          <li
                            class="history-condensed-row is-readonly"
                            data-activity-id="${escapeHtml(activity.id)}"
                            aria-label="${name} entry"
                          >
                            ${colorDot}
                            <span class="history-condensed-text">${line}</span>
                          </li>
                        `;
                      })
                      .join("")}
                  </ul>
                </div>`
              : group.activities
                  .map((activity) => {
                    const justAdded = isJustAdded(activity);
                    const note = activityNoteText(activity);
                    const enteredAt = formatEnteredAt(activity);
                    const detailBits = [
                      note
                        ? `<span class="activity-note">${escapeHtml(note)}</span>`
                        : "",
                      enteredAt
                        ? `<span class="activity-entered">${escapeHtml(enteredAt)}</span>`
                        : "",
                    ]
                      .filter(Boolean)
                      .join("");
                    const repsMag = activityCompactMagnitude(activity);
                    if (isOwner) {
                      return `
                      <article class="activity-item is-editable${person.honorary ? " is-honorary" : ""}${justAdded ? " is-just-added" : ""}" data-activity-id="${escapeHtml(activity.id)}" role="button" tabindex="0" aria-label="Edit ${escapeHtml(exerciseName(activity))} entry">
                        ${exerciseIcon(activity)}
                        <div class="activity-main">
                          <p><span class="activity-reps${repsMag}">${formatActivityLead(activity)}</span> ${escapeHtml(exerciseName(activity))}</p>
                          ${detailBits}
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
                    }
                    return `
                      <article class="activity-item is-readonly${person.honorary ? " is-honorary" : ""}" data-activity-id="${escapeHtml(activity.id)}" aria-label="${escapeHtml(exerciseName(activity))} entry">
                        ${exerciseIcon(activity)}
                        <div class="activity-main">
                          <p><span class="activity-reps${repsMag}">${formatActivityLead(activity)}</span> ${escapeHtml(exerciseName(activity))}</p>
                          ${detailBits}
                        </div>
                      </article>
                    `;
                  })
                  .join("");
          const dayHtml = `
            <div class="history-day${isToday ? " is-today" : ""}${condensed ? " is-condensed" : ""}">
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
              <div class="history-day-activities${condensed ? " is-condensed" : ""}">
                ${activitiesHtml}
              </div>
              ${
                isOwner
                  ? `<button class="add-to-date-button${condensed ? " is-on-timeline" : ""}" type="button" data-log-date="${group.dateKey}">
                <span class="add-to-date-icon" aria-hidden="true">+</span>
                <span class="add-to-date-label">Add Reps</span>
              </button>`
                  : ""
              }
            </div>
          `;
          if (dayAge === 1 && !yesterdayHeadingStarted) {
            parts.push('<h2 class="person-history-heading">Yesterday</h2>');
            yesterdayHeadingStarted = true;
          }
          if (dayAge >= 2 && !historyHeadingStarted) {
            parts.push('<h2 class="person-history-heading">History</h2>');
            historyHeadingStarted = true;
          }
          if (condensed && !timelineStarted) {
            parts.push('<div class="history-timeline">');
            timelineStarted = true;
          }
          parts.push(dayHtml);
        });
        if (timelineStarted) parts.push("</div>");
        return parts.join("");
      })()
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
    if (isOwner && !dialog.open) {
      window.setTimeout(() => openLogDialog(personId), 0);
    }
  }
}

const personInput = $("#person-input");

const exerciseInput = $("#exercise-input");
const exerciseButtons = [...document.querySelectorAll("[data-exercise]")];
const quickButtons = [...document.querySelectorAll("[data-increment]")];
const EXERCISE_ORDER = ["pushups", "squats", "planks", "other"];
const OTHER_TYPE_ORDER = ["workouts", "reps", "time"];

function emptyLogDrafts() {
  return {
    pushups: { reps: 0 },
    squats: { reps: 0 },
    planks: { reps: 0 },
    other: { reps: 0, otherActivity: "", injuryInput: false, otherType: "workouts" },
  };
}

let logDrafts = emptyLogDrafts();

function currentOtherType() {
  const input = $("#other-type-input");
  const value = input?.value || "workouts";
  return OTHER_TYPE_ORDER.includes(value) ? value : "workouts";
}

function setOtherType(type, { syncDraft = true } = {}) {
  const next = OTHER_TYPE_ORDER.includes(type) ? type : "workouts";
  const input = $("#other-type-input");
  if (input) input.value = next;
  document.querySelectorAll("[data-other-type]").forEach((button) => {
    const selected = button.dataset.otherType === next;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-checked", selected ? "true" : "false");
  });
  const tabs = $(".other-type-tabs");
  if (tabs) tabs.dataset.active = next;
  if (exerciseInput.value === "other") {
    updateExerciseFields({ keepAmount: true });
  }
  if (syncDraft) saveCurrentDraft();
}

function amountMaxForExercise(exercise, otherType = currentOtherType()) {
  if (exercise === "other" && otherType === "workouts") return 100;
  return 1000;
}

function setAmount(value) {
  const max = amountMaxForExercise(exerciseInput.value);
  const amount = Math.max(0, Math.min(max, Math.round(Number(value) || 0)));
  const input = $("#reps-input");
  input.value = amount;
  const showCompact = exerciseInput.value === "other" && currentOtherType() === "workouts";
  if (showCompact) {
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
    const otherType = currentOtherType();
    return {
      reps: Math.max(0, Math.min(amountMaxForExercise("other", otherType), reps)),
      otherActivity: $("#other-input").value.trim(),
      injuryInput: Boolean($("#injury-input-toggle")?.checked),
      otherType,
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
      const injuryInput = Boolean(draft.injuryInput);
      const otherType = OTHER_TYPE_ORDER.includes(draft.otherType) ? draft.otherType : "workouts";
      if (!otherActivity) {
        return { exercise, reps, otherActivity: "", injuryInput, otherType, invalid: "name" };
      }
      return { exercise, reps, otherActivity, injuryInput, otherType };
    }
    return { exercise, reps, otherActivity: "", injuryInput: false, otherType: "" };
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
  const draft = logDrafts[exercise] || emptyLogDrafts()[exercise] || { reps: 0 };
  if (exercise === "other") {
    $("#other-input").value = draft.otherActivity || "";
    const injuryToggle = $("#injury-input-toggle");
    if (injuryToggle) injuryToggle.checked = Boolean(draft.injuryInput);
    setOtherType(draft.otherType || "workouts", { syncDraft: false });
  }
  setAmount(draft.reps || 0);
}

function updateExerciseFields({ keepAmount = false } = {}) {
  const exercise = exerciseInput.value;
  const otherType = currentOtherType();
  const settings = {
    pushups: { label: "Push-up reps", unit: "REPS", quick: [5, 10, 25, 50], percent: false },
    squats: { label: "Squat reps", unit: "REPS", quick: [5, 10, 25, 50], percent: false },
    planks: {
      label: "Plank time",
      unit: "SECONDS",
      quick: [30, 60, 90, 120],
      percent: false,
      quickLabel: (seconds) => `+${seconds / 60}`.replace(/^\+0/, "+") + "min",
    },
    other: {
      workouts: {
        label: "Misc Workout",
        unit: "% EFFORT",
        quick: [25, 50, 75, 100],
        percent: true,
        quickLabel: (n) => `+${n}%`,
      },
      reps: {
        label: "Misc Rep",
        unit: "REPS",
        quick: [10, 25, 50, 100],
        percent: false,
        quickLabel: (n) => `+${n}`,
      },
      time: {
        label: "Misc Timed",
        unit: "MIN",
        quick: [10, 20, 30, 45],
        percent: false,
        quickLabel: (n) => `+${n}`,
      },
    }[otherType],
  }[exercise] || {
    label: "Activity amount",
    unit: "REPS",
    quick: [5, 10, 25, 50],
    percent: false,
  };

  exerciseButtons.forEach((button) => {
    const selected = button.dataset.exercise === exercise;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-selected", selected ? "true" : "false");
  });
  const tabs = $(".exercise-tabs");
  if (tabs) tabs.dataset.active = exercise;
  const quickReps = $(".quick-reps");
  if (quickReps) quickReps.dataset.active = exercise === "other" ? `other-${otherType}` : exercise;
  $("#amount-unit").textContent = settings.unit;
  const amountValue = $(".amount-value");
  if (amountValue) amountValue.classList.toggle("is-percent", Boolean(settings.percent));
  const suffix = $("#amount-suffix");
  if (suffix) {
    suffix.hidden = !settings.percent;
    suffix.setAttribute("aria-hidden", settings.percent ? "false" : "true");
  }
  $("#reps-input").setAttribute("aria-label", settings.label);
  $("#reps-input").setAttribute("maxlength", settings.percent ? "3" : "4");
  const isOther = exercise === "other";
  $("#other-field").hidden = !isOther;
  const injuryField = $("#injury-input-field");
  if (injuryField) injuryField.hidden = !isOther;
  $("#other-input").required = false;
  quickButtons.forEach((button, index) => {
    const amount = settings.quick[index] || 0;
    button.hidden = !amount;
    button.dataset.increment = amount;
    button.textContent = settings.quickLabel ? settings.quickLabel(amount) : `+${amount}`;
  });
  if (!keepAmount) {
    setAmount(0);
  } else {
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

function yesterdayDateValue(from = new Date()) {
  const day = new Date(from.getFullYear(), from.getMonth(), from.getDate() - 1);
  return localDateValue(day);
}

function workoutDateOtherLabel(dateKey) {
  if (!dateKey) return "";
  const date = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  const dow = date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const today = localDateValue();
  const age = historyDayAgeDays(dateKey, today);
  // Within the last week: weekday is enough; older dates get a short month+day.
  if (age >= 0 && age < 7) return dow;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function syncWorkoutDateToggle() {
  const input = $("#activity-date-input");
  const toggle = $("#workout-date-toggle");
  const otherLabel = $("#workout-date-other-label");
  const otherWrap = toggle?.querySelector(".workout-date-other-wrap");
  if (!input || !toggle) return;

  const today = localDateValue();
  const yesterday = yesterdayDateValue();
  input.min = CHALLENGE_START;
  input.max = today;
  const value = input.value || today;
  if (!input.value) input.value = value;

  let preset = "other";
  if (value === today) preset = "today";
  else if (value === yesterday) preset = "yesterday";

  toggle.dataset.active = preset;
  toggle.querySelectorAll("button[data-date-preset]").forEach((button) => {
    const selected = button.dataset.datePreset === preset;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", selected ? "true" : "false");
  });
  otherWrap?.classList.toggle("is-selected", preset === "other");

  if (otherLabel) {
    otherLabel.textContent = preset === "other" ? workoutDateOtherLabel(value) : "";
  }
  input.setAttribute(
    "aria-label",
    preset === "other"
      ? `Workout date ${workoutDateOtherLabel(value) || value}. Change date`
      : "Pick another workout date",
  );
}

function setActivityDateValue(dateKey, { emitChange = false } = {}) {
  const input = $("#activity-date-input");
  if (!input) return;
  const today = localDateValue();
  let next = dateKey || today;
  if (next > today) next = today;
  if (next < CHALLENGE_START) next = CHALLENGE_START;
  const changed = input.value !== next;
  input.min = CHALLENGE_START;
  input.max = today;
  input.value = next;
  syncWorkoutDateToggle();
  if (emitChange && changed) {
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

function unlockLogDialogHeight() {
  dialog.style.height = "";
  dialog.style.minHeight = "";
}

/**
 * Most recent weight log for a person by activity date, then logged timestamp.
 */
function latestWeightActivity(personId) {
  if (!personId) return null;
  let latest = null;
  for (const activity of activities) {
    if (activity.personId !== personId || !isWeightActivity(activity)) continue;
    if (!latest) {
      latest = activity;
      continue;
    }
    const latestKey = activityDateKey(latest);
    const entryKey = activityDateKey(activity);
    if (entryKey > latestKey) {
      latest = activity;
      continue;
    }
    if (entryKey < latestKey) continue;
    if (activityLoggedAt(activity) >= activityLoggedAt(latest)) latest = activity;
  }
  return latest;
}

/**
 * Weight logs for a person as challenge day × lb (one point per activity).
 * Day is 1-based from CHALLENGE_START; only days inside 1…CHALLENGE_DAYS are kept.
 */
function personWeightChartPoints(personId) {
  if (!personId) return [];
  return activities
    .filter((activity) => activity.personId === personId && isWeightActivity(activity))
    .map((activity) => {
      const dateKey = activityDateKey(activity);
      const day = dateKey ? challengeDayIndex(new Date(`${dateKey}T12:00:00`)) : 0;
      return {
        dateKey,
        day,
        weight: Number(activity.reps) || 0,
        at: activityLoggedAt(activity),
      };
    })
    .filter(
      (point) =>
        point.dateKey &&
        point.day >= 1 &&
        point.day <= CHALLENGE_DAYS &&
        point.weight > 0,
    )
    .sort((a, b) => a.day - b.day || a.at - b.at);
}

function niceWeightAxisTicks(minW, maxW, targetCount = 5) {
  const span = Math.max(1, maxW - minW);
  const raw = span / Math.max(1, targetCount - 1);
  const niceSteps = [1, 2, 5, 10, 15, 20, 25, 50, 100];
  const step = niceSteps.find((value) => value >= raw) || Math.ceil(raw);
  const start = Math.floor(minW / step) * step;
  const ticks = [];
  for (let value = start; value <= maxW + 0.001; value += step) {
    if (value >= minW - 0.001 && value <= maxW + 0.001) ticks.push(value);
  }
  if (!ticks.length) ticks.push(Math.round(minW), Math.round(maxW));
  return ticks;
}

/** Catmull-Rom → cubic Bézier path through chart points. */
function weightChartSmoothPath(coords) {
  if (!coords.length) return "";
  if (coords.length === 1) {
    return `M${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  }
  if (coords.length === 2) {
    return `M${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)} L${coords[1].x.toFixed(
      1,
    )} ${coords[1].y.toFixed(1)}`;
  }
  let d = `M${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < coords.length - 1; i += 1) {
    const p0 = coords[i - 1] || coords[i];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${cp2x.toFixed(1)} ${cp2y.toFixed(
      1,
    )} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

/**
 * Challenge weight chart: X = days 1–100, Y = lb.
 * @param {HTMLElement|string|null} chartOrSelector chart root (`.weight-chart`)
 * @param {string} [personId]
 */
function paintWeightChart(chartOrSelector, personId) {
  const chart =
    typeof chartOrSelector === "string"
      ? $(chartOrSelector)
      : chartOrSelector || $("#weight-chart");
  if (!chart) return;

  const svg = chart.querySelector(".weight-chart__svg");
  const empty = chart.querySelector(".weight-chart__empty");
  if (!svg || !empty) return;

  const allPoints = personWeightChartPoints(personId);

  // One plotted point per challenge day (latest log that day wins).
  const byDay = new Map();
  for (const point of allPoints) {
    byDay.set(point.day, point);
  }
  const points = [...byDay.values()].sort((a, b) => a.day - b.day);

  // Match viewBox aspect to the laid-out CSS box so text/grid aren't stretched
  // when the chart is much wider than the intrinsic 320×142 design size.
  const height = 142;
  const boxW = chart.clientWidth || svg.clientWidth;
  const boxH = chart.clientHeight || svg.clientHeight || height;
  const width =
    boxW > 0 && boxH > 0
      ? Math.max(280, Math.round((boxW / boxH) * height))
      : 320;
  // No Y-axis labels — keep room for day labels + floating weight values.
  const pad = { top: 18, right: 14, bottom: 26, left: 14 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const daySpan = Math.max(1, CHALLENGE_DAYS - 1);
  const gradId = `weight-fill-${chart.id || "chart"}`;

  let minW = 150;
  let maxW = 220;
  if (points.length) {
    const weights = points.map((p) => p.weight);
    const lo = Math.min(...weights);
    const hi = Math.max(...weights);
    const padLbs = Math.max(3, Math.round((hi - lo) * 0.15) || 3);
    minW = Math.max(1, Math.floor(lo - padLbs));
    maxW = Math.ceil(hi + padLbs);
    if (maxW <= minW) maxW = minW + 10;
  }

  // Day 1 left → Day 100 right; higher weight up.
  const xForDay = (day) => pad.left + ((day - 1) / daySpan) * plotW;
  const yForWeight = (w) =>
    pad.top + ((maxW - w) / Math.max(1e-6, maxW - minW)) * plotH;

  const placeWeightLabel = (x, y, label) => {
    const approxW = label.length * 6.4;
    let lx = x;
    let anchor = "middle";
    if (x - approxW / 2 < pad.left) {
      lx = pad.left;
      anchor = "start";
    } else if (x + approxW / 2 > pad.left + plotW) {
      lx = pad.left + plotW;
      anchor = "end";
    }
    const above = y >= pad.top + 14;
    const ly = above ? y - 9 : y + 15;
    const tipW = approxW + 10;
    const tipH = 15;
    const tipX =
      anchor === "start" ? lx : anchor === "end" ? lx - tipW : lx - tipW / 2;
    const tipY = ly - 11;
    return { lx, ly, anchor, tipX, tipY, tipW, tipH };
  };

  const yTicks = niceWeightAxisTicks(minW, maxW, 4);
  const dayLabelStep = 25;
  const dayTicks = [];
  for (let day = 1; day <= CHALLENGE_DAYS; day += 1) {
    const isEdge = day === 1 || day === CHALLENGE_DAYS;
    if (isEdge || day % dayLabelStep === 0) dayTicks.push(day);
  }

  let grid = "";
  for (const tick of yTicks) {
    const y = yForWeight(tick);
    grid += `<line class="weight-chart__grid weight-chart__grid--y" x1="${pad.left}" y1="${y.toFixed(
      1,
    )}" x2="${pad.left + plotW}" y2="${y.toFixed(1)}" />`;
  }
  for (const day of dayTicks) {
    if (day === 1 || day === CHALLENGE_DAYS) continue;
    const x = xForDay(day);
    grid += `<line class="weight-chart__grid weight-chart__grid--x" x1="${x.toFixed(
      1,
    )}" y1="${pad.top}" x2="${x.toFixed(1)}" y2="${pad.top + plotH}" />`;
  }

  let refs = "";
  if (points.length >= 1) {
    const startW = points[0].weight;
    const latestW = points[points.length - 1].weight;
    const startY = yForWeight(startW);
    refs += `<line class="weight-chart__ref weight-chart__ref--start" x1="${pad.left}" y1="${startY.toFixed(
      1,
    )}" x2="${pad.left + plotW}" y2="${startY.toFixed(1)}" />`;
    if (latestW !== startW) {
      const latestY = yForWeight(latestW);
      refs += `<line class="weight-chart__ref weight-chart__ref--latest" x1="${pad.left}" y1="${latestY.toFixed(
        1,
      )}" x2="${pad.left + plotW}" y2="${latestY.toFixed(1)}" />`;
    }
  }

  const dayLabels = dayTicks
    .map((day) => {
      const x = xForDay(day);
      const anchor =
        day === 1 ? "start" : day === CHALLENGE_DAYS ? "end" : "middle";
      return `<text class="weight-chart__label weight-chart__day" x="${x.toFixed(1)}" y="${
        pad.top + plotH + 16
      }" text-anchor="${anchor}">Day ${day}</text>`;
    })
    .join("");

  const defs = `
    <defs>
      <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--terra)" stop-opacity="0.28" />
        <stop offset="55%" stop-color="var(--lime)" stop-opacity="0.1" />
        <stop offset="100%" stop-color="var(--lime)" stop-opacity="0" />
      </linearGradient>
    </defs>
  `;

  const axis = `
    ${defs}
    ${grid}
    ${refs}
    <line class="weight-chart__axis" x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${
      pad.top + plotH
    }" />
    <line class="weight-chart__axis" x1="${pad.left}" y1="${pad.top + plotH}" x2="${
      pad.left + plotW
    }" y2="${pad.top + plotH}" />
    ${dayLabels}
  `;

  let series = "";
  if (points.length) {
    const coords = points.map((p) => ({
      x: xForDay(p.day),
      y: yForWeight(p.weight),
      weight: p.weight,
    }));
    const lineD = weightChartSmoothPath(coords);
    const baseline = pad.top + plotH;
    const areaD = `${lineD} L${coords[coords.length - 1].x.toFixed(1)} ${baseline.toFixed(
      1,
    )} L${coords[0].x.toFixed(1)} ${baseline.toFixed(1)} Z`;
    series = `<path class="weight-chart__area" d="${areaD}" fill="url(#${gradId})" />`;
    series += `<path class="weight-chart__line" d="${lineD}" />`;
    series += coords
      .map((c, i) => {
        const isLatest = i === coords.length - 1;
        const label = `${Math.round(c.weight)} LB`;
        const place = placeWeightLabel(c.x, c.y, label);
        const valueEl = isLatest
          ? `<text class="weight-chart__value" x="${place.lx.toFixed(1)}" y="${place.ly.toFixed(
              1,
            )}" text-anchor="${place.anchor}">${label}</text>`
          : `<g class="weight-chart__tip" aria-hidden="true">
              <rect class="weight-chart__tip-bg" x="${place.tipX.toFixed(1)}" y="${place.tipY.toFixed(
                1,
              )}" width="${place.tipW.toFixed(1)}" height="${place.tipH}" rx="4" ry="4" />
              <text class="weight-chart__tip-text" x="${place.lx.toFixed(1)}" y="${(
                place.tipY + 11
              ).toFixed(1)}" text-anchor="${place.anchor}">${label}</text>
            </g>`;
        return `<g class="weight-chart__marker${isLatest ? " is-latest" : ""}">
          <circle class="weight-chart__hit" cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="11" />
          <circle class="weight-chart__halo" cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="5.5" />
          <circle class="weight-chart__point" cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="2.6" />
          ${valueEl}
        </g>`;
      })
      .join("");
  }

  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = axis + series;
  empty.textContent = "Add starting weight";
  empty.hidden = points.length > 0;
  chart.classList.toggle("is-empty", points.length === 0);
  chart.setAttribute(
    "aria-label",
    points.length
      ? `Body weight across ${CHALLENGE_DAYS} challenge days`
      : `Body weight across ${CHALLENGE_DAYS} challenge days, add starting weight`,
  );
}

/** Refresh every mounted weight chart for this person (dialog + person page). */
function renderWeightChart(personId = personInput?.value) {
  const id = personId || "";
  paintWeightChart("#weight-chart", id);
  const pagePerson = currentPersonId();
  if (pagePerson && (!id || pagePerson === id)) {
    paintWeightChart("#person-weight-chart", pagePerson);
  }
}

function lockLogDialogHeight() {
  const form = $("#log-form");
  const weightForm = $("#weight-form");
  const success = $("#log-success");
  const otherField = $("#other-field");
  const injuryField = $("#injury-input-field");
  if (!form) return;

  const formHidden = form.hidden;
  const weightHidden = weightForm?.hidden;
  const successHidden = success?.hidden;
  const otherHidden = otherField?.hidden;
  const injuryHidden = injuryField?.hidden;

  if (weightForm && !weightHidden) {
    form.hidden = true;
    weightForm.hidden = false;
    if (success) success.hidden = true;
    dialog.style.height = "auto";
    dialog.style.minHeight = "";
    const height = Math.ceil(dialog.getBoundingClientRect().height);
    dialog.style.height = `${height}px`;
    dialog.style.minHeight = `${height}px`;
    form.hidden = formHidden;
    weightForm.hidden = weightHidden;
    if (success) success.hidden = successHidden;
    return;
  }

  form.hidden = false;
  if (weightForm) weightForm.hidden = true;
  if (success) success.hidden = true;
  dialog.style.height = "auto";
  dialog.style.minHeight = "";

  let height = 0;
  if (otherField || injuryField) {
    if (otherField) otherField.hidden = true;
    if (injuryField) injuryField.hidden = true;
    height = Math.max(height, dialog.getBoundingClientRect().height);
    if (otherField) otherField.hidden = false;
    if (injuryField) injuryField.hidden = false;
    height = Math.max(height, dialog.getBoundingClientRect().height);
    if (otherField) otherField.hidden = otherHidden;
    if (injuryField) injuryField.hidden = injuryHidden;
  } else {
    height = dialog.getBoundingClientRect().height;
  }

  const locked = `${Math.ceil(height)}px`;
  dialog.style.height = locked;
  dialog.style.minHeight = locked;
  form.hidden = formHidden;
  if (weightForm) weightForm.hidden = weightHidden;
  if (success) success.hidden = successHidden;
}

function syncWeightPersonAvatar(person) {
  const weightImg = $("#weight-person-image");
  if (!weightImg || !person) return;
  weightImg.src = person.image;
  weightImg.alt = "";
}

function syncWeightNudgeState(amount = Math.round(Number($("#weight-input")?.value) || 0)) {
  const minus = $("#weight-minus");
  const plus = $("#weight-plus");
  const chips = document.querySelectorAll("#weight-quick-chips [data-weight-delta]");
  const hasValue = amount > 0;
  if (minus) minus.disabled = !hasValue || amount <= WEIGHT_MIN_LB;
  if (plus) plus.disabled = hasValue && amount >= WEIGHT_MAX_LB;
  chips.forEach((button) => {
    const delta = Number(button.dataset.weightDelta);
    if (!Number.isFinite(delta)) return;
    if (!hasValue) {
      button.disabled = delta < 0;
      return;
    }
    button.disabled =
      (delta < 0 && amount + delta < WEIGHT_MIN_LB) ||
      (delta > 0 && amount + delta > WEIGHT_MAX_LB);
  });
}

function setWeightInputValue(value) {
  const input = $("#weight-input");
  if (!input) return;
  const raw = Math.round(Number(value) || 0);
  if (raw <= 0) {
    input.value = "";
    syncWeightNudgeState(0);
    return;
  }
  const amount = Math.max(WEIGHT_MIN_LB, Math.min(WEIGHT_MAX_LB, raw));
  input.value = String(amount);
  syncWeightNudgeState(amount);
}

function nudgeWeight(delta) {
  const current = Math.round(Number($("#weight-input")?.value) || 0);
  const next = current > 0 ? current + delta : delta > 0 ? WEIGHT_MIN_LB : 0;
  setWeightInputValue(next);
  clearWeightFormError();
}

/**
 * Toggle starting-weight mode (first entry) vs recent+stepper mode.
 */
function syncWeightAmountMode({ starting = false, editing = false } = {}) {
  const field = $("#weight-amount-field");
  const label = $("#weight-amount-label");
  const hint = $("#weight-amount-hint");
  const input = $("#weight-input");
  const minus = $("#weight-minus");
  const plus = $("#weight-plus");
  const chips = $("#weight-quick-chips");
  const title = $("#weight-dialog-title");
  const mode = starting ? "starting" : "recent";

  if (field) field.dataset.mode = mode;
  if (minus) minus.hidden = starting;
  if (plus) plus.hidden = starting;
  if (chips) chips.hidden = starting;

  if (label) {
    label.textContent = starting ? "Starting weight" : "Weight";
  }
  if (hint) {
    hint.textContent = starting
      ? `Enter a whole-number weight from ${WEIGHT_MIN_LB} to ${WEIGHT_MAX_LB} lb`
      : `Whole pounds · ${WEIGHT_MIN_LB}–${WEIGHT_MAX_LB} lb`;
  }
  if (input) {
    input.setAttribute(
      "aria-label",
      starting ? "Starting weight in pounds" : "Body weight in pounds",
    );
  }
  if (title) {
    if (editing) title.textContent = "Edit weight";
    else title.textContent = starting ? "Starting weight" : "Log weight";
  }
  syncWeightNudgeState();
}

function showLogCard() {
  const form = $("#log-form");
  const weightForm = $("#weight-form");
  const success = $("#log-success");
  if (weightForm) weightForm.hidden = true;
  if (success) success.hidden = true;
  if (form) form.hidden = false;
  clearWeightFormError();
  const trackLink = $("#open-weight-card");
  if (trackLink) trackLink.hidden = Boolean(editingActivityId);
  unlockLogDialogHeight();
  if (dialog.open) lockLogDialogHeight();
}

function showWeightCard({ reps = null, activityDate = null, editing = false, hideBack = false } = {}) {
  const form = $("#log-form");
  const weightForm = $("#weight-form");
  const success = $("#log-success");
  if (!weightForm) return;

  const priorHeight = dialog.open ? dialog.getBoundingClientRect().height : 0;
  const personId = personInput?.value;
  const latest = latestWeightActivity(personId);
  const hasPrior = Boolean(latest);
  const starting = !editing && !hasPrior;

  clearLogFormError();
  clearWeightFormError();
  if (form) form.hidden = true;
  if (success) success.hidden = true;
  weightForm.hidden = false;

  const dateInput = $("#weight-date-input");
  const mainDate = $("#activity-date-input")?.value || localDateValue();
  if (dateInput) {
    dateInput.max = localDateValue();
    // First weight: default to challenge start (Day 1), not today.
    dateInput.value = starting
      ? CHALLENGE_START
      : activityDate || mainDate;
  }

  let weightValue = 0;
  if (editing && reps != null) {
    weightValue = Number(reps) || 0;
  } else if (hasPrior) {
    weightValue = Number(latest.reps) || 0;
  } else if (reps != null) {
    weightValue = Number(reps) || 0;
  }
  setWeightInputValue(weightValue);
  syncWeightAmountMode({ starting, editing });

  const submit = $("#weight-submit-button");
  if (submit) submit.textContent = editing ? "SAVE CHANGES" : "SAVE WEIGHT";
  const back = $("#weight-back-button");
  if (back) back.hidden = Boolean(editing || hideBack);

  renderWeightChart(personId);

  unlockLogDialogHeight();
  if (dialog.open) {
    lockLogDialogHeight();
    const locked = parseFloat(dialog.style.height) || 0;
    if (priorHeight > locked + 1) {
      const kept = `${Math.ceil(priorHeight)}px`;
      dialog.style.height = kept;
      dialog.style.minHeight = kept;
    }
  }
  window.setTimeout(() => $("#weight-input")?.focus(), 40);
}

function openLogDialog(personId, options = {}) {
  if (!personId) return;
  const activity = options.activity || null;
  const activityDate = options.activityDate || localDateValue();
  editingActivityId = activity?.id || null;
  logDrafts = emptyLogDrafts();

  clearLogCelebrations();
  unlockLogDialogHeight();
  $("#log-success").hidden = true;
  $("#log-success").classList.remove("is-board-cleared");
  $("#log-form").reset();
  const weightForm = $("#weight-form");
  if (weightForm) weightForm.reset();
  clearLogFormError();
  clearWeightFormError();

  personInput.value = personId;
  const person = getPerson(personId);
  $("#log-person-image").src = person.image;
  $("#log-person-image").alt = "";
  syncWeightPersonAvatar(person);
  $("#activity-date-input").min = CHALLENGE_START;
  $("#activity-date-input").max = localDateValue();
  $("#activity-date-input").value = activityDate;
  syncWorkoutDateToggle();
  $("#log-dialog-title").textContent = activity ? "+ Edit reps" : "+ Add reps";

  const isWeight = activity && activityExercise(activity) === "weight";

  if (isWeight) {
    $("#log-form").hidden = true;
    showWeightCard({
      reps: activity.reps,
      activityDate,
      editing: true,
    });
  } else if (options.openWeight) {
    showWeightCard({ activityDate, hideBack: true });
  } else if (activity) {
    showLogCard();
    exerciseInput.value = activityExercise(activity);
    $("#other-input").value = activity.otherActivity || "";
    const injuryToggle = $("#injury-input-toggle");
    if (injuryToggle) injuryToggle.checked = Boolean(activity.injuryInput);
    setOtherType(otherTypeOf(activity) || "workouts", { syncDraft: false });
    setAmount(activity.reps);
    updateExerciseFields({ keepAmount: true });
  } else {
    showLogCard();
    exerciseInput.value = "pushups";
    setOtherType("workouts", { syncDraft: false });
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
      const weightForm = $("#weight-form");
      if (weightForm) weightForm.hidden = true;
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
    const unit =
      entry.exercise === "planks"
        ? "MIN"
        : entry.exercise === "weight"
          ? "LB"
          : entry.exercise === "other"
            ? entry.otherType === "time"
              ? "MIN"
              : entry.otherType === "reps"
                ? "REPS"
                : "% GOAL"
            : "REPS";
    $("#success-amount").textContent = entry.exercise === "weight" ? amount : `+${amount}`;
    $("#success-unit").textContent = unit;
    $("#success-copy").textContent =
      entry.exercise === "weight"
        ? `Saved to ${person.name.split(" ")[0]}’s personal log.`
        : `Added to ${person.name.split(" ")[0]}’s personal progress.`;
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
                : entry.exercise === "weight"
                  ? "weight"
                  : entry.otherActivity || "other";
        const amount =
          entry.exercise === "planks" ? formatPlankMinutes(entry.reps) : number.format(entry.reps);
        const unit =
          entry.exercise === "planks"
            ? "min"
            : entry.exercise === "weight"
              ? "lb"
              : entry.exercise === "other" && entry.otherType === "time"
                ? "min"
                : entry.exercise === "other" && entry.otherType !== "reps"
                  ? "%"
                  : "";
        return `${entry.exercise === "weight" ? "" : "+"}${amount}${unit ? ` ${unit}` : ""} ${label}`;
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
    parts.push(`${formatPlankMinutes(plankLeft)} min plank`);
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
  const boardCleared = Boolean(pendingPulseReveal?.boardCleared);
  const showPulseLfg = Boolean(boardCleared && pendingPulseReveal?.showPulseLfg);
  const skipEntrance = Boolean(pendingPulseReveal?.skipEntrance);
  // Only inject celebration chrome when the board was just cleared; otherwise the
  // already-complete banner/share stay in the rendered HTML and shouldn't re-enter.
  const showBanner = Boolean(boardCleared);

  if (showBanner) {
    pulse.classList.add("is-complete");
  }

  // Lock height only when celebration chrome will be injected (avoids layout thrash on Quick Add).
  if (showBanner || showPulseLfg) {
    pulse.style.minHeight = `${pulse.offsetHeight}px`;
  }

  fills.forEach((fill) => {
    const from = Number(fill.dataset.from) || 0;
    fill.style.width = `${from}%`;
  });

  if (skipEntrance) {
    pulse.classList.remove("is-revealing");
  } else {
    pulse.classList.add("is-revealing");
    // Force layout so the slide/fill transitions run from the starting state.
    void pulse.offsetWidth;
  }

  const injectDailyPulseShare = () => {
    const banner = pulse.querySelector(".daily-pulse-banner");
    if (!banner) return;
    const personId = pendingPulseReveal?.personId || currentPersonId();
    const dateKey = pendingPulseReveal?.activityDate || localDateValue();
    if (!personId || !isPersonPageOwner(personId)) return;
    let share = pulse.querySelector(".daily-pulse-share");
    if (!share) {
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
  };

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
      // Keep Share off the LET'S GO / board-cleared overlay — only reveal after LFG exits.
      if (!showPulseLfg) injectDailyPulseShare();
    }

    if (showPulseLfg) {
      playDailyPulseLfg(pulse);
      window.setTimeout(() => {
        const lfg = pulse.querySelector(".daily-pulse-lfg");
        if (!lfg) {
          if (showBanner) injectDailyPulseShare();
          return;
        }
        lfg.classList.remove("is-in");
        // Force a frame so the exit transition runs from full opacity.
        void lfg.offsetWidth;
        lfg.classList.add("is-out");
        window.setTimeout(() => {
          lfg.remove();
          pulse.classList.remove("is-lfg");
          if (showBanner) injectDailyPulseShare();
        }, reduceMotion ? 0 : 300);
      }, reduceMotion ? 0 : 2600);
    }

    pulse.classList.add("is-animating");
    fills.forEach((fill) => {
      const to = Number(fill.dataset.to) || 0;
      fill.style.width = `${to}%`;
      fill.classList.toggle("is-maxed", to >= 100);
    });
    if (boardCleared) pulse.classList.add("is-board-burst");
    window.setTimeout(() => {
      pulse.classList.remove("is-revealing", "is-animating", "is-board-burst", "is-lfg");
      pulse.style.minHeight = "";
      const banner = pulse.querySelector(".daily-pulse-banner");
      if (banner) banner.classList.remove("is-entering", "is-in");
      const share = pulse.querySelector(".daily-pulse-share");
      if (share) share.classList.remove("is-entering", "is-in");
      const lfg = pulse.querySelector(".daily-pulse-lfg");
      if (lfg) lfg.remove();
      fills.forEach((fill) => fill.classList.remove("is-maxed"));
      pendingPulseReveal = null;
    }, reduceMotion ? 0 : showPulseLfg ? 4800 : 4200);
  };

  if (reduceMotion) {
    run();
    return;
  }
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(run);
  });
}

function playDailyPulseLfg(pulse) {
  if (!pulse) return;
  pulse.classList.add("is-lfg");
  let lfg = pulse.querySelector(".daily-pulse-lfg");
  if (!lfg) {
    lfg = document.createElement("div");
    lfg.className = "daily-pulse-lfg";
    lfg.setAttribute("role", "status");
    lfg.innerHTML = `
      <div class="daily-pulse-lfg__confetti" aria-hidden="true"></div>
      <p class="daily-pulse-lfg__eyebrow">BOARD CLEARED</p>
      <strong class="daily-pulse-lfg__amount">LET'S F@#%!ING GO!</strong>
      <span class="daily-pulse-lfg__unit">PUSH · SQUAT · PLANK</span>
    `;
    pulse.appendChild(lfg);
  }
  void lfg.offsetWidth;
  lfg.classList.add("is-in");
  fireDailyPulseLfgConfetti(lfg.querySelector(".daily-pulse-lfg__confetti"));
}

function fireDailyPulseLfgConfetti(host) {
  if (!host || typeof confetti !== "function") return null;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  host.replaceChildren();
  const canvas = document.createElement("canvas");
  host.appendChild(canvas);
  const fire = confetti.create(canvas, { resize: true, useWorker: true });
  const colors = ["#f5c842", "#ff2d78", "#e8763a", "#f8ede1", "#c9b3ff", "#4cdf8a"];
  fire({
    particleCount: 70,
    spread: 72,
    startVelocity: 34,
    gravity: 1.05,
    ticks: 180,
    origin: { x: 0.5, y: 0.55 },
    colors,
  });
  fire({
    particleCount: 24,
    angle: 60,
    spread: 42,
    startVelocity: 28,
    origin: { x: 0.15, y: 0.7 },
    colors,
  });
  fire({
    particleCount: 24,
    angle: 120,
    spread: 42,
    startVelocity: 28,
    origin: { x: 0.85, y: 0.7 },
    colors,
  });
  window.setTimeout(() => {
    fire({
      particleCount: 36,
      spread: 360,
      startVelocity: 26,
      ticks: 90,
      gravity: 0.95,
      origin: { x: 0.5, y: 0.35 },
      colors,
    });
  }, 520);
  return fire;
}

function queuePulseReveal(personId, activityDate, boardCleared, previousPercents, options = {}) {
  pendingPulseReveal = {
    personId,
    activityDate,
    boardCleared,
    previousPercents: { ...previousPercents },
    showPulseLfg: Boolean(options.showPulseLfg),
    // Quick Add is already on-screen; skip the down-then-up entrance slide.
    skipEntrance: Boolean(options.skipEntrance),
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
    const exercise = activityExercise(activity);
    if (exercise === "weight") return;
    sessionDays[exercise].add(activity.createdAt.slice(0, 10));
  });
  const averageFor = (exercise, value) => {
    const days = sessionDays[exercise].size;
    return days ? value / days : 0;
  };
  const metrics = personStats?.metrics || { pushups: 0, squats: 0, planks: 0, other: 0 };
  const plankMinutes = metrics.planks / 60;
  const workoutUnits = otherWorkoutUnits(metrics.other);
  return {
    pushups: metrics.pushups,
    squats: metrics.squats,
    plankMinutes,
    workouts: workoutUnits,
    avgPushups: Math.round(averageFor("pushups", metrics.pushups)),
    avgSquats: Math.round(averageFor("squats", metrics.squats)),
    avgPlanks: averageFor("planks", plankMinutes),
    avgOther: averageFor("other", workoutUnits),
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
      value: `${formatPlankMinutes(totals.planks)} / ${formatPlankMinutes(DAILY_GOALS.planks)} MIN`,
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
      value: workoutNumber.format(stats.workouts),
      avg: workoutNumber.format(stats.avgOther),
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
  if (!personId || !dateKey || !isPersonPageOwner(personId)) return false;
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
  // Never show WhatsApp share on the log success / BOARD CLEARED sheet.
  success.querySelectorAll(".share-whatsapp-button, .daily-pulse-share, .log-success-share").forEach((el) => {
    el.remove();
  });

  if (boardCleared) {
    $("#success-eyebrow").textContent = "BOARD CLEARED";
    $("#success-amount").textContent = "LET'S F@#%!ING GO!";
    $("#success-unit").textContent = "PUSH · SQUAT · PLANK";
    $("#success-copy").textContent =
      list.length === 1
        ? "Daily goals locked in. Absolute menace."
        : `${list.length} activities in — daily goals locked in.`;
    setSuccessRemainingMessage(personId, activityDate, { boardCleared: true });
  } else {
    fillNormalLogSuccess(personId, list, activityDate);
  }

  form.hidden = true;
  const weightForm = $("#weight-form");
  if (weightForm) weightForm.hidden = true;
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

$("#person-log-button").addEventListener("click", () => {
  const personId = currentPersonId();
  if (!personId || !isPersonPageOwner(personId)) return;
  openLogDialog(personId);
});

async function quickAddActivity(button) {
  const personId = currentPersonId();
  if (!personId || !isPersonPageOwner(personId) || !button || button.classList.contains("is-success")) {
    return;
  }
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
      otherType: exercise === "other" ? "workouts" : "",
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
    queuePulseReveal(personId, activityDate, boardCleared, previousPercents, {
      showPulseLfg: boardCleared,
      skipEntrance: true,
    });
    playQuickAddButtonSuccess(button, { boardCleared });
    render({ skipScroll: true });

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      scrollPersonLogButtonIntoView();
      window.setTimeout(() => revealDailyPulseAfterLog(), reduceMotion ? 40 : 280);
    }, reduceMotion ? 60 : 420);

    window.setTimeout(
      () => {
        clearQuickAddButtonSuccess(button);
        buttons.forEach((entry) => {
          entry.disabled = false;
        });
      },
      reduceMotion ? 900 : boardCleared ? 2800 : 1800,
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

$("#person-quick-add")?.addEventListener(
  "touchstart",
  (event) => {
    const button = event.target.closest("[data-quick-exercise]");
    if (!button || button.disabled) return;
    if (event.touches.length !== 1) return;
    event.preventDefault();
    button.dataset.touchedAt = String(Date.now());
    quickAddActivity(button);
  },
  { passive: false }
);
$("#person-quick-add")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-quick-exercise]");
  if (!button) return;
  const touchedAt = Number(button.dataset.touchedAt || 0);
  if (touchedAt && Date.now() - touchedAt < 450) return;
  quickAddActivity(button);
});

document.addEventListener("click", async (event) => {
  const shareButton = event.target.closest(
    ".daily-pulse-share, .share-whatsapp-button[data-person-id]",
  );
  if (!shareButton) return;
  event.preventDefault();
  const personId = shareButton.dataset.personId;
  const activityDate = shareButton.dataset.date;
  if (!personId || !activityDate || !isPersonPageOwner(personId)) return;
  pendingShareGoal = { personId, activityDate };
  await shareDailyGoalMetToWhatsApp(personId, activityDate, shareButton);
});

$("#feed-day-filter")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-feed-date]");
  if (!button) return;
  const nextKey = button.dataset.feedDate;
  if (!nextKey || nextKey === feedSelectedDateKey) return;
  feedSelectedDateKey = nextKey;
  renderFeedPageActivityList();
  renderFeedClearedToday({ smoothDayScroll: true });
});
$("#nav-add-reps-button")?.addEventListener("click", () => startAddRepsFlow());
$("#hero-add-reps")?.addEventListener("click", () => startAddRepsFlow());
$("#person-picker-grid").addEventListener("click", (event) => {
  const option = event.target.closest("[data-person-id]");
  if (!option) return;
  const personId = option.dataset.personId;
  rememberLastPerson(personId);
  updateSiteMenu();
  closePersonPicker();
  window.location.hash = `/person/${personId}/add`;
});
$("#close-person-picker-button").addEventListener("click", () => closePersonPicker());
$("#person-picker-dialog").addEventListener("click", (event) => {
  if (event.target === $("#person-picker-dialog")) closePersonPicker();
});
$("#close-dialog-button").addEventListener("click", () => {
  closeLogDialog();
});
$("#close-weight-dialog-button")?.addEventListener("click", () => {
  closeLogDialog();
});
document.querySelectorAll("#log-dialog .sheet-handle").forEach((handle) => {
  handle.addEventListener("click", () => {
    closeLogDialog();
  });
});
$("#open-weight-card")?.addEventListener("click", () => {
  if (editingActivityId) return;
  const person = getPerson(personInput.value);
  syncWeightPersonAvatar(person);
  showWeightCard({
    activityDate: $("#activity-date-input")?.value || localDateValue(),
  });
});
$("#person-update-weight")?.addEventListener("click", () => {
  const personId = currentPersonId();
  if (!personId || !isPersonPageOwner(personId)) return;
  openLogDialog(personId, { openWeight: true });
});
$("#weight-date-input")?.addEventListener("change", () => {
  const personId = personInput?.value;
  if (!personId || $("#weight-form")?.hidden) return;
  paintWeightChart("#weight-chart", personId);
});
$("#weight-back-button")?.addEventListener("click", () => {
  if (editingActivityId) {
    closeLogDialog();
    return;
  }
  const weightDate = $("#weight-date-input")?.value;
  if (weightDate && $("#activity-date-input")) {
    setActivityDateValue(weightDate);
  }
  showLogCard();
});
// Select on tap so replace-by-typing still works, but not on the
// programmatic focus when the weight tracker opens.
$("#weight-input")?.addEventListener("click", (event) => {
  event.currentTarget.select();
});
$("#weight-input")?.addEventListener("input", (event) => {
  const input = event.currentTarget;
  const digits = String(input.value || "").replace(/\D+/g, "");
  if (input.value !== digits) input.value = digits;
  syncWeightNudgeState(Math.round(Number(digits) || 0));
  clearWeightFormError();
});
$("#weight-input")?.addEventListener("blur", (event) => {
  const raw = String(event.currentTarget.value || "").replace(/\D+/g, "");
  if (!raw) {
    event.currentTarget.value = "";
    syncWeightNudgeState(0);
    return;
  }
  setWeightInputValue(raw);
});
onPress($("#weight-minus"), () => nudgeWeight(-1));
onPress($("#weight-plus"), () => nudgeWeight(1));
document.querySelectorAll("#weight-quick-chips [data-weight-delta]").forEach((button) => {
  onPress(button, () => nudgeWeight(Number(button.dataset.weightDelta)));
});
$("#weight-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const personId = personInput.value;
  clearWeightFormError();
  if (personId !== currentPersonId()) {
    closeLogDialog();
    showToast("Open a participant profile before adding activity.");
    return;
  }

  const reps = Number($("#weight-input")?.value);
  if (!Number.isInteger(reps) || reps < WEIGHT_MIN_LB || reps > WEIGHT_MAX_LB) {
    showToast(`Enter a whole-number weight from ${WEIGHT_MIN_LB} to ${WEIGHT_MAX_LB} lb.`);
    $("#weight-input")?.focus();
    return;
  }

  const activityDate = $("#weight-date-input")?.value || localDateValue();
  const submitButton = $("#weight-submit-button");
  const activityId = editingActivityId;
  if (submitButton) submitButton.disabled = true;
  try {
    if (activityId) {
      const result = await protectedRequest("/api/activities", "PUT", personId, {
        activityId,
        exercise: "weight",
        otherActivity: "",
        otherType: "",
        injuryInput: false,
        reps,
        activityDate,
      });
      if (!result) return;
      const index = activities.findIndex((entry) => entry.id === activityId);
      if (index >= 0) activities[index] = result.activity;
      else activities.push(result.activity);
      participation[personId] = result.status;
      await finishWeightSave(personId);
      return;
    }

    const result = await protectedRequest("/api/activities", "POST", personId, {
      exercise: "weight",
      otherActivity: "",
      otherType: "",
      injuryInput: false,
      reps,
      activityDate,
    });
    if (!result) return;
    activities.push(result.activity);
    participation[personId] = result.status;
    await finishWeightSave(personId);
  } catch (error) {
    showToast(error.message || "Weight could not be saved.");
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
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
  const pin = syncPinCodeCells();
  if (!/^(?:\d{4}|\d{6})$/.test(pin)) {
    $("#pin-error").textContent = "Enter a 4-digit participant PIN or 6-digit master PIN.";
    $("#pin-error").hidden = false;
    $("#pin-input")?.focus();
    return;
  }
  closePinPrompt(pin);
});
$("#pin-input")?.addEventListener("input", () => {
  const pin = syncPinCodeCells();
  if ($("#pin-error") && !$("#pin-error").hidden) {
    $("#pin-error").hidden = true;
    $("#pin-error").textContent = "";
  }
  window.clearTimeout(pinAutoSubmitTimer);
  pinAutoSubmitTimer = null;
  if (pin.length === 6) {
    closePinPrompt(pin);
    return;
  }
  if (pin.length === 4) {
    // Brief pause so a master PIN can continue to 6 digits.
    pinAutoSubmitTimer = window.setTimeout(() => {
      if (syncPinCodeCells() === pin) closePinPrompt(pin);
    }, 520);
  }
});
$("#pin-input")?.addEventListener("focus", () => syncPinCodeCells());
$("#pin-code")?.addEventListener("click", () => $("#pin-input")?.focus());
$("#close-pin-button").addEventListener("click", () => closePinPrompt());
pinDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closePinPrompt();
});
pinDialog.addEventListener("click", (event) => {
  if (event.target === pinDialog) closePinPrompt();
});
pinDialog.addEventListener("close", () => {
  resetPinCodeUI();
});

function onPress(element, handler) {
  if (!element) return;
  let touchedRecently = false;
  // touchstart + preventDefault is the reliable iOS path: each rapid tap fires
  // the action and Safari never gets a chance to treat it as double-tap zoom.
  element.addEventListener(
    "touchstart",
    (event) => {
      if (event.touches.length !== 1) return;
      event.preventDefault();
      touchedRecently = true;
      handler(event);
      window.setTimeout(() => {
        touchedRecently = false;
      }, 450);
    },
    { passive: false }
  );
  element.addEventListener("click", (event) => {
    if (touchedRecently) return;
    handler(event);
  });
}

quickButtons.forEach((button) => {
  onPress(button, () => {
    setAmount(Number($("#reps-input").value) + Number(button.dataset.increment));
    saveCurrentDraft();
  });
});

onPress($("#amount-minus"), () => nudgeAmount(-1));
onPress($("#amount-plus"), () => nudgeAmount(1));

$("#reps-input").addEventListener("focus", (event) => {
  event.currentTarget.select();
});
$("#reps-input").addEventListener("input", (event) => {
  const input = event.currentTarget;
  const digits = String(input.value || "").replace(/\D+/g, "");
  if (input.value !== digits) input.value = digits;
  saveCurrentDraft();
});
$("#reps-input").addEventListener("blur", (event) => {
  setAmount(event.currentTarget.value);
  saveCurrentDraft();
});
$("#activity-date-input").addEventListener("change", () => {
  const input = $("#activity-date-input");
  const today = localDateValue();
  const yesterday = yesterdayDateValue();
  let value = input?.value || today;
  if (value > today) value = today;
  if (value < CHALLENGE_START) value = CHALLENGE_START;
  if (input && input.value !== value) input.value = value;
  // Snap calendar picks of today/yesterday onto those segments.
  if (value === today || value === yesterday) {
    setActivityDateValue(value);
  } else {
    syncWorkoutDateToggle();
  }
  saveCurrentDraft();
});

let workoutDatePickerGuard = false;

function fallbackOpenWorkoutDatePicker(input) {
  // Used when showPicker throws/rejects (common on iOS). Focus alone is often
  // not enough; a guarded synthetic click can recover the native wheel/sheet.
  workoutDatePickerGuard = true;
  try {
    try {
      input.focus({ preventScroll: true });
    } catch {
      try {
        input.focus();
      } catch {
        /* ignore */
      }
    }
    try {
      input.click();
    } catch {
      /* ignore */
    }
  } finally {
    queueMicrotask(() => {
      workoutDatePickerGuard = false;
    });
  }
}

function openWorkoutDatePicker() {
  const input = $("#activity-date-input");
  if (!input || workoutDatePickerGuard) return;

  input.min = CHALLENGE_START;
  input.max = localDateValue();

  if (typeof input.showPicker !== "function") {
    // Rely on the activating tap on the input itself (iOS / older browsers).
    // Do not synthesize another click — that can dismiss the native picker.
    return;
  }

  try {
    const result = input.showPicker();
    if (result && typeof result.then === "function") {
      result.catch(() => fallbackOpenWorkoutDatePicker(input));
    }
  } catch {
    // showPicker throws when not user-activated, unsupported for this control,
    // or blocked inside a dialog on some mobile browsers.
    fallbackOpenWorkoutDatePicker(input);
  }
}

$("#activity-date-input")?.addEventListener("click", () => {
  // Ensure tapping anywhere on the calendar segment opens the picker, not just
  // the tiny native indicator. showPicker requires a user gesture.
  // Click-only (no pointerup): avoids open-then-close races with the native UI.
  openWorkoutDatePicker();
});

document.querySelectorAll("#workout-date-toggle button[data-date-preset]").forEach((button) => {
  button.addEventListener("click", () => {
    const preset = button.dataset.datePreset;
    if (preset === "today") {
      setActivityDateValue(localDateValue(), { emitChange: true });
      return;
    }
    if (preset === "yesterday") {
      setActivityDateValue(yesterdayDateValue(), { emitChange: true });
    }
  });
});
$("#other-input").addEventListener("input", () => {
  saveCurrentDraft();
});
$("#injury-input-toggle")?.addEventListener("change", () => {
  saveCurrentDraft();
});

document.querySelectorAll("[data-other-type]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.otherType === currentOtherType()) return;
    setOtherType(button.dataset.otherType);
  });
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
      const otherType = currentOtherType();
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
        otherType: exercise === "other" ? otherType : "",
        injuryInput: exercise === "other" && Boolean($("#injury-input-toggle")?.checked),
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
        [{
          exercise,
          reps,
          otherActivity: result.activity.otherActivity || "",
          otherType: result.activity.otherType || otherType,
          injuryInput: Boolean(result.activity.injuryInput),
        }],
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
          otherType: entry.otherType || "",
          injuryInput: Boolean(entry.injuryInput),
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
        added.push({
          ...entry,
          otherType: result.activity.otherType || entry.otherType || "",
        });
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

function restoreActivityItem(item, html) {
  if (!item) return;
  item.classList.remove("is-deleting", "is-tv-off");
  item.removeAttribute("aria-busy");
  item.style.height = "";
  item.style.marginTop = "";
  item.style.marginBottom = "";
  item.style.paddingTop = "";
  item.style.paddingBottom = "";
  item.style.overflow = "";
  item.style.removeProperty("--delete-h");
  item.innerHTML = html;
}

function playActivityTvOff(item) {
  return new Promise((resolve) => {
    if (!item) {
      resolve();
      return;
    }
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      resolve();
      return;
    }

    const height = item.offsetHeight;
    item.style.setProperty("--delete-h", `${height}px`);
    item.style.height = `${height}px`;
    item.style.overflow = "hidden";
    void item.offsetWidth;
    item.classList.add("is-tv-off");

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      item.removeEventListener("animationend", onEnd);
      resolve();
    };
    const onEnd = (event) => {
      if (event.target !== item || event.animationName !== "activity-tv-off") return;
      finish();
    };
    item.addEventListener("animationend", onEnd);
    window.setTimeout(finish, 900);
  });
}

async function deleteActivityItem(item, activity, personId) {
  if (!item || !activity || !personId) return;
  if (item.classList.contains("is-deleting")) return;

  const snapshot = item.innerHTML;
  const lockedHeight = item.offsetHeight;
  item.classList.add("is-deleting");
  item.setAttribute("aria-busy", "true");
  item.style.height = `${lockedHeight}px`;
  item.innerHTML = `<span class="activity-deleting-label">Deleting</span>`;

  try {
    const result = await protectedRequest("/api/activities", "DELETE", personId, {
      activityId: activity.id,
    });
    if (!result) {
      restoreActivityItem(item, snapshot);
      return;
    }

    activities = activities.filter((entry) => entry.id !== result.deletedActivityId);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion) {
      await new Promise((resolve) => window.setTimeout(resolve, 320));
    }
    await playActivityTvOff(item);
    render({ skipScroll: true });
    showToast("Activity deleted. Totals updated.");
  } catch (error) {
    restoreActivityItem(item, snapshot);
    showToast(error.message || "Activity could not be deleted.");
  }
}

document.querySelectorAll("[data-participation]").forEach((button) => {
  button.addEventListener("click", async () => {
    const personId = currentPersonId();
    if (!personId || !isPersonPageOwner(personId)) return;
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

$("#person-history-more")?.addEventListener("click", () => {
  personHistoryVisibleDays += PERSON_HISTORY_PAGE_SIZE;
  renderPersonPage({ skipScroll: true });
});

$("#person-activity-list").addEventListener("click", async (event) => {
  const personId = currentPersonId();
  if (!personId || !isPersonPageOwner(personId)) return;

  const addButton = event.target.closest("[data-log-date]");
  if (addButton) {
    openLogDialog(personId, { activityDate: addButton.dataset.logDate });
    return;
  }

  const deleteButton = event.target.closest("[data-delete-activity-id]");
  if (deleteButton) {
    event.stopPropagation();
    const item = deleteButton.closest("[data-activity-id]");
    const activity = activities.find((entry) => entry.id === deleteButton.dataset.deleteActivityId);
    if (!item || !activity || activity.personId !== personId) return;
    if (item.classList.contains("is-deleting")) return;
    await deleteActivityItem(item, activity, personId);
    return;
  }

  const item = event.target.closest("[data-activity-id]");
  if (!item || item.classList.contains("is-deleting") || !item.classList.contains("is-editable")) {
    return;
  }
  const activity = activities.find((entry) => entry.id === item.dataset.activityId);
  if (!activity || activity.personId !== personId) return;
  openLogDialog(personId, {
    activity,
    activityDate: localDateValue(new Date(activity.createdAt)),
  });
});

$("#person-activity-list").addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const item = event.target.closest("[data-activity-id].is-editable");
  if (!item || event.target.closest("[data-delete-activity-id]") || item.classList.contains("is-deleting")) {
    return;
  }
  if (!isPersonPageOwner(currentPersonId())) return;
  event.preventDefault();
  item.click();
});

function onLeaderboardClick(event) {
  const row = event.target.closest("[data-person-id]");
  if (row) window.location.hash = `/person/${row.dataset.personId}`;
}
$("#leaderboard").addEventListener("click", onLeaderboardClick);
$("#leaderboard-page-list")?.addEventListener("click", onLeaderboardClick);

/** Unclamped 1-based day index from CHALLENGE_START (may be <1 or >CHALLENGE_DAYS). */
function challengeDayIndex(asOf = new Date()) {
  const todayKey = localDateValue(asOf);
  const start = new Date(`${CHALLENGE_START}T12:00:00`);
  const today = new Date(`${todayKey}T12:00:00`);
  return Math.floor((today.getTime() - start.getTime()) / 86400000) + 1;
}

/** 1-based challenge day (Day 1 = CHALLENGE_START), clamped to 1…CHALLENGE_DAYS. */
function currentChallengeDay(asOf = new Date()) {
  return Math.min(CHALLENGE_DAYS, Math.max(1, challengeDayIndex(asOf)));
}

/** Days after today through day 100. While in range: D + remaining === CHALLENGE_DAYS. */
function challengeDaysRemaining(asOf = new Date()) {
  const day = challengeDayIndex(asOf);
  // Pre-start: UI clamps to Day 1, so remaining is 99 to keep the sum at 100.
  if (day < 1) return CHALLENGE_DAYS - 1;
  if (day > CHALLENGE_DAYS) return 0;
  return CHALLENGE_DAYS - day;
}

/** Days left to train including today (Day D … Day 100). */
function challengeDaysLeftInclusive(asOf = new Date()) {
  const day = challengeDayIndex(asOf);
  if (day < 1) return CHALLENGE_DAYS;
  if (day > CHALLENGE_DAYS) return 0;
  return CHALLENGE_DAYS - day + 1;
}

function tickOldchellaCountdown() {
  // Match https://goingtoliveforever.com/ exactly: floor(ms) + 3-digit days.
  const diff = Math.max(0, OLDCHELLA_START.getTime() - Date.now());
  const dayCount = Math.floor(diff / 86400000);
  const hourCount = Math.floor((diff % 86400000) / 3600000);
  const minCount = Math.floor((diff % 3600000) / 60000);
  const secCount = Math.floor((diff % 60000) / 1000);
  const challengeDay = currentChallengeDay();
  const challengeDayLabel = `Day ${challengeDay} of ${CHALLENGE_DAYS}`;
  const goalDays = $("#goal-days-value");
  if (goalDays) {
    goalDays.textContent = String(challengeDay);
    const goalDaysWrap = $("#goal-days");
    if (goalDaysWrap) {
      goalDaysWrap.setAttribute("aria-label", challengeDayLabel);
    }
  }
  const activityGoalDays = $("#activity-goal-days-value");
  if (activityGoalDays) {
    activityGoalDays.textContent = String(challengeDay);
    const activityGoalDaysWrap = $("#activity-goal-days");
    if (activityGoalDaysWrap) {
      activityGoalDaysWrap.setAttribute("aria-label", challengeDayLabel);
    }
  }
  const days = $("#activity-cd-days");
  const hours = $("#activity-cd-hours");
  const mins = $("#activity-cd-mins");
  const secs = $("#activity-cd-secs");
  if (days && hours && mins && secs) {
    days.textContent = String(dayCount).padStart(3, "0");
    hours.textContent = String(hourCount).padStart(2, "0");
    mins.textContent = String(minCount).padStart(2, "0");
    secs.textContent = String(secCount).padStart(2, "0");
    const activityCountdown = $("#activity-days-countdown");
    if (activityCountdown) {
      activityCountdown.setAttribute(
        "aria-label",
        `${dayCount} days, ${hourCount} hours, ${minCount} minutes, ${secCount} seconds until Old-Chella — open Going To Live Forever`,
      );
    }
  }
}

function scrollHomeToTop() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? "auto" : "smooth" });
}

function updateSiteMenu() {
  updateHomeWelcome();
  const myHome = $("#menu-my-home");
  const myHomeLabel = $("#menu-my-home-label");
  const myHomeMeta = $("#menu-my-home-meta");
  const myHomeAvatar = $("#menu-my-home-avatar");
  const knownId = menuHomePersonId();
  if (myHome) {
    if (knownId) {
      const person = getPerson(knownId);
      const first = person?.name?.split(" ")[0] || "Your";
      myHome.hidden = false;
      myHome.href = `#/person/${knownId}`;
      if (myHomeLabel) myHomeLabel.textContent = first;
      if (myHomeMeta) myHomeMeta.textContent = "Your progress";
      if (myHomeAvatar) {
        myHomeAvatar.src = person?.image || "";
        myHomeAvatar.alt = "";
      }
    } else {
      myHome.hidden = true;
      if (myHomeAvatar) {
        myHomeAvatar.removeAttribute("src");
        myHomeAvatar.alt = "";
      }
    }
  }

  const route = parseAppRoute();
  document.querySelectorAll(".site-menu-link[data-menu-route]").forEach((link) => {
    const key = link.dataset.menuRoute;
    let current = false;
    if (key === "home") current = route.type === "person" && route.personId === knownId;
    else if (key === "challenge") current = route.type === "challenge";
    else if (key === "leaderboard") current = route.type === "leaderboard";
    else if (key === "activity") current = route.type === "activity";
    else if (key === "feed") current = route.type === "feed";
    else if (key === "recipes") current = route.type === "recipes";
    else if (key === "inspiration") current = route.type === "inspiration";
    if (current) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

let siteMenuClosing = false;
let siteMenuCloseTimer = 0;
let siteMenuClosePanel = null;

function prefersSiteMenuReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function clearSiteMenuCloseWait() {
  if (siteMenuCloseTimer) {
    window.clearTimeout(siteMenuCloseTimer);
    siteMenuCloseTimer = 0;
  }
  if (siteMenuClosePanel) {
    siteMenuClosePanel.removeEventListener("transitionend", onSiteMenuCloseTransitionEnd);
    siteMenuClosePanel = null;
  }
}

function finishSiteMenuClose() {
  const menu = $("#site-menu");
  clearSiteMenuCloseWait();
  siteMenuClosing = false;
  if (!menu || document.body.classList.contains("is-menu-open")) return;
  menu.hidden = true;
}

function onSiteMenuCloseTransitionEnd(event) {
  if (event.target !== siteMenuClosePanel) return;
  if (event.propertyName !== "transform") return;
  finishSiteMenuClose();
}

function setSiteMenuToggleExpanded(expanded) {
  const toggle = $("#nav-menu-toggle");
  if (!toggle) return;
  toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
  toggle.setAttribute("aria-label", expanded ? "Close menu" : "Open menu");
}

function closeSiteMenu() {
  const menu = $("#site-menu");
  if (!menu || menu.hidden) return;
  if (!document.body.classList.contains("is-menu-open")) {
    if (siteMenuClosing) return;
    clearSiteMenuCloseWait();
    siteMenuClosing = false;
    menu.hidden = true;
    return;
  }

  document.body.classList.remove("is-menu-open");
  setSiteMenuToggleExpanded(false);

  if (prefersSiteMenuReducedMotion()) {
    clearSiteMenuCloseWait();
    siteMenuClosing = false;
    menu.hidden = true;
    return;
  }

  clearSiteMenuCloseWait();
  siteMenuClosing = true;
  siteMenuClosePanel = menu.querySelector(".site-menu-panel");
  if (siteMenuClosePanel) {
    siteMenuClosePanel.addEventListener("transitionend", onSiteMenuCloseTransitionEnd);
  }
  siteMenuCloseTimer = window.setTimeout(finishSiteMenuClose, 360);
}

function openSiteMenu() {
  const menu = $("#site-menu");
  if (!menu) return;
  clearSiteMenuCloseWait();
  siteMenuClosing = false;
  updateQuickAddButton();
  updateSiteMenu();
  menu.hidden = false;
  setSiteMenuToggleExpanded(true);

  const reveal = () => {
    document.body.classList.add("is-menu-open");
  };

  if (prefersSiteMenuReducedMotion()) {
    reveal();
  } else if (!document.body.classList.contains("is-menu-open")) {
    // Force a closed-frame paint so translateX transitions run.
    void menu.offsetWidth;
    window.requestAnimationFrame(reveal);
  } else {
    reveal();
  }

  const first = menu.querySelector(".site-menu-link:not([hidden])");
  if (first) window.setTimeout(() => first.focus(), 0);
}

function toggleSiteMenu() {
  if (document.body.classList.contains("is-menu-open")) closeSiteMenu();
  else openSiteMenu();
}

$("#nav-menu-toggle")?.addEventListener("click", () => toggleSiteMenu());
$("#site-menu-backdrop")?.addEventListener("click", () => closeSiteMenu());
$("#site-menu")?.addEventListener("click", (event) => {
  const link = event.target.closest(".site-menu-link");
  if (!link) return;
  closeSiteMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeSiteMenu();
});

$("#ripped-home-link").addEventListener("click", (event) => {
  event.preventDefault();
  closeSiteMenu();
  window.location.hash = "#/";
  scrollHomeToTop();
});

window.addEventListener("hashchange", () => {
  closeSiteMenu();
  renderPersonPage();
  updateSiteMenu();
});

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
  // New-user home keeps rules expanded with no collapse control.
  if (isNewVisitor()) collapsed = false;
  card.classList.toggle("is-collapsed", collapsed);
  toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
  toggle.setAttribute("aria-label", collapsed ? "Expand our goal" : "Collapse our goal");
  if (isNewVisitor()) {
    toggle.removeAttribute("aria-label");
    return;
  }
  try {
    localStorage.setItem(RULES_COLLAPSE_KEY, collapsed ? "1" : "0");
  } catch {
    // Preference is optional if storage is blocked.
  }
}

function initRulesCollapse() {
  const toggle = $("#rules-toggle");
  if (!toggle) return;
  setRulesCollapsed(isNewVisitor() ? false : rulesShouldStartCollapsed());
  toggle.addEventListener("click", () => {
    if (isNewVisitor()) return;
    setRulesCollapsed(!$("#rules-card")?.classList.contains("is-collapsed"));
  });
}

updateExerciseFields();
initThemeToggle();
initRulesCollapse();
render();
loadSharedState();
tickOldchellaCountdown();
window.setInterval(tickOldchellaCountdown, 1000);
