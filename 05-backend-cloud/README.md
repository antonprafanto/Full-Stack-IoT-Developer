# 💻 05 - Distributed Ingestion, Backend & Time-Series Data Lake

Folder ini berisi arsitektur backend terdistribusi, message streaming, database multi-tenant, dan containerization (**Fase 8**):

## 📂 Struktur Direktori:
- `docker-compose/` : Orkestrasi full-stack (EMQX, Kafka, PostgreSQL, TimescaleDB, Redis, Grafana).
- `fastapi-ingestion/` : Worker ingestion service berbasis async Python (FastAPI + Kafka Consumer).
- `db-migrations/` : Skema SQL PostgreSQL (Multi-Tenant Row-Level Security) & TimescaleDB Hypertables.
- `s3-parquet-archival/` : Pipeline ekspor otomatis data historis lama ke S3/MinIO dalam format biner Apache Parquet.

---

## 🎯 Target Pembelajaran:
1. Membangun ingestion pipeline berkecepatan tinggi yang mampu menangani puluhan ribu data per detik.
2. Mendesain database multi-tenant yang aman dan terisolasi antar klien.
3. Mengonfigurasi *Continuous Aggregates* & *Data Retention Policies* pada TimescaleDB.
