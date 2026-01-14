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

  counter.textContent = `${filtered.length} task`;

  filtered.forEach((task) => {
    const li = document.createElement("li");
    li.className = `list-group-item task-item d-flex justify-content-between align-items-center priority-${
      task.priority
    } ${task.completed ? "completed" : ""}`;

    li.innerHTML = `
      <div>
        <strong>${task.text}</strong>
        <small class="d-block text-muted">Priorità: ${task.priority}</small>
      </div>

      <div class="task-actions d-flex gap-2">
        <button class="btn btn-sm btn-success" onclick="toggleTask(${task.id})">✔</button>
        <button class="btn btn-sm btn-warning" onclick="editTask(${task.id})">✏</button>
        <button class="btn btn-sm btn-danger" onclick="deleteTask(${task.id})">🗑</button>
      </div>
    `;

    taskList.appendChild(li);
  });
}
