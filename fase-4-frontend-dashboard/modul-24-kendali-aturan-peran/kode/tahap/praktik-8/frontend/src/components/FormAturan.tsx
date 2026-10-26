// FormAturan.tsx - SATU formulir untuk membuat dan mengubah aturan otomatis (Modul 24).
// Isiannya diperiksa skema Aturan yang SAMA dengan backend (salinan di skema/aturan-dasar.ts) lewat react-hook-form +
// zodResolver: pesan galat tampil di bawah kolomnya sebelum apa pun dikirim. Backend tetap memeriksa ulang; galat 400-nya
// (misalnya ekspresi cron yang tidak sah) ikut ditaruh di kolomnya.
// Berkas ini memegang formulirnya (isian, simpan, hapus, pratinjau). Kolom-kolomnya digambar tiga bagian kecil:
// BagianKapan ("Kapan?"), BagianLalu ("Lalu?"), dan KonfirmasiHapus (tombol Hapus aturan + kotak "yakin?").
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import type { FieldPath } from "react-hook-form";
import { useNavigate } from "react-router";
import { buatAturan, GalatApi, hapusAturan, ubahAturan } from "../api";
import { aksiBawaan, kondisiBawaan, namaPerangkat, perintahBawaan, pesanRamah, uraikanAturan, uraikanGalat400 } from "../aturan";
import { idKolom, KOTAK, LABEL, useKolom } from "../kolom";
import { Aturan } from "../skema/aturan-dasar";
import type { PerintahSet } from "../skema/kontrak";
import { toast } from "../toast";
import { sesiHabis, useToko } from "../toko";
import BagianKapan from "./BagianKapan";
import BagianLalu from "./BagianLalu";
import KonfirmasiHapus from "./KonfirmasiHapus";

type Props = {
  id: number | null; // null = aturan baru (POST); angka = mengubah aturan bernomor itu (PUT)
  awal: Aturan; // isi awal formulir
};

// Kolom yang punya tempat pesan galat di layar. Galat 400 dari backend untuk kolom LAIN (misalnya "kondisi.jenis" dari
// backend lama yang belum mengenal "ambang-bawah") ditulis di atas tombol Simpan, supaya tidak hilang tanpa jejak.
const KOLOM_TAMPIL = ["nama", "kondisi.cron", "kondisi.device_id", "kondisi.nyala_di_atas", "kondisi.padam_di_bawah",
  "kondisi.nyala_di_bawah", "kondisi.padam_di_atas", "kondisi.selama_detik", "aksi.jenis", "aksi.device_id", "aksi.perintah.nilai"];

export default function FormAturan({ id, awal }: Props) {
  const navigate = useNavigate();
  const perangkat = useToko((s) => s.perangkat) ?? [];
  const [menghapus, setMenghapus] = useState(false); // true selama DELETE /rules/:id berjalan

  // mode "onTouched": kolom diperiksa sesudah ditinggalkan sekali, lalu setiap kali diketik.
  // zodResolver(Aturan, { error: pesanRamah }): skema yang sama dengan backend + peta pesan yang lebih ramah.
  const formulir = useForm({ resolver: zodResolver(Aturan, { error: pesanRamah }), mode: "onTouched", defaultValues: awal });
  const { register, control, handleSubmit, setValue, unregister, setError, clearErrors, formState } = formulir;
  const { aria, tampilGalat } = useKolom(control); // untuk kolom Nama (bagian lain memakai useKolom() sendiri)

  // useWatch = "awasi" isian kondisi dan aksi: komponen ini digambar ulang setiap kali isinya berubah. Dipakai untuk
  // memilih kolom yang tampil (bergantung "Kapan?" dan "Lalu?") dan untuk pratinjau kalimat.
  const [kondisi, aksi] = useWatch({ control, name: ["kondisi", "aksi"] });

  // Mengganti "Kapan?": SELURUH isi kondisi diganti sekaligus. Kolom milik pilihan lama ikut hilang dari isian, jadi
  // skema yang ketat (strictObject) tidak menolaknya dengan "Kunci tidak dikenali".
  function gantiKapan(jenis: Aturan["kondisi"]["jenis"]) {
    if (jenis === kondisi.jenis) return;
    const deviceId = "device_id" in kondisi ? kondisi.device_id : aksi.device_id;
    setValue("kondisi", kondisiBawaan(jenis, deviceId), { shouldDirty: true });
    clearErrors("kondisi");
    // jadwal hanya punya saat mulai, tanpa saat selesai: aksinya harus perintah sekali, bukan sakelar
    if (jenis === "jadwal" && aksi.jenis === "sakelar") gantiAksi("perintah");
  }

  // Mengganti "Lalu?": seluruh isi aksi diganti sekaligus (perangkat dan pilihan Telegram dipertahankan).
  function gantiAksi(jenis: Aturan["aksi"]["jenis"]) {
    if (jenis === aksi.jenis) return;
    unregister("aksi.perintah.nilai"); // lihat gantiTarget di bawah
    setValue("aksi", aksiBawaan(jenis, aksi.device_id, aksi.kabari), { shouldDirty: true });
    clearErrors("aksi");
  }

  // Mengganti jenis perintah (pompa, lampu, kipas, tirai). Kolom nilai berganti jenis: angka untuk pompa dan tirai,
  // nyala/mati untuk lampu dan kipas. Kolom lama dilepas dulu (unregister), supaya cara membacanya (valueAsNumber)
  // tidak terbawa ke kolom yang baru.
  function gantiTarget(target: PerintahSet["target"]) {
    unregister("aksi.perintah.nilai");
    setValue("aksi.perintah", perintahBawaan(target), { shouldDirty: true });
    clearErrors("aksi.perintah");
  }

  // dipanggil handleSubmit HANYA kalau isian lolos skema; selama fungsi ini berjalan, isSubmitting = true
  async function simpan(isi: Aturan) {
    try {
      if (id === null) await buatAturan(isi);
      else await ubahAturan(id, isi);
      toast('Aturan "' + isi.nama + '" disimpan.', "sukses");
      // replace: tombol Back di daftar aturan tidak membuka lagi formulir yang sudah tersimpan
      navigate("/aturan", { replace: true });
    } catch (err) {
      if (err instanceof GalatApi && err.kode === 401) return sesiHabis();
      if (err instanceof GalatApi && err.kode === 400) {
        // galat yang hanya bisa ditemukan backend (misalnya cron "61 * * * *"): taruh di kolomnya, lalu fokus ke kolom
        // pertama yang salah. Galat untuk kolom tanpa tempat pesan dikumpulkan di atas tombol Simpan.
        const umum: string[] = [];
        let pertama = true;
        for (const g of uraikanGalat400(err.message)) {
          if (KOLOM_TAMPIL.includes(g.kolom)) {
            // nama kolom datang dari teks jawaban backend, jadi TypeScript tidak bisa memeriksanya: "as" = kita yang menjamin
            setError(g.kolom as FieldPath<Aturan>, { type: "server", message: g.pesan }, { shouldFocus: pertama });
            pertama = false;
          } else {
            umum.push(g.kolom === "" ? g.pesan : g.kolom + ": " + g.pesan);
          }
        }
        if (umum.length > 0) setError("root.server", { message: "Ditolak server: " + umum.join("; ") });
        return;
      }
      setError("root.server", { message: err instanceof GalatApi ? err.message : "Gagal menyimpan aturan." });
    }
  }

  async function hapus() {
    if (id === null) return;
    setMenghapus(true);
    try {
      const hasil = await hapusAturan(id);
      toast('Aturan "' + hasil.nama + '" dihapus.', "sukses");
      navigate("/aturan", { replace: true }); // Back tidak membuka lagi formulir aturan yang sudah terhapus
    } catch (err) {
      setMenghapus(false);
      if (err instanceof GalatApi && err.kode === 401) return sesiHabis();
      if (err instanceof GalatApi && err.kode === 404) {
        toast("Aturan ini sudah tidak ada (mungkin dihapus dari dashboard lain).", "info");
        return navigate("/aturan", { replace: true });
      }
      setError("root.server", { message: err instanceof GalatApi ? err.message : "Gagal menghapus aturan." });
    }
  }

  return (
    // FormProvider: bagian-bagian di dalamnya (BagianKapan, BagianLalu) memakai formulir yang sama lewat useFormContext.
    // noValidate: pemeriksaan bawaan browser dimatikan, supaya semua pesan datang dari skema yang sama dengan backend.
    <FormProvider {...formulir}>
      <form onSubmit={handleSubmit(simpan)} noValidate className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{id === null ? "Aturan baru" : "Ubah aturan " + id}</h2>

        <label htmlFor={idKolom("nama")} className={LABEL}>
          Nama aturan
        </label>
        <input id={idKolom("nama")} placeholder="misalnya Siram jika tanah kering" {...aria("nama")} {...register("nama")} className={KOTAK} />
        {tampilGalat("nama")}

        <BagianKapan kondisi={kondisi} gantiKapan={gantiKapan} />
        <BagianLalu aksi={aksi} jadwal={kondisi.jenis === "jadwal"} gantiAksi={gantiAksi} gantiTarget={gantiTarget} />

        {/* pratinjau: kalimat aturan dari isian saat ini, berubah sambil mengetik */}
        <div className="mt-5 rounded-lg bg-slate-100 p-3 text-sm text-slate-800 dark:bg-slate-900 dark:text-slate-100">
          <p className="font-medium">Pratinjau</p>
          <p className="mt-1">{uraikanAturan({ nama: "", aktif: true, kondisi, aksi }, (d) => namaPerangkat(perangkat, d))}</p>
        </div>

        {/* galat dari jawaban server yang tidak menunjuk satu kolom: role="alert" = langsung dibacakan pembaca layar */}
        {formState.errors.root?.server ? (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 p-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
            {formState.errors.root.server.message}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={formState.isSubmitting || menghapus}
            className="min-h-11 rounded-lg bg-teal-600 px-5 font-medium text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {formState.isSubmitting ? "Menyimpan…" : "Simpan aturan"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/aturan")}
            className="min-h-11 rounded-lg border border-slate-300 px-4 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Batal
          </button>
          {id !== null ? <KonfirmasiHapus nama={awal.nama} menghapus={menghapus} onHapus={hapus} /> : null}
        </div>
      </form>
    </FormProvider>
  );
}
