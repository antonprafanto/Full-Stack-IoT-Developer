// App.tsx - the dashboard's top component. Practice 3: sensor cards from ONE example reading
// (not from the API yet: Practice 4 connects to the backend for login, real readings only come in Practice 6).
import SensorCard from "./components/SensorCard";
import type { TelemetryNode1 } from "./types";

// This reading is COPIED from the output of `node generate-dummy.js` (tools folder, Module 4), line "Example of the first reading".
// generate-dummy.js is deliberately not imported: it uses node:fs (Node.js only), which doesn't exist in the browser.
// The TelemetryNode1 type label makes TypeScript check every field: a typo is marked right away.
const reading: TelemetryNode1 = {
  ts: "2026-10-23T09:56:59Z",
  fw: "0.1.0",
  temperature: 28.1,
  humidity: 71,
  light: 473,
  soil: 38,
  motion: false,
  water_level: 57,
};

export default function App() {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-teal-700">Mini Smart Home</h1>
        <p className="mt-2 text-sm text-slate-500">
          Example reading from generate-dummy.js (not from the API yet) · firmware {reading.fw} · ts {reading.ts}
        </p>
        {/* one SensorCard mold used six times; only its props differ */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <SensorCard label="Temperature" value={reading.temperature} unit="°C" color="text-teal-600" />
          <SensorCard label="Humidity" value={reading.humidity} unit="%" />
          <SensorCard label="Light" value={reading.light} unit="/4095" />
          <SensorCard label="Soil moisture" value={reading.soil} unit="%" />
          <SensorCard label="Motion" value={reading.motion ? "Yes" : "No"} />
          <SensorCard label="Water tank" value={reading.water_level} unit="%" />
        </div>
      </div>
    </main>
  );
}
