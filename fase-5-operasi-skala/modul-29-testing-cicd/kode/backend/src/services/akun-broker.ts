// akun-broker.ts - akun broker setiap perangkat dibuat, diganti, dan dihapus OTOMATIS oleh backend (Modul 28), lewat
// plugin "dynamic security" Mosquitto 2.1 (mosquitto_dynamic_security.so, sudah ada di image eclipse-mosquitto:2.1.2-alpine).
// Plugin itu menerima perintah berbentuk JSON di topik kontrol $CONTROL/dynamic-security/v1 dan menjawab di .../response.
// Tanpa mosquitto_passwd dan tanpa memuat ulang broker: akun baru langsung bisa dipakai, akun yang dihapus langsung diputus.
//
// Ke broker mana perintahnya dikirim? Setelan AKUN_BROKER_OTOMATIS (config/env.ts):
//   pusat          -> $CONTROL/dynamic-security/v1 di broker pusat (tempat backend tersambung)
//   gerbang:pi1    -> rpm-gerbang/pi1/dynamic-security/v1 di broker pusat. Jembatan gerbang Pi bernama pi1 memindahkannya ke
//                     $CONTROL/dynamic-security/v1 di broker GERBANG (dua baris "topic" di edge/jembatan.contoh.conf), lalu
//                     membawa jawabannya kembali. Node 1 masuk ke broker gerbang, jadi akunnya harus ada di sana.
//   mati           -> tidak ada perintah: akun dibuat tangan seperti Modul 21
// Izin topik perangkat TETAP pola %u di edge/acl-broker (Modul 21), untuk MENULIS dan MEMBACA: akun dynamic security tidak
// diberi peran apa pun, dan untuk akun tanpa peran yang izinnya "tolak", plugin menyerahkan keputusan ke acl-broker. Bawaan
// MENULIS memang "tolak" sejak plugin membuat berkasnya, tetapi bawaan MEMBACA (publishClientReceive) = "izinkan": tanpa
// tolakBacaBawaan() di bawah, akun perangkat bisa membaca rpm/# perangkat lain dan $SYS (temuan verifikasi kode M28).
// Siapa yang boleh menulis topik kontrol? Hanya akun backend (edge/acl-broker blok 3). Siapa pun yang bisa menulisnya
// adalah "admin" akun broker, jadi jangan pernah memberi akun lain izin itu (atau izin "#").
import { randomUUID } from "node:crypto";
import { env } from "../config/env.ts";
import { terbitkanKontrol } from "./mqtt.ts";
import { log } from "./log.ts";

export const BATAS_JAWAB_MS = 3000; // broker (atau gerbang lewat jembatan) yang sehat menjawab dalam puluhan milidetik

interface Jawaban {
  command: string;
  error?: string; // ada = perintah gagal, misalnya "Client already exists" atau "Client not found"
  correlationData?: string;
}

// Topik perintah dan jawabannya, atau null kalau AKUN_BROKER_OTOMATIS=mati.
export function topikKontrol(): { perintah: string; jawaban: string } | null {
  const mode = env.AKUN_BROKER_OTOMATIS;
  if (mode.jenis === "mati") return null;
  const perintah = mode.jenis === "pusat" ? "$CONTROL/dynamic-security/v1" : `rpm-gerbang/${mode.nama}/dynamic-security/v1`;
  return { perintah, jawaban: `${perintah}/response` };
}

// Untuk kalimat log dan langkah: "broker pusat", "broker gerbang pi1", atau "tangan (Modul 21)".
export function tempatAkun(): string {
  const mode = env.AKUN_BROKER_OTOMATIS;
  return mode.jenis === "pusat" ? "broker pusat" : mode.jenis === "gerbang" ? `broker gerbang ${mode.nama}` : "tangan (Modul 21)";
}

// Perintah yang sedang menunggu jawaban, menurut correlationData-nya (penanda unik yang dikembalikan broker apa adanya).
const menunggu = new Map<string, (jawaban: Jawaban) => void>();

// Dipanggil mqtt.ts untuk setiap pesan di topik jawaban. Isinya {"responses":[{...}, ...]}.
export function serahkanJawabanKontrol(teks: string): void {
  let isi: { responses?: Jawaban[] };
  try {
    isi = JSON.parse(teks) as { responses?: Jawaban[] };
  } catch {
    return; // bukan JSON: bukan jawaban plugin
  }
  for (const jawaban of isi.responses ?? []) {
    if (jawaban.correlationData !== undefined) menunggu.get(jawaban.correlationData)?.(jawaban);
  }
}

// Satu kali kirim, tunggu jawabannya paling lama 3 detik. Urutannya PENTING: terbitkan DULU, baru pasang pengatur waktu.
// (Calon kode lab M28 memasang pengatur waktu lebih dulu; saat backend tidak tersambung ke broker, galat waktu habisnya
// tidak ditangkap siapa pun dan mematikan seluruh proses backend: "unhandled rejection".)
function kirimSekali(perintah: Record<string, unknown>): Promise<Jawaban> {
  const topik = topikKontrol();
  if (topik === null) return Promise.reject(new Error("AKUN_BROKER_OTOMATIS=mati: akun broker diurus tangan"));
  const korelasi = randomUUID();
  const isi = JSON.stringify({ commands: [{ ...perintah, correlationData: korelasi }] });
  if (!terbitkanKontrol(topik.perintah, isi)) return Promise.reject(new Error("backend sedang tidak tersambung ke broker"));
  return new Promise<Jawaban>((selesai, gagal) => {
    const pengatur = setTimeout(() => {
      menunggu.delete(korelasi);
      gagal(new Error(`${tempatAkun()} tidak menjawab ${String(perintah.command)} dalam ${BATAS_JAWAB_MS / 1000} detik`));
    }, BATAS_JAWAB_MS);
    menunggu.set(korelasi, (jawaban) => {
      clearTimeout(pengatur);
      menunggu.delete(korelasi);
      selesai(jawaban);
    });
  });
}

// Satu perintah dynamic security: tanpa jawaban 3 detik = dicoba SEKALI lagi (misalnya jembatan Pi baru saja tersambung
// lagi dan perintah pertama hilang di jalan, seperti cmd yang tidak ditahan jembatan, kontrak aturan 11). Gagal dua kali =
// galat; pemanggilnya menjawab 503 dan TIDAK mengubah apa pun di database.
export async function perintahKontrol(perintah: Record<string, unknown>): Promise<Jawaban> {
  try {
    return await kirimSekali(perintah);
  } catch (galat) {
    log.warn(`akun broker: ${(galat as Error).message}; dicoba sekali lagi`);
    return await kirimSekali(perintah);
  }
}

// Bawaan izin MEMBACA untuk akun tanpa peran = tolak (setDefaultACLAccess publishClientReceive), supaya pola
// "pattern read rpm/%u/cmd" di acl-broker yang berlaku: perangkat hanya menerima cmd miliknya. Dikirim sebelum SETIAP
// pembuatan akun perangkat: murah (satu perintah, puluhan milidetik), tidak berubah bila diulang, tersimpan di
// dynamic-security.json broker itu (tahan restart, ikut skrip cadangan), dan tetap benar walau broker gerbang baru saja
// dibuat ulang. Gagal = galat, akun tidak dibuat (pemanggil menjawab 503).
let bawaanBacaDicatat = false;
async function tolakBacaBawaan(): Promise<void> {
  const jawab = await perintahKontrol({ command: "setDefaultACLAccess", acls: [{ acltype: "publishClientReceive", allow: false }] });
  if (jawab.error !== undefined) throw new Error(`setDefaultACLAccess: ${jawab.error}`);
  if (!bawaanBacaDicatat) { // cukup sekali per backend menyala: log tidak perlu satu baris per perangkat
    bawaanBacaDicatat = true;
    log.info(`akun broker: bawaan izin baca akun perangkat di ${tempatAkun()} = tolak (yang berlaku pola %u acl-broker)`);
  }
}

// Langkah akun broker dikerjakan SATU PER SATU (antrean). Setiap langkah (daftar, ganti kunci, klaim, Nonaktifkan) memegang
// satu sambungan database (transaksinya) selama menunggu jawaban broker: saat broker atau jembatan diam, sampai ±6 detik.
// Kolam database backend hanya 5 sambungan (db/pool.ts), jadi lima langkah bersamaan saat broker diam = seluruh backend
// tanpa database (GET /devices ikut 503; temuan verifikasi kode M28). Dengan antrean, paling banyak SATU sambungan yang
// menunggu broker. Langkah yang sudah menunggu giliran lebih dari 5 detik tidak dikerjakan sama sekali: galat (503),
// database dan broker tidak disentuh, kode klaim tidak hangus, dan papan yang mengklaim tidak menunggu terlalu lama.
export const BATAS_ANTRE_MS = 5000;
let ekorAntre: Promise<unknown> = Promise.resolve();
export function antreAkun<T>(kerja: () => Promise<T>): Promise<T> {
  if (topikKontrol() === null) return kerja(); // AKUN_BROKER_OTOMATIS=mati: tidak ada broker yang ditunggu
  const masuk = Date.now();
  const giliran = ekorAntre.then(() => {
    if (Date.now() - masuk > BATAS_ANTRE_MS) {
      throw new Error(`langkah akun broker sebelumnya belum selesai sesudah ${BATAS_ANTRE_MS / 1000} detik (${tempatAkun()} lambat?)`);
    }
    return kerja();
  });
  ekorAntre = giliran.catch(() => undefined); // galat langkah ini tidak menghentikan antrean
  return giliran;
}

// Akun untuk perangkat yang baru didaftarkan/diklaim (dibuat), atau kunci baru untuk akun yang sudah ada (diganti; perangkat
// yang sedang tersambung dengan kunci lama langsung diputus broker). "manual" = AKUN_BROKER_OTOMATIS=mati.
export async function pasangAkunPerangkat(deviceId: string, kunci: string): Promise<"dibuat" | "diganti" | "manual"> {
  if (topikKontrol() === null) return "manual";
  await tolakBacaBawaan();
  const buat = await perintahKontrol({ command: "createClient", username: deviceId, password: kunci,
    textname: "perangkat Rumah Pintar Mini (dibuat backend)" });
  if (buat.error === undefined) return "dibuat";
  if (!/exist/i.test(buat.error)) throw new Error(`createClient ${deviceId}: ${buat.error}`);
  // akun sudah ada (perangkat pernah didaftarkan, atau percobaan pertama ternyata sampai): ganti kuncinya, lalu aktifkan
  const ganti = await perintahKontrol({ command: "setClientPassword", username: deviceId, password: kunci });
  if (ganti.error !== undefined) throw new Error(`setClientPassword ${deviceId}: ${ganti.error}`);
  const aktif = await perintahKontrol({ command: "enableClient", username: deviceId });
  if (aktif.error !== undefined) throw new Error(`enableClient ${deviceId}: ${aktif.error}`);
  return "diganti";
}

// Hapus akun perangkat (perangkat hilang/dicuri). Broker langsung memutus sambungannya ("administrative action") dan
// menolak sambungan berikutnya (kode 5). WASIAT TIDAK TERBIT pada cara putus ini, jadi status "offline" ditulis backend
// sendiri (routes/perangkat.ts). "tidak-ada" = akun itu tidak ada di dynamic security: biasanya akun lama Modul 21 di
// berkas sandi broker, yang harus dihapus dengan mosquitto_passwd -D lalu restart broker.
export async function hapusAkunPerangkat(deviceId: string): Promise<"dihapus" | "tidak-ada" | "manual"> {
  if (topikKontrol() === null) return "manual";
  const hapus = await perintahKontrol({ command: "deleteClient", username: deviceId });
  if (hapus.error === undefined) return "dihapus";
  if (/not found/i.test(hapus.error)) return "tidak-ada";
  throw new Error(`deleteClient ${deviceId}: ${hapus.error}`);
}
