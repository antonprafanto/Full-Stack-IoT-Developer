# User test task sheet — Mini Smart Home dashboard v1.0 (Module 24)

This sheet is used in **Practice 10**. Print (or copy out) part **B** for the tester; parts **A** and **C** are for you, the
learner who prepares and watches. Write the results in `notes-sheet.md`.

## A. Preparation (done by the learner, before the tester arrives)

1. **A temporary tester account with the admin role.** In the `backend` folder, from PowerShell or the macOS Terminal (not Git
   Bash: the password is asked in the terminal):

   ```
   npm run users -- add tester@home.test "Tester" admin
   ```

   The password needs at least 15 characters. Write the email and password on a **paper card** for the tester; don't keep them in
   a file, a chat, or a photo. This account is deleted again at the end (part C).
2. **Starting state:** the lamp is **off**, and there is **no** watering rule yet (if one is left from Practice 8, delete it first
   on the **Rules** screen). For the simulator path: `tank random` and `soil random` in the simulator's terminal.
3. **Phone mode** (Module 23): `HOST=0.0.0.0` and the laptop's IP in `CORS_ORIGIN` in `backend/.env`, then `npm run dev:phone` in
   the `frontend` folder. First open `http://<laptop-IP>:8080/health` from the tester's phone: it must answer.
4. Have `notes-sheet.md` (or its paper copy) and a clock/timer ready, and ask permission if you want to record the screen or the
   voice (they may say no; recording isn't required).
5. The tester uses **their own phone** on the same home Wi-Fi. The only thing the tester opens is the address
   `http://<laptop-IP>:5173`; you don't hold their phone.

## B. For the tester (read it aloud or hand over this card)

> Thanks for trying this out. What is being tested is **the dashboard**, not you: if you're confused, that's a sign the screen
> needs fixing. While you work, say out loud what you're thinking ("I'm looking for a button…", "what does this mean…").
> I won't help while a task is running; I may only read the task out again.

1. Open this address on your phone: `http://______________:5173` (filled in by the learner), then **log in** with the email and password on the card.
2. **Turn on the lamp** in this house.
3. **Make the plants get watered automatically when the soil is drier than 30 %.**
4. **Log out** of the dashboard.

## C. Rules during the test and afterwards (learner)

- **No help.** While a task is running you may only read its sentence out again. No pointing at the screen, no hints, no
  answering "press that one".
- **Stuck for more than 2 minutes** (or the tester gives up/asks directly) = that task is **"helped"**: you may help so the test
  can go on, but that task **hasn't passed**. Fix what was confusing (a label, a position, a message), then repeat that task — with
  the same tester after a break, or another tester.
- Write down for every task: success / helped / failed, the time (minutes:seconds), and interesting things the tester said
  **without their full name**.
- **Evidence from the backend log** (the `npm run dev` terminal in the `backend` folder), copy the lines to the notes sheet:
  - task 1: `login: account N (admin), session N, IP 192.168.…` (the IP = the tester's phone IP, not `127.0.0.1`);
  - task 2: `command c-… (api) to <device_id>: lamp = true, ack ok=true in N ms`;
  - task 3: `Rule N (…) created through the API: …` (then, to prove the rule works: the simulator's `soil 25`, or Kit A's
    soil that really is dry → the event `🌱 Soil … — pump watering for 5 seconds automatically`);
  - task 4: `logout: session N`.
- **The L4 requirement is done by the learner:** on the same phone, log in with the **viewer** account, open a device's details
  screen and the **Rules** screen: there must be no control buttons, no **+ New rule**, and no **Edit**.
- **After the test:** delete the tester account (`npm run users -- delete tester@home.test`), tear up or keep the password card,
  switch back to **laptop mode** (`HOST` and `CORS_ORIGIN`, then `npm run dev`), and make sure the tester's phone can't open the dashboard anymore.
