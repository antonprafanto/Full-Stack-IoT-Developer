-- 005_columnstore.sql - padatkan jilid yang lebih tua daripada 7 hari dengan menyimpannya per kolom: columnstore (Modul 18).
-- segmentby: bacaan dikelompokkan per perangkat; orderby: di dalam kelompok, diurutkan dari yang terbaru.
-- Jilid yang sudah dipadatkan tetap bisa dibaca, ditambah, dan diubah seperti biasa.
ALTER TABLE readings SET (
  timescaledb.enable_columnstore,
  timescaledb.segmentby = 'device_id',
  timescaledb.orderby   = 'ts DESC'
);
CALL add_columnstore_policy('readings', after => INTERVAL '7 days');
