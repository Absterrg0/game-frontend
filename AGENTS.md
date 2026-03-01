# AGENTS.md

## Cursor Cloud specific instructions

This is a **React + TypeScript + Vite** frontend SPA for a sports club/tournament management platform (TB10). There is no backend in this repository.

### Quick reference

| Action | Command |
|--------|---------|
| Install deps | `yarn install` |
| Dev server | `yarn dev` (Vite, default port 5173) |
| Lint | `yarn lint` (ESLint) |
| Build | `yarn build` (tsc + vite build) |
| Preview prod build | `yarn preview` |

### Notes

- The project uses **Yarn classic** (v1) with `nodeLinker: node-modules` (see `.yarnrc.yml`).
- **No automated test suite exists** — there are no test scripts or test frameworks configured.
- ESLint has several pre-existing errors (React hooks `set-state-in-effect`, `react-refresh/only-export-components`). These are in the existing codebase and are not regressions.
- The app requires `REACT_APP_BACKEND_URL` env var (defaults to `http://localhost:3000`) for the backend API. The backend is **not** included in this repo, so most features (auth, clubs, user profiles) will show errors or redirects without it.
- To expose the dev server to the network, use `yarn dev --host 0.0.0.0`.
