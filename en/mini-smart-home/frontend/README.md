# Mini Smart Home Frontend

🌐 **English** · [Bahasa Indonesia](../../../proyek-rumah-pintar-mini/frontend/README.md)

Dashboard v1.1 of the Mini Smart Home project: a React 19 + TypeScript web page with Tailwind CSS v4, made with Vite 8 (the `react-ts` template from create-vite 9.3.1). Every screen has its own address (React Router v8, declarative mode), and the screens behind the login are guarded by protected routes. The dashboard shows live data from the backend through Socket.IO (the device list, details with a 5-minute chart and gauges, a 1 hour / 24 hours / 7 days history with its rows and a CSV), and since Module 24 it also **controls** the devices: an admin account turns the lamp and fan on with the status "Waiting for device confirmation…", waters with the pump, and creates, changes, deactivates, and deletes automation rules in a form checked by the same Zod schema as the backend. A viewer account sees all the data without control buttons. Important events (a rule acting, a device disconnecting) appear as toasts. Since Module 25 (v1.1) there is a **Map** screen: every device that has a point (`lat`, `lng` from backend 1.2) shows as a green/gray circle on an OpenStreetMap map, colored by its live status. It's designed to be tidy on a phone and on a laptop, follows the system's dark mode, and can be opened from a phone on the home Wi-Fi (see "Limits of v1.1"). With v1.1, the Phase 4 dashboard is complete: live data (Module 23), control and roles (Module 24), and the device map (Module 25, 🎉 Phase 4 checkpoint). The Grafana technical dashboard is NOT part of this folder: it runs separately in Docker, with its files in the project's `grafana/` folder.

## How to run it

1. Install Node.js 24 LTS (Vite 8 needs at least Node.js 20.19 or 22.12; React Router 8 needs Node.js 22.22 or newer).
2. Start **backend v1.2** as in `backend/README.md` (the `smarthome-db` database in Docker Desktop and the MQTT broker already running, then `npm run dev` in the `backend` folder) together with its data sources: Node 1 and Node 2 (Kit A + B), or the device simulator in the `tools` folder with the practice device `f00d00000001` already registered. Dashboard v1.1 needs backend 1.2 for the **Map** screen (backend 1.1 doesn't send `lat`/`lng`; the Map screen then writes "The backend doesn't send map points (lat, lng) yet. The Map page needs backend 1.2 (Module 25)."), and at least backend 1.1 for the other screens: "falls below" rules (for example water if soil < 30%) and the **Delete rule** button don't exist in backend v1.0. `CORS_ORIGIN` in `backend/.env` must contain `http://localhost:5173` (its default value already does).
3. In this folder, run `npm install`.
4. Run `npm run dev`, then open **`http://localhost:5173`** in Chrome or Edge. Use `localhost`, not `127.0.0.1`: on Windows, Vite only listens on `localhost`, and the page's host name must be the same as the API's host name so the login cookies are sent along.
5. Log in with an account made in Module 20: `admin@home.test` (looks and controls) or `viewer@home.test` (can only look). The password is your own; the dashboard never stores it.

The 7-day history needs 7 days of data. If the "7 days" chart only has a few points, fill in practice data in the `backend` folder with `npm run seed-history`, then refresh the hourly summary book:

```
docker exec smarthome-db psql -U postgres -d smarthome -c "CALL refresh_continuous_aggregate('readings_hourly', now() - INTERVAL '8 days', now() - INTERVAL '1 hour');"
```

| Command | What it does |
| :--- | :--- |
| `npm run dev` | a dev server at `http://localhost:5173` that updates the page every time the code is saved (HMR). Its port is locked (`strictPort`): if 5173 is in use, Vite stops with an error instead of quietly moving to 5174 |
| `npm run dev:phone` | the same as `npm run dev`, but other devices on the home Wi-Fi can open it too (`vite --host`). Only for "phone mode", see below |
| `npm run build` | checks the TypeScript types (`tsc -b`), then makes a ready-to-use version in the `dist/` folder. One yellow warning `Some chunks are larger than 500 kB after minification` is normal since Module 23 (the Recharts chart library makes its JavaScript file big; since Module 25, Leaflet adds about 157 kB, or 46 kB after gzip compression); the build still succeeds |
| `npm run preview` | serves what is in `dist/` at `http://localhost:5173` so you can try it (stop `npm run dev` first). For a phone: `npm run preview -- --host` |
| `npm run lint` | checks the code with oxlint; clean = no warnings or errors are printed |
| `npm run check-schema` | checks that the schema copies in `src/schemas/` are exactly the same as their originals in `../backend/src/schemas/` (see "Schema copies"). The right result: two `SAME` lines |

The packages added in Module 24 are installed with written versions: `npm install react-router@8.5.0 react-hook-form@7.91.0 @hookform/resolvers@5.9.2 zod@4.6.7`. The command without versions can fail (`npm error code ERESOLVE`, because of `@hookform/resolvers` 6.0.0); don't use `--legacy-peer-deps`.

The map packages (Module 25) are installed with written versions too: `npm install leaflet@1.9.4 react-leaflet@5.0.0`, then `npm install -D @types/leaflet@1.9.22`. Don't copy the command from react-leaflet's installation page (`react@rc`, `react-leaflet@next`): as of October 2026 it installs old test versions (React 19.0.0-rc.1, react-leaflet 5.0.0-rc.2).

## Route map

All the addresses are in one place: `<Routes>` in `src/App.tsx`. The screens' paths (`/devices`, `/rules`, `/login`) live at `localhost:5173` and the backend API's paths (`/auth`, `/devices`, `/rules`) at `localhost:8080`: some words are the same, but the port (the origin) is different, and the dashboard calls the backend directly (CORS), with no proxy. `npm run dev` and `npm run preview` serve `index.html` for any address, so **F5** and a direct link to `/devices/f00d00000001` still work; other servers (Modules 26–27) need the same rule ("every address → `index.html`").

| Address | Screen | Who |
| :--- | :--- | :--- |
| `/login` | the login form (react-hook-form + Zod) | guests; someone already logged in is moved straight to their destination screen |
| `/` | redirected to `/devices` | logged in |
| `/devices` | the live device list | admin & viewer |
| `/devices/:id` | details, the 5-minute chart, gauges; the **Controls** section only for admins | admin & viewer |
| `/devices/:id/history` | the history, its rows, **Download CSV** | admin & viewer |
| `/map` | the device map (Module 25): green/gray circles by live status, a popup + a link to the details | admin & viewer |
| `/rules` | the automation rules in plain sentences; the **+ New rule** and **Edit** buttons only for admins | admin & viewer |
| `/rules/new`, `/rules/:id` | the rule form (create, change, deactivate, delete) | admin; a viewer sees the "Admin only" screen |
| any other address | "Page not found" + a link to the device list | everyone |

A screen opened without a login (for example the link `/devices/f00d00000001/history` in a private window) is moved to `/login`; after logging in, the dashboard goes back to that screen. After the **Log out** button, the next person always starts from `/devices`.

## The device map (Module 25)

- **The source of the points** is the `lat` (latitude) and `lng` (longitude) columns of `devices` in the database, which backend 1.2 sends in `GET /devices`. Points are set by an **admin** through the API, not written in the frontend code: the Bruno request `set device location` (`PUT /devices/:id/location` with `{ "lat": -6.1754, "lng": 106.8272 }`; numbers with a decimal point, `null` + `null` removes the point). A viewer account is answered 403.
- **When does a new point show up?** The Map screen fetches `GET /devices` again every time it opens. A point changed through Bruno shows after you open the **Map** menu again (from another screen), without F5. While the Map screen is open, points don't move by themselves: point changes aren't sent through Socket.IO. If that fetch fails (for example the database is down for a moment), the map keeps using the list it already has and a toast says "Couldn't reload the device list: the map points may not be the latest."; the other screens aren't affected.
- **The color** follows the live status in the store (Socket.IO events, no polling): green = `online`; gray = offline, offline mode, unknown, or a key that is revoked / not registered (its messages are ignored by the backend). A color always comes with words: the legend under the map and the status badge in the popup. Remember, "online" is the last MQTT status: a silent Node 2 (the Garden) stays green until its `offline` status is published (16 minutes after its last packet), and stays green while its linking Node 1 is off too (Node 2's status is published by Node 1). So "last seen" in the popup still needs reading, and for "data stopped arriving" rely on the "silent node" alert in Grafana.
- **The popup** (tap a circle): name, location, `device_id`, status, "last seen", and the link **Open details →** to `/devices/<id>`.
- The map is **fitted** to all points (`fitBounds`, zoom 18 at the closest) when it opens and when a point moves, not when a status changes, so a map you are dragging doesn't jump by itself. Devices without a point are listed under the map ("No point yet: …"). If there is no point at all yet, the screen says "No device has coordinates yet. Set them with the Bruno request `set device location`."
- **Marker = `CircleMarker`** (an SVG circle), not Leaflet's default `Marker` with an icon: the default icon uses image files that go missing after `npm run build` (the markers vanish in `npm run preview`, although they show in `npm run dev`). A circle needs no image file.
- **The map box must have a height** (`h-96` = 384 px in `DeviceMap.tsx`; without a height, the map is 0 px tall and can't be seen), and Leaflet's CSS must be loaded (`import "leaflet/dist/leaflet.css"`; without it the tiles are scattered). The `isolate` class keeps Leaflet's layers (z-index 400–1000) inside the map box, so the toasts (z-50) still show above it.
- **Map tiles** come straight from the OpenStreetMap server (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`, one constant in `src/map.ts`, as the OSM tile policy says: "don't hard-code the tile URL in many places"). The conditions: the attribution "© OpenStreetMap contributors" is always shown in the corner of the map (don't take it away), the browser sends a *Referer* (browsers do by default), and you **may not** download tiles in bulk or store them for use without the internet. This tile service is free without guarantees (no SLA) and can be blocked if overused; a few points for one home are far below that limit.
- **Dark mode:** the page frame, the legend, and the popup box with its ✕ button turn dark too (the rules in `index.css`); **the map tiles stay light**, because they are pictures from OpenStreetMap whose colors we don't change.
- **Privacy:** a home's coordinates are personal data (your home address). The examples in the module use a fictional point in a public place (around Monas, Jakarta). Before sharing a screenshot of the map, use the example point or cover the place.
- **Map library licenses:** Leaflet 1.9.4 is under the BSD-2-Clause license. react-leaflet 5.0.0 (with `@react-leaflet/core`) is under the **Hippocratic License 2.1**: free to use and change, provided the use is in line with human-rights principles (the UN Universal Declaration of Human Rights, named in its license text). That extra condition makes it **not** an open-source license recognized by the OSI (GitHub shows it as `NOASSERTION`). For this learning project that isn't a problem; for a product you sell, read its full text first (`node_modules/react-leaflet/LICENSE.md`), or use Leaflet directly without react-leaflet (covered in the Module 25 Deep Dive).

## Roles: admin and viewer

- The role is read from the `GET /auth/me` and `POST /auth/login` answers, then kept only in the tab's memory (the Zustand store), never in `localStorage`.
- The control buttons, **+ New rule**, and **Edit** are only drawn once the admin role is **certain** (`useAdmin()` in `store.ts`), so they don't flash up on a viewer's screen.
- Leaving buttons out is only screen convenience, **not protection**. What guards is still the backend's guard: every command and change from a viewer account is answered `403 viewer accounts can only look; commands and changes are admin-only`, from the dashboard, Bruno, or any other way.
- A role changed with `npm run users` in the backend only shows after the page is reloaded or the access wristband (15 minutes) is renewed.

## Control buttons

- **Lamp and fan** (`components/SwitchButton.tsx`): as soon as it is tapped, the button changes at once (*optimistic UI*, React 19's `useOptimistic` + `useTransition`) and writes "Waiting for device confirmation…" until the backend passes on the device's answer (the ack, at most 5 seconds). Its final state is taken from the ack. If the command fails, the button goes back by itself to the state the device reports, and a toast explains why: the device refused (`ack.ok` `false`), 409 (the device is offline, the previous command is still waiting), 503, the server didn't answer. A **504** answer means "not confirmed by the device yet; the server will try again when it hears from the device": a lamp or fan command is NOT cancelled, so the lamp may turn on by itself a little later.
- **Pump** (`components/PumpButton.tsx`): 3, 5, or 10 seconds (the buttons say `3 sec`, `5 sec`, `10 sec`), deliberately **not** optimistic (water that has come out can't be pulled back; a repeated command = watering twice). The screen only changes after the ack, and its buttons stay disabled while the pump is still watering. The backend doesn't send a pump command again after a 504.
- The buttons are disabled (with the reason written) when the device isn't online or its kind isn't known yet. Node 2 and devices whose key is revoked or that aren't registered have no **Controls** section. The curtain is only shown (its button: the Module 24 Challenge).
- The `POST /devices/:id/command` answer is checked with the `Ack` schema (a copy from the backend) using `safeParse`, not just trusted.

## Automation rules

- The `/rules` screen writes every rule as a sentence (`describeRule()` in `src/rules.ts`), for example "If the soil moisture on Practice living room is below 30 % for 10 seconds, water for 5 seconds (once). The rule is ready again after the soil moisture rises above 35 %." This sentence is made in the browser, so it can differ a little from the event sentences the backend makes.
- There is one form for creating and changing (`components/RuleForm.tsx`, with three small parts `WhenSection.tsx`, `ThenSection.tsx`, and `ConfirmDelete.tsx` that use the same form through `FormProvider`): **When?** (a number rising above a limit, a number falling below a limit, or a set time with a 5-field WIB cron), **Then?** (turn the lamp/fan on while the rule is on, or send one command once), a sentence preview that changes while you type, the **Active** switch, and **Delete rule** with a confirmation. The input is checked by the `Rule` schema that is the same as the backend's (react-hook-form + `zodResolver`); Zod's built-in messages are replaced by friendlier ones ("Enter a number", "Required"), while the schema's own messages (for example the hysteresis one) are exactly the ones the backend sends. The backend still checks again; its 400 errors (for example `invalid cron expression`) are put in their field, and errors for a part without a field (for example `condition.kind` from an old backend that doesn't know `below-threshold` yet) are written above the **Save rule** button. Number fields read a decimal point (`2.5`); careful with a decimal comma: an English-language Chrome drops every comma, so `2,5` becomes `25` without an error message. The whole-number fields refuse `2.5` with "Enter a whole number (no decimals)". Write thousands without a separator (`1000`, not `1.000`, which the browser reads as 1). After saving or deleting, the screen moves to `/rules` with `replace`, so **Back** doesn't open the old form again.
- Every rule created, changed, or deleted from any dashboard makes an open `/rules` screen fetch its list again by itself (the `rule-changed` event).

## On-screen notices (toasts)

- They come from two sources: the results of your own actions (a failed command, a saved rule) and the backend's `event` events (a rule acting, a schedule running, a device disconnecting, offline mode, a command sent again). `rule-changed` doesn't become a toast.
- At most 2 at once (the third pushes the oldest out), each one disappears by itself after 4 seconds (`setTimeout`, not `setInterval`) or is closed with the ✕ button (44 × 44 px). Their region (`components/ToastRegion.tsx`) is mounted by `Layout` between the header and the screen content, so it is always there on every screen after logging in, with `role="status"` and `aria-live="polite"`: screen readers announce its content without moving the focus. The color always comes with an icon and text.
- Their place follows the screen width, so they don't cover the button being used. On screens of 1280 px and up: top right, in the empty space beside the content column, sticking to the top edge while the page scrolls. On phones and tablets (below 1280 px there's no empty space beside the content): at the BOTTOM of the screen, plus the height of the phone's system bar if there is one (`env(safe-area-inset-bottom)`). So that the lowest buttons (**Save rule**, **Delete rule**) can always be scrolled above the toasts, the page content gets 16rem of free space at the bottom (`pb-64` on `<main>`), and `scroll-pb-64` on `<html>` (`index.html`) makes a browser that scrolls by itself to a button or field (the Tab key, a field with an error) stop above the toasts. Tested at 375 px and 1280 px, light and dark, also with three toasts arriving at once: **Log out**, **+ New rule**, **Edit**, Lamp, Fan, the pump buttons, **Save rule**, **Cancel**, **Delete rule**, and **Yes, delete** are not covered. What can still happen on a phone: a button that happens to sit right at the bottom edge of the screen when a toast arrives is covered until the page is scrolled a little more (or the toast is closed with ✕, at most 4 seconds). On a short or very narrow screen (a phone turned sideways, or a phone 320 px wide) a toast can cover the Lamp/Fan row or the pump buttons, including a toast from the button just tapped. A tap that lands on a toast card doesn't reach the button under it: close the toast with ✕ first or wait until it goes away. The region's empty space (outside the cards) doesn't block taps.
- An event toast's color is taken from the data, not from its sentence: a device disconnecting (the device's status in the store isn't `online`), and a rule or schedule whose action wasn't carried out (`data.ok` `false` from backend 1.1, or `data.result` `no-ack`/`not-sent`) are red; the others are gray.

## Logging out

The **Log out** button works in four steps: (1) it cuts the live connection first, (2) `POST /auth/logout` so the backend deletes the `HttpOnly` cookies (JavaScript can't delete them), (3) it clears EVERYTHING in the store and the toasts, so the next person in the same tab sees no leftover data or buttons of the previous account, (4) the route guard moves the screen to `/login`. If the **Back** button restores an old page whole from the browser's back/forward cache (it can happen when its address was typed straight into the address bar), `App.tsx` reloads that page (`pageshow` with `persisted`), so the previous account's content only shows for a moment and is then replaced by the Log in screen. If the server doesn't answer at Log out, the Log in screen says plainly that the session on the server hasn't been deleted. An expired session (or a logout in another tab) uses the same clearing, then writes "Your session has expired. Please log in again."

## Schema copies (`src/schemas/`)

`src/schemas/contract.ts` and `src/schemas/rule-basics.ts` are **identical copies** of `backend/src/schemas/` (explained in `src/schemas/README.md`). Don't change them in the frontend: change them in the backend, copy them again, then run `npm run check-schema` from this folder. The `check-schema.js` script compares the content of both files line by line (CRLF and LF line endings count as the same), prints `SAME` or `DIFF` with the first line that differs, and exits with code 1 if something differs. `src/schemas/login.ts` isn't a copy: the Log in form's schema is written by hand, mirroring `backend/src/routes/auth.ts`.

## Backend address (`.env.local`, optional)

Without any settings, the dashboard calls the backend at the page's host name + port `8080`: the page `http://localhost:5173` → API `http://localhost:8080`, and the page `http://<laptop-IP>:5173` on a phone → API `http://<laptop-IP>:8080`. The live connection (Socket.IO) uses the same address. If your backend is at another address, copy `.env.example` to `.env.local`, fill in `VITE_API_BASE` (for example `VITE_API_BASE=http://localhost:8081`), then restart `npm run dev`. `.env.local` doesn't go into Git, and for phone mode the `VITE_API_BASE` line must stay commented out with `#`. Every `VITE_…` variable is built into the JavaScript sent to the browser, so it only ever holds an address, **never** a secret.

## Opening it from a phone (home Wi-Fi)

The phone and the laptop must be on the same home Wi-Fi (not a guest Wi-Fi). Turn on "phone mode" only while you try it, on a home Wi-Fi you trust, then switch back to "laptop mode". Since v1.0 an admin account can control devices from a phone: the admin password travels over plain `http://` (not encrypted yet, HTTPS follows in Module 27), so give a tester a temporary account and delete it afterwards.

| Setting | Laptop mode (default) | Phone mode (temporary) |
| :--- | :--- | :--- |
| `HOST` in `backend/.env` | `127.0.0.1` | `0.0.0.0` (not the Wi-Fi IP address: with an IP address, the backend stops serving `localhost`) |
| `CORS_ORIGIN` in `backend/.env` | `http://localhost:5173,http://127.0.0.1:5173` | plus `,http://<laptop-IP>:5173`. This one line applies to `fetch` (commands, saving and deleting rules included) and Socket.IO at once. Without it, a command from the phone is answered `403 request from the page http://<laptop-IP>:5173 refused` |
| Vite command | `npm run dev` | `npm run dev:phone` |
| Address in the browser | `http://localhost:5173` on the laptop | `http://<laptop-IP>:5173` on the phone |

1. Find the laptop's Wi-Fi IPv4 address: on Windows `ipconfig`, the `Wireless LAN adapter Wi-Fi` section; on macOS `ipconfig getifaddr en0`. Ignore the addresses of other adapters (vEthernet, Docker, VPN) that Vite also prints.
2. Change the two `backend/.env` lines above, then save (`npm run dev` in the backend restarts by itself). The database stays on `127.0.0.1`: it isn't opened to the Wi-Fi.
3. In this folder, run `npm run dev:phone`. If Windows asks, allow **Node.js JavaScript Runtime** only for **Private** networks.
4. On the phone, open `http://<laptop-IP>:8080/health` first (it must answer), then `http://<laptop-IP>:5173`, and log in. Logging in on the laptop doesn't carry over to the phone: a cookie belongs to a host name (`localhost` and the IP address are two different names).
5. When you're done trying, and always before the laptop goes to another network: put `HOST` and `CORS_ORIGIN` back, then start Vite again with `npm run dev`. The IP address may change tomorrow (the router hands it out again); if the phone can't open the page any more, find the IP again.

**Add to the home screen.** The dashboard can be made a shortcut on the phone's home screen (Chrome on Android: menu ⋮ → **Install and create shortcut** → **Create shortcut**; iPhone: Share → **Add to Home Screen**). For the iPhone, `index.html` sets the icon `public/apple-touch-icon.png` (180 × 180 px: a simple line drawing of a house on a full light background, made by hand from an SVG) and the short name "Smart Home". This is only a shortcut to `http://<laptop-IP>:5173`, not an installed app: a PWA needs HTTPS (Module 27), and the shortcut breaks if the laptop's IP changes.

## What's in the `src/` folder

| File | What it holds |
| :--- | :--- |
| `main.tsx` | the entry point: mounts `App` inside `StrictMode` and `<BrowserRouter>` |
| `App.tsx` | checks the login once (`GET /auth/me`), keeps the live connection once (above `<Routes>`, so switching screens doesn't cut it), and the route map in one place |
| `api.ts` | one door to the backend: `fetch` with `credentials: "include"`, an `ApiError` that knows the HTTP code, a refresh once when the answer is 401, readings and history, `sendCommand()` (+ `Ack.safeParse`), `getRules()` (+ `safeParse`), `createRule()`, `updateRule()`, `deleteRule()` |
| `socket.ts` | one Socket.IO connection (`withCredentials: true`), connection recovery, `follow`/`unfollow`, the `useRealtime()` hook; the `event` event → a toast; the device list is fetched again every time the connection is RESTORED (statuses that changed while it was down) |
| `store.ts` | the Zustand store: the session and role (`useAdmin()`), connection, device list, status, latest readings, "last seen", the 5-minute chart points, `applyState()` from an ack, `clearAll()`, `handleSessionExpired()` |
| `toast.ts` | the small toast store: `toast(message, kind)`, at most 2, gone after 4 seconds |
| `rules.ts` | the shape of the `GET /rules` answer, `describeRule()` (a rule → a sentence), the form's default values, device options, the friendly-message map, and the backend's 400 error reader |
| `fields.tsx` | helpers for the rule form's fields: the box and label styles, field ids, `useFieldErrors()` (error messages + `aria-invalid`/`aria-describedby`) |
| `schemas/` | `contract.ts` and `rule-basics.ts` = identical copies from the backend; `login.ts` = the Log in form's schema; `README.md` |
| `time.ts` | WIB time, "… seconds ago" (date-fns), the stale-data limit, time-axis labels, and the one-second tick (`useNow`) |
| `csv.ts` | builds and downloads a CSV in the browser (comma separator, decimal point, BOM: Excel with English settings) |
| `types.ts` | data types from data contract 1.4 (Appendix A), the API answers, and the Socket.IO events |
| `map.ts` | the map settings in one constant `MAP` (Module 25): the OSM tile address, attribution, zoom, marker colors |
| `pages/` | one thin wrapper file per screen: `Login`, `Devices`, `Details`, `History`, `Map`, `Rules`, `RuleForm`, `NotFound`. The screens that use `:id` look up their own data from the address |
| `components/RequireLogin.tsx` | the route guard: "Checking the session…", moving to `/login` (carrying the destination address), or `<Outlet />` |
| `components/AdminOnly.tsx` | the second guard: the "Admin only" screen for viewer accounts, or `<Outlet />` for admins |
| `components/Layout.tsx` | the frame after logging in: the header (connection badge, the **Devices** / **Map** / **Rules** menu, name + role, **Log out**), the toast region (and the free space under the content for it), fetching the device list once, `<Outlet />` |
| `components/SwitchButton.tsx`, `components/PumpButton.tsx` | the control buttons (see "Control buttons") |
| `components/ToastRegion.tsx` | where the toasts show: at the bottom of phone and tablet screens, top right on screens of 1280 px and up |
| `components/RuleList.tsx`, `components/RuleForm.tsx` | the rule list in sentences and the rule form (input, save, delete, preview) |
| `components/WhenSection.tsx`, `components/ThenSection.tsx`, `components/ConfirmDelete.tsx` | the parts of the rule form: **When?**, **Then?** (+ Telegram and **Active**), and the **Delete rule** button with its "are you sure?" box |
| `components/DeviceList.tsx` | red/green device cards with the latest temperature and "last seen"; every card is a link to `/devices/<id>` |
| `components/DeviceDetails.tsx` | all the sensors of one device (Node 1 or Node 2), the **Controls** section (admin), the 5-minute chart, and gauges |
| `components/DeviceMap.tsx` | the device map (Module 25): a `MapContainer` with a set height, OSM tiles + attribution, a `CircleMarker` colored by live status, a popup + a details link, `fitBounds`, empty-state messages; fetches `GET /devices` again every time it opens |
| `components/LiveChart.tsx`, `Gauge.tsx`, `DeviceHistory.tsx`, `HistoryChart.tsx`, `HistoryTable.tsx`, `SensorCard.tsx`, `Badge.tsx`, `ConnectionBadge.tsx`, `LastSeen.tsx`, `Picker.tsx` | the Module 22–23 components (charts, gauges, history, cards, badges) |
| `index.css` | `@import "tailwindcss";` (Tailwind CSS v4, without `tailwind.config.js`) + chart colors that follow dark mode + the map popup box that follows dark mode (Module 25) |

## Login and security

- The dashboard doesn't store passwords, tokens, or roles. The backend sets two `HttpOnly; SameSite=Strict` cookies: `access` (15 minutes) and `session` (7 days). JavaScript can't read them; the browser sends them because every `fetch` uses `credentials: "include"` and Socket.IO uses `withCredentials: true`. Nothing at all is stored in `localStorage`.
- If a request is answered with 401 (the `access` cookie has run out), `api.ts` calls `POST /auth/refresh` **once**, then repeats the request once. If the refresh fails too, the store is cleared and the screen moves to `/login`.
- Requests without a body (`POST /auth/logout`, `POST /auth/refresh`, `DELETE /rules/:id`) are sent WITHOUT the `Content-Type: application/json` header: the backend refuses a request that claims to carry JSON but whose body is empty (400).
- The server cuts the live connection every time the `access` cookie runs out (15 minutes) and at logout. The dashboard then calls refresh and reconnects by itself; if the refresh is refused (for example after a logout in another tab), the screen moves to `/login`. After 3 failures in a row the badge becomes **Disconnected**, and the page has to be reloaded once the backend is back.
- New data only comes through Socket.IO: there's no polling. `setInterval` is only used in `time.ts` for the clock on the screen.
- Device names, rule names, and event sentences are shown as JSX text, which React escapes automatically; the dashboard doesn't use `dangerouslySetInnerHTML`.

## Limits of v1.1

- **Home network only, and still plain `http://`.** Phone mode above opens the dashboard from another device on the home Wi-Fi; passwords (the admin password too) travel without encryption. Access from the internet with HTTPS, and an installed app (PWA), follow in Module 27.
- **Leaving buttons out isn't protection.** The role on the screen is only convenience; the backend's guard (403) is what guards. A changed role only shows after a reload or within 15 minutes.
- **Only some API answers are checked by Zod**: the command ack and the rule list. The other answers (devices, readings, history, Socket.IO events) are still trusted through TypeScript types.
- **After a 504, the screen goes back to the reported state**, although the backend will still send a lamp or fan command again when it hears from the device; the dashboard doesn't show commands that are still pending.
- **The curtain has no button yet**, and a rule's schedule is entered as a 5-field cron text (with three ready-to-click examples), not with a time and day picker yet.
- **The summary history has only four quantities**: temperature (average, lowest, highest), air humidity, soil moisture, and light. Air pressure, battery, and the water tank only show on the live cards. The ranges follow the API's defaults: 1 hour (raw readings), 24 hours (per 15 minutes), and 7 days (per hour).
- **The 5-minute chart is only for devices that send every 10 seconds** (Node 1 and the simulator). Node 2 sends every 5 minutes, so its chart is seen on the history screen.
- **Messages missed while the connection is down aren't sent again by the server.** Once reconnected, the 5-minute chart is refilled from the database, the device list (and its statuses) is fetched again, and the cards get the last reading the backend remembers. After the backend restarts, the state of the lamp, fan, pump, and curtain only appears with the next message because it isn't stored in the database; until then the control buttons aren't shown.
- **The map needs the internet.** Tiles come from the OpenStreetMap server (free, without guarantees, can be blocked if overused). Without the internet, the map box is plain gray; the marker circles are still drawn. Tiles may not be downloaded in bulk or stored for offline use.
- **Map points don't move live.** A point changed by the admin shows after the **Map** menu is opened again; only the status color is live.
- **Markers can't be selected with the Tab key.** The map box itself can be focused with Tab and then moved with the arrow keys (Leaflet's default), but the marker circles and their popups only open with a click or a tap. The same content (name, status, last seen, details link) is on the **Devices** screen.
- **Map tiles stay light in dark mode**, and for one home the points are close together (a few meters, zoom 18): the map is most useful when devices are spread out (a garden, another house).
- **Dark mode follows the system setting** of the phone or laptop; there's no light/dark button yet.
- "Tidy on a phone" was checked with DevTools device mode (375 px wide, a phone held upright), and phone mode was tried by opening the laptop's Wi-Fi IP address from that laptop itself; use by another person on a real phone and the home-screen shortcut haven't been tried by the author yet. Tailwind CSS v4 needs a fairly new browser (Chrome 111+, Safari 16.4+, Firefox 128+).
