# Module 27 Challenge 2 key: the admin door through an SSH tunnel

**Task (fill in the blanks):** on the VPS, the backend (8080), database (5432), and Grafana (3000) counters are deliberately `127.0.0.1`
only: they can't be knocked on from the internet. You still want to use Swagger (`/docs`), DBeaver, and Grafana from your laptop. Fill in
the `____` parts so that all three go through an **SSH tunnel**: SSH opens a counter on your laptop and forwards every knock, encrypted,
to the `127.0.0.1` counter on the VPS. No new door on the VPS, and ufw doesn't need changing.

> [!NOTE]
> The commands in this key are a standard OpenSSH feature (`ssh -L`). The author hasn't run them against a real VPS yet; a test with a
> stand-in SSH server on the author's machine follows in the module's final recording. `house` = the regular user on the VPS (Practice 5), `<VPS-IP>` = your VPS's address.

## The questions and their answers

| Question | Answer |
| :--- | :--- |
| Swagger: `ssh -L ____:127.0.0.1:____ house@<VPS-IP>`, then open `http://localhost:____/docs` | `ssh -L 8080:127.0.0.1:8080 house@<VPS-IP>`, then `http://localhost:8080/docs` |
| DBeaver: `ssh -L ____:127.0.0.1:5432 house@<VPS-IP>`, then DBeaver to **Host** `localhost`, **Port** `____` | `ssh -L 15432:127.0.0.1:5432 house@<VPS-IP>`, then **Host** `localhost`, **Port** `15432` |
| All three at once in ONE command | `ssh -L 8080:127.0.0.1:8080 -L 15432:127.0.0.1:5432 -L 3000:127.0.0.1:3000 house@<VPS-IP>` |
| Only the tunnel, without opening a VPS terminal | add `-N`: `ssh -N -L 8080:127.0.0.1:8080 house@<VPS-IP>` (stop it with **Ctrl + C**) |

How to read `-L 15432:127.0.0.1:5432`: **the counter on the laptop** `15432` → (the SSH tunnel) → from the VPS side, knock on
`127.0.0.1:5432`. You may choose the left number yourself (as long as it isn't used on the laptop yet); the right number is the counter
on the VPS (`ports:` in `compose.cloud.yml`). The `127.0.0.1` in the middle is read FROM the VPS, so it means "the VPS itself", not your laptop.

## Why the numbers are like that

- **Swagger must have `8080` on the left, and be opened through `localhost`.** The backend's guard only accepts a login from a listed
  page: the `CORS_ORIGIN` list (on the VPS only `https://iot.yourname.my.id`) plus the backend's own page, `http://localhost:8080`. With
  `-L 18080:…`, the Swagger page becomes `http://localhost:18080` and the **Execute** button for `POST /auth/login` is answered `403
  request from the page http://localhost:18080 refused`. `http://127.0.0.1:8080/docs` is refused too (the same as in Module 26). So
  stop the laptop backend that uses 8080 first (it must be off anyway: one backend per bot token, Practice 7).
- **The database uses `15432`, not `5432`,** so that it doesn't clash with the laptop's database that may still be running on `5432`.
  DBeaver has no page-origin check, so the left number is free. Log in with the read-only account `grafana_reader` to look around; the
  `postgres` account only when you really need to change something.
- **Grafana (`3000`)** only needs a tunnel if you DON'T open it at `https://iot…/grafana/` (Practice 7; `GRAFANA_URL` empty in the
  VPS `.env`): then `http://localhost:3000`. If Grafana is already at `/grafana/`, just use its HTTPS address; a tunnel to a Grafana
  served under a subpath hasn't been tried by the author.

## Safe?

A tunnel can only be made by someone who can log in to the VPS over SSH (the Practice 5 ed25519 key, no password). SSH opens the
laptop's counter on `127.0.0.1` only (OpenSSH's default), so other people on a cafe Wi-Fi don't get in through your laptop. Close the
tunnel when you're done (**Ctrl + C** or `exit`).
