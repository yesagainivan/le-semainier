---
description: Ensure robust internal React component architecture (no state-in-effect band-aids).
---

# Architecture Refactoring Workflow

When confronted with issues involving unnecessary re-renders, cascading renders, or `setState` within `useEffect` hooks, **do not** apply band-aid fixes like wrapping everything in `useCallback` or creating complex `useMemo` dependency arrays if an architectural refactoring is more appropriate.

## Core Principle: Component Lifecycle vs Data Dependency

State that should only initialize *once* when a view opens (e.g., auto-focusing an input, or fetching initial data like a Note) should be tied to the **lifecycle of a component** (mounting), not to data dependencies that might change entirely unrelated to the component's visibility.

## Steps to Refactor `useEffect` anti-patterns:

1. **Identify the Trigger:** Is the effect meant to happen only when the UI appears?
2. **Extract the View:** Move the inner content of the conditional UI into its own dedicated component (e.g., extracting the body of a Dialog into `<DialogContent />`).
3. **Mount Conditionally:** Only render the new component when the condition is true (e.g., `isOpen && <DialogContent />`).
4. **Tie to Mount:** Within the new component, use `useEffect` with an empty dependency array `[]` to execute the setup logic exactly once when the component mounts.
5. **Clean up:** Ensure any cleanup logic (like saving data back, closing subscriptions) is handled either in an action handler (like a close button) or in the `useEffect`'s return cleanup function if appropriate.

By doing this, you guarantee the effect runs exactly once per view interaction, cleanly skipping the React rendering cycle complexities.
