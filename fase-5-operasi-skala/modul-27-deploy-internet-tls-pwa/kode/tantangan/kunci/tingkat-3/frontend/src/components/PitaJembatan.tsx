// PitaJembatan.tsx - Tantangan 3 Modul 27: pita "Gerbang rumah terputus" di bawah kepala dashboard.
// Saat internet rumah putus, perangkat tetap "Online" di dashboard VPS (status terakhirnya retained, dan wasiatnya ada di
// broker Pi, bukan di VPS). Pita ini memberi tahu bahwa angka dari rumah sedang tertahan, dari kabar jembatan yang
// diteruskan backend (acara Socket.IO "jembatan"). Pendengarnya dipasang di sini dan dilepas lagi di cleanup, dengan
// fungsi yang sama (aturan Modul 23); soketnya tetap satu, dari soket.ts.
import { useEffect, useState } from "react";
import { socket } from "../soket";
import type { KeadaanJembatan } from "../types";
import { jamWib } from "../waktu";

export default function PitaJembatan() {
  // nama jembatan -> keadaan terakhirnya. Server mengirim semua keadaan yang ia tahu setiap kali sambungan live terbentuk.
  const [jembatan, setJembatan] = useState<Record<string, KeadaanJembatan>>({});

  useEffect(() => {
    function onJembatan(nama: string, keadaan: KeadaanJembatan) {
      setJembatan((lama) => ({ ...lama, [nama]: keadaan }));
    }
    socket.on("jembatan", onJembatan);
    return () => {
      socket.off("jembatan", onJembatan);
    };
  }, []);

  const putus = Object.entries(jembatan).filter(([, k]) => !k.tersambung);
  if (putus.length === 0) return null;
  return (
    // role="status": pembaca layar membacakan pita ini begitu muncul, tanpa merebut fokus
    <div role="status" className="border-b border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950">
      {putus.map(([nama, k]) => (
        <p key={nama} className="mx-auto max-w-3xl px-4 py-2 text-sm text-amber-900 dark:text-amber-100">
          <strong>Gerbang rumah terputus</strong>
          {k.sejak === null ? "" : ` sejak ${jamWib(k.sejak)}`} ({nama}). Status dan angka perangkat di rumah bisa basi; data
          yang tertahan di gerbang dikirim sendiri begitu sambungannya pulih.
        </p>
      ))}
    </div>
  );
}
