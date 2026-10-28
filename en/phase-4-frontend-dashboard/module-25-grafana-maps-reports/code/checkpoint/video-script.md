# Phone demo video script: 🎉 Phase 4 checkpoint (Module 25)

The Syllabus asks for Phase 4 evidence as a **phone demo video + a Grafana link**. This video is short (**60–90 seconds**), recorded from your
own phone's screen with the phone's built-in screen recorder, and shows that the dashboard you built is really used from a phone: live numbers,
control, the map, and Telegram messages. "A Grafana link" = a GitHub link to the dashboard JSON file in `grafana/dashboards/` plus one
screenshot of the Grafana dashboard (Grafana isn't opened to the internet before Module 27).

## Before recording (5 minutes)

1. Start everything as usual: the database, the broker, backend 1.2, the simulator or Node 1/Node 2, Grafana.
2. Turn on **phone mode** (Module 23, `frontend/README.md` "Opening it from a phone (home Wi-Fi)"): `HOST=0.0.0.0`, `CORS_ORIGIN` + `http://<laptop-IP>:5173`,
   `npm run dev:phone`. Open `http://<laptop-IP>:5173` on the phone and **log in before you start recording** (the Log in screen and the password aren't recorded).
3. Make sure the points on the **Map** are the example points (around Monas) or already blurred, not your home's point.
4. Turn on **Do Not Disturb** on the phone, so personal notifications (other chats, email) don't appear in the middle of the recording.
5. In Telegram, have the chat with the Module 19 bot ready, already holding the 🔴/✅ messages from Grafana (Practice 5) and the 📊 CSV report (Practice 9).

## Script (60–90 seconds)

| Seconds | What is shown | What you may say (optional) |
| :---: | :--- | :--- |
| 0–10 | The **Devices** screen on the phone: green/red cards, the **Live** badge | "This is my Mini Smart Home dashboard, opened from my phone on the home Wi-Fi." |
| 10–25 | Tap one device: the numbers and the 5-minute chart move by themselves | "The numbers are live from the sensors, without reloading." |
| 25–40 | The **Controls** section: turn the lamp on → "Waiting for device confirmation…" → on; turn it off again | "The device confirms the command first." |
| 40–55 | The **Map** menu: green/gray circles, tap one → popup with name, status, last seen | "A device map from the database, the color follows the status." |
| 55–75 | Switch to Telegram: Grafana's 🔴 alert message (and ✅ recovered), then the 📊 `report-….csv` file | "When a node goes silent, Grafana tells the technical team; every morning the CSV report arrives by itself." |
| 75–90 | Back to the dashboard, end the recording | "The dashboard for the residents, Grafana for the technical team." |

It doesn't have to be exact: what matters is that the four things (live, control, map, Telegram) are seen in one recording without cuts. If
you don't have Node 2/a battery or a real Telegram yet, record the parts you have and write that honestly in your learning notes.

## What must NOT be recorded

- **Any password**: the dashboard's Log in screen, Grafana's login screen, the keyboard while typing a password.
- **The Telegram bot token** and the content of `backend/.env` (also `TELEGRAM_BOT_TOKEN`, `JWT_SECRET`, the database and broker passwords).
- **The Telegram chat_id** and the bot/BotFather settings pages. The Grafana contact point form too: the **BOT API Token** field there
  shows the token as it is (not as password dots).
- **Your home's exact coordinates** (a point on the Map, a popup with latitude/longitude, other map apps): use the example point or blur it.
- Your home's **public IP address** (for example from a "what is my IP" site); the laptop's Wi-Fi IP address (`192.168.…`) is better not highlighted either.
- **Other personal data**: chat/email notifications, the Wi-Fi name, account emails, the faces or voices of family members who didn't agree to be recorded.

Before sharing, play the video once from start to end only to look for the things above.

## After recording (2 minutes)

Switch back to **laptop mode** (Module 23, `frontend/README.md` "Opening it from a phone (home Wi-Fi)") before going on to the pull request:

1. Tap **Log out** on the phone dashboard (while the phone can still reach the backend); if you used a temporary tester account, delete
   the account (`npm run users -- delete …`).
2. In `backend/.env`: `HOST=127.0.0.1` again, and remove `,http://<laptop-IP>:5173` from `CORS_ORIGIN`. Save (the backend's `npm run dev`
   restarts by itself).
3. Stop Vite (`Ctrl + C`), then run the usual `npm run dev` (not `npm run dev:phone`).
4. Turn **Do Not Disturb** off if you turned it on just for the recording.

## Keeping the evidence

- Upload the video as an **unlisted video** (only people with the link can watch it), or keep it in your private storage. Don't
  put the video file in the project's Git; the link in the learning notes `learn-iot/module-25/` is enough.
- "A Grafana link": a GitHub link to `grafana/dashboards/system-health.json` on the `main` branch after the Module 25 pull request, plus
  one screenshot of the System Health dashboard without personal data. Grafana's external snapshot and public dashboard are NOT used
  (both are turned off in the `docker run` command): an external snapshot sends your home's data to the internet, and a public dashboard opens it without a login.

## Phase 4 checkpoint evidence sheet

Tick only what **has already happened**. The checkpoint may be closed later (for example a test by another person only fits next week).

- [ ] Quizzes of Modules 22–25: at least 4 correct answers in each quiz (Syllabus §8, Phase 4)
- [ ] The dashboard used by someone else from a phone without help (the result of Module 24 Practice 10: L1–L3)
- [ ] The 60–90-second phone demo video (link: …)
- [ ] The GitHub link to the Grafana dashboard JSON + its screenshot (link: …)
- [ ] The "when to use which" note: the React dashboard for residents, Grafana for the technical team, Node-RED for quick experiments
