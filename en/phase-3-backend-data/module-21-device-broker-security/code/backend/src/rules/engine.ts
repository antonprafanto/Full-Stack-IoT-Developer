// engine.ts - the "brain" of the automation rules (Module 19) as PURE functions: it reads no clock, database, or MQTT.
// Everything it needs comes in through the arguments, so the same input always gives the same result (easy to test).
import type { ThresholdCondition } from "../schemas/rules.ts";

// The memory of one threshold rule from reading to reading.
export interface Memory {
  active: boolean; // is the rule "on" right now (for example, the fan should be on)?
  since: number | null; // when the readings started to be above the on threshold (milliseconds); null = not waiting
  last: number | null; // when the last reading was evaluated (milliseconds)
}

export const INITIAL_MEMORY: Memory = { active: false, since: null, last: null };
export const MAX_GAP_MS = 60_000; // readings more than 60 seconds apart: the "for" count starts again from zero

export type Decision = "turn-on" | "turn-off" | null; // null = nothing needs to be done

// Evaluate one reading. now = the time the reading arrived (milliseconds, like Date.now()), given by the caller.
// A decision only comes out when the rule CHANGES state (at the edge), not at every reading.
export function evaluateThreshold(c: ThresholdCondition, memory: Memory, value: number | null, now: number):
  { memory: Memory; decision: Decision } {
  const interrupted = memory.last !== null && now - memory.last > MAX_GAP_MS;
  const base: Memory = { ...memory, last: now, since: interrupted ? null : memory.since };
  if (value === null) { // the sensor couldn't be read: decide nothing, and the "for" count starts again
    return { memory: { ...base, since: null }, decision: null };
  }
  if (!base.active) {
    if (value <= c.on_above) return { memory: { ...base, since: null }, decision: null }; // not hot yet
    const since = base.since ?? now; // the first hot reading starts the count
    if (now - since >= c.for_seconds * 1000) {
      return { memory: { ...base, active: true, since: null }, decision: "turn-on" };
    }
    return { memory: { ...base, since }, decision: null }; // hot, but not long enough yet: waiting
  }
  if (value < c.off_below) return { memory: { ...base, active: false, since: null }, decision: "turn-off" };
  return { memory: base, decision: null }; // still above the off threshold (inside the hysteresis gap): stays on
}

// Notification debouncing: notify when the situation changes; while still in danger, remind at most every 30 minutes.
export type Situation = "safe" | "danger";

export interface NotifyRecord {
  situation: Situation; // the situation that was notified last
  lastSent: number | null; // when the last message was sent (milliseconds)
}

export const INITIAL_RECORD: NotifyRecord = { situation: "safe", lastSent: null };
export const REMINDER_MS = 30 * 60_000;

export function shouldNotify(r: NotifyRecord, current: Situation, now: number): { send: boolean; record: NotifyRecord } {
  if (current !== r.situation) return { send: true, record: { situation: current, lastSent: now } }; // changed
  if (current === "danger" && r.lastSent !== null && now - r.lastSent >= REMINDER_MS) {
    return { send: true, record: { ...r, lastSent: now } }; // reminder
  }
  return { send: false, record: r }; // quiet
}
