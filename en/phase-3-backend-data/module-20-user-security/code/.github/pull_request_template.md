## What changed?

<!-- One or two sentences: which feature was added or fixed, and why. -->

## Checklist before merging

- [ ] `npm run check` passes, without type errors
- [ ] The server starts with `npm run dev`, without errors in the terminal
- [ ] The new route was tried in Bruno, its test passes, and its request is saved in `backend/bruno/`
- [ ] The new route shows up in `/docs`, with its descriptions
- [ ] No `.env` file or password in the **Files changed** tab
- [ ] `DATA-CONTRACT.md` is updated too if the shape of an MQTT message changed

## Security checklist

<!-- Since Module 20. Only tick what you have really checked. -->

- [ ] No `.env`, `bruno/.env`, `tools/.env`, `login*.json`, `cookies*.txt`, passwords, or tokens in the **Files changed** tab; passwords in Bruno requests are written as `{{process.env.…}}`
- [ ] New secret settings (if any) are added to `.env.example` without their real values, and checked by Zod in `src/config/env.ts`
- [ ] New routes were tried in Bruno after `logout` (answered with 401), then with a `viewer` account (403 if the route changes something)
- [ ] No new route in `OPEN_ROUTES` without a reason written in this pull request; routes that check passwords are guarded by the hourglass too (`config.rateLimit`)
- [ ] New logs don't record passwords, wristbands, season passes, cookies, emails, or request contents; an account is mentioned by its number only
- [ ] Passwords and refresh tokens are only stored as fingerprints, new personal data is only stored when it is really used, and new live data is only sent to the Socket.IO rooms that may receive it
- [ ] `CORS_ORIGIN` only holds the addresses of pages we really run, one by one, and never `*`
- [ ] `npm test` passes, new npm packages are installed with an exact version (`npm install name@version`) and recorded in `package-lock.json`, `npm audit` answers `found 0 vulnerabilities`, and `allowScripts` only grows for packages that really need an install script
