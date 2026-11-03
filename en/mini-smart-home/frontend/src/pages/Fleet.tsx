// pages/Fleet.tsx - the /fleet screen (Module 28): every registered device with its firmware version, health, and last
// update; the firmware releases on the server; and (admin only) the firmware upload, over-the-air updates (OTA), and claim codes
// for new devices. Admins and viewers may both look; the buttons are only drawn for admins (the Rules screen pattern).
// LIVE data without polling: the status, the version from telemetry, and an update's progress come through Socket.IO (the store);
// other data is fetched again only when there is news from the server (fleetVersion goes up).
import { useEffect, useState } from "react";
import { getFleet, getReleases, ApiError } from "../api";
import CreateClaimCode from "../components/CreateClaimCode";
import ReleaseList from "../components/ReleaseList";
import FleetCard from "../components/FleetCard";
import FirmwareUpload from "../components/FirmwareUpload";
import { handleSessionExpired, useAdmin, useLiveStore } from "../store";
import type { ReleaseList as Releases, FleetData } from "../types";

const SECTION_TITLE = "text-base font-semibold text-slate-800 dark:text-slate-100";

// an ordinary function (not inside the component): the SAME function forever, safe to hand to many cards
function reload() {
  useLiveStore.getState().fleetChanged();
}

export default function FleetPage() {
  const admin = useAdmin();
  const fleetVersion = useLiveStore((s) => s.fleetVersion); // goes up when an update finishes, a new device, a deactivation, ...
  const [data, setData] = useState<FleetData | null>(null); // null = still loading
  const [releases, setReleases] = useState<Releases | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch the fleet and the release list AT THE SAME TIME (Promise.all) when the screen opens and every time fleetVersion goes up.
  // The old data stays on screen until the new data arrives (no "Loading…" flicker).
  useEffect(() => {
    let ignore = false;
    Promise.all([getFleet(), getReleases()])
      .then(([fleet, releaseList]) => {
        if (ignore) return;
        setData(fleet);
        setReleases(releaseList);
        setError(null);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof ApiError && err.code === 401) return handleSessionExpired();
        setError(err instanceof ApiError ? err.message : "Couldn't load the fleet.");
      });
    return () => {
      ignore = true;
    };
  }, [fleetVersion]);

  if (error !== null && data === null) {
    return <p className="rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{error}</p>;
  }
  if (data === null || releases === null) return <p className="text-slate-600 dark:text-slate-400">Loading the fleet…</p>;

  const latest = data.latest_release.node1;
  const active = data.devices.filter((d) => d.key !== "revoked");
  const needing = active.filter((d) => d.needs_update).length;

  return (
    <>
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Fleet</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        {active.length} active device(s)
        {data.devices.length > active.length ? " (+" + (data.devices.length - active.length) + " deactivated)" : ""} · latest Node 1 release:{" "}
        <span className="font-mono">{latest ?? "none yet"}</span>
        {needing > 0 ? " · " + needing + " to update" : ""}
      </p>
      {error !== null ? (
        // fetching AGAIN failed: the old data stays on screen, with a warning that it may be stale
        <p className="mt-2 rounded-lg bg-red-50 p-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          {error} The data below may be stale.
        </p>
      ) : null}
      {admin && !data.settings.ota_ready ? (
        <p className="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
          SERVER_URL in the server's <span className="font-mono">.env</span> isn't set: the Update button can't be used yet, because
          the devices don't know where to download firmware from.
        </p>
      ) : null}

      <section aria-labelledby="devices-title" className="mt-4">
        <h3 id="devices-title" className={SECTION_TITLE}>
          Devices
        </h3>
        {data.devices.length === 0 ? (
          <p className="mt-2 rounded-lg bg-white p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            No registered devices yet.{admin ? " Create a claim code below to register a new device." : ""}
          </p>
        ) : (
          <ul className="mt-2 grid gap-3">
            {data.devices.map((d) => (
              <li key={d.device_id} className="min-w-0">
                <FleetCard d={d} releases={releases.releases} latest={latest} otaReady={data.settings.ota_ready} onChange={reload} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="releases-title" className="mt-6">
        <h3 id="releases-title" className={SECTION_TITLE}>
          Firmware releases
        </h3>
        <p className="mt-1 mb-2 text-sm text-slate-600 dark:text-slate-300">
          Firmware files can only be downloaded by registered devices with their own key. The server decides when devices
          are updated: the canary first, then all.
        </p>
        <div className="grid gap-3">
          {admin ? <FirmwareUpload onDone={reload} /> : null}
          <ReleaseList list={releases} admin={admin} onChange={reload} />
        </div>
      </section>

      {admin ? (
        <section aria-labelledby="new-devices-title" className="mt-6">
          <h3 id="new-devices-title" className={SECTION_TITLE}>
            New devices
          </h3>
          <div className="mt-2">
            <CreateClaimCode />
          </div>
        </section>
      ) : (
        <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
          Your account is a viewer: you can see the fleet, but uploading firmware, updates, claim codes, and deactivating devices are for
          the admin.
        </p>
      )}
    </>
  );
}
