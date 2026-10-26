// DeviceDetails.tsx - the latest reading of ALL of one device's sensors, one SensorCard per field.
// The cards that appear follow the device kind (Node 1 or Node 2) and the fields that were really sent (Appendix A).
// Module 23: the numbers are read from the store, so they change by themselves every time a telemetry event arrives; plus a
// 5-minute chart and gauges.
// Module 24: "Back to the list" and "History →" become React Router links to their own addresses; admin accounts get the
// Controls section (lamp, fan, pump).
import { Link } from "react-router";
import { useAdmin, useLiveStore } from "../store";
import type { Device, DeviceStatus, Kind, Telemetry, TelemetryNode1, TelemetryNode2 } from "../types";
import { wibTime } from "../time";
import Gauge from "./Gauge";
import LiveChart from "./LiveChart";
import SensorCard from "./SensorCard";
import { KeyBadge, StatusBadge } from "./Badge";
import LastSeen from "./LastSeen";
import PumpButton from "./PumpButton";
import SwitchButton from "./SwitchButton";

// the content of one card: the same shape as SensorCard's props
type Card = { label: string; value: number | string | null; unit?: string; color?: string };

function cardsNode1(t: TelemetryNode1, admin: boolean): Card[] {
  // soil moisture and the water tank are shown as gauges, so they aren't repeated here
  const cards: Card[] = [
    { label: "Temperature", value: t.temperature, unit: "°C", color: "text-teal-600 dark:text-teal-400" },
    { label: "Humidity", value: t.humidity, unit: "%" },
    { label: "Light", value: t.light, unit: "/4095" },
    { label: "Motion", value: t.motion ? "Yes" : "No", color: t.motion ? "text-amber-600 dark:text-amber-400" : undefined },
  ];
  // The RS-485 soil sensor (Module 15) is only there if it's fitted; its three fields always come together (rule 11).
  if (t.soil_rs485 !== undefined) {
    cards.push(
      { label: "RS-485 soil", value: t.soil_rs485, unit: "%" },
      { label: "Soil temperature", value: t.soil_temperature ?? null, unit: "°C" },
      { label: "Soil EC", value: t.ec ?? null, unit: "µS/cm" },
    );
  }
  // The actuator state. Module 24: admins control the lamp, fan, and pump from the Controls section, so these three cards
  // aren't repeated for admins; viewers only see the cards. The curtain stays a card (its button: Challenge Level 1).
  if (t.state !== undefined) {
    if (!admin) {
      cards.push(
        { label: "Lamp", value: t.state.lamp ? "On" : "Off", color: t.state.lamp ? "text-amber-600 dark:text-amber-400" : undefined },
        { label: "Fan", value: t.state.fan ? "On" : "Off", color: t.state.fan ? "text-teal-600 dark:text-teal-400" : undefined },
        { label: "Pump", value: t.state.pump ? "Watering" : "Idle", color: t.state.pump ? "text-sky-600 dark:text-sky-400" : undefined },
      );
    }
    cards.push({ label: "Curtain", value: t.state.curtain, unit: "°" });
  }
  return cards;
}

function cardsNode2(t: TelemetryNode2): Card[] {
  // soil moisture is shown as a gauge, so it isn't repeated here
  const cards: Card[] = [
    { label: "Temperature", value: t.temperature, unit: "°C", color: "text-teal-600 dark:text-teal-400" },
    { label: "Humidity", value: t.humidity, unit: "%" },
    { label: "Air pressure", value: t.pressure, unit: "hPa" },
    { label: "Soil temperature", value: t.soil_temperature, unit: "°C" },
  ];
  // The battery meter is optional: if it isn't fitted, the field isn't there at all.
  if (t.battery !== undefined) {
    cards.push({ label: "Battery", value: t.battery, unit: "V" });
  }
  return cards;
}

// Gauges are only for quantities with clear limits, 0-100 %: soil moisture, and Node 1's water tank.
function gauges(reading: Telemetry, node2: boolean) {
  if (node2) {
    return <Gauge label="Soil moisture" value={(reading as TelemetryNode2).soil} />;
  }
  const t = reading as TelemetryNode1;
  return (
    <>
      <Gauge label="Soil moisture" value={t.soil} />
      {/* the water tank below 20 % = "low" (the data contract's threshold, the same as Node 1's immediate-send rule) */}
      <Gauge label="Water tank" value={t.water_level} lowThreshold={20} />
    </>
  );
}

// Module 24: why the control buttons can't be used right now (null = they can). The backend checks the same thing (409),
// but it's friendlier when the button says so before it is tapped.
const STATUS_TEXT: Record<DeviceStatus, string> = {
  online: "online",
  offline: "offline",
  "offline-mode": "in offline mode",
  unknown: "in an unknown state",
};
function whyDisabled(kind: Kind, status: DeviceStatus): string | null {
  if (kind === "unknown") return "The device kind isn't known yet: wait for its first message.";
  if (status !== "online") return "The device is " + STATUS_TEXT[status] + ": commands can't be sent.";
  return null;
}

type Props = {
  device: Device; // from the list in the store (Module 24): name, location, kind, and key are already there, no need to ask again
};

export default function DeviceDetails({ device }: Props) {
  const id = device.device_id;
  // Narrow selectors: this component only re-renders when a value of THIS device changes.
  const reading = useLiveStore((s) => s.latest[id]); // undefined = no reading yet
  const status = useLiveStore((s) => s.status[id]) ?? device.status;
  const last = useLiveStore((s) => s.lastSeen[id]);
  const live = useLiveStore((s) => s.connection === "live");
  const admin = useAdmin(); // Module 24: the Controls section is only drawn when the admin role is CERTAIN
  // Module 24: the kind from the list (GET /devices, fetched once after logging in). A device that sends for the first time AFTER
  // the list was fetched is still "unknown" in the list, though its message has arrived: its kind is read from that message
  // (only Node 2 has air pressure). Without this, its control buttons stay disabled until the page is reloaded.
  const kind: Kind =
    device.kind !== "unknown" || reading === undefined ? device.kind : "pressure" in reading ? "node2" : "node1";
  const node2 = kind === "node2"; // the kind decides the telemetry's shape: node2, or otherwise Node 1
  // A revoked key or an unregistered device: the backend ignores its messages (Module 21), so the stored status
  // (possibly still "online") is misleading. The status isn't shown; "messages ignored" takes its place.
  const messagesIgnored = device.key === "revoked" || device.key === "unregistered";
  // the lamp, fan, pump, and curtain state the device reports; undefined = none yet (or Node 2)
  const state = reading === undefined || node2 ? undefined : (reading as TelemetryNode1).state;
  const reason = whyDisabled(kind, status);

  // Pick ONE content for the lower part: no reading yet, or the gauges + cards.
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
    content = <p className="mt-4 rounded-lg bg-white p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{message}</p>;
  } else {
    const cards = node2 ? cardsNode2(reading as TelemetryNode2) : cardsNode1(reading as TelemetryNode1, admin);
    // starting values from the database (the backend has only just started) carry no actuator state: the database doesn't store it
    const noState = !node2 && (reading as TelemetryNode1).state === undefined;
    content = (
      // live connection lost = the numbers below aren't updated any more: they're faded so they look stale
      <div className={live ? "" : "opacity-60"}>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          updated at {wibTime(reading.ts)}
          {live ? null : " · live connection lost, these numbers may be stale"}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">{gauges(reading, node2)}</div>
        {/* mobile first: two columns on a phone, three columns from the sm width (640 px) */}
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {cards.map((k) => (
            <SensorCard key={k.label} label={k.label} value={k.value} unit={k.unit} color={k.color} />
          ))}
        </div>
        {noState ? (
          <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
            The state of the lamp, fan, pump, and curtain isn't stored in the database, so their cards only appear with the
            next message.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-4">
        {/* min-h-11 = a minimum height of 44 px: even a small link is easy to tap with a thumb */}
        <Link to="/devices" className="inline-flex min-h-11 items-center text-sm font-medium text-teal-700 hover:underline dark:text-teal-300">
          ← Back to the list
        </Link>
        <Link
          to={"/devices/" + id + "/history"}
          className="inline-flex min-h-11 items-center text-sm font-medium text-teal-700 hover:underline dark:text-teal-300"
        >
          History →
        </Link>
      </div>
      {/* flex-wrap + break-words: a long name moves down a row, the badge isn't pushed off the screen */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <h2 className="min-w-0 text-xl font-semibold break-words text-slate-800 dark:text-slate-100">{device.name ?? id}</h2>
        <KeyBadge keyStatus={device.key} />
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {device.location ?? "no location yet"} · <span className="font-mono text-xs">{id}</span>
      </p>
      {device.key === "revoked" ? (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          This device's key has been revoked: the backend ignores its messages, so the dashboard doesn't follow it.
        </p>
      ) : null}
      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
        <span>{kind}</span>
        <span>·</span>
        {messagesIgnored ? <span>messages ignored</span> : <StatusBadge status={status} />}
        <span>·</span>
        <LastSeen t={last} kind={kind} checkStale={!messagesIgnored} />
      </p>
      {/* Module 24: the Controls section, admin-only, for Node 1 and the simulator (Node 2 takes no commands) */}
      {admin && !node2 && !messagesIgnored ? (
        <section aria-labelledby="controls-title" className="mt-4">
          <h3 id="controls-title" className="font-semibold text-slate-800 dark:text-slate-100">
            Controls
          </h3>
          {state === undefined ? (
            <p className="mt-2 rounded-lg bg-white p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              The control buttons appear as soon as the device reports the state of its lamp, fan, and pump (its next message).
            </p>
          ) : (
            <div className="mt-2 grid grid-cols-2 gap-3">
              <SwitchButton deviceId={id} target="lamp" label="Lamp" value={state.lamp} disabledReason={reason} />
              <SwitchButton deviceId={id} target="fan" label="Fan" value={state.fan} disabledReason={reason} />
              <PumpButton deviceId={id} watering={state.pump} disabledReason={reason} />
            </div>
          )}
        </section>
      ) : null}
      {/* The 5-minute chart is only for devices that send every 10 seconds (Node 1 and the simulator) */}
      {messagesIgnored ? null : node2 ? (
        <p className="mt-4 rounded-lg bg-white p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          Node 2 sends every 5 minutes, so a chart of the last 5 minutes would almost always be empty. Its chart is in History.
        </p>
      ) : (
        <LiveChart deviceId={id} />
      )}
      {content}
    </div>
  );
}
