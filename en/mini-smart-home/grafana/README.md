# Mini Smart Home Grafana

🌐 **English** · [Bahasa Indonesia](../../../proyek-rumah-pintar-mini/grafana/README.md)

Grafana is the Mini Smart Home dashboard for the **technical team** ([Module 25](../../phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md)): device health panels (RSSI, uptime, heap of Node 1; packets per hour of Node 2) and the "silent node" alert to Telegram, read straight from the TimescaleDB database (Modules 17–18). The dashboard for the residents is still `frontend/` (Modules 22–24). Grafana runs on the laptop as a Docker container, next to the database container `smarthome-db`.

This folder holds the Grafana **recipe**, not Grafana itself: all of its content may go into Git because there are **no secrets** in it. The Grafana admin password, the password of the database account `grafana_reader`, and the Telegram bot token are never written here.

| File | What it holds |
| :--- | :--- |
| [`grafana-user.sql`](grafana-user.sql) | the database account `grafana_reader` that can only read (without a password; the password is typed with `\password`) |
| [`dashboards/system-health.json`](dashboards/system-health.json) | the "System Health" dashboard, exported from Grafana as **Classic** JSON (Module 25 Practice 9) |
| [`alerting/silent-node.yaml`](alerting/silent-node.yaml) | the "silent node" alert rule, exported from Grafana (without the contact point: the bot token is never exported) |

## How to run it

The commands below are run from the project folder `mini-smart-home` and use no feature of one particular shell (no `<`, `>`, or `$(…)`), so they are typed as they are in PowerShell (Windows), the macOS Terminal, or Linux. The database container `smarthome-db` (Module 17) must already be running.

1. **The hallway between containers** (network): Grafana inside its container can't use `localhost:5432` (that is the Grafana container itself), so both containers meet on one custom network named `smarthome`. Once is enough:

   ```text
   docker network create smarthome
   ```

   ```text
   docker network connect smarthome smarthome-db
   ```

2. **Grafana** (one line; download it first with `docker pull grafana/grafana:13.2.4`, about 445 MB for arm64):

   ```text
   docker run -d --name smarthome-grafana --network smarthome -p 127.0.0.1:3000:3000 -e GF_PLUGINS_PREINSTALL_DISABLED=true -e GF_ANALYTICS_REPORTING_ENABLED=false -e GF_SNAPSHOTS_EXTERNAL_ENABLED=false -e GF_PUBLIC_DASHBOARDS_ENABLED=false -v smarthome-grafana-data:/var/lib/grafana --restart unless-stopped grafana/grafana:13.2.4
   ```

   `127.0.0.1:3000` = can only be opened from this laptop. `GF_PLUGINS_PREINSTALL_DISABLED=true` prevents a plugin download of about 290 MB when Grafana starts for the first time; the next three `false` settings turn off what is sent out (usage statistics to stats.grafana.org, snapshots to Grafana's server, and public dashboards). What STILL contacts the internet: the check for new versions of Grafana and its plugins at grafana.com, the news feed, and avatar pictures (Gravatar); none of them carry dashboard content or your home's data. If you want the version check off too, add `-e GF_ANALYTICS_CHECK_FOR_UPDATES=false -e GF_ANALYTICS_CHECK_FOR_PLUGIN_UPDATES=false` before `-v`. Everything in Grafana (dashboards, alerts, accounts) is stored in the volume `smarthome-grafana-data`, so it stays even when the container is made again. Write the version exactly (`13.2.4`): the `grafana/grafana-oss` image is no longer updated, and without a tag you get another version whose menus can differ.
3. Open `http://localhost:3000`, log in with `admin` / `admin`, then on the **Update your password** screen type a new password and click **Submit** (not **Skip**: the `admin` password stays valid if you skip it).
4. **The read-only database account** (once). Copy the SQL file into the database container, run it, then type the `grafana_reader` password twice (it doesn't show on the screen and doesn't go into the terminal history):

   ```text
   docker cp grafana/grafana-user.sql smarthome-db:/tmp/grafana-user.sql
   ```

   ```text
   docker exec smarthome-db psql -U postgres -d smarthome -f /tmp/grafana-user.sql
   ```

   ```text
   docker exec -it smarthome-db psql -U postgres -d smarthome -c "\password grafana_reader"
   ```

   If the second command is repeated (for example the file is run twice), its first line answers `ERROR:  role "grafana_reader" already exists`: that's normal, the other lines still apply.

5. **The data source** in Grafana: **Connections → Data sources → Add data source → PostgreSQL**, Host URL `smarthome-db:5432` (the container name, through the `smarthome` hallway), Database name `smarthome`, Username `grafana_reader` and its password, TLS/SSL Mode `disable`, **TimescaleDB** switched on, **Max open** (in **Connection limits**) set to `4`, then **Save & test** until **Database Connection OK** appears. That 4 matters: the `grafana_reader` account may have at most 5 connections, while Grafana without this number may open up to 100; with 4, Grafana queues by itself and one connection is still left for psql. If that number has just been changed on a data source a dashboard is using, the first **Save & test** can answer `too many connections for role "grafana_reader"` (the old connections aren't released yet): wait a few seconds, then click **Save & test** again.
6. The dashboard and the alert rule are made on Grafana's screens (Module 25 Practices 2–4), then exported to the `dashboards/` and `alerting/` folders here. To restore them in another Grafana, import the dashboard JSON (**Dashboards → New → Import dashboard**) and choose your PostgreSQL data source when asked; in the same Grafana, click **Change uid** first so the old dashboard isn't overwritten. The Telegram contact point (the Module 19 bot token + chat_id) and the alert rule are **made again** on the screens: the YAML file in `alerting/` is an archive, because Grafana 13.2.4's **Import alert rules** menu only takes Prometheus-format rules. Installing that YAML as a provisioning file is covered in Module 26 (Grafana refuses to start if a contact point with the same name doesn't exist yet: `receiver Telegram Smart Home does not exist`).

## Security

- Grafana only on `127.0.0.1:3000`, with the `admin` password changed at the first login.
- Grafana reads the database with `grafana_reader`, **not** `postgres`: only `SELECT` on `readings`, `readings_hourly`, `device_health`, `events`, `commands`, and certain `devices` columns (without `key_hash`). It can't read `users` and `sessions` (password fingerprints, session tokens); `INSERT`, `DROP`, and the like are refused (`cannot execute … in a read-only transaction`); a query longer than 10 seconds is stopped. Because its rights are per column, `SELECT * FROM devices` is refused (`permission denied for table devices`): always write the column names.
- The bot token is only in `backend/.env` and in the Grafana contact point (stored in the Grafana volume; its encryption uses a default key that is the same in every installation as long as `GF_SECURITY_SECRET_KEY` isn't set, so guard that volume like you guard the token), never in JSON, YAML, Git, or screenshots. Before a commit, search the exported files for the word `token` and your chat_id: the result must be empty.

## Limits

- Grafana only runs while the laptop is on (the same as the backend). A server that is always on follows in Modules 26–27.
- The "silent node" alert reads the time of the last reading in the database. If the **backend** is down, no new readings are stored, so **all** nodes look silent at once. If the **database** is down, the rule becomes *Error* (`DatasourceError`) and messages arrive without a node name; in the author's lab (DB down ±80 seconds, group 1 minute) a node that was 🔴 stayed 🔴, but a false "recovered" message was once seen when the rule was evaluated every 10 seconds.
- The `grafana_reader` account may have at most 5 connections at once. With **Max open** `4` in the data source (step 5), one Grafana never goes over it, even when the dashboard is open in two tabs or on a laptop and a phone at the same time. Without it (default 100), two tabs loading the dashboard at the same time can already turn some panels red or empty with the error `too many connections for role "grafana_reader"`; two Grafanas using the same account can too.
- If Grafana can't read the database, alert messages arrive without a node name (`🔴 [no value] ([no value]) is not sending data, …`, then `✅  is sending data again.`): that is a sign of a database or Grafana problem, not of a silent node.
- Alert messages come without a panel picture (Grafana's image renderer isn't installed).
