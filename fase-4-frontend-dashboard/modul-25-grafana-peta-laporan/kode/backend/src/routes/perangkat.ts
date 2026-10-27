// perangkat.ts - rute /devices: daftar perangkat, bacaan terbaru, riwayat dari database (mentah atau ringkasan),
// perintah, dan keadaan aktuator (desired/reported, Modul 19). Modul 21: daftar resmi perangkat (registrasi, ganti kunci,
// cabut kunci); GET /devices kini dibaca dari database. Modul 25: GET /devices membawa titik peta (lat, lng), dan admin
// memindahkan titik itu lewat PUT /devices/:id/lokasi.
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { Ack, DeviceId, Keadaan, PerintahSet, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/kontrak.ts";
import { cariPerangkat } from "../services/gudang.ts";
import { cabutPerangkat, daftarkanPerangkat, gantiKunciPerangkat, semuaPerangkatDb, ubahLokasi } from "../db/perangkat.ts";
import type { BarisPerangkat } from "../db/perangkat.ts";
import { buatKunci, hashKunci } from "../auth/kunci.ts";
import { catatDicabut, catatTerdaftar, izinPerangkat } from "../services/daftar.ts";
import { keadaanPerangkat, perintahkan } from "../services/perintah.ts";
import { ambilRingkasan, ambilRiwayat, waktuKontrak } from "../db/arsip.ts";

const MENIT = 60 * 1000; // dalam milidetik, seperti Date.getTime()
const JAM = 60 * MENIT;
const HARI = 24 * JAM;
const BATAS_EMBER = 1000; // paling banyak 1.000 ember (titik grafik) per permintaan

// Kamus ember: lebar satu ember, rentang bawaan kalau from tidak diisi, dan geseran supaya hari dimulai 00.00 WIB.
const EMBER = {
  "15m": { lebar: 15 * MENIT, bawaan: HARI, geser: 0 },
  "1h": { lebar: JAM, bawaan: 7 * HARI, geser: 0 },
  "1d": { lebar: HARI, bawaan: 30 * HARI, geser: 7 * JAM }, // WIB = UTC + 7 jam
};

// Rentang yang sebenarnya ditanyakan. to kosong = sekarang. from kosong = 1 jam sebelum to (bacaan mentah) atau
// rentang bawaan embernya. Dengan bucket, awal rentang dibulatkan ke bawah ke awal ember supaya ember pertama utuh.
function hitungRentang(q: { from?: string; to?: string; bucket?: keyof typeof EMBER }) {
  const sampai = q.to ? new Date(q.to) : new Date();
  if (q.bucket === undefined) {
    return { dari: q.from ? new Date(q.from) : new Date(sampai.getTime() - JAM), sampai };
  }
  const { lebar, bawaan, geser } = EMBER[q.bucket];
  const awal = q.from ? new Date(q.from).getTime() : sampai.getTime() - bawaan;
  return { dari: new Date(Math.floor((awal + geser) / lebar) * lebar - geser), sampai }; // misalnya 10.37 -> 10.30
}

const Galat = z.object({ pesan: z.string() });
const Jenis = z.enum(["node1", "node2", "belum-diketahui"]);
const Ember = z.enum(["15m", "1h", "1d"]);
const ParamId = z.object({ id: DeviceId.describe("device_id perangkat, misalnya a4cf12e5b7c0") });
const Rentang = z.object({
  from: z.iso.datetime({ offset: true }).optional()
    .describe("awal rentang, misalnya 2026-10-20T10:00:00+07:00 (bawaan: 1 jam sebelum to; dengan bucket: 1, 7, atau 30 hari)"),
  to: z.iso.datetime({ offset: true }).optional().describe("akhir rentang, tidak ikut dihitung (bawaan: sekarang)"),
  bucket: Ember.optional()
    .describe("ringkas per 15 menit (15m), per jam (1h), atau per hari WIB (1d); tanpa bucket = bacaan mentah"),
}).refine((r) => !r.from || !r.to || new Date(r.from) < new Date(r.to), { // rentang terbalik ditolak dengan kode 400
  message: "harus lebih akhir daripada from", path: ["to"],
  when: (hasil) => hasil.issues.length === 0, // urutan diperiksa hanya kalau from dan to sudah lolos pemeriksaan format
}).refine((r) => { // ringkasan dengan terlalu banyak ember juga ditolak dengan kode 400
  if (r.bucket === undefined) return true; // bacaan mentah sudah dibatasi 1.000 bacaan oleh ambilRiwayat
  const { dari, sampai } = hitungRentang(r);
  return Math.ceil((sampai.getTime() - dari.getTime()) / EMBER[r.bucket].lebar) <= BATAS_EMBER;
}, {
  message: `rentang terlalu panjang: paling banyak ${BATAS_EMBER} ember (15m sekitar 10 hari, 1h sekitar 41 hari, `
    + "1d sekitar 2,7 tahun)",
  path: ["from"],
  when: (hasil) => hasil.issues.length === 0,
});
const angka = z.number().nullable(); // kolom yang tidak dimiliki perangkat berisi null
const Bacaan = z.object({
  ts: z.string(), fw: z.string(), suhu: angka, kelembapan: angka, cahaya: angka, tanah: angka, gerak: z.boolean().nullable(),
  level_air: angka, tekanan: angka, suhu_tanah: angka, baterai: angka, tanah_rs485: angka, ec: angka,
});
const TitikRingkasan = z.object({
  waktu: z.string(), suhu_rata: angka, suhu_min: angka, suhu_maks: angka, kelembapan_rata: angka, tanah_rata: angka,
  cahaya_rata: angka, jumlah_bacaan: z.number(),
});

// Modul 21: satu baris daftar perangkat. kunci = keadaan kuncinya, bukan kuncinya (database tidak menyimpan kunci).
const Perangkat = z.object({
  device_id: z.string(),
  nama: z.string().nullable(),
  lokasi: z.string().nullable(),
  lat: z.number().nullable().describe("Modul 25: lintang titik perangkat di peta (derajat desimal); null = belum diisi"),
  lng: z.number().nullable().describe("Modul 25: bujur titik perangkat di peta (derajat desimal); null = belum diisi"),
  jenis: Jenis,
  status: z.string().describe("online, offline, offline-mode, atau belum-diketahui (status MQTT terakhir)"),
  terakhir_dilihat: z.string().nullable().describe("waktu server saat pesan terakhir perangkat ini tiba"),
  kunci: z.enum(["aktif", "dicabut", "tanpa-kunci", "belum-terdaftar"])
    .describe("aktif = boleh mengirim data; tanpa-kunci = perangkat ESP-NOW lewat penghubung; belum-terdaftar = baris lama"),
  terdaftar: z.string().nullable().describe("kapan didaftarkan admin"),
  kunci_dibuat: z.string().nullable().describe("kapan kunci yang berlaku sekarang dibuat"),
  dicabut: z.string().nullable().describe("kapan kuncinya dicabut"),
  penghubung: z.string().nullable().describe("perangkat ESP-NOW: device_id yang menerbitkan datanya"),
});
const Registrasi = z.strictObject({
  device_id: DeviceId.describe("device_id perangkat (12 digit heksadesimal huruf kecil dari alamat MAC), misalnya a4cf12e5b7c0"),
  nama: z.string().min(1).max(60).optional().describe("nama yang mudah diingat, misalnya Node 1 ruang tamu"),
  lokasi: z.string().min(1).max(60).optional().describe("misalnya ruang tamu"),
  penghubung: DeviceId.optional()
    .describe("hanya untuk perangkat ESP-NOW (Node 2): device_id Node 1 yang menerbitkan datanya; perangkat ini tidak diberi kunci"),
});
// Modul 25: isi PUT /devices/:id/lokasi. Angka dengan TITIK desimal (JSON tidak mengenal koma desimal): "-6,2" adalah teks,
// jadi ditolak 400. Rentangnya sama dengan CHECK di migrasi 001. z.number() Zod 4 juga menolak NaN dan Infinity.
// strictObject: kolom lain (misalnya teks "lokasi") ditolak 400; rute ini HANYA memindahkan titik di peta.
const angkaDesimal = (contoh: string) => z.number({ // pesan galat: kolom tidak ada, NaN/Infinity, atau teks
  error: (isu) => isu.input === undefined ? "wajib diisi: angka, atau null untuk menghapus titik"
    : typeof isu.input === "number" ? "harus angka berhingga (bukan NaN atau Infinity)"
      : `harus angka dengan titik desimal, misalnya ${contoh} (bukan teks "${contoh.replace(".", ",")}")`,
});
export const Lokasi = z.strictObject({
  lat: angkaDesimal("-6.1754").min(-90, "lintang paling kecil -90").max(90, "lintang paling besar 90").nullable()
    .describe("lintang (latitude) dalam derajat desimal, -90 sampai 90; Jakarta sekitar -6.2. null = hapus titik"),
  lng: angkaDesimal("106.8272").min(-180, "bujur paling kecil -180").max(180, "bujur paling besar 180").nullable()
    .describe("bujur (longitude) dalam derajat desimal, -180 sampai 180; Jakarta sekitar 106.8. null = hapus titik"),
}).refine((l) => (l.lat === null) === (l.lng === null), { // setengah titik tidak bisa digambar di peta
  message: "lat dan lng diisi berpasangan: keduanya angka, atau keduanya null untuk menghapus titik", path: ["lng"],
});
const KunciBaru = z.object({
  device_id: z.string(),
  kunci: z.string().nullable().describe("43 huruf; HANYA ditampilkan sekali ini. null untuk perangkat ESP-NOW"),
  langkah: z.array(z.string()).describe("yang harus dilakukan berikutnya"),
});
const SALAH_DATABASE = "database sedang tidak bisa dihubungi, coba lagi sebentar lagi";

const iso = (waktu: Date | null) => (waktu === null ? null : waktuKontrak(waktu));

function tampilkan(b: BarisPerangkat) {
  const kunci = b.terdaftar === null ? "belum-terdaftar" as const
    : b.dicabut !== null ? "dicabut" as const
      : b.penghubung !== null ? "tanpa-kunci" as const : "aktif" as const;
  return {
    device_id: b.device_id, nama: b.nama, lokasi: b.lokasi, lat: b.lat, lng: b.lng, jenis: b.jenis, status: b.status,
    terakhir_dilihat: iso(b.terakhir_dilihat), kunci, terdaftar: iso(b.terdaftar), kunci_dibuat: iso(b.kunci_dibuat),
    dicabut: iso(b.dicabut), penghubung: b.penghubung,
  };
}

// petunjuk langkah berikutnya, supaya kunci langsung dipasang di perangkat dan di broker
function langkahKunci(id: string): string[] {
  return ["Simpan kunci ini sekarang: kunci hanya tampil sekali ini (database hanya menyimpan sidik jarinya).",
    `Perangkat: ketik  kunci <kunci>  di Serial Monitor (simulator: KUNCI_${id.toUpperCase()}=<kunci> di alat/.env)`,
    `Broker: mosquitto_passwd <berkas sandi broker> ${id} di mesin broker, tempel kunci dua kali, lalu muat ulang broker`];
}

function langkahTanpaKunci(id: string, penghubung: string): string[] {
  return ["Perangkat ESP-NOW tanpa kunci. Pastikan tiga baris ini ada di berkas ACL broker, lalu restart broker:",
    `user ${penghubung}`, `topic write rpm/${id}/telemetry`, `topic write rpm/${id}/status`];
}

export const rutePerangkat: FastifyPluginAsyncZod = async (app) => {
  app.get("/devices", {
    schema: {
      tags: ["perangkat"],
      summary: "Daftar perangkat di database: yang terdaftar, yang dicabut, dan baris lama yang belum terdaftar",
      response: {
        200: z.array(Perangkat).describe("urut device_id; kunci dan sidik jarinya tidak pernah ikut"),
        503: Galat.describe("database sedang tidak bisa dihubungi"),
      },
    },
  }, async (req, reply) => {
    try {
      return (await semuaPerangkatDb()).map(tampilkan);
    } catch (galat) {
      req.log.error(`daftar perangkat gagal dibaca: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: SALAH_DATABASE });
    }
  });

  // ---- Modul 21: registrasi perangkat, ganti kunci, cabut kunci (hanya admin: satpam menolak viewer untuk POST) ----

  app.post("/devices", {
    schema: {
      tags: ["perangkat"],
      summary: "Daftarkan perangkat; kuncinya hanya ditampilkan SEKALI di jawaban ini",
      body: Registrasi,
      response: {
        201: KunciBaru.describe("perangkat terdaftar; simpan kuncinya sekarang"),
        409: Galat.describe("sudah terdaftar (pakai ganti kunci), atau penghubung tidak sah"),
        503: Galat.describe("database sedang tidak bisa dihubungi"),
      },
    },
  }, async (req, reply) => {
    const { device_id: id, nama, lokasi, penghubung } = req.body;
    if (penghubung !== undefined) { // perangkat ESP-NOW: tanpa kunci, datanya diterbitkan penghubungnya
      if (penghubung === id) return reply.code(409).send({ pesan: "penghubung tidak boleh perangkat itu sendiri" });
      if (izinPerangkat(penghubung) !== "terdaftar") {
        return reply.code(409).send({ pesan: `penghubung ${penghubung} belum terdaftar atau sudah dicabut; daftarkan Node 1 dulu` });
      }
    }
    const kunci = penghubung === undefined ? buatKunci() : null;
    try {
      const baris = await daftarkanPerangkat(id, nama ?? null, lokasi ?? null, penghubung ?? null,
        kunci === null ? null : hashKunci(kunci)); // database hanya menerima sidik jarinya
      if (baris === undefined) {
        return reply.code(409).send({ pesan: `${id} sudah terdaftar; untuk kunci baru pakai POST /devices/${id}/kunci` });
      }
      catatTerdaftar(id);
      req.log.info(`perangkat ${id} didaftarkan oleh akun ${req.user.sub}${penghubung === undefined ? "" : ` (lewat ${penghubung})`}`);
      const langkah = penghubung === undefined ? langkahKunci(id) : langkahTanpaKunci(id, penghubung);
      return reply.code(201).send({ device_id: id, kunci, langkah });
    } catch (galat) {
      req.log.error(`registrasi ${id} gagal: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: SALAH_DATABASE });
    }
  });

  app.post("/devices/:id/kunci", {
    schema: {
      tags: ["perangkat"],
      summary: "Buat kunci baru (kunci lama langsung tidak berlaku); juga menghidupkan lagi perangkat yang dicabut",
      params: ParamId,
      response: {
        200: KunciBaru.describe("kunci baru; simpan sekarang"),
        404: Galat.describe("perangkat belum terdaftar, atau perangkat ESP-NOW (tidak punya kunci)"),
        503: Galat.describe("database sedang tidak bisa dihubungi"),
      },
    },
  }, async (req, reply) => {
    const id = req.params.id;
    const kunci = buatKunci();
    try {
      const baris = await gantiKunciPerangkat(id, hashKunci(kunci));
      if (baris === undefined) return reply.code(404).send({ pesan: `${id} belum terdaftar, atau perangkat tanpa kunci (ESP-NOW)` });
      catatTerdaftar(id);
      req.log.info(`kunci baru untuk ${id} dibuat oleh akun ${req.user.sub}`);
      return { device_id: id, kunci, langkah: langkahKunci(id) };
    } catch (galat) {
      req.log.error(`ganti kunci ${id} gagal: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: SALAH_DATABASE });
    }
  });

  app.post("/devices/:id/cabut", {
    schema: {
      tags: ["perangkat"],
      summary: "Cabut kunci perangkat (hilang atau dicuri): backend tidak melayaninya lagi",
      params: ParamId,
      response: {
        200: z.object({ device_id: z.string(), dicabut: z.string(), langkah: z.array(z.string()) })
          .describe("dicabut; hapus juga akunnya dari broker"),
        404: Galat.describe("perangkat belum terdaftar atau sudah dicabut"),
        503: Galat.describe("database sedang tidak bisa dihubungi"),
      },
    },
  }, async (req, reply) => {
    const id = req.params.id;
    try {
      const baris = await cabutPerangkat(id);
      if (baris === undefined) return reply.code(404).send({ pesan: `${id} belum terdaftar atau sudah dicabut` });
      catatDicabut(id);
      req.log.warn(`kunci ${id} DICABUT oleh akun ${req.user.sub}`);
      return {
        device_id: id, dicabut: waktuKontrak(baris.dicabut ?? new Date()),
        langkah: baris.penghubung === null
          ? [`Hapus akunnya dari broker: mosquitto_passwd -D <berkas sandi broker> ${id}`,
            "Muat ulang broker (Pi: sudo systemctl reload mosquitto; laptop: Ctrl + C lalu jalankan lagi)"]
          : [`Hapus dua baris rpm/${id}/... dari blok user ${baris.penghubung} di berkas ACL broker, lalu restart broker`],
      };
    } catch (galat) {
      req.log.error(`cabut ${id} gagal: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: SALAH_DATABASE });
    }
  });

  // ---- Modul 25: titik perangkat di peta (hanya admin: satpam menolak viewer untuk PUT, seperti POST di atas) ----

  app.put("/devices/:id/lokasi", {
    schema: {
      tags: ["perangkat"],
      summary: "Atur titik perangkat di peta: { lat, lng } dengan titik desimal; { lat: null, lng: null } menghapus titiknya",
      params: ParamId,
      body: Lokasi,
      response: {
        200: Perangkat.describe("perangkat dengan titik barunya (bentuknya sama dengan satu baris GET /devices)"),
        404: Galat.describe("device_id itu tidak ada di daftar perangkat"),
        503: Galat.describe("database sedang tidak bisa dihubungi"),
      },
    },
  }, async (req, reply) => {
    const id = req.params.id;
    const { lat, lng } = req.body;
    try {
      const baris = await ubahLokasi(id, lat, lng);
      if (baris === undefined) return reply.code(404).send({ pesan: `${id} tidak ada di daftar perangkat` });
      // koordinatnya sengaja TIDAK ditulis ke log: titik rumah termasuk data pribadi
      req.log.info(`titik ${id} di peta ${lat === null ? "dihapus" : "diatur"} oleh akun ${req.user.sub}`);
      return tampilkan(baris);
    } catch (galat) {
      req.log.error(`lokasi ${id} gagal disimpan: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: SALAH_DATABASE });
    }
  });

  app.get("/devices/:id/latest", {
    schema: {
      tags: ["perangkat"],
      summary: "Bacaan telemetry terbaru satu perangkat",
      params: ParamId,
      response: {
        200: z.object({
          device_id: z.string(),
          jenis: Jenis,
          status: z.union([Status, z.literal("belum-diketahui")]),
          telemetry: z.union([TelemetryNode1, TelemetryNode2]),
        }).describe("bacaan terbaru perangkat itu"),
        404: Galat.describe("belum ada telemetry dari perangkat itu"),
      },
    },
  }, async (req, reply) => {
    const p = cariPerangkat(req.params.id);
    if (p === undefined || p.telemetry === null) {
      return reply.code(404).send({ pesan: `belum ada telemetry dari ${req.params.id}` });
    }
    return { device_id: p.device_id, jenis: p.jenis, status: p.status, telemetry: p.telemetry };
  });

  app.get("/devices/:id/vitals", {
    schema: {
      tags: ["perangkat"],
      summary: "Kesehatan terakhir satu perangkat (vitals)",
      params: ParamId,
      response: {
        200: z.object({ device_id: z.string(), vitals: Vitals }).describe("vitals terbaru perangkat itu"),
        404: Galat.describe("belum ada vitals dari perangkat itu"),
      },
    },
  }, async (req, reply) => {
    const p = cariPerangkat(req.params.id);
    if (p === undefined || p.vitals === null) {
      return reply.code(404).send({ pesan: `belum ada vitals dari ${req.params.id}` });
    }
    return { device_id: p.device_id, vitals: p.vitals };
  });

  app.get("/devices/:id/readings", {
    schema: {
      tags: ["perangkat"],
      summary: "Riwayat satu perangkat dari database: bacaan mentah (paling banyak 1.000) atau ringkasan per ember",
      params: ParamId,
      querystring: Rentang,
      response: {
        200: z.union([
          z.object({
            device_id: z.string(), dari: z.string(), sampai: z.string(), jumlah: z.number(), terpotong: z.boolean(),
            bacaan: z.array(Bacaan),
          }),
          z.object({
            device_id: z.string(), dari: z.string(), sampai: z.string(), ember: Ember, jumlah: z.number(),
            ringkasan: z.array(TitikRingkasan),
          }),
        ]).describe("tanpa bucket: bacaan mentah, terpotong = ada lebih dari 1.000 bacaan; dengan bucket: satu titik "
          + "ringkasan per ember. Keduanya terlama lebih dulu"),
        503: Galat.describe("database sedang tidak bisa dihubungi"),
      },
    },
  }, async (req, reply) => {
    const { dari, sampai } = hitungRentang(req.query);
    const ember = req.query.bucket;
    try {
      if (ember !== undefined) {
        const ringkasan = await ambilRingkasan(req.params.id, dari, sampai, ember);
        return {
          device_id: req.params.id, dari: waktuKontrak(dari), sampai: waktuKontrak(sampai), ember, jumlah: ringkasan.length,
          ringkasan,
        };
      }
      const { bacaan, terpotong } = await ambilRiwayat(req.params.id, dari, sampai);
      return {
        device_id: req.params.id, dari: waktuKontrak(dari), sampai: waktuKontrak(sampai), jumlah: bacaan.length, terpotong,
        bacaan,
      };
    } catch (galat) {
      req.log.error(`riwayat ${req.params.id} gagal dibaca dari database: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: "database sedang tidak bisa dihubungi, coba lagi sebentar lagi" });
    }
  });

  app.post("/devices/:id/command", {
    schema: {
      tags: ["perangkat"],
      summary: "Kirim satu perintah set ke perangkat, lalu tunggu ack-nya (paling lama 5 detik)",
      params: ParamId,
      body: PerintahSet,
      response: {
        200: z.object({ id: z.string(), lama_ms: z.number(), ack: Ack }).describe("perangkat menjawab dengan ack"),
        404: Galat.describe("perangkat belum terdaftar (Modul 21) atau belum pernah terdengar"),
        409: Galat.describe("kunci perangkat sudah dicabut (Modul 21), perangkat offline, Node 2, jenisnya belum diketahui, "
          + "atau perintah sebelumnya untuk aktuator yang sama masih menunggu ack"),
        503: Galat.describe("backend tidak tersambung ke broker"),
        504: Galat.describe("tidak ada ack dalam 5 detik"),
      },
    },
  }, async (req, reply) => {
    const hasil = await perintahkan(req.params.id, req.body, "api"); // Modul 19: lewat satu pintu yang sama
    if (hasil.status === "tidak-dikirim") return reply.code(hasil.kode).send({ pesan: hasil.pesan });
    if (hasil.status === "tanpa-ack") return reply.code(504).send({ pesan: `tidak ada ack untuk ${hasil.id} dalam 5 detik` });
    return { id: hasil.id, lama_ms: hasil.lama_ms, ack: hasil.ack };
  });

  app.get("/devices/:id/state", {
    schema: {
      tags: ["perangkat"],
      summary: "Keadaan aktuator: yang diinginkan server (desired) dan yang dilaporkan perangkat (reported)",
      params: ParamId,
      response: {
        200: z.object({
          device_id: z.string(),
          desired: z.object({ kipas: z.boolean().optional(), lampu: z.boolean().optional(), tirai: z.number().optional() })
            .describe("keadaan yang diinginkan server untuk kipas, lampu, dan tirai (pompa tidak: perintahnya sekali jalan)"),
          reported: Keadaan.nullable().describe("keadaan terakhir yang dilaporkan perangkat lewat telemetry atau ack"),
          reported_pada: z.string().nullable().describe("waktu server saat laporan itu tiba"),
          selisih: z.array(z.string()).describe("aktuator yang keadaannya belum sama dengan keinginan server"),
        }).describe("desired, reported, dan selisihnya"),
        404: Galat.describe("perangkat belum pernah terdengar"),
      },
    },
  }, async (req, reply) => {
    const keadaan = keadaanPerangkat(req.params.id);
    if (keadaan === undefined) return reply.code(404).send({ pesan: `perangkat ${req.params.id} belum pernah terdengar` });
    return keadaan;
  });
};
