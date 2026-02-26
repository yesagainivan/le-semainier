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
- [x] Save Notes to `localStorage`/IndexedDb
- [ ] Drag-and-drop tasks between days (`dnd-kit`) (to be assessed as needed or not)
- [ ] PWA manifest + service worker (installable, offline assets caching)
- [ ] Export/import (JSON and Markdown)

---

## Phase 2: Polish (Upcoming)
*Goal: Add quality-of-life features without adding clutter.*

- [ ] Keyboard shortcuts globally (already started in day view)
- [ ] Time-blocking view option (vs. pure list)
- [ ] Responsive design check (Mobile portrait polish)
- [ ] ICS export (Importable into Apple Calendar, Google Calendar)
- [ ] Soft Dark Mode

---

## Phase 3: Community (Future)
*Goal: Open source stability and optional user enhancements.*

- [ ] Launch on appropriate channels
- [ ] Add most-requested features (if they align with the vision)
- [ ] Investigate optional cloud sync (Bring Your Own Backend or via OPFS/PowerSync)
