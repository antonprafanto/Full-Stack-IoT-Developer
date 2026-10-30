// BridgeBanner.tsx - Module 27 Challenge 3: the "Home gateway disconnected" banner under the dashboard's header.
// When the home internet is down, the devices still show "Online" on the VPS dashboard (their last status is retained, and their
// will is on the Pi's broker, not on the VPS). This banner says that the numbers from home are being held, based on the bridge
// status message the backend passes on (the Socket.IO event "bridge"). Its listener is added here and removed again in the
// cleanup, with the same function (the Module 23 rule); the socket stays one, from socket.ts.
import { useEffect, useState } from "react";
import { socket } from "../socket";
import type { BridgeState } from "../types";
import { wibTime } from "../time";

export default function BridgeBanner() {
  // bridge name -> its last state. The server sends every state it knows each time a live connection is made.
  const [bridges, setBridges] = useState<Record<string, BridgeState>>({});

  useEffect(() => {
    function onBridge(name: string, state: BridgeState) {
      setBridges((old) => ({ ...old, [name]: state }));
    }
    socket.on("bridge", onBridge);
    return () => {
      socket.off("bridge", onBridge);
    };
  }, []);

  const down = Object.entries(bridges).filter(([, s]) => !s.connected);
  if (down.length === 0) return null;
  return (
    // role="status": a screen reader reads this banner out as soon as it appears, without taking the focus
    <div role="status" className="border-b border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950">
      {down.map(([name, s]) => (
        <p key={name} className="mx-auto max-w-3xl px-4 py-2 text-sm text-amber-900 dark:text-amber-100">
          <strong>Home gateway disconnected</strong>
          {s.since === null ? "" : ` since ${wibTime(s.since)}`} ({name}). The status and numbers of the devices at home may be stale; the data
          held at the gateway is sent by itself as soon as the connection is back.
        </p>
      ))}
    </div>
  );
}
