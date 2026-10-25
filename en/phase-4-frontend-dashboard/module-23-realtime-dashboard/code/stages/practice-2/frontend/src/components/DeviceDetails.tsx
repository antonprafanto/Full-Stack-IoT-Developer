// DeviceDetails.tsx - the latest reading of ALL of one device's sensors, one SensorCard per field.
// The cards that appear follow the device kind (Node 1 or Node 2) and the fields that were really sent (Appendix A).
// Module 23: the numbers are read from the store, so they change by themselves every time a telemetry event arrives.
import { useLiveStore } from "../store";
import type { Device, TelemetryNode1, TelemetryNode2 } from "../types";
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
  device: Device; // sent from the list: the name, location, kind, and key are already there, no need to ask again
  onBack: () => void;
};

export default function DeviceDetails({ device, onBack }: Props) {
  const id = device.device_id;
  // Narrow selectors: this component only re-renders when a value of THIS device changes.
  const reading = useLiveStore((s) => s.latest[id]); // undefined = no reading yet
  const status = useLiveStore((s) => s.status[id]) ?? device.status;
  const live = useLiveStore((s) => s.connection === "live");
  const node2 = device.kind === "node2"; // kind sets the shape of the telemetry: node2, or anything else = Node 1
  // A revoked key or an unregistered device: the backend ignores its messages (Module 21), so the stored status
  // (possibly still "online") is misleading. The status isn't shown; "messages ignored" takes its place.
  const messagesIgnored = device.key === "revoked" || device.key === "unregistered";

  // Pick ONE content to show under the heading: no reading yet, or the cards.
  let content;
  if (reading === undefined) {
    // Will a reading come? That depends on the key field (Module 21).
    let message =
      "No reading from this device since the backend started. The numbers appear by themselves as soon as the " +
      "device sends (Node 1: within 10 seconds; Node 2: 5 minutes).";
    if (device.key === "unregistered") {
      message = "This device isn't registered, so the backend ignores its messages (register it first, as in Module 21).";
    } else if (device.key === "revoked") {
      message = "No new reading will come from this device while its key is revoked.";
    } else if (!live) {
      // the starting values come through the "follow" answer, and "follow" is only sent once the live connection is up
      message = "Waiting for the live connection…";
    }
    content = <p className="mt-4 rounded-lg bg-white p-3 text-slate-600">{message}</p>;
  } else {
    const cards = node2 ? cardsNode2(reading as TelemetryNode2) : cardsNode1(reading as TelemetryNode1);
    content = (
      <>
        <p className="mt-4 text-sm text-slate-500">
          {device.kind} · {messagesIgnored ? "messages ignored" : status} · updated at {wibTime(reading.ts)}
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
      {/* min-h-11 = a minimum height of 44 px: even a small link is easy to tap with a thumb */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-11 items-center text-sm font-medium text-teal-700 hover:underline"
      >
        ← Back to the list
      </button>
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
          This device's key has been revoked: the backend ignores its messages, so the dashboard doesn't follow it.
        </p>
      ) : null}
      {content}
    </div>
  );
}
