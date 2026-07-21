const GOAL = 10000;
const STORAGE_KEY = "oldchella-10k-activities-v1";

const crew = [
  { id: "andrew", name: "Andrew F", initials: "AF", color: "#d7ff45" },
  { id: "brian", name: "Brian M", initials: "BM", color: "#ff9f45" },
  { id: "chris", name: "Chris E", initials: "CE", color: "#58d7ff" },
  { id: "james", name: "James Z", initials: "JZ", color: "#f58aab" },
  { id: "jamie", name: "Jamie D", initials: "JD", color: "#b993ff" },
  { id: "joe", name: "Joe D", initials: "JD", color: "#f6d85e" },
  { id: "john", name: "John Z", initials: "JZ", color: "#74e1a6" },
  { id: "matt", name: "Matt H", initials: "MH", color: "#ff795f" },
  { id: "mike", name: "Mike B", initials: "MB", color: "#7ea8ff" },
];

const seedActivities = [
  { id: 1, personId: "andrew", reps: 175, note: "7 sets of 25", createdAt: "2026-07-20T18:30:00" },
  { id: 2, personId: "joe", reps: 100, note: "Push-ups, squats & planks", createdAt: "2026-07-20T17:05:00" },
  { id: 3, personId: "matt", reps: 100, note: "20 sets of 5", createdAt: "2026-07-20T08:20:00" },
  { id: 4, personId: "andrew", reps: 75, note: "3 sets of 25", createdAt: "2026-07-19T19:10:00" },
  { id: 5, personId: "joe", reps: 100, note: "4 sets of 25", createdAt: "2026-07-19T15:40:00" },
  { id: 6, personId: "matt", reps: 100, note: "Mix of 10s and 5s", createdAt: "2026-07-19T09:15:00" },
  { id: 7, personId: "andrew", reps: 75, note: "3 sets of 25", createdAt: "2026-07-18T18:00:00" },
  { id: 8, personId: "joe", reps: 100, note: "4 sets of 25", createdAt: "2026-07-18T12:00:00" },
  { id: 9, personId: "matt", reps: 100, note: "10×4 + 5×12", createdAt: "2026-07-18T07:30:00" },
];

const $ = (selector) => document.querySelector(selector);
const number = new Intl.NumberFormat("en-US");

function loadActivities() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : seedActivities;
  } catch {
    return seedActivities;
  }
}

let activities = loadActivities();

function saveActivities() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
}

function getPerson(id) {
  return crew.find((person) => person.id === id) ?? crew[0];
}

function totalsByPerson() {
  return crew.map((person) => ({
    ...person,
    total: activities
      .filter((activity) => activity.personId === person.id)
      .reduce((sum, activity) => sum + activity.reps, 0),
    sessions: activities.filter((activity) => activity.personId === person.id).length,
  }));
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value);
  return div.innerHTML;
}

function render() {
  const ranking = totalsByPerson().sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  const total = ranking.reduce((sum, person) => sum + person.total, 0);
  const percent = Math.min(100, Math.round((total / GOAL) * 100));

  $("#group-total").textContent = number.format(total);
  $("#remaining-total").textContent = number.format(Math.max(0, GOAL - total));
  $("#goal-percent").textContent = `${percent}%`;
  $("#progress-fill").style.width = `${percent}%`;
  $(".progress-track").setAttribute("aria-valuenow", String(total));
  $("#pace-copy").textContent = total >= GOAL ? "Challenge complete!" : "Oldchella awaits";

  $("#leaderboard").innerHTML = ranking
    .map(
      (person, index) => `
        <article class="leader-row">
          <span class="rank">${String(index + 1).padStart(2, "0")}</span>
          <span class="avatar" style="background:${person.color}">${person.initials}</span>
          <div>
            <p class="leader-name">${escapeHtml(person.name)}</p>
            <p class="leader-sub">${person.sessions} ${person.sessions === 1 ? "session" : "sessions"}</p>
          </div>
          <div class="leader-reps">
            <strong>${number.format(person.total)}</strong>
            <small>REPS</small>
          </div>
        </article>
      `,
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
            <article class="activity-item">
              <span class="activity-avatar" style="background:${person.color}">${person.initials}</span>
              <div class="activity-main">
                <p>${escapeHtml(person.name)}</p>
                <span>${escapeHtml(activity.note || "Push-ups")}</span>
              </div>
              <div>
                <p class="activity-reps">+${number.format(activity.reps)}</p>
                <span class="activity-time">${formatDate(activity.createdAt)}</span>
              </div>
            </article>
          `;
        })
        .join("")
    : '<div class="empty-state">No reps yet. Be the first to get moving.</div>';
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

const personInput = $("#person-input");
personInput.innerHTML = crew
  .map((person) => `<option value="${person.id}">${escapeHtml(person.name)}</option>`)
  .join("");

const dialog = $("#log-dialog");
$("#open-log-button").addEventListener("click", () => {
  dialog.showModal();
  window.setTimeout(() => $("#reps-input").focus(), 100);
});
$("#close-dialog-button").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

document.querySelectorAll("[data-reps]").forEach((button) => {
  button.addEventListener("click", () => {
    $("#reps-input").value = button.dataset.reps;
    $("#reps-input").focus();
  });
});

$("#log-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const reps = Number($("#reps-input").value);
  if (!Number.isInteger(reps) || reps < 1 || reps > 1000) return;

  activities.push({
    id: Date.now(),
    personId: personInput.value,
    reps,
    note: $("#note-input").value.trim(),
    createdAt: new Date().toISOString(),
  });
  saveActivities();
  render();
  event.currentTarget.reset();
  dialog.close();
  showToast(`${number.format(reps)} reps logged. Nice work.`);
});

$("#reset-button").addEventListener("click", () => {
  if (!window.confirm("Reset all activity to the original demo data?")) return;
  activities = structuredClone(seedActivities);
  saveActivities();
  render();
  showToast("Demo data restored.");
});

render();
