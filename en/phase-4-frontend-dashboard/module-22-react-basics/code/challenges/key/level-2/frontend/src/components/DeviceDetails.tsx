// DeviceDetails.tsx - the latest reading of ALL of one device's sensors (GET /devices/:id/latest), one SensorCard per field.
// The cards that appear follow the device kind (Node 1 or Node 2) and the fields that were really sent (Appendix A).
// Module 22 Challenge, Level 2 answer key: a Reload button (tapped by hand, not polling; live data only comes in Module 23).
import { useEffect, useState } from "react";
import { ApiError, getLatest } from "../api";
import type { Device, LatestReading, TelemetryNode1, TelemetryNode2 } from "../types";
import SensorCard from "./SensorCard";
import { KeyBadge } from "./Badge";

// the content of one card: the same shape as SensorCard's props
type Card = { label: string; value: number | string | null; unit?: string; color?: string };

function cardsNode1(t: TelemetryNode1): Card[] {
  const cards: Card[] = [
    { label: "Temperature", value: t.temperature, unit: "°C", color: "text-teal-600" },
    { label: "Humidity", value: t.humidity, unit: "%" },
    { label: "Light", value: t.light, unit: "/4095" },
    { label: "Soil moisture", value: t.soil, unit: "%" },
    { label: "Motion", value: t.motion ? "Yes" : "No", color: t.motion ? "text-amber-600" : undefined },
    { label: "Water tank", value: t.water_level, unit: "%" },
  ];
  // The RS-485 soil sensor (Module 15) is only there if it's fitted; its three fields always come together (rule 11).
  if (t.soil_rs485 !== undefined) {
    cards.push(
      { label: "RS-485 soil", value: t.soil_rs485, unit: "%" },
      { label: "Soil temperature", value: t.soil_temperature ?? null, unit: "°C" },
      { label: "Soil EC", value: t.ec ?? null, unit: "µS/cm" },
    );
  }
  // The actuator state is only SHOWN; its control buttons are only made in Module 24.
  if (t.state !== undefined) {
    cards.push(
      { label: "Lamp", value: t.state.lamp ? "On" : "Off", color: t.state.lamp ? "text-amber-600" : undefined },
      { label: "Fan", value: t.state.fan ? "On" : "Off", color: t.state.fan ? "text-teal-600" : undefined },
    );
  }
  return cards;
}

function cardsNode2(t: TelemetryNode2): Card[] {
  const cards: Card[] = [
    { label: "Temperature", value: t.temperature, unit: "°C", color: "text-teal-600" },
    { label: "Humidity", value: t.humidity, unit: "%" },
    { label: "Air pressure", value: t.pressure, unit: "hPa" },
    { label: "Soil temperature", value: t.soil_temperature, unit: "°C" },
    { label: "Soil moisture", value: t.soil, unit: "%" },
  ];
  // The battery meter is optional: if it isn't fitted, the field isn't there at all.
  if (t.battery !== undefined) {
    cards.push({ label: "Battery", value: t.battery, unit: "V" });
  }
  return cards;
}

// A device's ts is always UTC (the Z at the end). Show it as a WIB time whatever the laptop's time zone (en-GB = 24-hour clock).
function wibTime(ts: string): string {
  return new Date(ts).toLocaleTimeString("en-GB", { timeZone: "Asia/Jakarta" }) + " WIB";
}

type Props = {
  device: Device; // sent from the list: the name, location, and key are already there, no need to ask again
  onBack: () => void;
  onSessionExpired: () => void; // called if the backend answers 401 (after the refresh failed as well)
};

export default function DeviceDetails({ device, onBack, onSessionExpired }: Props) {
  const [reading, setReading] = useState<LatestReading | null>(null); // null = still loading
  const [error, setError] = useState<string | null>(null);
  const [noReadingYet, setNoReadingYet] = useState(false); // 404: no reading yet since the backend started
  const [reloadCount, setReloadCount] = useState(0); // Challenge 2: goes up by 1 every time the Reload button is tapped
  const [reloading, setReloading] = useState(false); // Challenge 2: true while waiting for the reload's answer
  const id = device.device_id;

  // The starting values of the state above are already "clean" for one device. For another device, App sets key={device_id},
  // so React makes a new DeviceDetails with fresh state; this effect doesn't need to empty the state itself.
  // The dependency list at the end of the effect = every outside value the effect uses (npm run lint warns about forgotten ones).
  useEffect(() => {
    let ignore = false;
    getLatest(id)
      .then((b) => {
        if (!ignore) setReading(b);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof ApiError && err.code === 401) return onSessionExpired();
        if (err instanceof ApiError && err.code === 404) return setNoReadingYet(true); // normal, not a fault
        setError(err instanceof ApiError ? err.message : "Couldn't load the reading.");
      })
      .finally(() => {
        if (!ignore) setReloading(false); // Challenge 2: success or failure, the button works again
      });
    return () => {
      ignore = true;
    };
  }, [id, onSessionExpired, reloadCount]); // Challenge 2: reloadCount changes = the effect runs again = the reading is fetched again

  // Challenge 2: called by the Reload button. Changing state in a click handler like this is fine;
  // fetching the data is still done by the effect above. The old cards stay on screen until the new answer arrives.
  function reload() {
    setError(null); // clear a leftover error or "no reading yet" from the previous try
    setNoReadingYet(false);
    setReloading(true);
    setReloadCount((n) => n + 1); // an updater function: take the latest value, add one
  }

  // Pick ONE content to show under the heading: loading, error, no reading yet, or the cards.
  let content = <p className="mt-4 text-slate-500">Loading the reading…</p>;
  if (error !== null) {
    content = <p className="mt-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>;
  } else if (noReadingYet) {
    // 404 = no reading in the backend's memory yet. Will a reading come? That depends on the key field (Module 21):
    // messages from a device that isn't registered or whose key was revoked are IGNORED by the backend, so waiting is pointless.
    let message = "No reading from this device since the backend started. Wait for its next message, then tap Reload.";
    if (device.key === "unregistered") {
      message = "This device isn't registered, so the backend ignores its messages (register it first, as in Module 21).";
    } else if (device.key === "revoked") {
      message = "There's no stored reading from this device, and no new reading will come while its key is revoked.";
    }
    content = <p className="mt-4 rounded-lg bg-white p-3 text-slate-600">{message}</p>;
  } else if (reading !== null) {
    // kind tells the shape of its telemetry: node2 -> the Node 2 fields, anything else the Node 1 fields
    const cards =
      reading.kind === "node2"
        ? cardsNode2(reading.telemetry as TelemetryNode2)
        : cardsNode1(reading.telemetry as TelemetryNode1);
    // A revoked key or an unregistered device: the backend ignores its messages (Module 21), so the stored status
    // (possibly still "online") is misleading. The status isn't shown; "messages ignored" takes its place.
    const messagesIgnored = device.key === "revoked" || device.key === "unregistered";
    content = (
      <>
        <p className="mt-4 text-sm text-slate-500">
          {reading.kind} · {messagesIgnored ? "messages ignored" : reading.status} · updated at{" "}
          {wibTime(reading.telemetry.ts)}
        </p>
        {/* mobile first: two columns on a phone, three columns from the sm width (640 px) */}
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {cards.map((k) => (
            <SensorCard key={k.label} label={k.label} value={k.value} unit={k.unit} color={k.color} />
          ))}
        </div>
      </>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        {/* min-h-11 = a minimum height of 44 px: even a small link is easy to tap with a thumb */}
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center text-sm font-medium text-teal-700 hover:underline"
        >
          ← Back to the list
        </button>
        {/* Challenge 2: a MANUAL reload; the button is dimmed while waiting so it isn't tapped again and again */}
        <button
          type="button"
          onClick={reload}
          disabled={reloading}
          className="min-h-11 shrink-0 rounded-lg border border-slate-300 bg-white px-4 text-sm hover:bg-slate-50 disabled:opacity-60"
        >
          {reloading ? "Loading…" : "Reload"}
        </button>
      </div>
      {/* flex-wrap + break-words: a long name moves down a row, the badge isn't pushed off the screen */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <h2 className="min-w-0 text-xl font-semibold break-words text-slate-800">{device.name ?? id}</h2>
        <KeyBadge keyStatus={device.key} />
      </div>
      <p className="text-sm text-slate-500">
        {device.location ?? "no location yet"} · <span className="font-mono text-xs">{id}</span>
      </p>
      {device.key === "revoked" ? (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          This device's key has been revoked: the backend ignores its messages. The reading below (if any) is the last
          one sent before the key was revoked.
        </p>
      ) : null}
      {content}
    </div>
  );
}
