-- 004_retensi.sql - buang bacaan mentah yang lebih tua daripada 90 hari (Modul 18).
-- TimescaleDB membuang jilid (chunk) utuh, bukan baris satu per satu: cepat, tanpa DELETE.
-- Ringkasan per jam (readings_per_jam) tidak ikut terbuang karena jendela petugasnya (3 hari) jauh lebih pendek daripada 90 hari.
SELECT add_retention_policy('readings', drop_after => INTERVAL '90 days');
