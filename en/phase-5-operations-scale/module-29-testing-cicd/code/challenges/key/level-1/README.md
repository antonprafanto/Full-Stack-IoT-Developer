# Module 29 Challenge 1 key: the Pi asks every 5 minutes

**Task (change a little):** 15 minutes feels long while you're practicing deploying releases. Make the Pi ask "a new release?"
every 5 minutes, **without** changing `scripts/systemd/smarthome-update.timer` in the repo (that file stays at 15 minutes), then
prove the interval from the journal.

> [!NOTE]
> **Not run by the author on real systemd.** The author didn't start systemd on a Pi for Module 29 (the systemd of the author's
> machine may not be changed); the file below follows the `systemd.timer` and `systemd.unit` documents (the drop-in part), was
> checked with `systemd-analyze verify` (systemd 259, without starting systemd) in the Indonesian edition's lab, and only
> structurally in this edition's lab (the same section, keys, and values). Run the steps on your own Pi and compare with "The right result".

| Key file | Goes on the Pi as |
| :--- | :--- |
| [`smarthome-update.timer.d/every-5-minutes.conf`](smarthome-update.timer.d/every-5-minutes.conf) | `/etc/systemd/system/smarthome-update.timer.d/every-5-minutes.conf` |

## The answer

A drop-in file: a folder `<unit name>.d/` next to the unit file, holding `.conf` files that **override part** of the unit's content.
The original file isn't touched, so the copy from the repo stays the same as every other reader's, and this challenge is easy to undo.

```ini
[Timer]
OnUnitActiveSec=
OnBootSec=5min
OnUnitActiveSec=5min
```

The empty `OnUnitActiveSec=` line is the heart of it. A schedule setting such as `OnUnitActiveSec=` may be written several times, and
**all** its values apply together. An empty value first empties **all** the schedules of that timer, not only
`OnUnitActiveSec=`: `OnBootSec=5min` from the original file is deleted too. That's why `OnBootSec=5min` is written again. Without that
line everything looks right until the Pi restarts: `OnUnitActiveSec=` counts from the previous round, but right after
starting there hasn't been any round yet, so nothing wakes the timer and the Pi quietly stops deploying releases (according to
the `systemd.timer` document). `systemd-analyze verify` does NOT catch this mistake (the timer still has one schedule), but it
shows the rule (the Indonesian edition's lab): a drop-in with only `OnUnitActiveSec=` makes it write `Timer unit lacks value setting`,
meaning `OnBootSec=5min` from the original file was deleted too.

Without the empty line, the Pi has two schedules: the old 15 minutes AND the new 5 minutes. The result happens to stay ±5 minutes, but
try changing `5min` to `30min` without the empty line: the old 15-minute schedule quietly keeps running, and the Pi still
asks every ±15 minutes.

Install (on the Pi):

```bash
sudo mkdir -p /etc/systemd/system/smarthome-update.timer.d
sudo nano /etc/systemd/system/smarthome-update.timer.d/every-5-minutes.conf
```

Paste the content of the key file, save (**Ctrl + O**, **Enter**, **Ctrl + X**), then check the timer (no output = no
typo; `systemd-analyze verify` reads the drop-in files in the `.timer.d` folder too) and restart it:

```bash
systemd-analyze verify /etc/systemd/system/smarthome-update.timer
sudo systemctl daemon-reload
sudo systemctl restart smarthome-update.timer
```

(Another way without copying a file: `sudo systemctl edit smarthome-update.timer` opens an editor for the drop-in file
`override.conf` in the same folder; write the four `[Timer]` lines above where it shows you, save, and systemd reads them
again at once.)

## The right result

- `systemctl cat smarthome-update.timer` shows TWO files: the original unit (`OnUnitActiveSec=15min`) and, below it,
  `# /etc/systemd/system/smarthome-update.timer.d/every-5-minutes.conf` with two `OnUnitActiveSec` lines and one
  `OnBootSec`.
- `systemctl show smarthome-update.timer -p TimersMonotonic` holds `OnBootUSec=5min` **and** `OnUnitActiveUSec=5min`
  (no `15min`). If `OnBootUSec` is missing, the Pi stops deploying releases after a restart.
- `systemctl list-timers smarthome-update.timer`: the next round at most ±7 minutes away (5 minutes + a random 0–60 seconds
  + the systemd alarm clock's accuracy, by default up to 1 minute).
- `journalctl -u smarthome-update.service --since "30 min ago"`: the lines `already deployed` (or `deployed`) are ±5–7
  minutes apart, not ±15–17 minutes.

To undo: `sudo rm -r /etc/systemd/system/smarthome-update.timer.d`, then `sudo systemctl daemon-reload` and
`sudo systemctl restart smarthome-update.timer`.

Don't shorten it down to seconds: every round contacts GitHub, and a round that deploys a release uses the Pi's CPU,
network, and microSD card. 5 minutes is more than enough for practicing.
