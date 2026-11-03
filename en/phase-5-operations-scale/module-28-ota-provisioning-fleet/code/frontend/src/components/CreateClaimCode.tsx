// CreateClaimCode.tsx - "New devices" on the Fleet screen (Module 28, admin only): creates a single-use claim code
// (POST /provision/code). The code is typed in the new device's Wi-Fi portal; the device exchanges it by itself for its device
// key, the backend creates its broker account, and then it shows up on the Fleet screen. The code is shown only ONCE: the
// database only stores its fingerprint, and this screen keeps it in the component's memory only (gone when closed or when you leave).
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { getClaimCodes, createClaimCode, ApiError } from "../api";
import { reportError } from "../fleet";
import { toast } from "../toast";
import { handleSessionExpired, useLiveStore } from "../store";
import type { ClaimCode, NewClaimCode } from "../types";
import { wibTime, wibDateTime } from "../time";

const BOX =
  "mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";
const LABEL = "mt-3 block text-sm font-medium text-slate-700 dark:text-slate-200";
const SHAPE = "rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

const STATE_BADGES: Record<ClaimCode["state"], string> = {
  valid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  used: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100",
  expired: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
};

export default function CreateClaimCode() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [minutes, setMinutes] = useState("30");
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState<NewClaimCode | null>(null); // the code just created: shown once
  const [copied, setCopied] = useState(false);
  const [list, setList] = useState<ClaimCode[] | null>(null);
  const [listNumber, setListNumber] = useState(0); // goes up after a code is created: the list is fetched again
  const codeField = useRef<HTMLInputElement>(null);
  // a code a device used causes a "provisioning" event, which raises fleetVersion: the list is fetched again too
  const fleetVersion = useLiveStore((s) => s.fleetVersion);

  useEffect(() => {
    let ignore = false;
    getClaimCodes()
      .then((l) => {
        if (!ignore) setList(l);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof ApiError && err.code === 401) handleSessionExpired();
        // failing to read the list doesn't stop creating a code: only the list isn't shown
      });
    return () => {
      ignore = true;
    };
  }, [listNumber, fleetVersion]);

  async function create(e: FormEvent) {
    e.preventDefault();
    const m = Number(minutes);
    if (!Number.isInteger(m) || m < 5 || m > 60) {
      toast("The code's validity is 5 to 60 minutes.", "error");
      return;
    }
    setBusy(true);
    setCode(null);
    setCopied(false);
    try {
      // a field left empty isn't sent at all (the backend refuses empty text)
      const created = await createClaimCode({
        minutes: m,
        ...(name.trim() === "" ? {} : { name: name.trim() }),
        ...(location.trim() === "" ? {} : { location: location.trim() }),
      });
      setCode(created);
      setName("");
      setLocation("");
      setListNumber((n) => n + 1);
    } catch (err) {
      reportError(err, "The claim code couldn't be created.");
    } finally {
      setBusy(false);
    }
  }

  async function copyCode() {
    if (code === null) return;
    try {
      // navigator.clipboard only exists at a secure address (https:// or localhost). At http://<IP> it doesn't: the code
      // is only selected (highlighted), then copied by hand with Ctrl + C (or long-press then Copy on a phone).
      await navigator.clipboard.writeText(code.code);
      setCopied(true);
    } catch {
      codeField.current?.select();
      toast("Can't copy automatically at this address: the code is already selected, copy it with Ctrl + C.");
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <h4 className="font-semibold text-slate-800 dark:text-slate-100">Create claim code</h4>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        A single-use code to register a new device: type it in that device's Wi-Fi portal (the Claim code field), together with the
        server address and broker address. No key copied by hand, no mosquitto_passwd.
      </p>

      <form onSubmit={create} noValidate>
        <div className="grid gap-x-3 sm:grid-cols-2">
          <div>
            <label htmlFor="claim-name" className={LABEL}>
              Device name (optional)
            </label>
            <input id="claim-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Node 1 garage" className={BOX} />
          </div>
          <div>
            <label htmlFor="claim-location" className={LABEL}>
              Location (optional)
            </label>
            <input id="claim-location" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={60} placeholder="garage" className={BOX} />
          </div>
        </div>
        <label htmlFor="claim-minutes" className={LABEL}>
          Valid (minutes, 5-60)
        </label>
        <input
          id="claim-minutes"
          type="number"
          inputMode="numeric"
          min={5}
          max={60}
          step={1}
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          className={BOX + " sm:w-32"}
        />
        <div>
          <button
            type="submit"
            disabled={busy}
            className="mt-3 min-h-11 rounded-lg bg-teal-700 px-4 font-medium text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {busy ? "Creating…" : "Create code"}
          </button>
        </div>
      </form>

      {code !== null ? (
        <div role="status" className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
          <p className="font-medium">
            Claim code{code.name === null ? "" : " for " + code.name}, valid until {wibTime(code.expires_at)} ({code.minutes} minutes):
          </p>
          {/* a read-only box: it can still be selected and copied by hand in a browser that doesn't allow copying automatically */}
          <input
            ref={codeField}
            readOnly
            value={code.code}
            aria-label="Claim code"
            onFocus={(e) => e.currentTarget.select()}
            className="mt-2 w-full max-w-xs rounded-lg border border-amber-400 bg-white px-3 py-2 text-center font-mono text-2xl tracking-widest text-slate-900 dark:border-amber-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <p className="mt-2">
            This code is shown only <b>once</b>: write it down now. After it's closed, the code can't be seen again; create a new code if it's lost.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={copyCode}
              className="min-h-11 rounded-lg bg-amber-700 px-4 font-medium text-white hover:bg-amber-800"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
            <button
              type="button"
              onClick={() => setCode(null)}
              className="min-h-11 rounded-lg border border-amber-400 px-4 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      {list !== null && list.length > 0 ? (
        <div className="mt-4">
          <h5 className="text-sm font-medium text-slate-700 dark:text-slate-200">Recent codes (without the code)</h5>
          <ul className="mt-1 space-y-1 text-sm">
            {list.slice(0, 5).map((c, i) => (
              // key: the creation time + the order (two codes can be created within the same second)
              <li key={c.created_at + "-" + i} className="break-words text-slate-700 dark:text-slate-300">
                <span className={SHAPE + " " + STATE_BADGES[c.state]}>{c.state}</span> {c.name ?? "no name"}
                {c.location === null ? "" : " (" + c.location + ")"}
                <span className="text-slate-600 dark:text-slate-400">
                  {c.state === "used" && c.used_at !== null
                    ? " · used " + (c.device_id ?? "") + ", " + wibDateTime(Date.parse(c.used_at))
                    : (c.state === "valid" ? " · valid until " : " · expired ") + wibDateTime(Date.parse(c.expires_at))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
