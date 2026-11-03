// claims.ts - the claim_codes table (Module 28, migration 011): single-use codes made by the admin that a new device exchanges
// for its device key. The database only stores the code's SHA-256 (like device keys, Module 21).
import { withTransaction, pool } from "./pool.ts";

// Save a new code. The result is the expiry time by the database clock.
export async function saveClaimCode(codeHash: string, name: string | null, location: string | null, createdBy: string,
  minutes: number): Promise<Date> {
  const result = await pool.query<{ expires_at: Date }>(
    `INSERT INTO claim_codes (code_hash, name, location, created_by, expires_at) VALUES ($1, $2, $3, $4, now() + make_interval(mins => $5))
     RETURNING expires_at`,
    [codeHash, name, location, createdBy, minutes],
  );
  return result.rows[0].expires_at;
}

// The list of codes for the /fleet page (WITHOUT the code: a code is shown only once, when it is made), newest first.
export interface CodeRow {
  name: string | null;
  location: string | null;
  created_by: string | null;
  created_at: Date;
  expires_at: Date;
  used_at: Date | null;
  device_id: string | null;
}

export async function listClaimCodes(limit = 20): Promise<CodeRow[]> {
  const result = await pool.query<CodeRow>(
    "SELECT name, location, created_by, created_at, expires_at, used_at, device_id FROM claim_codes ORDER BY created_at DESC LIMIT $1", [limit]);
  return result.rows;
}

export type ClaimResult =
  | { status: "succeeded"; name: string | null; location: string | null }
  | { status: "wrong-code" } // wrong, expired, or already used: one answer for all three
  | { status: "still-active" }; // that device_id is registered and not revoked (or an ESP-NOW device)

// Exchange a code for a registration, in ONE transaction:
//   1. lock the code's row (FOR UPDATE): two devices using the same code at the same time can't both succeed
//   2. register the device: a new one, an old Module 17-20 row, or a device that was REVOKED (a code from the admin = permission
//      to bring it back to life). A device that is still active CAN'T be claimed: its identity can't be taken over
//   3. mark the code used
//   4. atBroker: create the broker account (dynamic security). Fails = ROLLBACK: the code is NOT used up, the device may try again
export async function redeemClaimCode(codeHash: string, deviceId: string, keyHash: string,
  atBroker: () => Promise<void>): Promise<ClaimResult> {
  return withTransaction(async (client) => {
    const code = await client.query<{ name: string | null; location: string | null }>(
      "SELECT name, location FROM claim_codes WHERE code_hash = $1 AND used_at IS NULL AND expires_at > now() FOR UPDATE",
      [codeHash],
    );
    if (code.rows[0] === undefined) return { status: "wrong-code" } as const;
    const { name, location } = code.rows[0];
    const registration = await client.query(
      `INSERT INTO devices (device_id, name, location, registered_at, key_hash, key_created_at) VALUES ($1, $2, $3, now(), $4, now())
       ON CONFLICT (device_id) DO UPDATE SET name = coalesce($2, devices.name), location = coalesce($3, devices.location),
         registered_at = now(), key_hash = $4, key_created_at = now(), revoked_at = NULL
       WHERE devices.linked_via IS NULL AND (devices.registered_at IS NULL OR devices.revoked_at IS NOT NULL)
       RETURNING device_id`,
      [deviceId, name, location, keyHash],
    );
    if (registration.rowCount === 0) return { status: "still-active" } as const; // nothing changed: the transaction stays tidy
    await client.query("UPDATE claim_codes SET used_at = now(), device_id = $2 WHERE code_hash = $1", [codeHash, deviceId]);
    await atBroker();
    return { status: "succeeded", name, location } as const;
  });
}
