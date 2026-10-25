// fakeLoad.ts - a TEMPORARY FILE for Practice 6. Don't commit it: delete the src/loadtest folder after measuring.
// As soon as the dashboard is connected (the Live badge), this file injects 10 fake readings per second for 60 seconds into
// the store, as if one device sent 10 times per second. Its only use is to MEASURE how many times the screen is
// re-rendered (React DevTools: Highlight updates and the Profiler).
// How to use it: in main.tsx, right under the import App line, add   import './loadtest/fakeLoad'
// (the Vite template style of that file: single quotes, no semicolon). Then log in and open this device's details.
import { useLiveStore } from "../store";
import type { TelemetryNode1 } from "../types";

const ID = "f00d00000001"; // the flooded device; with Kit A + B, replace it with Node 1's device_id
const PER_SECOND = 10;
const DURATION_SECONDS = 60;

function start() {
  let count = 0;
  const timer = setInterval(() => {
    const content: TelemetryNode1 = {
      ts: new Date().toISOString(), // the fake reading's time = now
      fw: "0.0.0-test",
      temperature: Math.round((27 + Math.random() * 3) * 10) / 10,
      humidity: 60,
      light: Math.round(Math.random() * 4095),
      soil: 40,
      motion: false,
      water_level: 50,
    };
    useLiveStore.getState().receive(ID, content); // the same path as the telemetry event from Socket.IO
    count++;
    if (count >= PER_SECOND * DURATION_SECONDS) {
      clearInterval(timer);
      console.log(`fakeLoad: done, ${count} fake readings`);
    }
  }, 1000 / PER_SECOND);
  console.log(`fakeLoad: started, ${PER_SECOND} readings per second for ${DURATION_SECONDS} seconds for ${ID}`);
}

// Wait until the live connection is Live for the first time, then start (so it doesn't run on the login screen).
const unsubscribe = useLiveStore.subscribe((s) => {
  if (s.connection !== "live") return;
  unsubscribe(); // once is enough
  start();
});
