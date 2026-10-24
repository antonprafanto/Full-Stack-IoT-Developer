# Mini Smart Home Frontend

🌐 **English** · [Bahasa Indonesia](../../../../../fase-4-frontend-dashboard/modul-22-react-dasar/kode/frontend/README.md)

Dashboard v0.1 of the Mini Smart Home project: a React 19 + TypeScript web page with Tailwind CSS v4, made with Vite 8 (the `react-ts` template from create-vite 9.3.1). The dashboard logs in with a Module 20 account, then shows the device list (with the Module 21 `status` and `key` badges) and the latest reading of every sensor of each device from backend v1.0, tidy on a phone and on a laptop. Live data, charts, and control buttons aren't there yet; they all follow in Modules 23–24.

## How to run it

1. Install Node.js 24 LTS (Vite 8 needs at least Node.js 20.19 or 22.12).
2. Start backend v1.0 as in `backend/README.md` (the `smarthome-db` database in Docker Desktop and the MQTT broker already running, then `npm run dev` in the `backend` folder) together with its data sources: Node 1 and Node 2 (Kit A + B), or the Module 21 device simulator in the `tools` folder with the practice device `f00d00000001` already registered. `CORS_ORIGIN` in `backend/.env` must contain `http://localhost:5173` (its default value already does).
3. In this folder, run `npm install`.
4. Run `npm run dev`, then open **`http://localhost:5173`** in Chrome or Edge. Use `localhost`, not `127.0.0.1`: on Windows, Vite only listens on `localhost`, and the page's host name must be the same as the API's host name so the login cookies are sent along.
5. Log in with an account made in Module 20: `viewer@home.test` (can only look) or `admin@home.test`. The password is your own; the dashboard never stores it.

| Command | What it does |
| :--- | :--- |
| `npm run dev` | a dev server at `http://localhost:5173` that updates the page every time the code is saved (HMR). Its port is locked (`strictPort`): if 5173 is in use, Vite stops with an error instead of quietly moving to 5174 |
| `npm run build` | checks the TypeScript types (`tsc -b`), then makes a ready-to-use version in the `dist/` folder |
| `npm run preview` | serves what is in `dist/` at `http://localhost:5173` so you can try it (stop `npm run dev` first) |
| `npm run lint` | checks the code with oxlint; clean = no warnings or errors are printed |

## Backend address (`.env.local`, optional)

Without any settings, the dashboard calls the backend at the page's host name + port `8080`: the page `http://localhost:5173` → API `http://localhost:8080`. If your backend is at another address, copy `.env.example` to `.env.local`, fill in `VITE_API_BASE` (for example `VITE_API_BASE=http://localhost:8081`), then restart `npm run dev`. `.env.local` doesn't go into Git. Every `VITE_…` variable is built into the JavaScript sent to the browser, so it only ever holds an address, **never** a secret.

## What's in the `src/` folder

| File | What it holds |
| :--- | :--- |
| `main.tsx` | the entry point from the template: mounts `App` into `<div id="root">` inside `StrictMode` |
| `App.tsx` | checks the login (`GET /auth/me`), then picks one of three screens with plain state: login, the device list, or the device details; the **Log out** button |
| `api.ts` | one door to the backend: `fetch` with `credentials: "include"`, an `ApiError` that knows the HTTP code, and a refresh once when the answer is 401 |
| `types.ts` | data types from data contract 1.4 (Appendix A) and from the backend v1.0 API responses |
| `components/Login.tsx` | a minimal login form |
| `components/DeviceList.tsx` | `GET /devices`: device cards with `status` and `key` badges |
| `components/DeviceDetails.tsx` | `GET /devices/:id/latest`: the latest reading of every Node 1 or Node 2 sensor, with a WIB time |
| `components/SensorCard.tsx` | one sensor card (label, number, unit) that is reused |
| `components/Badge.tsx` | colored badges for `status` and `key` |
| `index.css` | `@import "tailwindcss";` (Tailwind CSS v4, without `tailwind.config.js`) |

## Login and security

- The dashboard doesn't store passwords or tokens. The backend sets two `HttpOnly; SameSite=Strict` cookies: `access` (15 minutes) and `session` (7 days). JavaScript can't read them; the browser sends them because every `fetch` uses `credentials: "include"`. Nothing at all is stored in `localStorage`.
- If a request is answered with 401 (the `access` cookie has run out), `api.ts` calls `POST /auth/refresh` **once**, then repeats the request once. If the refresh fails too, the screen goes back to the login form.
- Device names and locations are shown as JSX text, which React escapes automatically; the dashboard doesn't use `dangerouslySetInnerHTML`.

## Limits of v0.1

- **Static.** A reading is fetched once when its screen opens. For a newer number, go back to the list and open the device again. Live data, charts, and history follow in Module 23.
- **No controls.** The lamp and the fan are only shown. Control buttons, views by role, protected routes, and a more complete logout follow in Module 24.
- **Home network only, and for now only this laptop.** The backend listens on `127.0.0.1` and Vite on `localhost`, so the dashboard can only be opened from the laptop that runs it. Opening it from a phone over the home Wi-Fi follows in Module 23; from the internet in Module 27.
- **The latest reading comes from the backend's memory.** After the backend restarts, the device details say "No reading from this device…" until that device sends again (Node 1: every 10 seconds). A device that isn't registered or whose key is revoked never gets a new reading: the backend ignores its messages (Module 21).
- "Tidy on a phone" was checked with DevTools device mode (375 px wide), not on a real phone yet. Tailwind CSS v4 needs a fairly new browser (Chrome 111+, Safari 16.4+, Firefox 128+).
