# PWA Todo App — Implementation Plan

## Design Direction

**Aesthetic:** Ultra-minimal dark UI, inspired by WhatsApp/Telegram input pattern. No decoration — pure function. The "signature element" is the **always-visible bottom input bar** that feels native.

**Color tokens (dark theme base):**
- `--bg`: `#0a0a0a` (near-black)
- `--surface`: `#1a1a1a` (cards/list items)
- `--surface-2`: `#242424` (input fields, elevated elements)
- `--text`: `#e8e8e8` (primary text)
- `--text-dim`: `#737373` (secondary/labels)
- `--accent`: `#4a9eff` (user-configurable, default blue)
- Urgency colors: user-configurable (default: `#ef4444` today, `#f97316` 1-2d, `#3b82f6` 3-5d, `#22c55e` 6+d)

**Typography:** System font stack (`-apple-system, system-ui, ...`) — zero download, native feel.

**Layout (mobile):**
```
┌─────────────────────┐
│  [All] [Today] [Week] [Month]  │  ← Filter tabs
├─────────────────────┤
│                     │
│  ☐ Buy milk    🔴  │  ← Todo items (scrollable)
│     Due today       │
│  ☐ Call dentist 🟠  │
│     Due in 2 days   │
│  ○ Old task    ✓    │  ← Completed (dimmed, strikethrough)
│                     │
├─────────────────────┤
│ + Type a todo...    │  ← Always visible input bar
│ [📅] [✏️] [Add]     │  ← Date picker + Add button
└─────────────────────┘
```

---

## File Structure

```
Simple-Todo/
├── index.html          ← Single HTML file (app shell)
├── manifest.json       ← PWA manifest
├── sw.js               ← Service Worker (caching)
├── css/
│   └── style.css       ← All styles
├── js/
│   ├── app.js          ← Main app controller
│   ├── db.js           ← IndexedDB wrapper
│   ├── ui.js           ← DOM rendering/helpers
│   └── settings.js     ← Settings manager
└── icons/
    ├── icon-192.png    ← PWA icon
    └── icon-512.png    ← PWA icon
```

---

## Feature Breakdown

### 1. PWA Setup (`manifest.json`, `sw.js`, meta tags)
- `manifest.json` with `display: "standalone"`, theme color `#0a0a0a`, app name
- Service worker with cache-first strategy for static assets
- Viewport meta for fullscreen feel
- Add to homescreen support

### 2. IndexedDB Schema (`db.js`)
```
Database: "TodoApp"
Object Store: "todos"
  - keyPath: "id" (auto-generated UUID)
  - indexes: "createdAt", "dueDate", "completed"

Todo object:
  {
    id: string (crypto.randomUUID()),
    text: string,
    dueDate: string | null (ISO date "YYYY-MM-DD"),
    dueTime: string | null (HH:MM),
    completed: boolean,
    completedAt: string | null (ISO timestamp),
    createdAt: string (ISO timestamp),
    updatedAt: string (ISO timestamp)
  }

Object Store: "settings"
  - keyPath: "key"
  Values: { key: "urgencyColors", value: { today, twoDays, fiveDays, noDate, completed } }
         { key: "defaultView", value: "all" | "today" | "week" | "month" }
```

### 3. Core UI
- **Filter bar** (top): Horizontal scrollable pill buttons: All | Today | Week | Month
- **Todo list** (middle, scrollable): Checkbox + text + due date badge + edit/delete
- **Input bar** (bottom, fixed): Text input + optional date/time + Add button

### 4. Todo CRUD Operations
- **Create:** Enter text → optionally set date/time → Enter or tap Add
- **Read/View:** Loaded on start, sorted by incomplete first, due date ASC
- **Edit:** Tap todo text → inline edit mode
- **Delete:** Delete button on each todo
- **Toggle complete:** Tap checkbox → dimmed + strikethrough

### 5. Color-Coded Urgency System
- No date → grey
- Completed → dimmed
- Today/overdue → red
- Within 2 days → orange/amber
- Within 5 days → blue
- 6+ days → green

### 6. Settings Page
- Accessible via gear icon top-right
- Color pickers for 5 urgency levels
- Default view selector
- Reset colors button
- Saved to IndexedDB, applies instantly

---

## Implementation Order

1. Project scaffolding — Create all files, index.html shell, manifest.json, sw.js
2. IndexedDB layer — db.js with full CRUD + settings
3. Core UI rendering — ui.js with render functions
4. App controller — app.js wiring everything together
5. CSS styling — Dark theme, mobile-first, responsive
6. Settings — Color pickers, default view, persist to IndexedDB
7. PWA polish — Service worker, manifest icons, installability
8. Desktop responsiveness — Max-width container, adjusted spacing

---

## Key Technical Decisions

| Decision | Choice | Why |
|---|---|---|
| State management | Simple in-memory array + IndexedDB | No framework needed |
| Rendering | Direct DOM manipulation with innerHTML templates | Simple enough |
| ID generation | `crypto.randomUUID()` | Native, no dependency |
| Date handling | Native `Date` + ISO strings | No library needed |
| CSS approach | Single file, CSS custom properties for theming | Settings = update CSS vars |
| Animations | CSS transitions only | Smooth, performant |
