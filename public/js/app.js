let tasks = [];
let currentFilter = 'all';
let deleteTaskId = null;

// ===== API =====
async function apiFetch(url, options = {}) {
  const res = await fetch(url, options);
  return res.json();
}

// ===== Tasks =====
async function loadTasks() {
  const data = await apiFetch('/api/tasks');
  tasks = data;
  renderTasks();
  updateStats();
}

function renderTasks() {
  const list = document.getElementById('task-list');
  const empty = document.getElementById('empty-state');
  const filtered = currentFilter === 'all' ? tasks : tasks.filter(t => t.status === currentFilter);

  if (filtered.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  list.innerHTML = filtered.map(t => {
    const isDone = t.status === 'done';
    const dueDateHtml = t.dueDate
      ? '<span class="due-date">Fecha limite: ' + t.dueDate + '</span>'
      : '';
    const descHtml = t.description
      ? '<p>' + escapeHtml(t.description) + '</p>'
      : '';

    return '<li class="task-item ' + (isDone ? 'done' : '') + '">' +
      '<div class="task-info">' +
        '<input type="checkbox" ' + (isDone ? 'checked' : '') +
          ' onchange="toggleTask(\'' + t.id + '\')">' +
        '<div>' +
          '<strong>' + escapeHtml(t.title) + '</strong>' +
          descHtml + dueDateHtml +
        '</div>' +
      '</div>' +
      '<button class="btn-delete" onclick="openConfirm(\'' + t.id + '\')">X</button>' +
    '</li>';
  }).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function updateStats() {
  const pending = tasks.filter(t => t.status === 'pending').length;
  const done = tasks.filter(t => t.status === 'done').length;
  document.getElementById('task-stats').innerHTML =
    '<span class="stat pending">' + pending + ' pendientes</span>' +
    '<span class="stat done">' + done + ' completadas</span>';
}

function filterTasks(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTasks();
}

async function addTask() {
  const title = document.getElementById('task-title').value.trim();
  const description = document.getElementById('task-desc').value.trim();
  const dueDate = document.getElementById('task-date').value;

  if (!title) {
    showToast('Escribe un titulo', 'error');
    return;
  }

  const data = await apiFetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, dueDate })
  });

  if (data.id) {
    tasks.push(data);
    renderTasks();
    updateStats();
    document.getElementById('task-title').value = '';
    document.getElementById('task-desc').value = '';
    document.getElementById('task-date').value = '';
    showToast('Tarea creada');
  }
}

async function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.status = task.status === 'done' ? 'pending' : 'done';
  renderTasks();
  updateStats();
}

// ===== Delete =====
function openConfirm(id) {
  deleteTaskId = id;
  document.getElementById('confirm-modal').style.display = 'flex';
}

function closeConfirm() {
  document.getElementById('confirm-modal').style.display = 'none';
  deleteTaskId = null;
}

async function confirmDelete() {
  const data = await apiFetch('/api/tasks/' + deleteTaskId, { method: 'DELETE' });
  if (data.success) {
    tasks = tasks.filter(t => t.id !== deleteTaskId);
    renderTasks();
    updateStats();
    showToast('Tarea eliminada');
  }
  closeConfirm();
}

// ===== Toast =====
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(function() { toast.classList.add('show'); }, 10);
  setTimeout(function() {
    toast.classList.remove('show');
    setTimeout(function() { toast.remove(); }, 300);
  }, 3000);
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', loadTasks);
