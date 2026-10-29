-- fingerprint.sql - the Mini Smart Home history "fingerprint" (Module 26): one row of numbers that proves the history
-- in the database was NOT lost and did NOT change after the move into Docker Compose (Practices 1 and 4) or after
-- "docker compose down" then "up" (Practice 8). Based on the Module 18 Practice 7.2 query, plus the number of accounts and devices.
--
-- Run it BEFORE and AFTER, with the backend and the simulator stopped (no new readings in between), from the project root.
-- Save its output to a file, then compare:
--   Linux, macOS, Pi (bash/zsh):
--     docker compose exec -T db psql -U postgres -d smarthome < scripts/fingerprint.sql
--   PowerShell (Windows; not tested by the author):
--     Get-Content scripts/fingerprint.sql | docker compose exec -T db psql -U postgres -d smarthome
--   Before Module 26 (the old container smarthome-db): replace "docker compose exec -T db" with "docker exec -i smarthome-db".
-- (-T / -i = the content of this file is sent to psql through standard input, without a terminal screen in the container.)
--
-- What decides: the readings and fingerprint columns MUST be exactly the same (accounts and devices too). The summaries column may
-- differ without any data being lost: a TimescaleDB background job (see the jobs column) can summarize the hourly summary
-- book again between two measurements.
SELECT (SELECT count(*) FROM readings) AS readings,
       (SELECT md5(string_agg(md5(r::text), '' ORDER BY r.device_id, r.ts)) FROM readings AS r) AS fingerprint,
       (SELECT count(*) FROM readings_hourly) AS summaries,
       (SELECT count(*) FROM show_chunks('readings')) AS chunks,
       (SELECT count(*) FROM timescaledb_information.jobs WHERE job_id >= 1000) AS jobs,
       (SELECT count(*) FROM users) AS accounts,
       (SELECT count(*) FROM devices) AS devices;
