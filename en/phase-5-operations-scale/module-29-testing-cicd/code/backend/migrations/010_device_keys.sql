-- 010_device_keys.sql - the official registry of devices and their keys (Module 21). Up to Module 20, a devices row was created
-- automatically for ANY device that sent a message. From Module 21 on, a device must be registered by an admin (POST /devices);
-- messages from a device that isn't registered or whose key has been revoked are ignored by the backend.
-- Number 009 is skipped on purpose: 009_user_in_commands.sql is the Level 3 Challenge of Module 20 you may already have made.

-- A device key (32 random bytes) is shown ONCE when it is made; the database stores only its SHA-256 (64 hexadecimal
-- characters), just like a refresh token in Module 20. An ESP-NOW device (Node 2) doesn't connect to the broker, so it has no
-- key: its data is published by its linking device (Node 1).
ALTER TABLE devices
  ADD COLUMN registered_at  timestamptz,                               -- when the admin registered it; NULL = not registered
  ADD COLUMN key_hash       text CHECK (key_hash ~ '^[0-9a-f]{64}$'),  -- SHA-256 of the key that is valid now
  ADD COLUMN key_created_at timestamptz,                               -- when that key was made (registration or key rotation)
  ADD COLUMN revoked_at     timestamptz,                               -- when it was revoked; NULL = allowed to send data
  ADD COLUMN linked_via     text REFERENCES devices (device_id),       -- the device that publishes its data (Node 2 -> Node 1)
  ADD CONSTRAINT devices_key_complete CHECK ((key_hash IS NULL) = (key_created_at IS NULL)),
  ADD CONSTRAINT devices_linked_via_without_key CHECK (linked_via IS NULL OR key_hash IS NULL),
  ADD CONSTRAINT devices_not_self_linked CHECK (linked_via <> device_id),
  ADD CONSTRAINT devices_revoked_without_key CHECK (revoked_at IS NULL OR key_hash IS NULL);

-- Old rows (auto-created in Modules 17-20) stay, together with their history, but they are not registered: their new data is
-- ignored until the admin registers that device_id (their history is not lost).
