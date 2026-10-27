// aturan.ts - skema aturan otomatis untuk SERVER (Modul 19). Modul 24: semua bentuk aturan pindah ke aturan-dasar.ts, yang
// tanpa node-cron sehingga dashboard bisa memakai salinannya di browser. Di sini hanya ditambah satu pemeriksaan yang butuh
// node-cron: apakah ekspresi cron aturan jadwal benar-benar bisa dijalankan.
import type { z } from "zod";
import cron from "node-cron";
import { Aturan as AturanDasar } from "./aturan-dasar.ts";

// Semua yang ada di aturan-dasar.ts ikut tersedia dari berkas ini (KondisiAmbang, KondisiAmbangBawah, AksiSakelar, IsiAturan,
// tipe-tipenya, dan seterusnya), jadi berkas lain di backend cukup mengimpor dari aturan.ts seperti sejak Modul 19.
// Aturan di bawah ini menggantikan Aturan milik aturan-dasar.ts: nama yang ditulis di berkas ini sendiri selalu menang.
export * from "./aturan-dasar.ts";

// Isi POST /rules dan PUT /rules/:id di server: bentuk dasar + ekspresi cron yang benar-benar bisa dijalankan node-cron.
export const Aturan = AturanDasar.refine((a) => a.kondisi.jenis !== "jadwal" || cron.validate(a.kondisi.cron), {
  message: "ekspresi cron tidak sah",
  path: ["kondisi", "cron"],
});

export type Aturan = z.infer<typeof Aturan>; // nama yang sama untuk nilai dan tipenya, seperti di aturan-dasar.ts
