// devices.ts - the official device registry in the devices table (Module 21, migration 010): registration by an admin, key
// rotation, revocation. The key fingerprint (key_hash) is ONLY WRITTEN from this file; the device list never reads it.
// Module 25: the device list also carries the map point (lat, lng), and an admin can move that point (setDeviceLocation).
import { pool } from "./pool.ts";

// one row of the device registry as GET /devices shows it (without the key fingerprint)
export interface DeviceRow {
  device_id: string;
  kind: "node1" | "node2" | "unknown";
  name: string | null;
  location: string | null;
  lat: number | null; // Module 25: latitude of the point on the map, decimal degrees; null = not set yet
  lng: number | null; // Module 25: longitude; the column has existed since migration 001, but it's only read from now on
  status: string;
  last_seen: Date | null;
  registered_at: Date | null;
  key_created_at: Date | null;
  revoked_at: Date | null;
  linked_via: string | null;
}

const COLUMNS = "device_id, kind, name, location, lat, lng, status, last_seen, registered_at, key_created_at, revoked_at, linked_via";

export async function allDevicesDb(): Promise<DeviceRow[]> {
  const result = await pool.query<DeviceRow>(`SELECT ${COLUMNS} FROM devices ORDER BY device_id`);
  return result.rows;
}

// Register a device. A device_id that already has an old row (auto-created in Modules 17-20) is "claimed": its history stays.
// The result is undefined if that device_id is ALREADY registered (use key rotation, not a second registration).
export async function registerDevice(deviceId: string, name: string | null, location: string | null,
  linkedVia: string | null, keyHash: string | null): Promise<DeviceRow | undefined> {
  const result = await pool.query<DeviceRow>(
    `INSERT INTO devices (device_id, kind, name, location, linked_via, registered_at, key_hash, key_created_at)
     VALUES ($1, CASE WHEN $4::text IS NULL THEN 'unknown' ELSE 'node2' END, $2, $3, $4, now(), $5,
             CASE WHEN $5::text IS NULL THEN NULL ELSE now() END)
     ON CONFLICT (device_id) DO UPDATE SET
       name = coalesce($2, devices.name),
       location = coalesce($3, devices.location),
       kind = CASE WHEN $4::text IS NULL THEN devices.kind ELSE 'node2' END,
       linked_via = $4, registered_at = now(), key_hash = $5, key_created_at = EXCLUDED.key_created_at, revoked_at = NULL
     WHERE devices.registered_at IS NULL
     RETURNING ${COLUMNS}`,
    [deviceId, name, location, linkedVia, keyHash],
  );
  return result.rows[0];
}

// A new key for a registered device that connects to the broker (also brings a revoked device back to life).
export async function rotateDeviceKey(deviceId: string, keyHash: string): Promise<DeviceRow | undefined> {
  const result = await pool.query<DeviceRow>(
    `UPDATE devices SET key_hash = $2, key_created_at = now(), revoked_at = NULL
     WHERE device_id = $1 AND registered_at IS NOT NULL AND linked_via IS NULL
     RETURNING ${COLUMNS}`,
    [deviceId, keyHash],
  );
  return result.rows[0];
}

// Revoke: the key fingerprint is removed, the revocation time is recorded. The result is undefined if it isn't registered or already revoked.
export async function revokeDevice(deviceId: string): Promise<DeviceRow | undefined> {
  const result = await pool.query<DeviceRow>(
    `UPDATE devices SET key_hash = NULL, key_created_at = NULL, revoked_at = now()
     WHERE device_id = $1 AND registered_at IS NOT NULL AND revoked_at IS NULL
     RETURNING ${COLUMNS}`,
    [deviceId],
  );
  return result.rows[0];
}

// Module 25: move a device's point on the map. lat and lng are always written as a pair; null and null = the point is removed.
// The location text ("living room") is not changed. The result is undefined if that device_id isn't in the devices table.
export async function setDeviceLocation(deviceId: string, lat: number | null, lng: number | null): Promise<DeviceRow | undefined> {
  const result = await pool.query<DeviceRow>(
    `UPDATE devices SET lat = $2, lng = $3 WHERE device_id = $1 RETURNING ${COLUMNS}`,
    [deviceId, lat, lng],
  );
  return result.rows[0];
}
