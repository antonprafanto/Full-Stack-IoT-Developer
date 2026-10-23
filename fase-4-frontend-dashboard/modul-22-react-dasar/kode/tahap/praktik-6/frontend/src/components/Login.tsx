// Login.tsx - formulir masuk minimal: email + sandi ke POST /auth/login. Kalau berhasil, backend memasang
// cookie login di browser, lalu komponen induk diberi tahu lewat onMasuk. Disempurnakan di Modul 24.
import { useState } from "react";
import type { SubmitEvent } from "react"; // tipe kejadian "formulir dikirim" milik React
import { GalatApi, masuk } from "../api";
import type { Pengguna } from "../types";

type Props = {
  galatAwal: string | null; // pesan dari App (misalnya backend mati atau sesi habis), tampil sebelum mencoba masuk
  onMasuk: (pengguna: Pengguna) => void; // dipanggil sesudah login berhasil, membawa akun dari backend
};

export default function Login({ galatAwal, onMasuk }: Props) {
  // Formulir terkendali: isi kotak selalu sama dengan state, dan setiap ketikan memperbarui state.
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [galat, setGalat] = useState<string | null>(galatAwal); // isi awalnya dari App; diganti saat mencoba masuk
  const [sibuk, setSibuk] = useState(false); // true selama menunggu jawaban backend

  async function kirim(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault(); // jangan biarkan browser memuat ulang halaman (perilaku bawaan formulir)
    setGalat(null);
    setSibuk(true);
    try {
      onMasuk(await masuk(email, sandi));
    } catch (err) {
      setGalat(err instanceof GalatApi ? err.message : "Gagal masuk.");
    } finally {
      setSibuk(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form onSubmit={kirim} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-md">
        <h1 className="text-xl font-bold text-slate-800">Rumah Pintar Mini</h1>
        <p className="mt-1 text-sm text-slate-500">Masuk dengan akun Modul 20 untuk melihat dashboard.</p>

        {/* htmlFor = atribut for di HTML: mengetuk label memindahkan kursor ke kotaknya */}
        <label htmlFor="email" className="mt-5 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          placeholder="viewer@rumah.test"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-hidden"
        />

        <label htmlFor="sandi" className="mt-4 block text-sm font-medium text-slate-700">
          Sandi
        </label>
        <input
          id="sandi"
          type="password"
          required
          value={sandi}
          onChange={(e) => setSandi(e.target.value)}
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-hidden"
        />

        {galat ? <p className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">{galat}</p> : null}

        <button
          type="submit"
          disabled={sibuk}
          className="mt-5 w-full rounded-lg bg-teal-600 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {sibuk ? "Sedang masuk…" : "Masuk"}
        </button>
      </form>
    </div>
  );
}
