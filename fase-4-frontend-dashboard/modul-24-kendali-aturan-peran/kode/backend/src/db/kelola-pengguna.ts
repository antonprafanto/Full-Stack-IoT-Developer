// kelola-pengguna.ts - membuat dan mengurus akun dari terminal (Modul 20). Sengaja TIDAK ada rute API untuk mendaftar:
// akun hanya bisa dibuat oleh orang yang memegang laptop server dan file .env-nya.
// Jalankan dari folder backend:
//   npm run pengguna -- tambah <email> "<nama>" <admin|viewer>   sandi ditanyakan dan tidak tampil di layar
//   npm run pengguna -- sandi <email>                            ganti sandi; semua sesi akun itu dicabut
//   npm run pengguna -- peran <email> <admin|viewer>
//   npm run pengguna -- hapus <email>
//   npm run pengguna -- daftar
// Sandi TIDAK PERNAH ditulis sebagai argumen: argumen tersimpan di riwayat terminal dan terlihat di daftar proses.
import { z } from "zod";
import { pool } from "./pool.ts";
import { Sandi, buatSidikJari } from "../auth/sandi.ts";
import { cariUntukLogin, gantiPeran, gantiSandi, hapusPengguna, semuaPengguna, tambahPengguna } from "./pengguna.ts";
import type { Peran } from "./pengguna.ts";

const Email = z.email("email tidak sah").max(254);
const PeranSah = z.enum(["admin", "viewer"], "peran harus admin atau viewer");

// Tanya sandi tanpa menampilkannya: terminal dibuat "mentah" (raw) supaya setiap tombol sampai ke program tanpa
// ditampilkan, lalu program hanya menulis * untuk setiap karakter.
function tanyaTersembunyi(label: string): Promise<string> {
  const masuk = process.stdin;
  if (!masuk.isTTY) { // misalnya jendela Git Bash (mintty): ketikan tidak bisa disembunyikan, jadi jangan bertanya
    throw new Error("terminal ini tidak bisa menyembunyikan ketikan sandi; jalankan perintah ini di terminal VS Code "
      + "(PowerShell) atau Terminal macOS");
  }
  process.stdout.write(label);
  masuk.setRawMode(true);
  masuk.setEncoding("utf8");
  masuk.resume();
  return new Promise((selesai) => {
    let isi: string[] = [];
    const dengar = (data: string) => {
      if (data.startsWith("\u001b")) return; // tombol panah dan sejenisnya: abaikan
      for (const huruf of data) {
        if (huruf === "\r" || huruf === "\n") { // Enter
          masuk.off("data", dengar);
          masuk.setRawMode(false);
          masuk.pause();
          process.stdout.write("\n");
          return selesai(isi.join(""));
        }
        if (huruf === "\u0003") { // Ctrl + C
          process.stdout.write("\n");
          process.exit(130);
        }
        if (huruf === "\u007f" || huruf === "\b") { // Backspace (macOS/Linux mengirim \u007f, Windows \b)
          if (isi.length > 0) {
            isi = isi.slice(0, -1);
            process.stdout.write("\b \b");
          }
          continue;
        }
        if (huruf < " ") continue; // tombol kendali lain (Tab dan sebagainya)
        isi.push(huruf);
        process.stdout.write("*");
      }
    };
    masuk.on("data", dengar);
  });
}

async function mintaSandiBaru(): Promise<string> {
  for (let coba = 1; coba <= 3; coba++) {
    const sandi = await tanyaTersembunyi("Sandi baru: ");
    const periksa = Sandi.safeParse(sandi);
    if (!periksa.success) {
      console.log(periksa.error.issues[0].message);
      continue;
    }
    if (await tanyaTersembunyi("Ketik sekali lagi: ") !== sandi) {
      console.log("dua sandi itu tidak sama, ulangi");
      continue;
    }
    return sandi;
  }
  throw new Error("sandi belum dibuat setelah 3 kali percobaan");
}

function periksa<T>(skema: z.ZodType<T>, nilai: string | undefined): T {
  const hasil = skema.safeParse(nilai);
  if (!hasil.success) throw new Error(`${nilai ?? "(kosong)"}: ${hasil.error.issues[0].message}`);
  return hasil.data;
}

const CARA_PAKAI = `Cara pakai (dari folder backend):
  npm run pengguna -- tambah <email> "<nama>" <admin|viewer>
  npm run pengguna -- sandi <email>
  npm run pengguna -- peran <email> <admin|viewer>
  npm run pengguna -- hapus <email>
  npm run pengguna -- daftar`;

const [perintah, ...argumen] = process.argv.slice(2);
try {
  if (perintah === "tambah" && argumen.length === 3) {
    const email = periksa(Email, argumen[0]).toLowerCase(); // Budi@Rumah.test dan budi@rumah.test = akun yang sama
    const peran: Peran = periksa(PeranSah, argumen[2]);
    if (await cariUntukLogin(email) !== undefined) throw Object.assign(new Error("sudah terdaftar"), { code: "23505" });
    const sandi = await mintaSandiBaru(); // email diperiksa dulu, supaya ketikan sandi tidak terbuang percuma
    const akun = await tambahPengguna(email, argumen[1], peran, await buatSidikJari(sandi));
    console.log(`akun ${akun.id} dibuat: ${akun.email} (${akun.nama}, ${akun.peran})`);
  } else if (perintah === "sandi" && argumen.length === 1) {
    const email = periksa(Email, argumen[0]).toLowerCase();
    if (await cariUntukLogin(email) === undefined) throw new Error(`${email} tidak terdaftar`);
    const akun = await gantiSandi(email, await buatSidikJari(await mintaSandiBaru()));
    console.log(`sandi ${akun?.email} diganti; semua sesinya dicabut (harus login lagi)`);
  } else if (perintah === "peran" && argumen.length === 2) {
    const email = periksa(Email, argumen[0]).toLowerCase();
    const akun = await gantiPeran(email, periksa(PeranSah, argumen[1]));
    console.log(akun ? `${akun.email} sekarang ${akun.peran} (berlaku paling lambat 15 menit lagi, saat gelangnya diperbarui)`
      : `${email} tidak terdaftar`);
  } else if (perintah === "hapus" && argumen.length === 1) {
    const email = periksa(Email, argumen[0]).toLowerCase();
    console.log(await hapusPengguna(email) ? `${email} dihapus beserta semua sesinya` : `${email} tidak terdaftar`);
  } else if (perintah === "daftar") {
    console.table(await semuaPengguna()); // sidik jari sandi tidak ikut ditampilkan
  } else {
    console.log(CARA_PAKAI);
    process.exitCode = 1;
  }
} catch (galat) {
  const kode = (galat as { code?: string }).code;
  if (kode === "23505") console.error("email itu sudah terdaftar; untuk mengganti sandinya: npm run pengguna -- sandi <email>");
  else console.error(`gagal: ${(galat as Error).message}`);
  process.exitCode = 1;
}
await pool.end(); // tutup kolam supaya program selesai
