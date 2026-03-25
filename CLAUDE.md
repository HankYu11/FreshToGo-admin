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

## Deployment

Hosted on **Firebase Hosting** (site: `freshtogo-admin`, project: `freshtogo-e52a1`). The hosting config serves `dist/` with SPA rewrites (all routes → `index.html`). Deploy with `firebase deploy --only hosting`.
