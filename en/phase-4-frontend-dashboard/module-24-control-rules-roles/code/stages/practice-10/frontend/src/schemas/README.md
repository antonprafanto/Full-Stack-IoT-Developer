# `src/schemas/` — schema copies from the backend

`contract.ts` and `rule-basics.ts` in this folder are **COPIES** of `backend/src/schemas/` (Module 24). With these copies, the form in the browser checks the input with exactly the same rules as the backend, and the `ack` answer is checked with the same schema the server uses.

- **Don't change the copies here.** Change the backend first, copy both files to this folder again, then run `npm run check-schema` from the `frontend` folder. The right result: two `SAME` lines. CRLF (Windows) and LF line endings count as the same.
- **Why copied, not imported from `../backend`?** `backend/src/schemas/rules.ts` uses node-cron, which can't run in a browser (the page turns white). The frontend must also build on its own, without the `backend` folder and its `node_modules`. The backend still checks every input again, including the cron expression that can't be checked in the browser.
- Both copies import with the `.ts` ending (`./contract.ts`), the same style as the backend. The frontend allows it through `allowImportingTsExtensions` in `tsconfig.app.json`; the other frontend files still import without the ending.
- `contract.ts` calls `z.config(z.locales.en())`, so every built-in Zod error message in the dashboard is in English.
- `login.ts` is **not** a copy: the Log in form's schema is written by hand, mirroring the `LoginBody` schema in `backend/src/routes/auth.ts`.
