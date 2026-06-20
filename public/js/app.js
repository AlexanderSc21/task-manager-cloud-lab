// ===== Toast System =====
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===== Auth Functions (Login Page) =====
function showRegister() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('register-form').style.display = 'block';
  hideError();
}

function showLogin() {
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('login-form').style.display = 'block';
  hideError();
}

function showError(msg) {
  const el = document.getElementById('auth-error');
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
  }
}

function hideError() {
  const el = document.getElementById('auth-error');
  if (el) el.style.display = 'none';
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (loading) {
    btn.disabled = true;
    btn.dataset.originalText = btn.textContent;
    btn.textContent = 'Cargando...';
  } else {
    btn.disabled = false;
    btn.textContent = btn.dataset.originalText || btn.textContent;
  }
}

async function handleLogin() {
  const username = document.getElementById('login-user').value.trim();
  const password = document.getElementById('login-pass').value;

  if (!username || !password) {
    showError('Completa todos los campos');
    return;
  }

  setLoading('login-btn', true);
  hideError();

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      window.location.href = '/dashboard.html';
    } else {
      showError(data.error || 'Credenciales incorrectas');
    }
  } catch (err) {
    showError('Error de conexion');
  } finally {
    setLoading('login-btn', false);
  }
}

async function handleRegister() {
  const username = document.getElementById('reg-user').value.trim();
  const password = document.getElementById('reg-pass').value;

  if (!username || !password) {
    showError('Completa todos los campos');
    return;
  }

  if (password.length < 4) {
    showError('Minimo 4 caracteres');
    return;
  }

  setLoading('reg-btn', true);
  hideError();

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      window.location.href = '/dashboard.html';
    } else {
      showError(data.error || 'Error al registrar');
    }
  } catch (err) {
    showError('Error de conexion');
  } finally {
    setLoading('reg-btn', false);
  }
}

// ===== Dashboard Functions =====
let tasks = [];
let currentFilter = 'all';
let editingTaskId = null;
let deleteTaskId = null;

async function apiFetch(url, options = {}) {
  const res = await fetch(url, options);
  if (res.status === 401) {
    window.location.href = '/';
    return null;
  }
  return res.json();
}

async function loadUser() {
  const data = await apiFetch('/api/auth/me');
  if (data && data.user) {
    document.getElementById('welcome-msg').textContent = 'Bienvenido, ' + data.user.username;
  }
}

async function loadStats() {
  const data = await apiFetch('/api/tasks/stats');
  if (data) {
    document.getElementById('task-stats').innerHTML =
      '<span class="stat pending">' + data.pending + ' pendientes</span>' +
      '<span class="stat done">' + data.done + ' completadas</span>';
  }
}

async function loadTasks() {
  const data = await apiFetch('/api/tasks');
  if (data) {
    tasks = data;
    renderTasks();
    loadStats();
  }
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
          ' onchange="handleToggle(\'' + t.id + '\')">' +
        '<div>' +
          '<strong>' + escapeHtml(t.title) + '</strong>' +
          descHtml + dueDateHtml +
        '</div>' +
      '</div>' +
      '<div class="task-actions">' +
        '<button class="btn-edit" onclick="openEditModal(\'' + t.id + '\')">Editar</button>' +
        '<button class="btn-delete" onclick="openConfirm(\'' + t.id + '\')">X</button>' +
      '</div>' +
    '</li>';
  }).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function handleFilter(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTasks();
}

async function handleAddTask() {
  const title = document.getElementById('task-title').value.trim();
  const description = document.getElementById('task-desc').value.trim();
  const dueDate = document.getElementById('task-date').value;

  if (!title) {
    showToast('Escribe un titulo', 'error');
    return;
  }

  setLoading('add-btn', true);

  const data = await apiFetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, dueDate })
  });

  if (data && data.id) {
    tasks.push(data);
    renderTasks();
    loadStats();
    document.getElementById('task-title').value = '';
    document.getElementById('task-desc').value = '';
    document.getElementById('task-date').value = '';
    showToast('Tarea creada');
  } else {
    showToast('Error al crear tarea', 'error');
  }

  setLoading('add-btn', false);
}

async function handleToggle(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const newStatus = task.status === 'done' ? 'pending' : 'done';
  const data = await apiFetch('/api/tasks/' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  });

  if (data) {
    task.status = newStatus;
    renderTasks();
    loadStats();
  }
}

// ===== Edit Modal =====
function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  editingTaskId = id;
  document.getElementById('edit-title').value = task.title;
  document.getElementById('edit-desc').value = task.description || '';
  document.getElementById('edit-date').value = task.dueDate || '';
  document.getElementById('edit-modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('edit-modal').style.display = 'none';
  editingTaskId = null;
}

async function handleSaveEdit() {
  const title = document.getElementById('edit-title').value.trim();
  const description = document.getElementById('edit-desc').value.trim();
  const dueDate = document.getElementById('edit-date').value;

  if (!title) {
    showToast('El titulo no puede estar vacio', 'error');
    return;
  }

  const data = await apiFetch('/api/tasks/' + editingTaskId, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, dueDate })
  });

  if (data) {
    const task = tasks.find(t => t.id === editingTaskId);
    if (task) {
      task.title = title;
      task.description = description;
      task.dueDate = dueDate;
    }
    renderTasks();
    closeModal();
    showToast('Tarea actualizada');
  }
}

// ===== Confirm Delete Modal =====
function openConfirm(id) {
  deleteTaskId = id;
  document.getElementById('confirm-modal').style.display = 'flex';
}

function closeConfirm() {
  document.getElementById('confirm-modal').style.display = 'none';
  deleteTaskId = null;
}

async function handleConfirmDelete() {
  const data = await apiFetch('/api/tasks/' + deleteTaskId, { method: 'DELETE' });
  if (data && data.success) {
    tasks = tasks.filter(t => t.id !== deleteTaskId);
    renderTasks();
    loadStats();
    showToast('Tarea eliminada');
  }
  closeConfirm();
}

async function handleLogout() {
  await fetch('/api/auth/logout');
  window.location.href = '/';
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('task-list')) {
    loadUser();
    loadTasks();
  }
});
