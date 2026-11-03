// STATE
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";
let searchText = "";
let theme = localStorage.getItem("theme") || "light";
let selectedTaskId = null;

const body = document.body;
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const priorityInput = document.querySelector("#priority-input");
const taskList = document.querySelector("#task-list");
const filterButtons = document.querySelectorAll(".filter-btn");
const searchInput = document.querySelector("#search-input");
const counter = document.querySelector("#task-counter");
const themeToggle = document.querySelector("#theme-toggle");

const editInput = document.querySelector("#edit-input");
const saveEditBtn = document.querySelector("#save-edit-btn");
const confirmDeleteBtn = document.querySelector("#confirm-delete-btn");

const editModal = new bootstrap.Modal("#editModal");
const deleteModal = new bootstrap.Modal("#deleteModal");

// UI elements added with the redesign
const viewTitle = document.querySelector("#view-title");
const todayLabel = document.querySelector("#today");
const countAll = document.querySelector("#count-all");
const countActive = document.querySelector("#count-active");
const countCompleted = document.querySelector("#count-completed");
const progressFill = document.querySelector("#progress-fill");
const progressPercent = document.querySelector("#progress-percent");
const progressLabel = document.querySelector("#progress-label");

const VIEW_TITLES = {
  all: "All tasks",
  active: "Active",
  completed: "Completed",
};

// Tasks are shown grouped in this order
const PRIORITIES = [
  { value: "high", label: "High priority" },
  { value: "medium", label: "Medium priority" },
  { value: "low", label: "Low priority" },
];

// Today's date in the header, e.g. "Wednesday, November 4"
todayLabel.textContent = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

if (theme === "dark") {
  body.classList.add("dark");
}

renderTasks();

// EVENTS
themeToggle.addEventListener("click", () => {
  body.classList.toggle("dark");
  theme = body.classList.contains("dark") ? "dark" : "light";
  localStorage.setItem("theme", theme);
});

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = taskInput.value.trim();
  const priority = priorityInput.value;

  if (!text) return;

  addTask(text, priority);
  taskForm.reset();
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

searchInput.addEventListener("input", (e) => {
  searchText = e.target.value.toLowerCase();
  renderTasks();
});

saveEditBtn.addEventListener("click", () => {
  const newText = editInput.value.trim();
  if (!newText) return;

  const task = tasks.find((t) => t.id === selectedTaskId);
  task.text = newText;

  save();
  renderTasks();
  editModal.hide();
});

confirmDeleteBtn.addEventListener("click", () => {
  tasks = tasks.filter((t) => t.id !== selectedTaskId);
  save();
  renderTasks();
  deleteModal.hide();
});

// CRUD
function addTask(text, priority) {
  tasks.push({
    id: Date.now(),
    text,
    priority,
    completed: false,
  });

  save();
  renderTasks();
}

function deleteTask(id) {
  selectedTaskId = id;
  deleteModal.show();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  task.completed = !task.completed;
  save();
  renderTasks();
}

function editTask(id) {
  selectedTaskId = id;
  const task = tasks.find((t) => t.id === id);

  editInput.value = task.text;
  editModal.show();
}

// STORAGE
function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// RENDER
function renderTasks() {
  taskList.innerHTML = "";

  let filtered = [...tasks];

  if (currentFilter === "active") {
    filtered = filtered.filter((t) => !t.completed);
  }

  if (currentFilter === "completed") {
    filtered = filtered.filter((t) => t.completed);
  }

  if (searchText) {
    filtered = filtered.filter((t) =>
      t.text.toLowerCase().includes(searchText)
    );
  }

  counter.textContent = filtered.length;
  viewTitle.textContent = VIEW_TITLES[currentFilter];
  updateStats();

  // One group per priority: a header row, then its tasks
  PRIORITIES.forEach((priority) => {
    const group = filtered.filter((t) => t.priority === priority.value);
    if (group.length === 0) return;

    const header = document.createElement("li");
    header.className = "group-header";
    header.innerHTML = `
      <span class="priority-icon priority-${priority.value}" aria-hidden="true"><i></i><i></i><i></i></span>
      ${priority.label}
      <span class="group-count">${group.length}</span>
    `;
    taskList.appendChild(header);

    group.forEach((task) => {
      const li = document.createElement("li");
      li.className = `task-item priority-${task.priority} ${task.completed ? "completed" : ""}`;

      li.innerHTML = `
        <button class="task-check" onclick="toggleTask(${task.id})" aria-label="Mark as ${task.completed ? "active" : "done"}">
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
        </button>

        <span class="task-text">${task.text}</span>

        <div class="task-actions">
          <button class="icon-btn" onclick="editTask(${task.id})" aria-label="Edit task">
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
          </button>
          <button class="icon-btn icon-btn-danger" onclick="deleteTask(${task.id})" aria-label="Delete task">
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
          </button>
        </div>
      `;

      taskList.appendChild(li);
    });
  });
}

// STATS: sidebar counters + progress bar
function updateStats() {
  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  countAll.textContent = total;
  countActive.textContent = total - done;
  countCompleted.textContent = done;

  progressFill.style.width = `${percent}%`;
  progressPercent.textContent = `${percent}%`;
  progressLabel.textContent =
    total === 0 ? "No tasks yet" : `${done} of ${total} tasks done`;
}

// KEYBOARD SHORTCUTS: "N" = new task, "/" = search, "Esc" = leave the field
document.addEventListener("keydown", (e) => {
  const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName);

  if (e.key === "Escape" && typing) {
    document.activeElement.blur();
    return;
  }

  if (typing || e.metaKey || e.ctrlKey || e.altKey) return;

  if (e.key === "n" || e.key === "N") {
    e.preventDefault();
    taskInput.focus();
  }

  if (e.key === "/") {
    e.preventDefault();
    searchInput.focus();
  }
});
