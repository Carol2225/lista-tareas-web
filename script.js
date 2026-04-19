const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const taskList = document.getElementById("taskList");
const filterButtons = document.querySelectorAll(".filter-btn");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");

const STORAGE_KEY = "tasks";
let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
  const savedTasks = localStorage.getItem(STORAGE_KEY);

  if (!savedTasks) {
    return [];
  }

  try {
    const parsedTasks = JSON.parse(savedTasks);

    if (!Array.isArray(parsedTasks)) {
      return [];
    }

    return parsedTasks.filter(isValidTask);
  } catch (error) {
    console.error("Error al cargar tareas:", error);
    return [];
  }
}

function isValidTask(task) {
  return (
    task &&
    typeof task.id === "number" &&
    typeof task.text === "string" &&
    typeof task.completed === "boolean"
  );
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createTask(text) {
  return {
    id: Date.now(),
    text: text,
    completed: false
  };
}

function addTask() {
  const text = taskInput.value.trim();

  if (text === "") {
    alert("Escribe una tarea.");
    taskInput.focus();
    return;
  }

  tasks.push(createTask(text));
  saveTasks();
  renderTasks();
  taskInput.value = "";
  taskInput.focus();
}

function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks();
  renderTasks();
}

function toggleTask(taskId) {
  tasks = tasks.map((task) =>
    task.id === taskId
      ? { ...task, completed: !task.completed }
      : task
  );

  saveTasks();
  renderTasks();
}

function editTask(taskId) {
  const taskToEdit = tasks.find((task) => task.id === taskId);

  if (!taskToEdit) {
    return;
  }

  const newText = prompt("Edita la tarea:", taskToEdit.text);

  if (newText === null) {
    return;
  }

  const cleanedText = newText.trim();

  if (cleanedText === "") {
    alert("La tarea no puede estar vacía.");
    return;
  }

  tasks = tasks.map((task) =>
    task.id === taskId
      ? { ...task, text: cleanedText }
      : task
  );

  saveTasks();
  renderTasks();
}

function clearCompletedTasks() {
  const hasCompletedTasks = tasks.some((task) => task.completed);

  if (!hasCompletedTasks) {
    alert("No hay tareas completadas para borrar.");
    return;
  }

  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
}

function getFilteredTasks() {
  if (currentFilter === "pending") {
    return tasks.filter((task) => !task.completed);
  }

  if (currentFilter === "completed") {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;

  totalTasks.textContent = `Total: ${total}`;
  pendingTasks.textContent = `Pendientes: ${pending}`;
  completedTasks.textContent = `Completadas: ${completed}`;
}

function updateActiveFilterButton() {
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === currentFilter;
    button.classList.toggle("active", isActive);
  });
}

function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = "task-item";

  const leftContainer = document.createElement("div");
  leftContainer.className = "task-left";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-checkbox";
  checkbox.checked = task.completed;
  checkbox.addEventListener("change", () => toggleTask(task.id));

  const textSpan = document.createElement("span");
  textSpan.className = "task-text";
  textSpan.textContent = task.text;

  if (task.completed) {
    textSpan.classList.add("completed");
  }

  leftContainer.appendChild(checkbox);
  leftContainer.appendChild(textSpan);

  const actionsContainer = document.createElement("div");
  actionsContainer.className = "task-actions";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "action-btn edit-btn";
  editButton.textContent = "Editar";
  editButton.addEventListener("click", () => editTask(task.id));

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "action-btn delete-btn";
  deleteButton.textContent = "Eliminar";
  deleteButton.addEventListener("click", () => deleteTask(task.id));

  actionsContainer.appendChild(editButton);
  actionsContainer.appendChild(deleteButton);

  li.appendChild(leftContainer);
  li.appendChild(actionsContainer);

  return li;
}

function renderTasks() {
  taskList.innerHTML = "";

  const filteredTasks = getFilteredTasks();

  if (filteredTasks.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "empty-message";

    if (tasks.length === 0) {
      emptyMessage.textContent = "No hay tareas todavía.";
    } else {
      emptyMessage.textContent = "No hay tareas para este filtro.";
    }

    taskList.appendChild(emptyMessage);
  } else {
    filteredTasks.forEach((task) => {
      const taskElement = createTaskElement(task);
      taskList.appendChild(taskElement);
    });
  }

  updateStats();
  updateActiveFilterButton();
}

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addTask();
  }
});

clearCompletedBtn.addEventListener("click", clearCompletedTasks);

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

renderTasks();