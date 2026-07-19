import db from './db.js';
import settings from './settings.js';
import { renderTodoList, filterTodos, createTodoObject, createRecurringObject, getNextDueDate, getGraceDays } from './ui.js';

let todos = [];
let recurringTemplates = [];
let recurringMap = {};
let currentView = 'all';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ── Init ──

async function init() {
  await db.open();
  await settings.init();

  currentView = settings.getAll().defaultView || 'all';
  setActiveFilter(currentView);

  recurringTemplates = await db.getAllRecurring();
  buildRecurringMap();

  todos = await db.getAllTodos();
  await initRecurring();

  render();

  bindCreateModal();
  bindFilters();
  bindSettings();
  bindEditModal();
  bindKeyboard();
  bindUpdateCheck();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch(() => {});

    if (navigator.onLine) {
      navigator.serviceWorker.getRegistration()?.then((r) => r?.update());
    }

    navigator.serviceWorker.addEventListener('message', (e) => {
      if (e.data?.type === 'SW_UPDATED') {
        if (confirm('New version available. Reload to update?')) {
          window.location.reload();
        }
      }
    });
  }

  bindInstallPrompt();
}

// ── Recurring ──

function buildRecurringMap() {
  recurringMap = {};
  for (const t of recurringTemplates) {
    recurringMap[t.id] = t;
  }
}

async function initRecurring() {
  const today = todayStr();
  let changed = false;

  for (const template of recurringTemplates) {
    if (!template.active) continue;
    if (!template.nextDueDate) continue;
    if (template.nextDueDate > today) continue;

    const existingIncomplete = todos?.find(
      (t) => t.recurringId === template.id && !t.completed
    );
    if (existingIncomplete) continue;

    const newTodo = createTodoObject(template.text, template.nextDueDate, null, template.id);
    todos.push(newTodo);
    await db.addTodo(newTodo);
    changed = true;
  }

  if (changed && todos.length > 0) {
    render();
  }
}

function updateStreak(template, completedDate) {
  const grace = getGraceDays(template.frequency);

  if (!template.lastCompletedDate) {
    template.streak = 1;
  } else {
    const lastDate = new Date(template.lastCompletedDate + 'T00:00:00');
    const completedD = new Date(completedDate + 'T00:00:00');
    const diffMs = completedD - lastDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let expectedGap;
    if (template.frequency === 'daily') expectedGap = 1;
    else if (template.frequency === 'weekly') expectedGap = 7;
    else if (template.frequency === 'monthly') expectedGap = 30;
    else expectedGap = 1;

    if (diffDays <= expectedGap + grace) {
      template.streak += 1;
    } else {
      template.streak = 1;
    }
  }

  template.lastCompletedDate = completedDate;
  template.nextDueDate = getNextDueDate(completedDate, template.frequency);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ── Render ──

function render() {
  const filtered = filterTodos(todos, currentView);
  const list = $('#todoList');
  renderTodoList(filtered, list, {
    onToggle: toggleTodo,
    onEdit: openEditModal,
    onDelete: deleteTodo
  }, recurringMap);
}

// ── Create Todo Modal ──

function bindCreateModal() {
  const overlay = $('#createOverlay');
  const fab = $('#fabAdd');
  const input = $('#todoInput');
  const dateInput = $('#todoDate');
  const timeInput = $('#todoTime');
  const addBtn = $('#btnAdd');
  const cancelBtn = $('#btnCreateCancel');
  const freqPills = $$('.freq-pill');

  let selectedFrequency = null;

  fab.addEventListener('click', () => {
    overlay.classList.add('open');
    input.value = '';
    dateInput.value = '';
    timeInput.value = '';
    selectedFrequency = null;
    freqPills.forEach((p) => p.classList.remove('active'));
    input.focus();
  });

  freqPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const freq = pill.dataset.freq;
      if (selectedFrequency === freq) {
        selectedFrequency = null;
        pill.classList.remove('active');
      } else {
        selectedFrequency = freq;
        freqPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
      }
    });
  });

  cancelBtn.addEventListener('click', closeCreateModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeCreateModal();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTodo();
    }
    if (e.key === 'Escape') closeCreateModal();
  });

  addBtn.addEventListener('click', addTodo);

  async function addTodo() {
    const text = input.value.trim();
    if (!text) return;

    if (selectedFrequency) {
      const template = createRecurringObject(text, selectedFrequency);
      await db.addRecurring(template);
      recurringTemplates.push(template);
      recurringMap[template.id] = template;

      const todo = createTodoObject(text, template.nextDueDate, null, template.id);
      todos.push(todo);
      await db.addTodo(todo);
    } else {
      const todo = createTodoObject(text, dateInput.value || null, timeInput.value || null);
      todos.push(todo);
      await db.addTodo(todo);
    }

    input.value = '';
    dateInput.value = '';
    timeInput.value = '';
    selectedFrequency = null;
    freqPills.forEach((p) => p.classList.remove('active'));

    render();
    closeCreateModal();
  }

  function closeCreateModal() {
    overlay.classList.remove('open');
    input.value = '';
    dateInput.value = '';
    timeInput.value = '';
    selectedFrequency = null;
    freqPills.forEach((p) => p.classList.remove('active'));
  }
}

// ── Filters ──

function bindFilters() {
  $$('.filter-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      currentView = pill.dataset.view;
      setActiveFilter(currentView);
      render();
    });
  });
}

function setActiveFilter(view) {
  $$('.filter-pill').forEach((p) => {
    p.classList.toggle('active', p.dataset.view === view);
  });
}

// ── Todo Actions ──

async function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  todo.completed = !todo.completed;
  todo.completedAt = todo.completed ? new Date().toISOString() : null;
  todo.updatedAt = new Date().toISOString();

  if (todo.completed && todo.recurringId) {
    const template = recurringMap[todo.recurringId];
    if (template) {
      updateStreak(template, todayStr());
      await db.updateRecurring(template);
    }
  }

  await db.updateTodo(todo);
  render();
}

async function deleteTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  todos = todos.filter((t) => t.id !== id);
  await db.deleteTodo(id);
  render();
}

// ── Edit Modal ──

let editingId = null;

function bindEditModal() {
  const overlay = $('#editOverlay');
  const input = $('#editInput');
  const dateInput = $('#editDate');
  const timeInput = $('#editTime');
  const saveBtn = $('#btnEditSave');
  const cancelBtn = $('#btnEditCancel');
  const stopRecurringBtn = $('#btnStopRecurring');

  saveBtn.addEventListener('click', saveEdit);
  cancelBtn.addEventListener('click', closeEditModal);

  if (stopRecurringBtn) {
    stopRecurringBtn.addEventListener('click', async () => {
      if (!editingId) return;
      const todo = todos.find((t) => t.id === editingId);
      if (!todo || !todo.recurringId) return;

      const template = recurringMap[todo.recurringId];
      if (template) {
        template.active = false;
        await db.updateRecurring(template);
      }
      todo.recurringId = null;
      await db.updateTodo(todo);
      closeEditModal();
      render();
    });
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeEditModal();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    }
    if (e.key === 'Escape') closeEditModal();
  });
}

function openEditModal(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  editingId = id;
  const overlay = $('#editOverlay');
  const input = $('#editInput');
  const dateInput = $('#editDate');
  const timeInput = $('#editTime');
  const stopBtn = $('#btnStopRecurring');

  input.value = todo.text;
  dateInput.value = todo.dueDate || '';
  timeInput.value = todo.dueTime || '';

  if (stopBtn) {
    stopBtn.style.display = todo.recurringId ? '' : 'none';
  }

  overlay.classList.add('open');
  input.focus();
}

async function saveEdit() {
  if (!editingId) return;

  const input = $('#editInput');
  const dateInput = $('#editDate');
  const timeInput = $('#editTime');

  const text = input.value.trim();
  if (!text) return;

  const todo = todos.find((t) => t.id === editingId);
  if (!todo) return;

  Object.assign(todo, {
    text,
    dueDate: dateInput.value || null,
    dueTime: timeInput.value || null,
    updatedAt: new Date().toISOString()
  });

  if (todo.recurringId) {
    const template = recurringMap[todo.recurringId];
    if (template) {
      template.text = text;
      await db.updateRecurring(template);
    }
  }

  await db.updateTodo(todo);
  closeEditModal();
  render();
}

function closeEditModal() {
  editingId = null;
  $('#editOverlay').classList.remove('open');
}

// ── Manual Update Check ──

function bindUpdateCheck() {
  const btn = $('#btnCheckUpdate');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    if (!('serviceWorker' in navigator)) {
      btn.textContent = 'Not supported';
      return;
    }

    btn.textContent = 'Checking...';
    btn.disabled = true;

    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        btn.textContent = 'No service worker';
        btn.disabled = false;
        return;
      }

      await reg.update();

      if (reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        btn.textContent = 'Reloading...';
        setTimeout(() => window.location.reload(), 500);
        return;
      } else if (reg.installing) {
        btn.textContent = 'Installing...';
        reg.installing.addEventListener('statechange', (e) => {
          if (e.target.state === 'activated') {
            btn.textContent = 'Updated!';
            btn.disabled = false;
          }
        });
      } else {
        btn.textContent = 'Up to date';
        btn.disabled = false;
      }
    } catch {
      btn.textContent = 'Check failed';
      btn.disabled = false;
    }
  });
}

// ── Settings ──

function bindSettings() {
  const overlay = $('#settingsOverlay');
  const openBtn = $('#btnSettings');
  const closeBtn = $('#btnSettingsClose');
  const resetBtn = $('#btnResetColors');

  openBtn.addEventListener('click', () => {
    loadSettingsUI();
    loadRecurringList();
    overlay.classList.add('open');
  });

  closeBtn.addEventListener('click', () => overlay.classList.remove('open'));

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
  });

  $$('.color-input').forEach((input) => {
    input.addEventListener('input', async () => {
      const colors = {
        today: $('#colorToday').value,
        twoDays: $('#colorTwoDays').value,
        fiveDays: $('#colorFiveDays').value,
        moreDays: $('#colorMoreDays').value,
        noDate: $('#colorNoDate').value,
        completed: $('#colorCompleted').value
      };
      await settings.setColors(colors);
      render();
    });
  });

  const viewSelect = $('#defaultView');
  viewSelect.addEventListener('change', async () => {
    await settings.setDefaultView(viewSelect.value);
  });

  resetBtn.addEventListener('click', async () => {
    await settings.resetColors();
    loadSettingsUI();
    render();
  });
}

function loadSettingsUI() {
  const s = settings.getAll();
  $('#colorToday').value = s.colors.today;
  $('#colorTwoDays').value = s.colors.twoDays;
  $('#colorFiveDays').value = s.colors.fiveDays;
  $('#colorMoreDays').value = s.colors.moreDays;
  $('#colorNoDate').value = s.colors.noDate;
  $('#colorCompleted').value = s.colors.completed;
  $('#defaultView').value = s.defaultView;
}

function loadRecurringList() {
  const container = $('#recurringList');
  if (!container) return;

  const active = recurringTemplates.filter((t) => t.active);

  if (active.length === 0) {
    container.innerHTML = '<div class="recurring-empty">No recurring tasks</div>';
    return;
  }

  const FREQ = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' };

  container.innerHTML = active.map((t) => `
    <div class="recurring-row">
      <div class="recurring-info">
        <span class="recurring-text">${escapeHtml(t.text)}</span>
        <span class="recurring-freq">${FREQ[t.frequency]} · Streak: ${t.streak}</span>
      </div>
      <button class="btn-todo-action delete" data-recurring-id="${t.id}" aria-label="Delete recurring">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    </div>
  `).join('');

  container.querySelectorAll('[data-recurring-id]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.recurringId;
      const template = recurringMap[id];
      if (!template) return;

      template.active = false;
      await db.updateRecurring(template);

      const linkedTodo = todos.find((t) => t.recurringId === id && !t.completed);
      if (linkedTodo) {
        linkedTodo.recurringId = null;
        await db.updateTodo(linkedTodo);
      }

      loadRecurringList();
      render();
    });
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ── Keyboard ──

function bindKeyboard() {
  if (!window.visualViewport) return;

  const app = $('.app');

  window.visualViewport.addEventListener('resize', () => {
    const vh = window.visualViewport.height;
    app.style.height = vh + 'px';
  });
}

// ── Install Prompt ──

function bindInstallPrompt() {
  const DISMISSED_KEY = 'todo-install-dismissed';
  let deferredPrompt = null;

  const banner = $('#installBanner');
  const installBtn = $('#btnInstall');
  const dismissBtn = $('#btnInstallDismiss');

  if (localStorage.getItem(DISMISSED_KEY)) return;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    banner.classList.add('visible');
  });

  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    banner.classList.remove('visible');
    if (outcome === 'accepted') localStorage.setItem(DISMISSED_KEY, '1');
  });

  dismissBtn.addEventListener('click', () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    banner.classList.remove('visible');
    deferredPrompt = null;
  });

  window.addEventListener('appinstalled', () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    banner.classList.remove('visible');
    deferredPrompt = null;
  });
}

document.addEventListener('DOMContentLoaded', init);
