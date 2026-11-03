-- 008_login_and_sessions.sql - accounts can log in (Module 20): the password fingerprint (bcrypt hash) in the users table,
-- and a sessions table for refresh tokens. One sessions row = one login that is still active in one browser or device.

-- The users table has been ready since Module 17 (migration 001), but it has no passwords yet. Only their fingerprint is
-- stored (a bcrypt hash, 60 characters, starting with $2b$). An account whose password_hash is empty (NULL) can't log in.
-- Emails are always stored in lowercase, so Budi@Home.test and budi@home.test are the same account.
ALTER TABLE users
  ADD COLUMN password_hash       text CHECK (password_hash ~ '^\$2[aby]\$\d\d\$[./A-Za-z0-9]{53}$'),
  ADD COLUMN password_changed_at timestamptz,
  ADD CONSTRAINT users_email_lowercase CHECK (email = lower(email));

-- Logins that are still active. The original refresh token (32 random bytes) only lives in the browser's cookie; the
-- database stores its SHA-256, so someone who steals the database content can't use it. Every POST /auth/refresh swaps
-- the old token for a new one (rotation): token_hash is replaced, and the previous token moves to previous_token_hash. If
-- that hash is used again, the token was most likely stolen, so the session is deleted (whoever uses it must log in again).
CREATE TABLE sessions (
  id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id             integer NOT NULL REFERENCES users (id) ON DELETE CASCADE, -- account deleted = sessions deleted too
  token_hash          text NOT NULL UNIQUE,                                      -- SHA-256 of the refresh token valid now
  previous_token_hash text,                                                      -- SHA-256 of the previous refresh token
  created_at          timestamptz NOT NULL DEFAULT now(),                        -- when the login happened
  updated_at          timestamptz NOT NULL DEFAULT now(),                        -- when it was last refreshed (rotation)
  expires_at          timestamptz NOT NULL                                       -- 7 days after login: then log in again
);
CREATE INDEX sessions_user_idx ON sessions (user_id);
CREATE INDEX sessions_previous_token_hash_idx ON sessions (previous_token_hash);
