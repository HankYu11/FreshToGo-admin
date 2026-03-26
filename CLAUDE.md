# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

FreshToGo Admin — a React admin dashboard built with Vite + TypeScript. Currently a greenfield project on its initial scaffold.

## Commands

- `npm run dev` — start dev server with HMR
- `npm run build` — typecheck (`tsc -b`) then Vite production build
- `npm run lint` — ESLint across `**/*.{ts,tsx}`
- `npm run preview` — serve production build locally

## Tech Stack

- **React 19** with automatic JSX transform (`react-jsx`)
- **Vite 7** for bundling and dev server
- **TypeScript** in strict mode (ES2022 target, bundler module resolution)
- **ESLint** flat config with typescript-eslint, react-hooks, and react-refresh plugins
- **Pure CSS** with CSS custom properties and `prefers-color-scheme` support

## TypeScript

Strict mode is on with additional lint flags: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`. Three tsconfig files exist: root (references only), `tsconfig.app.json` (app code), `tsconfig.node.json` (build tooling).

## Testing

- **Vitest** with jsdom environment, **Testing Library** (react, jest-dom, user-event)
- `npm run test` — start Vitest in watch mode
- `npm run test:run` — single run (CI-friendly)
- Test files live next to source: `Component.test.tsx` beside `Component.tsx`
- Shared test helper at `src/test/helpers.tsx` — use `renderWithProviders()` to wrap components in `MemoryRouter` + `AuthContext.Provider`
- Setup file at `src/test/setup.ts` (jest-dom matchers)
- Write unit tests for every new feature unless there is a specific blocker (e.g., heavy native API dependency with no jsdom support). If skipping tests, leave a comment explaining why.
- Mock external dependencies (`sonner`, `recharts`, `axios`) rather than hitting real APIs
- Use `vi.useFakeTimers()` for timer tests. `fireEvent` is often simpler than `userEvent` (which requires manual timer advancement).
- Mock `HTMLDialogElement.prototype.showModal/close` — jsdom doesn't implement `<dialog>`

## Branching & PRs

- **`main`** is the production release branch — only merge into `main` for releases.
- **`develop`** is the integration branch — all `feat/`, `fix/`, `chore/`, `docs/`, and other work branches should target `develop` when creating PRs.

## Workflow

- Before committing, run `/simplify` to review changed code for reuse, quality, and efficiency.

## Deployment

Hosted on **Firebase Hosting** (site: `freshtogo-admin`, project: `freshtogo-e52a1`). The hosting config serves `dist/` with SPA rewrites (all routes → `index.html`). Deploy with `firebase deploy --only hosting`.
