// realtime.ts - Socket.IO: data mengalir ke terminal dan browser tanpa refresh (Modul 19), dikunci di Modul 20.
// Setiap perangkat punya satu room bernama "perangkat:<device_id>". Klien yang ingin melihat satu perangkat mengirim
// "ikuti", lalu hanya menerima telemetry perangkat itu. Perubahan status dan buku kejadian dikirim ke semua klien.
// Socket.IO menjawab sendiri permintaan /socket.io/ SEBELUM Fastify melihatnya, jadi satpam Fastify (hook onRequest) TIDAK
// menjaga pintu ini: Socket.IO punya penjaga sendiri (allowRequest + io.use) dengan aturan dan cookie yang sama.
import { Server } from "socket.io";
import type { FastifyInstance } from "fastify";
import { DeviceId } from "../schemas/kontrak.ts";
import type { Status, TelemetryNode1, TelemetryNode2 } from "../schemas/kontrak.ts";
import type { Kejadian } from "../db/arsip.ts";
import { cariPerangkat } from "./gudang.ts";
import { env } from "../config/env.ts";
import { ASAL_BOLEH, COOKIE_AKSES } from "../auth/keamanan.ts";
import type { IsiToken } from "../auth/keamanan.ts";

type Telemetry = TelemetryNode1 | TelemetryNode2;

// jawaban server untuk "ikuti" (ack Socket.IO): berhasil atau tidak, dan bacaan terakhir perangkat itu
interface JawabanIkuti {
  ok: boolean;
  pesan?: string;
  terbaru?: Telemetry | null;
}

// acara dari server ke klien, beserta isinya
interface KeKlien {
  telemetry: (deviceId: string, isi: Telemetry) => void;
  status: (deviceId: string, status: Status) => void;
  kejadian: (kejadian: Kejadian) => void;
}

// acara dari klien ke server; "balas" adalah ack Socket.IO
interface DariKlien {
  ikuti: (deviceId: string, balas: (jawaban: JawabanIkuti) => void) => void;
  berhenti: (deviceId: string) => void;
}

// Modul 20: data yang diingat server untuk setiap klien: isi gelangnya (JWT akses) saat tersambung
interface DataSoket {
  pengguna: IsiToken & { iat: number; exp: number };
}

let io: Server<DariKlien, KeKlien, Record<string, never>, DataSoket> | undefined;

export function mulaiRealtime(app: FastifyInstance): void {
  io = new Server<DariKlien, KeKlien, Record<string, never>, DataSoket>(app.server, { // menumpang di server HTTP Fastify
    cors: { origin: env.CORS_ORIGIN, credentials: true }, // daftar origin yang sama dengan API (Modul 22)
    // Modul 20: asal halaman diperiksa dengan aturan yang SAMA dengan satpam: tanpa Origin = klien Node (terminal kecil)
    allowRequest: (req, jawab) => jawab(null, req.headers.origin === undefined || ASAL_BOLEH.has(req.headers.origin)),
  });
  // Modul 20: penjaga pintu Socket.IO. Berjalan sekali saat klien menyambung (handshake), dengan cookie yang sama.
  io.use((socket, next) => {
    const cookie = app.parseCookie(socket.request.headers.cookie ?? "");
    const token = cookie[COOKIE_AKSES];
    if (token === undefined) return next(new Error("belum login"));
    try {
      socket.data.pengguna = app.jwt.verify<IsiToken & { iat: number; exp: number }>(token);
      next();
    } catch {
      next(new Error("sesi habis atau tidak sah: refresh atau login lagi"));
    }
  });
  io.on("connection", (socket) => {
    const { sub, peran, sid, exp } = socket.data.pengguna;
    app.log.info(`klien realtime tersambung: ${socket.id} (akun ${sub}, ${peran})`);
    void socket.join(`sesi:${sid}`); // logout sesi ini = putuskan semua sambungannya (putuskanSesi)
    // gelang hanya diperiksa di pintu: saat kedaluwarsa, sambungan diputus; klien refresh lalu menyambung lagi
    const habis = setTimeout(() => socket.disconnect(true), exp * 1000 - Date.now());
    socket.on("ikuti", (deviceId, balas) => {
      if (typeof balas !== "function") return; // klien tidak meminta jawaban: abaikan
      if (!DeviceId.safeParse(deviceId).success) { // jangan percaya klien, sama seperti jangan percaya perangkat
        return balas({ ok: false, pesan: "device_id harus 12 digit heksadesimal huruf kecil" });
      }
      socket.join(`perangkat:${deviceId}`);
      app.log.info(`klien ${socket.id} mengikuti ${deviceId}`);
      // pesan yang terlewat saat klien terputus tidak dikirim ulang, jadi kirim bacaan terakhirnya sekarang
      balas({ ok: true, terbaru: cariPerangkat(deviceId)?.telemetry ?? null });
    });
    socket.on("berhenti", (deviceId) => {
      socket.leave(`perangkat:${deviceId}`);
    });
    socket.on("disconnect", (alasan) => {
      clearTimeout(habis);
      app.log.info(`klien realtime terputus: ${socket.id} (${alasan})`);
    });
  });
  // Saat server ditutup dengan rapi, putuskan semua klien Socket.IO lebih dulu; kalau tidak, app.close() menunggu mereka.
  app.addHook("preClose", (done) => {
    io?.local.disconnectSockets(true);
    done();
  });
}

// Modul 20: logout atau sesi dicabut -> putuskan semua sambungan Socket.IO milik sesi itu
export function putuskanSesi(sid: number): void {
  io?.in(`sesi:${sid}`).disconnectSockets(true);
}

// kirim satu telemetry HANYA ke klien yang mengikuti perangkat itu
export function siarkanTelemetry(deviceId: string, isi: Telemetry): void {
  io?.to(`perangkat:${deviceId}`).emit("telemetry", deviceId, isi);
}

// kirim perubahan status ke SEMUA klien
export function siarkanStatus(deviceId: string, status: Status): void {
  io?.emit("status", deviceId, status);
}

// kirim satu baris buku kejadian ke SEMUA klien
export function siarkanKejadian(kejadian: Kejadian): void {
  io?.emit("kejadian", kejadian);
}
