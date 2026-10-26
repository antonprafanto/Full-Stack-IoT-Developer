// halaman/FormAturan.tsx - layar /aturan/baru dan /aturan/:id (khusus admin, dijaga KhususAdmin di App).
// Pembungkus tipis: menyiapkan isi awal formulir (aturan bawaan, atau aturan tersimpan dari GET /rules), lalu memakai
// komponen FormAturan yang sama untuk keduanya.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ambilAturan, GalatApi } from "../api";
import { aturanBawaan, isiFormulir } from "../aturan";
import type { AturanLengkap } from "../aturan";
import FormAturan from "../components/FormAturan";
import { sesiHabis, useToko } from "../toko";

export default function HalamanFormAturan() {
  const { id } = useParams(); // undefined di /aturan/baru; teks nomor aturan di /aturan/3
  const nomor = id === undefined ? null : Number(id);
  const nomorSah = nomor !== null && Number.isInteger(nomor) && nomor >= 1; // nomor aturan = bilangan bulat mulai 1
  const perangkat = useToko((s) => s.perangkat); // untuk pilihan perangkat di formulir; null = belum dimuat
  const galatPerangkat = useToko((s) => s.galatPerangkat); // GET /devices gagal (misalnya database mati sesaat)
  // aturan yang diubah: null = masih memuat, "tidak-ada" = nomornya tidak ditemukan
  const [aturan, setAturan] = useState<AturanLengkap | "tidak-ada" | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  useEffect(() => {
    if (!nomorSah) return; // aturan baru, atau nomor yang bukan angka: tidak ada yang perlu diambil
    let ignore = false;
    ambilAturan()
      .then((daftar) => {
        if (!ignore) setAturan(daftar.find((a) => a.id === nomor) ?? "tidak-ada");
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof GalatApi && err.kode === 401) return sesiHabis();
        setGalat(err instanceof GalatApi ? err.message : "Gagal memuat aturan.");
      });
    return () => {
      ignore = true;
    };
  }, [nomor, nomorSah]);

  const kembali = (
    <Link to="/aturan" className="inline-flex min-h-11 items-center text-sm font-medium text-teal-700 hover:underline dark:text-teal-300">
      ← Kembali ke daftar aturan
    </Link>
  );
  const kotak = (teks: string) => <p className="rounded-lg bg-white p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-200">{teks}</p>;

  let isi;
  if (galatPerangkat !== null) isi = <p className="rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{galatPerangkat}</p>;
  else if (perangkat === null) isi = <p className="text-slate-500 dark:text-slate-400">Memuat perangkat…</p>;
  else if (nomor === null) isi = <FormAturan id={null} awal={aturanBawaan(perangkat)} />;
  else if (!nomorSah || aturan === "tidak-ada") isi = kotak("Aturan " + id + " tidak ditemukan.");
  else if (galat !== null) isi = <p className="rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{galat}</p>;
  else if (aturan === null) isi = <p className="text-slate-500 dark:text-slate-400">Memuat aturan…</p>;
  // formulir baru dipasang SESUDAH aturannya tiba, jadi isi awalnya langsung benar (tidak perlu reset() susulan).
  // key = nomor aturan: aturan lain berarti formulir baru dengan isian segar.
  else isi = <FormAturan key={aturan.id} id={aturan.id} awal={isiFormulir(aturan)} />;

  return (
    <>
      {kembali}
      {isi}
    </>
  );
}
