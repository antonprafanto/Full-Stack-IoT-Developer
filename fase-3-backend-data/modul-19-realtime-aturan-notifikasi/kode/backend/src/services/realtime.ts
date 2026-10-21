// realtime.ts - Socket.IO: data mengalir ke terminal dan browser tanpa refresh (Modul 19).
// Setiap perangkat punya satu room bernama "perangkat:<device_id>". Klien yang ingin melihat satu perangkat mengirim
// "ikuti", lalu hanya menerima telemetry perangkat itu. Perubahan status dan buku kejadian dikirim ke semua klien.
import { Server } from "socket.io";
import type { FastifyInstance } from "fastify";
import { DeviceId } from "../schemas/kontrak.ts";
import type { Status, TelemetryNode1, TelemetryNode2 } from "../schemas/kontrak.ts";
import type { Kejadian } from "../db/arsip.ts";
import { cariPerangkat } from "./gudang.ts";

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

let io: Server<DariKlien, KeKlien> | undefined;

export function mulaiRealtime(app: FastifyInstance): void {
  io = new Server<DariKlien, KeKlien>(app.server); // menumpang di server HTTP Fastify, di alamat /socket.io/
  io.on("connection", (socket) => {
    app.log.info(`klien realtime tersambung: ${socket.id}`);
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
    socket.on("disconnect", (alasan) => app.log.info(`klien realtime terputus: ${socket.id} (${alasan})`));
  });
  // Saat server ditutup dengan rapi, putuskan semua klien Socket.IO lebih dulu; kalau tidak, app.close() menunggu mereka.
  app.addHook("preClose", (done) => {
    io?.local.disconnectSockets(true);
    done();
  });
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
