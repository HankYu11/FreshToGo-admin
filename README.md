# FreshToGo Admin

React admin dashboard built with Vite + TypeScript.

## Prerequisites

- Node.js (v18+)
- npm

## Getting Started

```bash
npm install
```

## Development

Start the dev server with HMR (uses `.env.development`):

```bash
npm run dev
```

## Production Build

Build for production (uses `.env.production`):

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Environment Files

- `.env.development` — environment variables for local development (`npm run dev`)
- `.env.production` — environment variables for production build (`npm run build`)

Vite automatically loads the appropriate `.env` file based on the mode. See the [Vite env docs](https://vite.dev/guide/env-and-mode) for details.

## Other Commands

```bash
npm run lint        # Run ESLint
npm run test        # Run Vitest in watch mode
npm run test:run    # Single test run (CI-friendly)
```

## Deployment

Hosted on Firebase Hosting. Deploy with:

```bash
npm run build
firebase deploy --only hosting
```
