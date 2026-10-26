// FirstButton.tsx - Module 24 Quick Win: ONE temporary button that tells the backend to turn the lamp on.
// No new packages: only a fetch POST /devices/:id/command, then the backend's answer is written as it is under the button.
// Admin account: 200 + the ack from the device. Viewer account: 403, because the backend guards the roles, not the button.
// When you're done trying, DELETE this file and the two FirstButton lines in DeviceDetails.tsx. The real button
// (with "Waiting for device confirmation…") is made in Practice 5.
import { useState } from "react";
import { BASE } from "../api";

export default function FirstButton({ deviceId }: { deviceId: string }) {
  const [result, setResult] = useState(""); // the backend's answer, written as it is

  async function turnOnLamp() {
    setResult("Sending… (the backend waits for the device's answer, at most 5 seconds)");
    try {
      const res = await fetch(BASE + "/devices/" + deviceId + "/command", {
        method: "POST",
        credentials: "include", // bring the login cookie: that's how the backend knows who we are and what our role is
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "lamp", value: true }), // the same command as Bruno "lamp on"
      });
      // 401 = the 15-minute wristband has expired (this test button doesn't renew it): reload the page, then try again
      setResult(res.status + " " + (await res.text()));
    } catch {
      setResult("Can't reach the backend: is it running?");
    }
  }

  return (
    <div className="mt-4 rounded-lg border border-dashed border-amber-500 bg-white p-3 dark:bg-slate-800">
      <button
        type="button"
        onClick={turnOnLamp}
        className="min-h-11 rounded-lg bg-amber-400 px-4 font-medium text-slate-900 hover:bg-amber-300"
      >
        Turn on the lamp (test)
      </button>
      <p className="mt-2 font-mono text-xs break-all text-slate-700 dark:text-slate-200">{result}</p>
    </div>
  );
}
