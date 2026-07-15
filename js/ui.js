import settings from './settings.js';

const EDIT_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
const DELETE_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysDiff(dateStr) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

export function getUrgencyColor(todo, s) {
  if (todo.completed) return s.colors.completed;
  if (!todo.dueDate) return s.colors.noDate;

  const diff = daysDiff(todo.dueDate);
  if (diff <= 0) return s.colors.today;
  if (diff <= 2) return s.colors.twoDays;
  if (diff <= 5) return s.colors.fiveDays;
  return s.colors.moreDays;
}

export function getDueLabel(dueDate, dueTime) {
  if (!dueDate) return 'No due date';

  const diff = daysDiff(dueDate);
  const today = todayStr();

  let label;
  if (diff < 0) label = `${Math.abs(diff)} day${Math.abs(diff) > 1 ? 's' : ''} overdue`;
  else if (diff === 0) label = 'Today';
  else if (diff === 1) label = 'Tomorrow';
  else if (diff <= 7) {
    const d = new Date(dueDate + 'T00:00:00');
    label = d.toLocaleDateString('en-US', { weekday: 'long' });
  } else {
    label = `In ${diff} days`;
  }

  if (dueTime) {
    const [h, m] = dueTime.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    label += ` at ${h12}:${m} ${ampm}`;
  }

  return label;
}

export function renderTodoList(todos, container, callbacks) {
  const s = settings.getAll();
  const sorted = sortTodos(todos);

  if (sorted.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">&#10003;</div>
        <div class="empty-state-title">No todos yet</div>
        <div class="empty-state-desc">Type below to add your first todo</div>
      </div>`;
    return;
  }

  container.innerHTML = sorted.map((todo) => {
    const color = getUrgencyColor(todo, s);
    const dueLabel = getDueLabel(todo.dueDate, todo.dueTime);
    const completedClass = todo.completed ? ' completed' : '';

    return `
      <div class="todo-item${completedClass}" data-id="${todo.id}">
        <div class="todo-checkbox" data-action="toggle" data-id="${todo.id}"></div>
        <div class="todo-content">
          <div class="todo-text">${escapeHtml(todo.text)}</div>
          <div class="todo-due">
            <span class="todo-due-dot" style="background: ${color};"></span>
            ${dueLabel}
          </div>
        </div>
        <div class="todo-actions">
          <button class="btn-todo-action" data-action="edit" data-id="${todo.id}" aria-label="Edit">${EDIT_SVG}</button>
          <button class="btn-todo-action delete" data-action="delete" data-id="${todo.id}" aria-label="Delete">${DELETE_SVG}</button>
        </div>
      </div>`;
  }).join('');

  container.querySelectorAll('[data-action]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = el.dataset.action;
      const id = el.dataset.id;
      if (action === 'toggle') callbacks.onToggle(id);
      else if (action === 'edit') callbacks.onEdit(id);
      else if (action === 'delete') callbacks.onDelete(id);
    });
  });
}

function sortTodos(todos) {
  const incomplete = todos.filter((t) => !t.completed);
  const completed = todos.filter((t) => t.completed);

  incomplete.sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  completed.sort((a, b) => {
    if (!a.completedAt && !b.completedAt) return 0;
    if (!a.completedAt) return 1;
    if (!b.completedAt) return -1;
    return b.completedAt.localeCompare(a.completedAt);
  });

  return [...incomplete, ...completed];
}

export function filterTodos(todos, view) {
  const today = todayStr();

  return todos.filter((todo) => {
    if (view === 'all') return true;
    if (view === 'today') {
      if (!todo.dueDate) return false;
      return daysDiff(todo.dueDate) <= 0;
    }
    if (view === 'week') {
      if (!todo.dueDate) return false;
      const diff = daysDiff(todo.dueDate);
      return diff <= 7;
    }
    if (view === 'month') {
      if (!todo.dueDate) return false;
      const diff = daysDiff(todo.dueDate);
      return diff <= 30;
    }
    if (view === 'no-date') return !todo.dueDate;
    return true;
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function createTodoObject(text, dueDate, dueTime) {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    text: text.trim(),
    dueDate: dueDate || null,
    dueTime: dueTime || null,
    completed: false,
    completedAt: null,
    createdAt: now,
    updatedAt: now
  };
}

export function updateTodoObject(todo, updates) {
  return {
    ...todo,
    ...updates,
    updatedAt: new Date().toISOString()
  };
}

export default { renderTodoList, filterTodos, getUrgencyColor, getDueLabel, createTodoObject, updateTodoObject };
