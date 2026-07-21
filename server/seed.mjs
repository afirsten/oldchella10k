function workout(personId, date, { pushups, squats, plankMinutes, pushupNote, setNote, run = false }) {
  const createdAt = `${date}T18:00:00`;
  const entries = [];
  const add = (exercise, reps, note = "", otherActivity = "", percent = null) =>
    entries.push({
      id: `${personId}-${date}-${exercise === "other" ? "run" : exercise}`,
      personId,
      exercise,
      otherActivity,
      reps,
      percent,
      note,
      createdAt,
    });

  if (pushups) add("pushups", pushups, pushupNote || setNote || "");
  if (squats) add("squats", squats, setNote || "");
  if (plankMinutes) add("planks", plankMinutes * 60, `${plankMinutes} × 1 min`);
  if (run) add("other", 100, "", "Run", 100);
  return entries;
}

export const seedState = {
  activities: [
    ...workout("matt", "2026-07-17", { pushups: 100, pushupNote: "5 reps × 20" }),
    ...workout("matt", "2026-07-18", { pushups: 100, pushupNote: "10 reps × 4, 5 reps × 12" }),
    ...workout("matt", "2026-07-19", { pushups: 100, pushupNote: "1 × 15, 2 × 10, 13 × 5" }),
    ...workout("matt", "2026-07-20", { pushups: 100, pushupNote: "20 sets of 5" }),
    ...["15", "16", "17", "18", "19", "20"].flatMap((day) =>
      workout("joe", `2026-07-${day}`, {
        pushups: 100,
        squats: 100,
        plankMinutes: 4,
        setNote: "4 sets of 25",
      }),
    ),
    ...workout("andrew", "2026-07-15", { pushups: 50, squats: 50, plankMinutes: 2, setNote: "2 sets of 25" }),
    ...workout("andrew", "2026-07-16", { pushups: 50, squats: 50, plankMinutes: 2, setNote: "2 sets of 25", run: true }),
    ...workout("andrew", "2026-07-17", { pushups: 50, squats: 50, plankMinutes: 2, setNote: "2 sets of 25" }),
    ...workout("andrew", "2026-07-18", { pushups: 75, squats: 75, plankMinutes: 3, setNote: "3 sets of 25" }),
    ...workout("andrew", "2026-07-19", { pushups: 75, squats: 75, plankMinutes: 3, setNote: "3 sets of 25" }),
    ...workout("andrew", "2026-07-20", { pushups: 75, squats: 75, plankMinutes: 3, setNote: "3 sets of 25", run: true }),
  ],
  participation: { andrew: "in", joe: "in", matt: "in" },
};
