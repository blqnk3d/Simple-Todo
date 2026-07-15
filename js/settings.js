import db from './db.js';

const STORAGE_KEY = 'todo-settings';

const DEFAULT_COLORS = {
  today: '#ef4444',
  twoDays: '#f97316',
  fiveDays: '#3b82f6',
  moreDays: '#22c55e',
  noDate: '#737373',
  completed: '#525252'
};

const DEFAULT_VIEW = 'all';

let current = null;

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch { /* ignore */ }
}

export async function init() {
  const stored = loadFromStorage();
  if (stored) {
    current = stored;
    applyToDOM(current);
    return current;
  }

  const colors = await db.getSetting('urgencyColors');
  const view = await db.getSetting('defaultView');

  current = {
    colors: colors || { ...DEFAULT_COLORS },
    defaultView: view || DEFAULT_VIEW
  };

  saveToStorage(current);
  applyToDOM(current);
  return current;
}

export function getAll() {
  return current || { colors: { ...DEFAULT_COLORS }, defaultView: DEFAULT_VIEW };
}

export async function setColors(colors) {
  current.colors = { ...colors };
  saveToStorage(current);
  await db.setSetting('urgencyColors', current.colors);
  applyToDOM(current);
}

export async function setDefaultView(view) {
  current.defaultView = view;
  saveToStorage(current);
  await db.setSetting('defaultView', current.defaultView);
}

export async function resetColors() {
  current.colors = { ...DEFAULT_COLORS };
  saveToStorage(current);
  await db.setSetting('urgencyColors', current.colors);
  applyToDOM(current);
}

function applyToDOM(settings) {
  const root = document.documentElement;
  root.style.setProperty('--color-today', settings.colors.today);
  root.style.setProperty('--color-two-days', settings.colors.twoDays);
  root.style.setProperty('--color-five-days', settings.colors.fiveDays);
  root.style.setProperty('--color-more-days', settings.colors.moreDays);
  root.style.setProperty('--color-no-date', settings.colors.noDate);
  root.style.setProperty('--color-completed', settings.colors.completed);
}

export default { init, getAll, setColors, setDefaultView, resetColors };
