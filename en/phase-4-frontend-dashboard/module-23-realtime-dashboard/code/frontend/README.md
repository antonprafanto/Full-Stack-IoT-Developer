# Mini Smart Home Frontend

🌐 **English** · [Bahasa Indonesia](../../../../../fase-4-frontend-dashboard/modul-23-dashboard-realtime/kode/frontend/README.md)

Dashboard v0.2 of the Mini Smart Home project: a React 19 + TypeScript web page with Tailwind CSS v4, made with Vite 8 (the `react-ts` template from create-vite 9.3.1). The dashboard logs in with a Module 20 account, then shows live data from backend v1.0 through Socket.IO: the device list with a red/green status and "last seen", device details with numbers that change by themselves, a chart of the last 5 minutes, and gauges. The history screen shows the last 1 hour, 24 hours, or 7 days as a chart and a paged table, and can be downloaded as a CSV. It's designed to be tidy on a phone and on a laptop and follows the system's dark mode; the dashboard can also be opened from a phone on the home Wi-Fi (see "Limits of v0.2"). Control buttons follow in Module 24.

## How to run it

1. Install Node.js 24 LTS (Vite 8 needs at least Node.js 20.19 or 22.12).
2. Start backend v1.0 as in `backend/README.md` (the `smarthome-db` database in Docker Desktop and the MQTT broker already running, then `npm run dev` in the `backend` folder) together with its data sources: Node 1 and Node 2 (Kit A + B), or the Module 21 device simulator in the `tools` folder with the practice device `f00d00000001` already registered. `CORS_ORIGIN` in `backend/.env` must contain `http://localhost:5173` (its default value already does).
3. In this folder, run `npm install`.
4. Run `npm run dev`, then open **`http://localhost:5173`** in Chrome or Edge. Use `localhost`, not `127.0.0.1`: on Windows, Vite only listens on `localhost`, and the page's host name must be the same as the API's host name so the login cookies are sent along.
5. Log in with an account made in Module 20: `viewer@home.test` (can only look) or `admin@home.test`. The password is your own; the dashboard never stores it.

The 7-day history needs 7 days of data. If the "7 days" chart only has a few points, fill in practice data in the `backend` folder with `npm run seed-history`, then refresh the hourly summary book:

```
docker exec smarthome-db psql -U postgres -d smarthome -c "CALL refresh_continuous_aggregate('readings_hourly', now() - INTERVAL '8 days', now() - INTERVAL '1 hour');"
```

| Command | What it does |
| :--- | :--- |
| `npm run dev` | a dev server at `http://localhost:5173` that updates the page every time the code is saved (HMR). Its port is locked (`strictPort`): if 5173 is in use, Vite stops with an error instead of quietly moving to 5174 |
| `npm run dev:phone` | the same as `npm run dev`, but other devices on the home Wi-Fi can open it too (`vite --host`). Only for "phone mode", see below |
| `npm run build` | checks the TypeScript types (`tsc -b`), then makes a ready-to-use version in the `dist/` folder. One yellow warning `Some chunks are larger than 500 kB after minification` is normal since Module 23 (the Recharts chart library makes its JavaScript file big); the build still succeeds |
| `npm run preview` | serves what is in `dist/` at `http://localhost:5173` so you can try it (stop `npm run dev` first). For a phone: `npm run preview -- --host` |
| `npm run lint` | checks the code with oxlint; clean = no warnings or errors are printed |

## Backend address (`.env.local`, optional)

Without any settings, the dashboard calls the backend at the page's host name + port `8080`: the page `http://localhost:5173` → API `http://localhost:8080`, and the page `http://<laptop-IP>:5173` on a phone → API `http://<laptop-IP>:8080`. The live connection (Socket.IO) uses the same address. If your backend is at another address, copy `.env.example` to `.env.local`, fill in `VITE_API_BASE` (for example `VITE_API_BASE=http://localhost:8081`), then restart `npm run dev`. `.env.local` doesn't go into Git, and for phone mode the `VITE_API_BASE` line must stay commented out with `#`. Every `VITE_…` variable is built into the JavaScript sent to the browser, so it only ever holds an address, **never** a secret.

## Opening it from a phone (home Wi-Fi)

The phone and the laptop must be on the same home Wi-Fi (not a guest Wi-Fi). Turn on "phone mode" only while you try it, on a home Wi-Fi you trust, then switch back to "laptop mode".

| Setting | Laptop mode (default) | Phone mode (temporary) |
| :--- | :--- | :--- |
| `HOST` in `backend/.env` | `127.0.0.1` | `0.0.0.0` (not the Wi-Fi IP address: with an IP address, the backend stops serving `localhost`) |
| `CORS_ORIGIN` in `backend/.env` | `http://localhost:5173,http://127.0.0.1:5173` | plus `,http://<laptop-IP>:5173`. This one line applies to `fetch` and Socket.IO at once |
| Vite command | `npm run dev` | `npm run dev:phone` |
| Address in the browser | `http://localhost:5173` on the laptop | `http://<laptop-IP>:5173` on the phone |

1. Find the laptop's Wi-Fi IPv4 address: on Windows `ipconfig`, the `Wireless LAN adapter Wi-Fi` section; on macOS `ipconfig getifaddr en0`. Ignore the addresses of other adapters (vEthernet, Docker, VPN) that Vite also prints.
2. Change the two `backend/.env` lines above, then save (`npm run dev` in the backend restarts by itself). The database stays on `127.0.0.1`: it isn't opened to the Wi-Fi.
3. In this folder, run `npm run dev:phone`. If Windows asks, allow **Node.js JavaScript Runtime** only for **Private** networks.
4. On the phone, open `http://<laptop-IP>:8080/health` first (it must answer), then `http://<laptop-IP>:5173`, and log in with the **viewer** account. Logging in on the laptop doesn't carry over to the phone: a cookie belongs to a host name (`localhost` and the IP address are two different names).
5. When you're done trying, and always before the laptop goes to another network: put `HOST` and `CORS_ORIGIN` back, then start Vite again with `npm run dev`. The IP address may change tomorrow (the router hands it out again); if the phone can't open the page any more, find the IP again.

## What's in the `src/` folder

| File | What it holds |
| :--- | :--- |
| `main.tsx` | the entry point from the template: mounts `App` into `<div id="root">` inside `StrictMode` |
| `App.tsx` | checks the login (`GET /auth/me`), keeps the live connection while logged in, and picks one screen with plain state: login, list, details, or history; the **Log out** button |
| `api.ts` | one door to the backend: `fetch` with `credentials: "include"`, an `ApiError` that knows the HTTP code, a refresh once when the answer is 401, the readings of the last 5 minutes, and the 1 hour / 24 hours / 7 days history |
| `socket.ts` | one Socket.IO connection for the whole dashboard (`withCredentials: true`), connection recovery, `follow`/`unfollow`, and the `useRealtime()` hook that passes the `telemetry` and `status` events on to the store |
| `store.ts` | the Zustand store: connection state, device list, status, latest readings, "last seen", and the 5-minute chart points |
| `time.ts` | WIB time, "… seconds ago" (date-fns), the stale-data limit, time-axis labels, and the one-second tick (`useNow`) |
| `csv.ts` | builds and downloads a CSV in the browser (comma separator, decimal point, BOM: Excel with English settings) |
| `types.ts` | data types from data contract 1.4 (Appendix A), the API answers, and the Socket.IO events of backend v1.0 |
| `components/Login.tsx` | a minimal login form |
| `components/DeviceList.tsx` | `GET /devices` + live data: red/green device cards with the latest temperature and "last seen" |
| `components/DeviceDetails.tsx` | all the sensors of one device (Node 1 or Node 2), the 5-minute chart, and gauges; the numbers change by themselves |
| `components/LiveChart.tsx` | a line chart of the last 5 minutes (Temperature / Light / Humidity) with honest gaps |
| `components/Gauge.tsx` | a 0-100 % half-circle gauge (soil moisture, water tank) |
| `components/DeviceHistory.tsx` | the history screen: range picker, chart, table, the **Download CSV** button, and the load time |
| `components/HistoryChart.tsx` | the history chart of averages (and lowest-highest for temperature) with honest gaps |
| `components/HistoryTable.tsx` | the history table, newest first, 24 rows per page |
| `components/SensorCard.tsx` | one sensor card (label, number, unit) that is reused |
| `components/Badge.tsx` | colored badges for `status` and `key` |
| `components/ConnectionBadge.tsx` | the connection badge in the header: Live, Reconnecting…, or Disconnected |
| `components/LastSeen.tsx` | "last seen … ago" + a "stale data" mark |
| `components/Picker.tsx` | a row of "pick one" buttons used by the charts and the history |
| `index.css` | `@import "tailwindcss";` (Tailwind CSS v4, without `tailwind.config.js`) + chart colors that follow dark mode |

## Login and security

- The dashboard doesn't store passwords or tokens. The backend sets two `HttpOnly; SameSite=Strict` cookies: `access` (15 minutes) and `session` (7 days). JavaScript can't read them; the browser sends them because every `fetch` uses `credentials: "include"` and Socket.IO uses `withCredentials: true`. Nothing at all is stored in `localStorage`, not even the theme choice.
- If a request is answered with 401 (the `access` cookie has run out), `api.ts` calls `POST /auth/refresh` **once**, then repeats the request once. If the refresh fails too, the screen goes back to the login form.
- The server cuts the live connection every time the `access` cookie runs out (15 minutes) and at logout. The dashboard then calls refresh and reconnects by itself; if the refresh is refused (for example after a logout in another tab), the screen goes back to the login form. If the backend has a problem (for example the database is down) when the wristband needs renewing, the dashboard tries again; after 3 failures in a row the badge becomes **Disconnected**, and the page has to be reloaded once the backend is back. The **Log out** button cuts the live connection first, then deletes the session.
- New data only comes through Socket.IO: there's no polling. `setInterval` is only used in `time.ts` for the clock on the screen.
- Device names and locations are shown as JSX text, which React escapes automatically; the dashboard doesn't use `dangerouslySetInnerHTML`.

## Limits of v0.2

- **No controls.** The lamp, fan, pump, and curtain are only shown. Control buttons, views by role, protected routes, and a more complete logout follow in Module 24. The v0.2 **Log out** cuts the live connection and deletes the session, but data already loaded stays in the tab's memory until the page is reloaded.
- **Home network only, and still plain `http://`.** Phone mode above opens the dashboard from another device on the home Wi-Fi; from the internet with HTTPS follows in Module 27.
- **The summary history has only four quantities**: temperature (average, lowest, highest), air humidity, soil moisture, and light. Air pressure, battery, and the water tank only show on the live cards. The ranges follow the API's defaults: 1 hour (raw readings), 24 hours (per 15 minutes), and 7 days (per hour).
- **The 5-minute chart is only for devices that send every 10 seconds** (Node 1 and the simulator). Node 2 sends every 5 minutes, so its chart is seen on the history screen.
- **Messages missed while the connection is down aren't sent again by the server.** Once reconnected, the 5-minute chart is refilled from the database; the cards get the last reading the backend remembers (the `follow` answer), or keep showing their old numbers with their time until the next message. After the backend restarts, its memory is still empty: the Node 1 cards use the last reading from the database (the last 5 minutes; its time is written in "updated at …"), but the state of the lamp, fan, pump, and curtain only appears with the next message because it isn't stored in the database. Node 2 says "No reading" until it sends again (every 5 minutes). Devices that aren't registered or whose key is revoked aren't followed: the backend ignores their messages (Module 21).
- **A status that changes while the connection is down** (for example a device turned off while the phone's Wi-Fi dropped) only shows after the Device List is opened again or the page is reloaded: the server only sends a status when it changes, and doesn't repeat it for a new connection. The "stale data" mark still appears after 30 seconds without a message (Node 2: 16 minutes).
- **Dark mode follows the system setting** of the phone or laptop; there's no light/dark button yet.
- "Tidy on a phone" was checked with DevTools device mode (375 px wide), and phone mode was tried by opening the laptop's Wi-Fi IP address from that laptop itself; neither has been tried on a real phone yet. Tailwind CSS v4 needs a fairly new browser (Chrome 111+, Safari 16.4+, Firefox 128+).
