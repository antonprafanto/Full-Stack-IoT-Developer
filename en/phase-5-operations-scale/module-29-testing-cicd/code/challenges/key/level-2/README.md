# Module 29 Challenge 2 key: the version guard, the "the version must go up" part

**Task (fill in the blanks):** the skeleton [`check-version-blanks.mjs`](check-version-blanks.mjs) already checks "one version number
in every place", but its second part is still empty: compared with `main`, if what gets **deployed** to the VPS/Pi changed, the
version must go up, and the version may never go down. Fill in TODO 1–3, then prove it with the tries below.

> [!NOTE]
> **Run by the author** on 6 November 2026 for this edition (Node.js 24.21.0, Git on a Raspberry Pi 5, a throw-away practice repo
> holding the project history of Module 28 + Module 29; the Indonesian edition on 4 November 2026, with the same result): the answer
> below gives the right result for 20 tries, while the skeleton without the TODOs filled in lets 7 of them through (every "forgot to raise the version" and the plain revert). The output below is cut to the meaningful lines.

| File | Content |
| :--- | :--- |
| [`check-version-blanks.mjs`](check-version-blanks.mjs) | the skeleton (the puzzle): put it in `scripts/check-version.mjs` on your practice branch |
| [`../../../scripts/check-version.mjs`](../../../scripts/check-version.mjs) | the whole answer = the project file the robot runs |
| [`changes.diff`](changes.diff) | skeleton → answer as a diff (only the function `isDeployed()` and the two checks of part 2) |

## The answer

**TODO 1, "what gets deployed".** Match it with what the VPS and the Pi really read: the image content (the `COPY` lines of both
`Dockerfile`s, minus `.dockerignore`), the Compose file, and the files a container reads straight from the repo (`volumes:`), plus
the scripts `deploy.sh` runs:

```js
function isDeployed(file) {
  if (file.endsWith(".md") || file.endsWith(".test.ts")) return false;
  if (file.startsWith("backend/")) {
    return /^backend\/(Dockerfile|\.dockerignore|package\.json|package-lock\.json)$/.test(file)
      || (/^backend\/(src|migrations)\//.test(file) && !file.startsWith("backend/src/integration/"));
  }
  if (file.startsWith("frontend/")) {
    return !/^frontend\/(\.oxlintrc\.json|check-schema\.js|\.env\.example|\.gitignore)$/.test(file);
  }
  return file === "compose.cloud.yml"
    || /^edge\/(compose\.edge\.yml|gateway\.conf|center\.conf|center-internet\.conf|acl-broker)$/.test(file)
    || /^grafana\/(provisioning|dashboards)\//.test(file) || file === "grafana/grafana-user.sql"
    || /^scripts\/[^/]+\.sh$/.test(file);
}
```

The backend uses a list of "what goes in" (the backend `Dockerfile` only copies `package*.json`, `migrations/`, and `src/`), the
frontend a list of "what stays out" (the frontend `Dockerfile` copies the whole folder). `src/integration/` is left out although it
isn't a `*.test.ts` file, because the backend `.dockerignore` holds it back. `scripts/*.sql` (tools for humans), `scripts/check-version.mjs`
(only run by the robot), and `.github/workflows/` aren't deployed to the VPS/Pi, so they may change without a release.

**TODO 2 and 3, the order matters.** Check "goes down" first, only then "forgot to go up"; the second is an `else if`, so a plain
revert gets only one message, the right one:

```js
  if (!goesUp && version !== baseVersion) {
    problems.push(`version ${version} is LOWER than ${baseVersion} on ${base}: the version may only go up. Bringing back old content `
      + `(revert)? The content may be old, the number still goes UP (for example ${nextPatch}), `
      + "with the entry \"Fixed: restores …\" in CHANGELOG.md.");
  } else if (deployed.length > 0 && !goesUp) {
    problems.push(`what gets deployed to the VPS/Pi changed (${examples}) but the version is still ${version} (= ${base}). …`);
  }
```

## Try it

From a practice branch (for example `try/version`), after `git fetch origin`. Uncommitted changes count too, so restore
them with `git restore .` after every try. PowerShell: `$env:BASE = "origin/main"; node scripts/check-version.mjs`.

| Try | The command after the change: `BASE=origin/main node scripts/check-version.mjs` | Exit code |
| :--- | :--- | :---: |
| change only `README.md` | `PASS  … compared with origin/main: no deployed file changed, the version stays 2.0.0 (allowed)` | 0 |
| change one line of `frontend/src/csv.ts`, the version unchanged | `FAIL  what gets deployed to the VPS/Pi changed (frontend/src/csv.ts) but the version is still 2.0.0 (= origin/main). …` | 1 |
| change `edge/acl-broker`, the version unchanged | `FAIL  what gets deployed to the VPS/Pi changed (edge/acl-broker) …` | 1 |
| change only `frontend/src/csv.test.ts` | `PASS` (tests aren't in the image) | 0 |
| the `csv.ts` change + a complete version 2.0.1 + a `CHANGELOG.md` entry | `PASS  one version number 2.0.1 in 10 places … compared with origin/main (2.0.0): the version went up, … deployed files changed` | 0 |
| `main` already at 2.0.1, the branch back at 2.0.0 (a plain revert) | `FAIL  version 2.0.0 is LOWER than 2.0.1 on origin/main: the version may only go up. … (for example 2.0.2) …` | 1 |
| revert + version 2.0.2 + a `CHANGELOG.md` entry | `PASS  one version number 2.0.2 …` | 0 |

Done practicing: `git switch main`, then `git branch -D try/version` (the skeleton is never merged).
