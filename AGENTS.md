# TB10 - Sports Club Management Frontend

## Cursor Cloud specific instructions

### Overview
This is a React 19 + TypeScript + Vite 7 single-page application for sports club management. It is a **frontend-only** repository — the backend API is external and not included here.

### Dev commands
All standard commands are in `package.json` scripts:
- `yarn dev` — Vite dev server on port 5173 (add `--host 0.0.0.0` for external access)
- `yarn build` — runs `tsc -b && vite build`
- `yarn lint` — ESLint

### Caveats
- **No automated tests**: the repo has no test framework or test files. Validation is limited to `yarn lint` and `yarn build`.
- **Pre-existing lint/TS errors**: `yarn lint` reports 6 pre-existing errors (unused import, setState-in-effect, react-refresh warnings). `yarn build` fails due to an unused `useEffect` import in `src/components/settings/LocationSearchInput.tsx`. The Vite dev server is unaffected since it does not type-check.
- **Auth-protected routes**: all routes redirect unauthenticated users to `/login`. The app requires a running backend at `REACT_APP_BACKEND_URL` (default `http://localhost:3000`) for OAuth login (Google/Apple). Without the backend, the frontend UI renders but login/data flows are non-functional.
- **Environment variables**: copy `.env.example` to `.env`. `REACT_APP_BACKEND_URL` is required for API calls; `VITE_MAPBOX_ACCESS_TOKEN` is optional (location search only).
- **Package manager**: Yarn Classic (v1) with `nodeLinker: node-modules` in `.yarnrc.yml`. Use `yarn install` for dependency installation.
