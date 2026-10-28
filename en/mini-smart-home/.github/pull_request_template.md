## What changed?

<!-- One or two sentences: which feature was added or fixed, and why. -->

## Checklist before merging

- [ ] `npm run check` passes, without type errors
- [ ] **(Module 22)** If `frontend/` changed: in the `frontend` folder, `npm run build` and `npm run lint` pass with no errors and no warnings
- [ ] **(Module 23)** The only warning allowed in `npm run build` is the size warning `Some chunks are larger than 500 kB` (Recharts, explained in Module 23); `npm run lint` still has no warnings
- [ ] **(Module 24)** If `backend/src/schemas/contract.ts` or `rule-basics.ts` changed: their copies in `frontend/src/schemas/` are updated too, and `npm run check-schema` in the `frontend` folder prints two `SAME` lines
- [ ] The server starts with `npm run dev`, without errors in the terminal
- [ ] The new route was tried in Bruno, its test passes, and its request is saved in `backend/bruno/`
- [ ] The new route shows up in `/docs`, with its descriptions
- [ ] **(Module 24)** Every new HTTP method the dashboard calls (for example `DELETE`) is in the backend's CORS `methods` (`src/auth/security.ts`), and it was tried from the browser, not only from Bruno (Bruno doesn't send a preflight)
- [ ] No `.env` file or password in the **Files changed** tab
- [ ] `DATA-CONTRACT.md` is updated too if the shape of an MQTT message changed

## Security checklist

<!-- Since Module 20. Only tick what you have really checked. -->

- [ ] No `.env`, `bruno/.env`, `tools/.env`, `edge/broker-passwd`, `login*.json`, `cookies*.txt`, passwords, device keys, or tokens in the **Files changed** tab; passwords in Bruno requests are written as `{{process.env.…}}`
- [ ] New secret settings (if any) are added to `.env.example` without their real values, and checked by Zod in `src/config/env.ts`
- [ ] New routes were tried in Bruno after `logout` (answered with 401), then with a `viewer` account (403 if the route changes something)
- [ ] No new route in `OPEN_ROUTES` without a reason written in this pull request; routes that check passwords are guarded by the hourglass too (`config.rateLimit`)
- [ ] New logs don't record passwords, wristbands, season passes, cookies, emails, or request contents; an account is mentioned by its number only
- [ ] Passwords and refresh tokens are only stored as fingerprints, new personal data is only stored when it is really used, and new live data is only sent to the Socket.IO rooms that may receive it
- [ ] `CORS_ORIGIN` only holds the addresses of pages we really run, one by one, and never `*`
- [ ] **(Module 21)** Device keys are only stored as a SHA-256 fingerprint, shown once, and never in a log, in Git, or in the `GET /devices` answer; the backend's broker account is in `MQTT_USERNAME`/`MQTT_PASSWORD`, not inside `MQTT_URL`
- [ ] **(Module 21)** The broker access list `edge/acl-broker` still restricts every account as tightly as possible (a device only its own topics, the `%u` pattern + `use_username_as_clientid`); a new device or topic is added with the smallest possible rights, and the broker is restarted (not reloaded) after the ACL changes
- [ ] **(Module 21)** `edge/broker-passwd` doesn't go into Git, and no new behavior bypasses the second layer (messages from an unregistered/revoked device are still ignored, the backend doesn't create `devices` rows automatically)
- [ ] **(Module 22)** No secrets in `VITE_…` variables (they all go to the browser), and `frontend/.env.local` doesn't go into Git; only `frontend/.env.example` without secret values may
- [ ] **(Module 22)** The dashboard doesn't keep passwords or tokens in `localStorage` (login only through the backend's `HttpOnly` cookie, `fetch` with `credentials: "include"`), and API data is shown as JSX text, without `dangerouslySetInnerHTML`
- [ ] **(Module 23)** No polling: new data only comes through Socket.IO, and `git grep -n setInterval frontend/src` only finds the clock in `frontend/src/time.ts`
- [ ] **(Module 23)** Every `socket.on(…)` has a `socket.off(…)` with the same function in its effect's cleanup, and the socket is still created once in `frontend/src/socket.ts` (not inside a component)
- [ ] **(Module 23)** Phone mode has been switched back to laptop mode (`HOST=127.0.0.1`, the IP address removed from `CORS_ORIGIN`, Vite without `--host`), and the `backend/.env` that holds the laptop's IP doesn't go into Git
- [ ] **(Module 23)** No experiment files in the **Files changed** tab: `frontend/public/try-live.html` (Quick Win) and the `frontend/src/loadtest/` folder (Practice 6)
- [ ] **(Module 24)** Control buttons and admin menus are only drawn when the admin role is certain (`useAdmin()`), AND the backend still refuses them: checked in Bruno with `login viewer` then `lamp on` (and every new route that changes something) → 403. Hiding a button is not protection
- [ ] **(Module 24)** **Log out** and an expired session clear the WHOLE store (`clearAll()`): after the admin logs out, a viewer account that logs in in the same tab sees no leftover data, toasts, or admin buttons
- [ ] **(Module 24)** Roles and tokens are still never stored in `localStorage`; the role is read from `GET /auth/me` / the login answer
- [ ] **(Module 24)** No experiment file `frontend/src/components/FirstButton.tsx` (Quick Win) in the **Files changed** tab; the user-test tester account has been deleted (`npm run users -- delete …`) and phone mode has been switched back
- [ ] `npm test` passes, new npm packages are installed with an exact version (`npm install name@version`) and recorded in `package-lock.json`, `npm audit` answers `found 0 vulnerabilities`, and `allowScripts` only grows for packages that really need an install script
- [ ] **(Module 24)** No install command without a version in the text, README, or notes, and no `--legacy-peer-deps`/`overrides` to "force" an install (example: `@hookform/resolvers@5.9.2`, not the latest version that fails with ERESOLVE)
- [ ] **(Module 25)** No Grafana admin password, `grafana_reader` password, bot token, or `chat_id` in the **Files changed** tab: the dashboard JSON (`grafana/dashboards/`) and the alert rule YAML (`grafana/alerting/`) hold no credentials, the Telegram contact point is never exported, and `grafana/grafana-user.sql` has no password (it is set with `\password`)
- [ ] **(Module 25)** The PostgreSQL data source in Grafana uses the read-only account `grafana_reader`, not `postgres`; panel queries name their columns one by one (no `SELECT *` from `devices`)
- [ ] **(Module 25)** Grafana is only open on `127.0.0.1:3000` (`-p 127.0.0.1:3000:3000`), the `admin` password was changed at the first login (**Submit**, not **Skip**), and external snapshots, public dashboards, and usage statistics reports (to stats.grafana.org) are off (the three `GF_…` settings of the `docker run` command)
- [ ] **(Module 25)** The new backend routes (`PUT /devices/:id/location`, `POST /reports/send`) are admin only: tried in Bruno with `login viewer` (403) and after `logout` (401); the backend log doesn't record coordinates
- [ ] **(Module 25)** The daily report CSV follows the Module 23 recipe (commas, decimal points, BOM) and holds no email or password; real home coordinates don't appear in shared screenshots or videos (use the example point or blur it)
- [ ] **(Module 25)** `leaflet@1.9.4`, `react-leaflet@5.0.0`, and `@types/leaflet@1.9.22` are installed with written versions (not `react-leaflet@next`/`react@rc`), the attribution "© OpenStreetMap contributors" stays visible on the **Map** screen, and the tile URL is only written in `frontend/src/map.ts`
