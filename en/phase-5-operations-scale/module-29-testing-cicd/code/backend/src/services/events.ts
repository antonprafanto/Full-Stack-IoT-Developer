// events.ts - the event log (Module 19): everything a human needs to know ("who turned on what, and when")
// is written to the events table, then broadcast to every Socket.IO client as the "event" event.
import { saveEvent } from "../db/archive.ts";
import type { NewEvent } from "../db/archive.ts";
import { broadcastEvent } from "./realtime.ts";
import { log } from "./log.ts";

export function recordEvent(event: NewEvent): void {
  saveEvent(event)
    .then((row) => broadcastEvent(row))
    .catch((error) => log.error(`couldn't record event "${event.message}": ${(error as Error).message}`));
}
