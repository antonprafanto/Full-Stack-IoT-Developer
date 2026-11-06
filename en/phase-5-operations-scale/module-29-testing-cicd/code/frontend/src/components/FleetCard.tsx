// FleetCard.tsx - one device on the Fleet screen (Module 28): its firmware version, health from the last vitals (Wi-Fi signal,
// RAM, uptime, restart reason), its last update, and (admin only) its buttons.
// Like the cards of the device list (Module 23), every card picks its OWN data from the store: the status, the version from the
// latest telemetry, and the update notice (the Socket.IO "ota" event) change by themselves without reloading the page.
import type { ReactNode } from "react";
import { RESET_MEANINGS, uptimeText, ramText, signalText, UPDATE_TEXT } from "../fleet";
import { useAdmin, useLiveStore } from "../store";
import type { FleetRow, Kind, OtaNotice, Update, FullRelease, DeviceStatus } from "../types";
import { wibDateTime } from "../time";
import { StatusBadge } from "./Badge";
import UpdateHistory from "./UpdateHistory";
import LastSeen from "./LastSeen";
import FleetActions from "./FleetActions";

const SHAPE = "rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

// the thick line on the card's left edge follows the status (like the device list cards)
const EDGE: Record<DeviceStatus, string> = {
  online: "border-l-green-500 dark:border-l-green-500",
  offline: "border-l-red-500 dark:border-l-red-500",
  "offline-mode": "border-l-sky-400 dark:border-l-sky-400",
  unknown: "border-l-slate-300 dark:border-l-slate-600",
};

// The last update = the newest of two sources: the row from GET /fleet, or the live notice from the "ota" event.
// Both times are UTC in the contract format (2026-10-31T01:02:03Z), so they can be compared as text.
function latestUpdate(fromServer: Update | null, notice: OtaNotice | undefined): Update | null {
  if (notice === undefined) return fromServer;
  // >= : within the same second, the server's row (which is complete) wins over the live notice
  if (fromServer !== null && fromServer.updated_at >= notice.time) return fromServer;
  const finishedAt = ["sent", "accepted", "downloading"].includes(notice.status) ? null : notice.time;
  return {
    id: notice.id,
    status: notice.status,
    from: notice.from,
    to: notice.to,
    message: notice.message,
    created_at: fromServer?.id === notice.id ? fromServer.created_at : notice.time,
    updated_at: notice.time,
    finished_at: finishedAt,
  };
}

function kindText(kind: Kind, linkedVia: string | null): string {
  if (kind === "node1") return "Node 1";
  if (kind === "node2") return "Node 2" + (linkedVia === null ? "" : " via " + linkedVia);
  return "kind not known yet";
}

// one "title: content" pair inside the card
function Field({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-slate-500 dark:text-slate-400">{title}</dt>
      <dd className="break-words text-slate-800 dark:text-slate-100">{children}</dd>
    </div>
  );
}

type Props = {
  d: FleetRow; // one row of GET /fleet
  releases: FullRelease[]; // the release list (for the version choice of the Update button)
  latest: string | null; // the latest Node 1 release
  otaReady: boolean; // SERVER_URL is set on the server
  onChange: () => void; // asks the screen to fetch the fleet data again
};

export default function FleetCard({ d, releases, latest, otaReady, onChange }: Props) {
  const id = d.device_id;
  const admin = useAdmin();
  const deactivated = d.key === "revoked";
  // a deactivated device: its live status is ignored (the broker may still keep an old "online", contract 1.6)
  const liveStatus = useLiveStore((s) => s.status[id]);
  const status: DeviceStatus = deactivated ? "offline" : (liveStatus ?? d.status);
  const reading = useLiveStore((s) => s.latest[id]); // the last telemetry (live); undefined = none yet
  // The firmware version: from telemetry (live, every 10 seconds) ONLY if that telemetry is newer than the fw record in the
  // database. After a successful update, the database knows the new version first (from the vitals of the device that just
  // started) before the next telemetry, and the old telemetry in the store still carries the OLD version.
  const telemetryNewer = reading !== undefined && (d.fw_seen_at === null || Date.parse(reading.ts) >= Date.parse(d.fw_seen_at));
  const fw = !deactivated && telemetryNewer ? reading.fw : d.fw;
  // The kind: a device that just registered through a claim code is still "unknown" in GET /fleet until its first message.
  // As soon as its telemetry arrives, its kind is read from that message (only Node 2 has air pressure), as in
  // DeviceDetails (Module 24); without this the Update button stays disabled until the page is reloaded.
  const kind: Kind = d.kind !== "unknown" || reading === undefined ? d.kind : "pressure" in reading ? "node2" : "node1";
  const row = kind === d.kind ? d : { ...d, kind }; // for FleetActions: the same row with the current kind
  const lastLive = useLiveStore((s) => s.lastSeen[id]);
  const last = lastLive ?? (d.last_seen === null ? undefined : Date.parse(d.last_seen));
  const notice = useLiveStore((s) => s.ota[id]);
  const update = latestUpdate(d.update, notice);
  // "needs update" is computed by the server against the fw in the database; a live version equal to the latest release closes it
  const needsUpdate = d.needs_update && fw !== latest;
  const h = d.health;

  return (
    <article
      aria-labelledby={"fleet-" + id}
      className={
        "rounded-xl border border-l-4 border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 " +
        (deactivated ? "border-l-slate-300 dark:border-l-slate-600" : EDGE[status])
      }
    >
      {/* the title + badges; flex-wrap: on a phone the badges move down a row instead of pushing the name off the screen */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <h4 id={"fleet-" + id} className="min-w-0 font-semibold break-words text-slate-800 dark:text-slate-100">
          {d.name ?? id}
        </h4>
        {deactivated ? (
          <span className={SHAPE + " bg-red-600 text-white"}>deactivated</span>
        ) : (
          <StatusBadge status={status} />
        )}
        {d.canary && !deactivated ? (
          <span className={SHAPE + " bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-100"}>canary</span>
        ) : null}
        {needsUpdate && !deactivated ? (
          <span className={SHAPE + " bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"}>needs update</span>
        ) : null}
      </div>
      <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
        {kindText(kind, d.linked_via)} · {d.location ?? "no location yet"} · <span className="font-mono text-xs">{id}</span> ·{" "}
        <LastSeen t={last} kind={kind} checkStale={!deactivated} />
      </p>

      {/* dl = a "title: content" list. Two columns on a phone, three from 640 px */}
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
        <Field title="Firmware version">
          <span className="font-mono">{fw ?? "—"}</span>
          {needsUpdate && !deactivated ? <span className="text-slate-600 dark:text-slate-400"> → {latest}</span> : null}
        </Field>
        {h === null ? (
          <Field title="Health">
            {kind === "node2" ? "Node 2 doesn't send vitals" : "no vitals yet"}
          </Field>
        ) : (
          <>
            <Field title="Restarted because">
              {h.reset_reason === null ? (
                <span className="text-slate-600 dark:text-slate-400">— (the old firmware doesn't report it)</span>
              ) : (
                <>
                  <span className={SHAPE + " " + RESET_MEANINGS[h.reset_reason].color}>{h.reset_reason}</span>{" "}
                  <span className="text-xs text-slate-600 dark:text-slate-400">{RESET_MEANINGS[h.reset_reason].meaning}</span>
                </>
              )}
            </Field>
            <Field title="Wi-Fi signal">{signalText(h.rssi)}</Field>
            <Field title="RAM">{ramText(h.heap_free)}</Field>
            <Field title="Uptime">{uptimeText(h.uptime_s)}</Field>
          </>
        )}
      </dl>
      {h !== null ? (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Health from the last vitals, {wibDateTime(Date.parse(h.ts))}; vitals sent every{" "}
          {d.vitals_interval_s === null ? "300 seconds (firmware default)" : d.vitals_interval_s + " seconds (set by the admin)"}.
        </p>
      ) : null}

      {/* the last update: changes by itself through the "ota" event (accepted -> downloading -> succeeded / rollback / failed).
          Node 2 is never updated over the air: one sentence is enough */}
      {kind === "node2" ? (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">OTA isn't available for Node 2: update it by cable.</p>
      ) : (
        <div className="mt-3 text-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400">Last update: </span>
          {update === null ? (
            <span className="text-slate-600 dark:text-slate-400">never over the air</span>
          ) : (
            <>
              <span className={SHAPE + " " + UPDATE_TEXT[update.status].color}>{UPDATE_TEXT[update.status].text}</span>{" "}
              <span className="font-mono text-slate-800 dark:text-slate-100">
                {update.from ?? "?"} → {update.to}
              </span>
              <span className="text-slate-600 dark:text-slate-400"> · {wibDateTime(Date.parse(update.updated_at))}</span>
              {update.message !== null ? (
                <span className="block break-words text-slate-600 dark:text-slate-400">{update.message}</span>
              ) : null}
            </>
          )}
        </div>
      )}
      {deactivated ? (
        <p className="mt-2 rounded-lg bg-red-50 p-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          Deactivated: its key is revoked and its messages are ignored. It comes back only with a new key or a new claim code.
        </p>
      ) : null}

      {kind === "node1" ? <UpdateHistory deviceId={id} version={update === null ? "" : update.id + update.status} /> : null}

      {/* the fleet buttons: drawn ONLY when the admin role is certain (the Module 24 pattern). For a device that is already
          deactivated, FleetActions only shows the manual steps after Deactivate (if any) */}
      {admin ? (
        <FleetActions d={row} status={status} fw={fw} update={update} releases={releases} latest={latest} otaReady={otaReady} onChange={onChange} />
      ) : null}
    </article>
  );
}
