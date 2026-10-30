// halaman/Masuk.tsx - layar /masuk: formulir email + sandi ke POST /auth/login (Modul 20).
// Modul 24: ditulis ulang dengan react-hook-form + Zod. Formulir tidak lagi memakai useState per kolom: react-hook-form
// yang menyimpan isiannya, dan skema IsianMasuk yang memeriksanya (pesan galat tampil di bawah kolomnya).
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Navigate, useLocation } from "react-router";
import { GalatApi, masuk } from "../api";
import { IsianMasuk } from "../skema/masuk";
import { useToko } from "../toko";

// aria-[invalid=true]: = gaya yang hanya berlaku saat kotak ditandai salah (garis merah, selain teks galatnya).
// focus: = tepi dan garis luar teal-700 saat kotak diketik, cukup kontras (lebih dari 3 : 1) di atas putih (Praktik 9)
const KOTAK =
  "mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-2 focus:outline-offset-2 focus:outline-teal-700 aria-[invalid=true]:border-red-600 dark:border-slate-600 dark:bg-slate-900 dark:focus:border-teal-400 dark:focus:outline-teal-400 dark:aria-[invalid=true]:border-red-400";

export default function HalamanMasuk() {
  const pengguna = useToko((s) => s.pengguna);
  const pesanMasuk = useToko((s) => s.pesanMasuk); // misalnya "Sesi sudah habis. Silakan masuk lagi."
  const location = useLocation();
  // alamat yang tadi diminta sebelum dipindah penjaga ke sini (JagaMasuk menitipkannya di state); bawaannya /perangkat
  const dari = (location.state as { dari?: { pathname: string; search: string } } | null)?.dari;
  const tujuan = dari ? dari.pathname + dari.search : "/perangkat";

  // mode "onTouched": kolom baru diperiksa sesudah ditinggalkan sekali (blur), lalu setiap kali diketik.
  // defaultValues string kosong (bukan undefined): react-hook-form meminta setiap kolom punya nilai awal.
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(IsianMasuk), mode: "onTouched", defaultValues: { email: "", sandi: "" } });

  // Sudah masuk (baru saja berhasil, atau membuka /masuk padahal cookie-nya masih berlaku): pindah ke tujuan.
  if (pengguna !== null && pengguna !== "memuat") return <Navigate to={tujuan} replace />;
  if (pengguna === "memuat") {
    return <p className="flex min-h-screen items-center justify-center text-slate-600 dark:text-slate-400">Memeriksa sesi…</p>;
  }

  // dipanggil handleSubmit HANYA kalau isian lolos skema; selama fungsi ini berjalan, isSubmitting bernilai true
  async function kirim(isian: IsianMasuk) {
    try {
      // berhasil: pengguna di toko terisi, layar ini digambar ulang, lalu <Navigate> di atas memindahkan ke tujuan
      useToko.getState().setPengguna(await masuk(isian.email, isian.sandi));
    } catch (err) {
      // 401 "email atau sandi salah", 429 "terlalu banyak percobaan…", 503, atau backend mati: tampil di atas tombol
      setError("root.server", { message: err instanceof GalatApi ? err.message : "Gagal masuk." });
    }
  }

  return (
    // main = "isi utama" halaman (landmark): pembaca layar bisa langsung melompat ke sini (Modul 24 Praktik 9)
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-900">
      {/* noValidate: pemeriksaan bawaan browser dimatikan, supaya semua pesan datang dari skema yang sama */}
      <form onSubmit={handleSubmit(kirim)} noValidate className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-md dark:bg-slate-800">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Rumah Pintar Mini</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Masuk dengan akun Modul 20 untuk melihat dashboard.</p>
        {/* kabar dari layar sebelumnya (sesi habis, backend tidak menjawab): role="status" = dibacakan pembaca layar */}
        {pesanMasuk ? (
          <p role="status" className="mt-3 rounded-lg bg-slate-100 p-2 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-200">
            {pesanMasuk}
          </p>
        ) : null}

        {/* htmlFor = atribut for di HTML: mengetuk label memindahkan kursor ke kotaknya */}
        <label htmlFor="email" className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Email
        </label>
        {/* {...register("email")} = pasang kotak ini ke react-hook-form (name, onChange, onBlur, ref).
            aria-invalid + aria-describedby: pembaca layar ikut membacakan pesan galat saat kotaknya disentuh */}
        <input
          id="email"
          type="email"
          autoComplete="username"
          placeholder="viewer@rumah.test"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "email-galat" : undefined}
          {...register("email")}
          className={KOTAK}
        />
        {errors.email ? (
          <p id="email-galat" className="mt-1 text-sm text-red-700 dark:text-red-300">
            {errors.email.message}
          </p>
        ) : null}

        <label htmlFor="sandi" className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Sandi
        </label>
        <input
          id="sandi"
          type="password"
          autoComplete="current-password"
          aria-invalid={errors.sandi ? true : undefined}
          aria-describedby={errors.sandi ? "sandi-galat" : undefined}
          {...register("sandi")}
          className={KOTAK}
        />
        {errors.sandi ? (
          <p id="sandi-galat" className="mt-1 text-sm text-red-700 dark:text-red-300">
            {errors.sandi.message}
          </p>
        ) : null}

        {/* galat dari jawaban server (bukan dari skema): role="alert" = langsung dibacakan pembaca layar */}
        {errors.root?.server ? (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
            {errors.root.server.message}
          </p>
        ) : null}

        {/* min-h-11 = tinggi minimal 44 px: mudah diketuk jempol di HP */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 min-h-11 w-full rounded-lg bg-teal-700 py-2 font-medium text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {isSubmitting ? "Sedang masuk…" : "Masuk"}
        </button>
      </form>
    </main>
  );
}
