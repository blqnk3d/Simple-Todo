import db from './db.js';
import settings from './settings.js';
import { renderTodoList, filterTodos, createTodoObject, updateTodoObject } from './ui.js';

let todos = [];
let currentView = 'all';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ── Init ──

async function init() {
  await db.open();
  await settings.init();

  currentView = settings.getAll().defaultView || 'all';
  setActiveFilter(currentView);

  todos = await db.getAllTodos();
  render();

  bindInputBar();
  bindFilters();
  bindSettings();
  bindEditModal();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

// ── Render ──

function render() {
  const filtered = filterTodos(todos, currentView);
  const list = $('#todoList');
  renderTodoList(filtered, list, {
    onToggle: toggleTodo,
    onEdit: openEditModal,
    onDelete: deleteTodo
  });
}

// ── Input Bar ──

function bindInputBar() {
  const input = $('#todoInput');
  const btn = $('#btnAdd');
  const dateInput = $('#todoDate');
  const timeInput = $('#todoTime');
  const extras = $('.input-extras');

  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTodo();
    }
  });

  btn.addEventListener('click', addTodo);

  function addTodo() {
    const text = input.value.trim();
    if (!text) return;

    const todo = createTodoObject(text, dateInput.value || null, timeInput.value || null);
    todos.push(todo);
    db.addTodo(todo);

    input.value = '';
    input.style.height = 'auto';
    dateInput.value = '';
    timeInput.value = '';

    render();
    input.focus();
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

  saveBtn.addEventListener('click', saveEdit);
  cancelBtn.addEventListener('click', closeEditModal);

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

  input.value = todo.text;
  dateInput.value = todo.dueDate || '';
  timeInput.value = todo.dueTime || '';

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

  await db.updateTodo(todo);
  closeEditModal();
  render();
}

function closeEditModal() {
  editingId = null;
  $('#editOverlay').classList.remove('open');
}

// ── Settings ──

function bindSettings() {
  const overlay = $('#settingsOverlay');
  const openBtn = $('#btnSettings');
  const closeBtn = $('#btnSettingsClose');
  const resetBtn = $('#btnResetColors');

  openBtn.addEventListener('click', () => {
    loadSettingsUI();
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

document.addEventListener('DOMContentLoaded', init);
