# Le Semainier

**Le Semainier** is an open-source, single-user weekly planner web application that brings the charm and elegance of a French paper agenda to the digital world. It combines the tactile satisfaction of a physical planner with the speed and convenience of modern web technology.

## Core Vision

A weekly planner that feels like opening a beautiful French agenda on your desk. Not a productivity weapon, not a complex task management system — just a calm, familiar space to organize your week.

1. **Open the app** → You see your week spread before you, like opening a physical agenda.
2. **Each day is a tile** → Large, touchable, with a gentle summary of what's planned.
3. **Click a day** → It expands smoothly into an editable view.
4. **Plan naturally** → Add tasks, appointments, and notes with minimal friction.
5. **Close and return** → Back to the peaceful weekly overview.

## Tech Stack

This project strictly adheres to a robust, minimalist, and offline-first architecture.

*   **Vite 6** + **React 19** + **TypeScript**
*   **Bun** (Package management and script running)
*   **Tailwind CSS v4** + **Shadcn/UI** (Selective primitives)
*   **Dexie.js** (IndexedDB for local storage)
*   **Motion** (Lazy loading for smooth layout animations)
*   **eslint** (Strict type-checked config for maximum architectural soundness)

## Getting Started

Because there is zero backend code to worry about, running the project locally is incredibly simple.

1.  **Install dependencies** using the ultra-fast Bun package manager:
    ```bash
    bun install
    ```

2.  **Start the development server:**
    ```bash
    bun run dev
    ```

3.  **Strict Linting:**
    The project enforces maximum type-safety. Ensure your code passes the linter before committing.
    ```bash
    bun run lint
    bun run lint:fix
    ```

## Contributing
Please see `ROADMAP.md` in the repository root for the current phase goals and upcoming features. All pull requests must align with the vision laid out in the original propositions (simplicity, offline-first, no accounts required).

---
*"La semaine est un cadeau. Planifiez-la avec soin."*
