# Le Semainier — Roadmap

**Status:** v0.1 — Minimum Viable Product (MVP) Iteration 1

This roadmap is derived directly from the original `origin/proposition.md` vision and tracks the active development of Le Semainier.

---

## Phase 1: MVP (Active)
*Goal: Nail the core experience. A fast, offline-first weekly view with day expansion.*

- [x] Project setup: Vite + React 19 + TypeScript + Bun + Tailwind v4
- [x] Apply visual design language (grain, fonts, CSS variables)
- [x] Implement the 7-day horizontal/grid layout (`WeekGrid`, `DayTile`)
- [x] Day expansion: Smooth layout-aware animations (`motion`)
- [x] Basic task creation and editing (Title, Time, Tag toggling)
- [x] Local storage with `Dexie.js` (IndexedDB) and `useLiveQuery`
- [x] Save Notes to IndexedDB (per-day, dedicated `notes` table)
- [x] Customizable accent colors (persisted to Dexie `settings` table)
- [x] Keyboard shortcuts in day view: `Escape` to close, `←`/`→` to navigate days
- [ ] Drag-and-drop tasks between days (`dnd-kit`) — deferred until it can be done perfectly
- [x] PWA manifest + service worker (installable, offline assets caching)
- [x] Export/import: JSON (full dump/restore), Markdown (weekly summary), ICS (calendar import)

---

## Phase 2: Polish (Active)
*Goal: Add quality-of-life features without adding clutter.*

- [ ] Customizable font choice (persisted to `settings` table)
- [ ] Weekly Section: per-week intention + stat cards (fills desktop whitespace, adds ritual)
- [x] Responsive design check (Mobile portrait polish)
- [ ] Soft Dark Mode (charcoal-based, no blue tinge)
- [ ] Time-blocking view *(deferred — conflicts with calm agenda philosophy; revisit only if user demand emerges)*

---

## Phase 3: Community (Future)
*Goal: Open source stability and optional user enhancements.*

- [ ] Launch on appropriate channels
- [ ] Add most-requested features (if they align with the vision)
- [ ] Investigate optional cloud sync (Bring Your Own Backend or via OPFS/PowerSync)
