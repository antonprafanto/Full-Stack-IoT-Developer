// fleet.ts - the firmware release table (firmware), the update history (updates), and the data of the /fleet page (Module 28,
// migration 011). Every SQL query for firmware updates is here; the rules for when something may be sent are in services/ota.ts.
import { pool } from "./pool.ts";

// ---------- firmware releases ----------

export interface ReleaseRow {
  kind: "node1";
  version: string;
  size: number;
  sha256: string;
  notes: string | null;
  test: boolean;
  uploaded_by: string | null;
  created_at: Date;
  withdrawn_at: Date | null;
}

const RELEASE_COLUMNS = "kind, version, size, sha256, notes, test, uploaded_by, created_at, withdrawn_at";

// Save a new release. The result is undefined if that version ALREADY exists (a version may not be overwritten: error code 23505 = unique).
export async function saveRelease(r: Omit<ReleaseRow, "created_at" | "withdrawn_at">): Promise<ReleaseRow | undefined> {
  try {
    const result = await pool.query<ReleaseRow>(
      `INSERT INTO firmware (kind, version, size, sha256, notes, test, uploaded_by) VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${RELEASE_COLUMNS}`,
      [r.kind, r.version, r.size, r.sha256, r.notes, r.test, r.uploaded_by],
    );
    return result.rows[0];
  } catch (error) {
    if ((error as { code?: string }).code === "23505") return undefined;
    throw error;
  }
}

export async function getRelease(kind: string, version: string): Promise<ReleaseRow | undefined> {
  const result = await pool.query<ReleaseRow>(`SELECT ${RELEASE_COLUMNS} FROM firmware WHERE kind = $1 AND version = $2`, [kind, version]);
  return result.rows[0];
}

// One release + its canary summary: how many canary devices succeeded, and how many rolled back/failed, with that version.
export interface ReleaseWithCanary extends ReleaseRow {
  canary_succeeded: number;
  canary_failed: number;
}

export async function allReleases(): Promise<ReleaseWithCanary[]> {
  const result = await pool.query<ReleaseWithCanary>(
    `SELECT f.kind, f.version, f.size, f.sha256, f.notes, f.test, f.uploaded_by, f.created_at, f.withdrawn_at,
            count(u.id) FILTER (WHERE u.status = 'succeeded')::int              AS canary_succeeded,
            count(u.id) FILTER (WHERE u.status IN ('rollback', 'failed'))::int AS canary_failed
     FROM firmware f
     LEFT JOIN updates u ON u.kind = f.kind AND u.to_version = f.version AND u.canary
     GROUP BY f.kind, f.version
     ORDER BY f.kind, f.created_at`,
  );
  return result.rows;
}

// Mark a bad release as withdrawn: it isn't sent anymore and can't be downloaded anymore. undefined = it doesn't exist / already withdrawn.
export async function withdrawRelease(kind: string, version: string): Promise<ReleaseRow | undefined> {
  const result = await pool.query<ReleaseRow>(
    `UPDATE firmware SET withdrawn_at = now() WHERE kind = $1 AND version = $2 AND withdrawn_at IS NULL RETURNING ${RELEASE_COLUMNS}`,
    [kind, version],
  );
  return result.rows[0];
}

// ---------- the update history ----------

export type UpdateStatus = "sent" | "accepted" | "downloading" | "rejected" | "succeeded" | "rollback" | "failed" | "expired";
export const RUNNING_STATUSES: UpdateStatus[] = ["sent", "accepted", "downloading"];

export interface UpdateRow {
  id: string;
  device_id: string;
  kind: string;
  from_version: string | null;
  to_version: string;
  canary: boolean;
  status: UpdateStatus;
  message: string | null;
  requested_by: string | null;
  created_at: Date;
  updated_at: Date;
  finished_at: Date | null;
}

const UPDATE_COLUMNS = "id, device_id, kind, from_version, to_version, canary, status, message, requested_by, created_at, updated_at, finished_at";

// Record one update command BEFORE it is published. false = that device still has an update running (the unique index
// updates_one_running refuses the second row; code 23505).
export async function startUpdate(u: { id: string; deviceId: string; from: string | null; to: string; canary: boolean;
  requestedBy: string }): Promise<boolean> {
  try {
    await pool.query(
      "INSERT INTO updates (id, device_id, from_version, to_version, canary, requested_by) VALUES ($1, $2, $3, $4, $5, $6)",
      [u.id, u.deviceId, u.from, u.to, u.canary, u.requestedBy],
    );
    return true;
  } catch (error) {
    if ((error as { code?: string }).code === "23505") return false;
    throw error;
  }
}

// Change the status of one update, ONLY if its status is now one of `from` (for example an ack that arrives after the device
// already started downloading: "accepted" may not overwrite "downloading"). A final status fills in finished_at. The result is the
// row after the change, or undefined if nothing matched.
export async function changeUpdateStatus(id: string, deviceId: string, status: UpdateStatus, message: string | null,
  from: UpdateStatus[]): Promise<UpdateRow | undefined> {
  const result = await pool.query<UpdateRow>(
    `UPDATE updates SET status = $3, message = coalesce($4, message), updated_at = now(),
       finished_at = CASE WHEN $3 = ANY($6::text[]) THEN NULL ELSE now() END
     WHERE id = $1 AND device_id = $2 AND status = ANY($5::text[])
     RETURNING ${UPDATE_COLUMNS}`,
    [id, deviceId, status, message, from, RUNNING_STATUSES],
  );
  return result.rows[0];
}

// The result report from the device (vitals.ota). Besides an update that is still running, a report may also overwrite an
// "expired" result and a result the server only CONCLUDED: the device's own report is always more honest.
export async function reportUpdateResult(id: string, deviceId: string, status: "succeeded" | "rollback" | "failed",
  message: string | null): Promise<UpdateRow | undefined> {
  const result = await pool.query<UpdateRow>(
    `UPDATE updates SET status = $3, message = $4, updated_at = now(), finished_at = now()
     WHERE id = $1 AND device_id = $2
       AND (status IN ('sent', 'accepted', 'downloading', 'expired') OR message LIKE 'concluded by the server:%')
       AND NOT (status = $3 AND coalesce(message, '') = coalesce($4, ''))
     RETURNING ${UPDATE_COLUMNS}`,
    [id, deviceId, status, message],
  );
  return result.rows[0];
}

// Has this server ever sent an update command with that id to that device? To tell a repeated report (normal,
// repeated in up to 3 vitals) from the report of an update this dashboard NEVER ordered (an M28 verification finding).
export async function knownUpdate(id: string, deviceId: string): Promise<boolean> {
  const result = await pool.query("SELECT 1 FROM updates WHERE id = $1 AND device_id = $2", [id, deviceId]);
  return (result.rowCount ?? 0) > 0;
}

// The report got lost (vitals QoS 0)? Conclude it from ordinary vitals that carry fw: a device that STARTED AFTER its command
// was sent (an uptime smaller than the command's age) with the new version = succeeded, with another version = failed. The result is
// the concluded rows (usually 0 or 1).
export async function concludeUpdate(deviceId: string, fw: string, uptimeSeconds: number): Promise<UpdateRow[]> {
  const result = await pool.query<UpdateRow>(
    `UPDATE updates SET
       status = CASE WHEN to_version = $2 THEN 'succeeded' ELSE 'failed' END,
       message = CASE WHEN to_version = $2 THEN 'concluded by the server: started with the new version, no report'
                    ELSE 'concluded by the server: started again with ' || $2 || ' without a report (maybe a rollback)' END,
       updated_at = now(), finished_at = now()
     WHERE device_id = $1 AND status IN ('sent', 'accepted', 'downloading')
       AND extract(epoch FROM now() - created_at) > $3
     RETURNING ${UPDATE_COLUMNS}`,
    [deviceId, fw, uptimeSeconds],
  );
  return result.rows;
}

// An update with no word for more than `minutes` minutes = expired (the device died halfway, the report got lost, ...).
export async function expireUpdates(minutes: number): Promise<UpdateRow[]> {
  const result = await pool.query<UpdateRow>(
    `UPDATE updates SET status = 'expired', message = 'no word from the device', updated_at = now(), finished_at = now()
     WHERE status IN ('sent', 'accepted', 'downloading') AND created_at < now() - make_interval(mins => $1)
     RETURNING ${UPDATE_COLUMNS}`,
    [minutes],
  );
  return result.rows;
}

// The device starts downloading the firmware file (the /fw route): the update waiting for that version changes to "downloading".
export async function markDownloading(deviceId: string, version: string): Promise<UpdateRow | undefined> {
  const result = await pool.query<UpdateRow>(
    `UPDATE updates SET status = 'downloading', updated_at = now()
     WHERE device_id = $1 AND to_version = $2 AND status IN ('sent', 'accepted')
     RETURNING ${UPDATE_COLUMNS}`,
    [deviceId, version],
  );
  return result.rows[0];
}

export async function updateHistory(deviceId: string, limit = 20): Promise<UpdateRow[]> {
  const result = await pool.query<UpdateRow>(
    `SELECT ${UPDATE_COLUMNS} FROM updates WHERE device_id = $1 ORDER BY created_at DESC LIMIT $2`, [deviceId, limit]);
  return result.rows;
}

// The "update all" condition (Module 28): how many canaries succeeded and how many failed/rolled back with this version?
export async function canarySummary(kind: string, version: string): Promise<{ succeeded: number; failed: number }> {
  const result = await pool.query<{ succeeded: number; failed: number }>(
    `SELECT count(*) FILTER (WHERE status = 'succeeded')::int AS succeeded,
            count(*) FILTER (WHERE status IN ('rollback', 'failed'))::int AS failed
     FROM updates WHERE kind = $1 AND to_version = $2 AND canary`,
    [kind, version],
  );
  return result.rows[0] ?? { succeeded: 0, failed: 0 };
}

// ---------- the state per device ----------

// The firmware version reported last (telemetry or vitals). Only written when it changes or is already old.
export async function recordFwDb(deviceId: string, fw: string): Promise<void> {
  await pool.query("UPDATE devices SET fw = $2, fw_seen_at = now() WHERE device_id = $1", [deviceId, fw]);
}

export async function recordResetReasonDb(deviceId: string, reason: string): Promise<void> {
  await pool.query("UPDATE devices SET reset_reason = $2 WHERE device_id = $1", [deviceId, reason]);
}

// Mark/unmark a canary. Only locked Wi-Fi devices (not a Node 2 linked via Node 1) that are registered and not revoked;
// their kind may still be unknown (just registered, its first telemetry hasn't arrived yet). undefined = doesn't qualify.
export async function changeCanary(deviceId: string, canary: boolean): Promise<{ device_id: string; canary: boolean } | undefined> {
  const result = await pool.query<{ device_id: string; canary: boolean }>(
    `UPDATE devices SET canary = $2
     WHERE device_id = $1 AND kind <> 'node2' AND linked_via IS NULL AND registered_at IS NOT NULL AND revoked_at IS NULL
     RETURNING device_id, canary`,
    [deviceId, canary],
  );
  return result.rows[0];
}

// Set the vitals interval (seconds). The same conditions as the canary: Node 2 doesn't send vitals at all.
export async function changeVitalsInterval(deviceId: string, seconds: number):
  Promise<{ device_id: string; vitals_interval_s: number; fw: string | null } | undefined> {
  const result = await pool.query<{ device_id: string; vitals_interval_s: number; fw: string | null }>(
    `UPDATE devices SET vitals_interval_s = $2
     WHERE device_id = $1 AND kind <> 'node2' AND linked_via IS NULL AND registered_at IS NOT NULL AND revoked_at IS NULL
     RETURNING device_id, vitals_interval_s, fw`,
    [deviceId, seconds],
  );
  return result.rows[0];
}

// One row of the /fleet page: a registered device (revoked ones too) + its last health + its last update.
export interface FleetRow {
  device_id: string;
  name: string | null;
  location: string | null;
  kind: "node1" | "node2" | "unknown";
  status: string;
  last_seen: Date | null;
  linked_via: string | null;
  revoked_at: Date | null;
  canary: boolean;
  vitals_interval_s: number | null;
  fw: string | null;
  fw_seen_at: Date | null;
  reset_reason: string | null;
  health_ts: Date | null;
  rssi: number | null;
  heap_free: number | null;
  uptime_s: number | null;
  health_reset_reason: string | null;
  u_id: string | null;
  u_status: UpdateStatus | null;
  u_from: string | null;
  u_to: string | null;
  u_message: string | null;
  u_created_at: Date | null;
  u_updated_at: Date | null;
  u_finished_at: Date | null;
}

// LATERAL + LIMIT 1 uses the indexes (device_id, ts) and (device_id, created_at): one small step per device.
export async function fleetData(): Promise<FleetRow[]> {
  const result = await pool.query<FleetRow>(
    `SELECT d.device_id, d.name, d.location, d.kind, d.status, d.last_seen, d.linked_via, d.revoked_at, d.canary,
            d.vitals_interval_s, d.fw, d.fw_seen_at, d.reset_reason,
            h.ts AS health_ts, h.rssi, h.heap_free, h.uptime_s, h.reset_reason AS health_reset_reason,
            u.id AS u_id, u.status AS u_status, u.from_version AS u_from, u.to_version AS u_to, u.message AS u_message,
            u.created_at AS u_created_at, u.updated_at AS u_updated_at, u.finished_at AS u_finished_at
     FROM devices d
     LEFT JOIN LATERAL (SELECT ts, rssi, heap_free, uptime_s, reset_reason FROM device_health
                        WHERE device_id = d.device_id ORDER BY ts DESC LIMIT 1) h ON true
     LEFT JOIN LATERAL (SELECT id, status, from_version, to_version, message, created_at, updated_at, finished_at FROM updates
                        WHERE device_id = d.device_id ORDER BY created_at DESC LIMIT 1) u ON true
     WHERE d.registered_at IS NOT NULL
     ORDER BY d.device_id`,
  );
  return result.rows;
}

// The candidates of "update canary" / "update all": every registered Node 1 (revoked ones too, so their reason shows).
export interface UpdateCandidate {
  device_id: string;
  kind: "node1" | "node2" | "unknown";
  registered_at: Date | null;
  revoked_at: Date | null;
  status: string;
  fw: string | null;
  canary: boolean;
  running: boolean;
}

export async function updateCandidates(): Promise<UpdateCandidate[]> {
  const result = await pool.query<UpdateCandidate>(
    `SELECT d.device_id, d.kind, d.registered_at, d.revoked_at, d.status, d.fw, d.canary,
            EXISTS (SELECT 1 FROM updates u WHERE u.device_id = d.device_id
                    AND u.status IN ('sent', 'accepted', 'downloading')) AS running
     FROM devices d
     WHERE d.registered_at IS NOT NULL AND d.kind <> 'node2'
     ORDER BY d.device_id`,
  );
  return result.rows;
}

// One device for an update command one at a time (the route POST /devices/:id/update).
export async function oneCandidate(deviceId: string): Promise<UpdateCandidate | undefined> {
  const result = await pool.query<UpdateCandidate>(
    `SELECT d.device_id, d.kind, d.registered_at, d.revoked_at, d.status, d.fw, d.canary,
            EXISTS (SELECT 1 FROM updates u WHERE u.device_id = d.device_id
                    AND u.status IN ('sent', 'accepted', 'downloading')) AS running
     FROM devices d WHERE d.device_id = $1`,
    [deviceId],
  );
  return result.rows[0];
}
