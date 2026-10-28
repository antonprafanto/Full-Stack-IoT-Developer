# Module 25 Quick Win: the first panel, your home's temperature in Grafana

Material for the 🏆 Module 25 Quick Win (±25 minutes): Grafana 13.2.4 starts next to the database, reads TimescaleDB with the
read-only account `grafana_reader`, then draws the temperature of every device. The full commands and their reasons are in the project's
`grafana/README.md`; this file is only their short order.

| File | What it holds |
| :--- | :--- |
| `temperature-query.sql` | the first panel's query (the average temperature per device, the macros `$__timeGroupAlias` and `$__timeFilter`) |
| `first-panel.json` | the "First panel" dashboard holding that panel, exported from Grafana 13.2.4 as **Classic** JSON with **Export for sharing externally** on. Only a shortcut if step 6 gets stuck |

## Steps

Before (in 🧰, outside the 25 minutes): `docker pull grafana/grafana:13.2.4` (about 445 MB for arm64). The database container
`smarthome-db` (Module 17) must already be running, and preferably the simulator or Node 1 is sending data.

1. **The hallway between containers** (once): `docker network create smarthome`, then `docker network connect smarthome smarthome-db`.
2. **Grafana**: the one-line `docker run` command from `grafana/README.md` step 2 (name `smarthome-grafana`, `-p 127.0.0.1:3000:3000`,
   four `GF_…` settings, volume `smarthome-grafana-data`, the exact tag `grafana/grafana:13.2.4`).
3. Open `http://localhost:3000`, log in with **Email or username** `admin` and **Password** `admin`, click **Log in**. On the **Update your
   password** screen fill in **New password** and **Confirm new password**, then click **Submit** (not **Skip**).
4. **The read-only account** `grafana_reader`: the three commands `docker cp …`, `docker exec … -f …`, `docker exec -it … "\password grafana_reader"` from
   `grafana/README.md` step 4.
5. **Data source**: left menu **Connections → Data sources → Add data source**, click **PostgreSQL**. Grafana makes a data source named
   `grafana-postgresql-datasource` right away and opens its form. Fill in **Host URL** `smarthome-db:5432`, **Database name** `smarthome`,
   **Username** `grafana_reader` and its **Password**, choose `disable` for **TLS/SSL Mode**. In **Additional settings**, switch on
   **TimescaleDB** (**Version** fills in `17` by itself). In **Connection limits**, set **Max open** to `4` (the `grafana_reader` account may only
   have 5 connections; the reason is in `grafana/README.md` step 5). Click **Save & test** until **Database Connection OK** appears.
6. **Panel**: **Dashboards → New → New dashboard**. In the **Add** pane on the right, click the **Panel** box (*Drag or click to add a panel*), then
   **Configure visualization**. Under the chart, change **Builder** to **Code**, paste the content of `temperature-query.sql`, change **Format** from
   `Table` to **`Time series`**, then click **Run query**: one line for every `device_id`. Try the range **Last 1 hour**, then
   **Last 24 hours** (the clock button at the top right). Save with **Save** (fill in **Title**, for example `First panel`, then **Save**).

**Shortcut if step 6 gets stuck:** **Dashboards → New → Import dashboard**. Paste the whole content of `first-panel.json` into the **Import
via dashboard JSON model** box, then click the **Load** that is UNDER that box (the first **Load** button is for a grafana.com address). On the
**Options** screen, in the `DS_GRAFANA-POSTGRESQL-DATASOURCE` box (*Select a grafana-postgresql-datasource data source*) choose the data source from
step 5, then click **Import**.

## Traps seen in the lab

- **Format `Table`** (the editor's default) draws ONE line named `temperature` that jumps between devices, because the `metric` column
  is only used to split lines in the **Time series** format.
- An empty panel (**No data**) although the data source is OK: the time range is too short for a device that has been silent for a long time, or the device
  hasn't sent anything yet. Node 2 (the Garden) only sends every 5 minutes, so it shows as separate dots, not a line.
- Don't use the `postgres` account in the data source: Grafana itself warns about it in its form (*Grafana does not validate that queries
  are safe*); the `grafana_reader` account can only `SELECT`.
