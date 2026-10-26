// socket.ts - ONE Socket.IO connection for the whole dashboard (Module 23). Created once here, outside any component,
// so StrictMode (which mounts components twice in dev mode) doesn't create a second connection.
import { useEffect } from "react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { BASE, refreshOnce } from "./api";
import { useLiveStore } from "./store";
import type { Device, DeviceStatus, FromClient, Telemetry, ToClient } from "./types";

// The address is the SAME as in api.ts (BASE): the page http://<laptop-IP>:5173 on a phone connects to http://<laptop-IP>:8080 by itself.
// withCredentials: true = bring the login cookies to another port (the twin of credentials: "include" in fetch). Without it,
// the backend answers "not logged in" even though fetch works. autoConnect: false = only connect after the login.
export const socket: Socket<ToClient, FromClient> = io(BASE, { withCredentials: true, autoConnect: false });

// Only devices whose messages the backend accepts are followed. Messages from a device whose key is revoked or that
// isn't registered are ignored by the backend (Module 21), so their events would never come.
function mayFollow(p: Device): boolean {
  return p.key === "active" || p.key === "no-key";
}

// "follow" MUST use an ack (an answer): without an answer function, the server quietly doesn't put us in that device's room.
async function follow(deviceId: string) {
  try {
    const answer = await socket.timeout(5000).emitWithAck("follow", deviceId);
    // latest = the last reading the backend remembers; null if the backend has only just started
    if (answer.ok && answer.latest) useLiveStore.getState().fillLatest(deviceId, answer.latest);
  } catch {
    // no answer within 5 seconds (the connection dropped halfway): followed again when it connects again
  }
}

// follow every device in the list. Rooms are lost every time the connection drops, so this is repeated on every "connect".
function followAll() {
  for (const p of useLiveStore.getState().devices ?? []) {
    if (mayFollow(p)) void follow(p.device_id);
  }
}

// useRealtime - called ONCE in App. While logged in: connects, restores the connection, and passes every event from the
// server on to the store. On logout: everything is removed. onSessionExpired = handleSessionExpired() from store.ts (Module 24).
export function useRealtime(loggedIn: boolean, onSessionExpired: () => void) {
  // Effect 1: the connection while logged in. The listeners are named functions, so the cleanup removes EXACTLY the same
  // function (socket.off(name) without a function would remove EVERY listener of that event, other parts' listeners too).
  useEffect(() => {
    if (!loggedIn) return;
    let ignore = false; // becomes true when the effect is cleaned up: a refresh result that arrives late is ignored
    let failStreak = 0; // how many times in a row we were refused even after a refresh

    // Renew the wristband (POST /auth/refresh) first, then connect again: the same pattern as tools/live-terminal.js.
    async function refreshThenConnect() {
      const result = await refreshOnce();
      if (ignore) return;
      if (result === false) onSessionExpired(); // refused: already logged out (maybe in another tab), or the season pass has run out
      else socket.connect(); // true = a new wristband is on; null = the backend can't serve yet (if it's down: Socket.IO keeps trying)
    }

    function onConnect() {
      failStreak = 0;
      useLiveStore.getState().setConnection("live");
      followAll();
    }
    function onDisconnect(reason: string) {
      if (reason === "io client disconnect") {
        useLiveStore.getState().setConnection("disconnected"); // we cut it ourselves (Log out): don't reconnect
        return;
      }
      useLiveStore.getState().setConnection("connecting");
      // "io server disconnect" = the server cut it ON PURPOSE: the 15-minute wristband expired, a logout in another tab, or the
      // backend was stopped gracefully. Socket.IO doesn't reconnect by itself for this reason, so we ask for it.
      // Other reasons (Wi-Fi dropped, the backend died suddenly or was restarted): Socket.IO reconnects by itself.
      if (reason === "io server disconnect") void refreshThenConnect();
    }
    function onConnectError() {
      useLiveStore.getState().setConnection("connecting");
      // socket.active = Socket.IO will still try again by itself (the backend is down, or the page's address isn't allowed)
      if (socket.active) return;
      // Refused by the Socket.IO door guard ("not logged in" or "session expired…"): the wristband expired. Refresh, then connect again.
      failStreak++;
      if (failStreak > 3) {
        useLiveStore.getState().setConnection("disconnected"); // refused again and again even after a refresh: don't loop forever
        return;
      }
      void refreshThenConnect();
    }
    function onTelemetry(deviceId: string, content: Telemetry) {
      useLiveStore.getState().receive(deviceId, content);
    }
    function onStatus(deviceId: string, status: DeviceStatus) {
      useLiveStore.getState().setStatus(deviceId, status);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("telemetry", onTelemetry);
    socket.on("status", onStatus);
    useLiveStore.getState().setConnection("connecting");
    socket.connect();
    // StrictMode in dev mode: connect, disconnect, connect again. Still only ONE connection stays alive.
    return () => {
      ignore = true;
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("telemetry", onTelemetry);
      socket.off("status", onStatus);
      socket.disconnect();
    };
  }, [loggedIn, onSessionExpired]);

  // Effect 2: follow the devices in the list, unfollow them in the cleanup. This selector returns ONE text holding the
  // device_ids separated by commas ("a4cf12e5b7c0,f00d00000001"). The same text = no change, so the effect (and App) only
  // runs again when the device list really changes, not every time a telemetry arrives.
  const idList = useLiveStore((s) => (s.devices ?? []).filter(mayFollow).map((p) => p.device_id).join(","));
  useEffect(() => {
    if (idList === "") return;
    const allIds = idList.split(",");
    // not connected yet? That's fine: onConnect follows them all as soon as it connects
    if (socket.connected) for (const id of allIds) void follow(id);
    return () => {
      if (socket.connected) for (const id of allIds) socket.emit("unfollow", id);
    };
  }, [idList]);
}
