-- 005_columnstore.sql - compress binders older than 7 days by storing them column by column: columnstore (Module 18).
-- segmentby: readings are grouped per device; orderby: inside a group, they are sorted from the newest.
-- Binders that are already compressed can still be read, added to, and changed as usual.
ALTER TABLE readings SET (
  timescaledb.enable_columnstore,
  timescaledb.segmentby = 'device_id',
  timescaledb.orderby   = 'ts DESC'
);
CALL add_columnstore_policy('readings', after => INTERVAL '7 days');
