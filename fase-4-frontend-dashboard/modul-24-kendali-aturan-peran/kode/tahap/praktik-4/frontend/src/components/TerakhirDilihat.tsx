// TerakhirDilihat.tsx - "terakhir dilihat 12 detik yang lalu", ditambah tanda "data basi" kalau perangkat sudah terlalu
// lama diam. Komponen kecil ini berdetak sendiri tiap detik, jadi hanya tulisan ini yang digambar ulang,
// bukan seluruh kartu atau seluruh layar.
import type { Jenis } from "../types";
import { batasBasi, jamRelatif, useSekarang } from "../waktu";

type Props = {
  t: number | undefined; // kapan perangkat terakhir terdengar (milidetik); undefined = belum pernah
  jenis: Jenis; // menentukan batas basi: Node 2 memang hanya mengirim tiap 5 menit
  periksaBasi: boolean; // false untuk perangkat yang kirimannya memang diabaikan backend (dicabut, belum terdaftar)
};

export default function TerakhirDilihat({ t, jenis, periksaBasi }: Props) {
  const sekarang = useSekarang();
  if (t === undefined) return <span>belum pernah terlihat</span>;
  const basi = periksaBasi && sekarang - t > batasBasi(jenis);
  return (
    <span>
      terakhir dilihat {jamRelatif(t, sekarang)}
      {/* status "online" belum tentu segar: angka yang lama tidak diperbarui harus tampak basi */}
      {basi ? <span className="ml-1 font-medium text-amber-700 dark:text-amber-400">· data basi</span> : null}
    </span>
  );
}
