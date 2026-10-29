# The bridge folder (Module 26)

The gateway broker on the Raspberry Pi reads **every `.conf` file** in this folder (`include_dir` in [`../gateway.conf`](../gateway.conf)).
It holds one file, `center.conf`, a copy of [`../bridge.example.conf`](../bridge.example.conf) with the password of the `pi-bridge` account:

```bash
cp bridge.example.conf bridge/center.conf
```

(typed from the `edge` folder, then replace `replace-with-the-pi-bridge-account-password` with its password). The `.conf` files in this folder
**aren't in Git** (the project root `.gitignore`) because they hold a password. This `README.md` file is in Git on purpose so that the folder
already exists after `git clone`: if this folder doesn't exist yet at `docker compose up`, Docker on Linux creates it by itself as
owned by `root`, and you can't copy `center.conf` into it without `sudo`.
