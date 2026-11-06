// fleet.ts - helpers of the Fleet screen (Module 28): texts and colors for the update statuses and the restart reasons, how to
// write a file size, the Wi-Fi signal, RAM, and uptime, and why the Update button can't be used yet.
// It holds ordinary functions and tables (not components), so the device card and the release list stay short.
import { ApiError } from "./api";
import { toast } from "./toast";
import { handleSessionExpired } from "./store";
import type { FleetRow, Update, ResetReason, UpdateStatus, DeviceStatus } from "./types";

// One program shelf (app0 or app1) of the Minimal SPIFFS scheme (Module 10): 0x1E0000 = 1,966,080 bytes. A bigger firmware
// file doesn't fit the spare shelf, so the backend refuses it (400); this screen refuses it first, before it is uploaded.
export const PROGRAM_SHELF = 1_966_080;

// The Tailwind classes are written WHOLE (not joined), as in Badge.tsx: Tailwind only makes classes that are written in full.
const BLUE = "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100";
const GREEN = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
const YELLOW = "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100";
const RED = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
const GRAY = "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200";

// Update statuses: a color ALWAYS comes with text (still readable for people who find colors hard to tell apart).
export const UPDATE_TEXT: Record<UpdateStatus, { text: string; color: string }> = {
  sent: { text: "sent, waiting for the device", color: BLUE },
  accepted: { text: "accepted by the device", color: BLUE }, // ack = the command ACCEPTED, not finished yet
  downloading: { text: "downloading", color: BLUE },
  succeeded: { text: "succeeded", color: GREEN },
  rollback: { text: "back to the old version (rollback)", color: YELLOW }, // the new firmware failed, the device is safe
  failed: { text: "failed", color: RED },
  rejected: { text: "rejected by the device", color: YELLOW },
  expired: { text: "expired (no word)", color: GRAY },
};

// the three statuses that mean "still running": meanwhile a second update command for the same device is refused (409)
export function inProgress(u: Update | null): boolean {
  return u !== null && (u.status === "sent" || u.status === "accepted" || u.status === "downloading");
}

// Why the device started the last time (contract 1.6 section 6). Red = something is wrong in the firmware; yellow = the power supply.
export const RESET_MEANINGS: Record<ResetReason, { meaning: string; color: string }> = {
  POWERON: { meaning: "power just came on or the EN button", color: GRAY },
  BROWNOUT: { meaning: "the voltage dipped: check the power supply", color: YELLOW },
  SW: { meaning: "restarted by the program (update, rollback, restart)", color: BLUE },
  PANIC: { meaning: "the program crashed", color: RED },
  WDT: { meaning: "the program got stuck (watchdog)", color: RED },
  DEEPSLEEP: { meaning: "woke up from deep sleep", color: GRAY },
  UNKNOWN: { meaning: "another reason", color: GRAY },
};

const NUMBER = new Intl.NumberFormat("en-US"); // 1234567 -> "1,234,567"

// "1,234,567 bytes (63% of a shelf)": a firmware file's size compared with one program shelf
export function sizeText(bytes: number): string {
  return NUMBER.format(bytes) + " bytes (" + Math.round((bytes / PROGRAM_SHELF) * 100) + "% of a shelf)";
}

// the Wi-Fi signal strength, with the categories of the Module 10 RSSI table (Concept 2)
export function signalText(rssi: number): string {
  let category = "very weak";
  if (rssi >= -55) category = "very strong";
  else if (rssi >= -67) category = "strong";
  else if (rssi >= -75) category = "fair";
  else if (rssi >= -85) category = "weak";
  return rssi + " dBm (" + category + ")";
}

// free RAM: bytes -> KB (1 KB = 1,024 bytes, the way ESP-IDF counts)
export function ramText(bytes: number): string {
  return NUMBER.format(Math.round(bytes / 1024)) + " KB free";
}

// uptime: 93784 seconds -> "1 d 2 h"; only the two biggest units, to keep it short
export function uptimeText(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return days + " d " + hours + " h";
  if (hours > 0) return hours + " h " + minutes + " min";
  if (minutes > 0) return minutes + " min";
  return seconds + " s";
}

// Why the Update button of ONE device can't be used yet (null = it can). The server checks the same things (409), and
// more (the same version, a downgrade, a withdrawn release); here only what is visible before the button is tapped, like
// whyDisabled() in DeviceDetails (Module 24). status and update = the LIVE values from the store, not from GET /fleet.
export function cannotUpdateReason(
  d: FleetRow,
  status: DeviceStatus,
  update: Update | null,
  otaReady: boolean,
  hasRelease: boolean,
): string | null {
  if (d.key === "revoked") return "This device has been deactivated.";
  if (d.kind === "node2") return "Node 2 (ESP-NOW) can't be updated over the air: update it by cable.";
  if (d.kind !== "node1") return "Device kind not known yet: wait for its first message.";
  if (!otaReady) return "SERVER_URL in the server's .env isn't set: the devices don't know where to download firmware from.";
  if (!hasRelease) return "No firmware uploaded yet.";
  if (inProgress(update)) return "The previous update is still running.";
  if (status !== "online") return "The device isn't online: update commands are only sent to online devices (not queued).";
  return null;
}

// The error sentence of a fleet button, or null if the session expired (401, and the refresh failed too: back to the Log in screen).
// Its message comes from the backend (ApiError), for example "device is offline: update commands are only sent to online devices",
// or the 503 of Deactivate "not saved in the database yet ... repeat this step in a moment".
export function errorMessage(err: unknown, fallback: string): string | null {
  if (err instanceof ApiError && err.code === 401) {
    handleSessionExpired();
    return null;
  }
  return err instanceof ApiError ? err.message : fallback;
}

// An error becomes a red toast (4 seconds). Used by Create claim code. The buttons on the device card and the release card use
// ErrorBox (it stays until Close), because their messages can be long and important.
export function reportError(err: unknown, fallback: string) {
  const message = errorMessage(err, fallback);
  if (message !== null) toast(message, "error");
}
