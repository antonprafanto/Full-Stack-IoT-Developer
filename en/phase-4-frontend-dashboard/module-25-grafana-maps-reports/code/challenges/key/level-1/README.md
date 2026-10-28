# Module 25 Level 1 answer key: the "weak signal" alert

**Task:** a second alert rule in Grafana that tells the technical team when a node's Wi-Fi signal is weak: **the average RSSI of the
last 15 minutes below −75 dBm**. The more negative the RSSI, the weaker the signal. The −75 dBm limit is only a *common convention* (roughly:
above −67 dBm is good, below −80 dBm drops easily), not an official standard: adjust it to your home.

The key file: [`weak-signal.yaml`](weak-signal.yaml), an export of the **node-health** group from the author's lab Grafana 13.2.4 after this
rule was made **on the screen** (Alert rules → the `node-health` group row → **More** → **Export rules group** → **YAML** → **Download**). Grafana
13.2.4 only exports one whole group, so that file holds two rules: **Silent node** (the same as `grafana/alerting/silent-node.yaml`)
then **Weak Wi-Fi signal** (this challenge's key). The file is for comparing with your rule, not for pasting: the `datasourceUid` in
it belongs to the author's Grafana.

## What goes into the rule

Make it with **Alerting → Alert rules → New alert rule**, the same way as the **Silent node** rule in Practice 4 (the default mode, the
**Advanced options** switch stays off). Only the content differs:

| Screen part | What goes in |
| :--- | :--- |
| **1.** Name | `Weak Wi-Fi signal` |
| **2.** query | the PostgreSQL data source (`grafana_reader`) is already chosen; change **Builder** to **Code**, paste the query below; **Format** stays `Table` (the alert form's default) |
| Alert condition | `WHEN` **Last** `OF QUERY` **IS BELOW** `-75` (choose **Is below** in the menu that first says **IS ABOVE**). Grafana stores it as A (the query) → B *Reduce* "Last" → C *Threshold*, the same as Silent node |
| **3.** Folder | **Mini Smart Home** |
| **4.** evaluation | **Select an evaluation group…** → `node-health` (every `1m`, the Silent node group); **Pending period** click **None** (the form's default `1m`): a 15-minute average already smooths the signal's ups and downs |
| Configure no data and error handling | *Alert state if no data or all values are null* **Normal** (default `No Data`); *execution error or timeout* stays **Error** |
| **5.** notifications | **Contact point** `Telegram Smart Home` → **Muting, grouping and timings (optional)** → **Override grouping** → in **Group by** type `device_id`, then Enter (`grafana_folder` and `alertname` always come along), the same as Silent node. The *Notification policies* page isn't touched: without a contact point in this rule, its alert never reaches Telegram |
| **6.** Summary | `{{ $labels.node }} ({{ $labels.device_id }}): weak Wi-Fi signal, average {{ with $values.A }}{{ .Value }}{{ end }} dBm over the last 15 minutes` |

Then **Save**.

```sql
SELECT h.device_id,
       coalesce(d.name, h.device_id) AS node,
       round(avg(h.rssi))::float8 AS avg_rssi
FROM device_health h
JOIN devices d ON d.device_id = h.device_id
WHERE h.ts > now() - INTERVAL '15 minutes'
  AND d.registered_at IS NOT NULL AND d.revoked_at IS NULL
GROUP BY h.device_id, d.name
```

One row = one node, so one rule guards all nodes at once (pattern **B** of Concept 7): the text columns `device_id` and `node` become
the alert labels, the number column `avg_rssi` becomes its value. Vitals come every 5 minutes, so 15 minutes = about 3 vitals per node.

## Trying it without breaking the Wi-Fi

The simulator's RSSI is random between −40 and −79 dBm (its 15-minute average is usually about −55 to −70), so with the −75 limit this rule
stays calm. To see it fire, **temporarily** open the rule → **Edit**, change the number in **Alert condition** to `-50`, **Save**, wait for the
next evaluation (≤ 1 minute) plus 30 seconds (group wait), then put it back to `-75` the same way.

**Expected output (the author's lab, 27 Oct 2026 ±19:05–19:13 WIB, Grafana 13.2.4 + a simulator with 1 device; Telegram = the mock Bot API
server, the messages below = the text it received):**

```text
19:05:51  Save (new rule, limit -75)   Normal (preview: Practice living room -70)
19:06:56  Save (limit -50)
19:07:50  🔴 Practice living room (f00d00000001): weak Wi-Fi signal, average -62 dBm over the last 15 minutes
19:08:27  Save (limit -75 again)
19:12:50  ✅ Practice living room is sending data again.
```

The ✅ message uses the "recovered" line of the Practice 4 contact point template, which was written for Silent node ("is sending data
again"); for this rule it means "the signal is back above the limit". The sentence follows that template, not this rule's Summary.

## Things to remember

- **Node 2 has no vitals**, so it never shows up in this rule. A node that stops sending vitals also disappears from the query result;
  if that node is 🔴 weak signal at that moment, the missing row makes this rule send ✅ "is sending data again." although the node is
  actually silent (the 4.1 template is shared). Silence is the job of the **Silent node** rule, not this one.
- RSSI is the **technical team's** business (Grafana), not the residents': that's why this alert isn't made in the backend or the React dashboard.
- Don't lower the limit to a number that is normal in your home: an alert that fires all the time gets ignored.
- If the `node-health` group is exported again after this challenge (for example when Practice 9 is repeated), the file
  `grafana/alerting/silent-node.yaml` will hold this rule too.
