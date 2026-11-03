// kejadian.ts - buku kejadian (Modul 19): setiap hal yang perlu diketahui manusia ("siapa menyalakan apa, kapan")
// ditulis ke tabel events, lalu disiarkan ke semua klien Socket.IO sebagai acara "kejadian".
import { simpanKejadian } from "../db/arsip.ts";
import type { KejadianBaru } from "../db/arsip.ts";
import { siarkanKejadian } from "./realtime.ts";
import { log } from "./log.ts";

export function catatKejadian(kejadian: KejadianBaru): void {
  simpanKejadian(kejadian)
    .then((baris) => siarkanKejadian(baris))
    .catch((galat) => log.error(`gagal mencatat kejadian "${kejadian.pesan}": ${(galat as Error).message}`));
}
