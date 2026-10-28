// peta.ts - setelan peta perangkat (Modul 25) dalam SATU konstanta: alamat ubin, tulisan atribusi, batas zoom, dan warna
// penanda. Kebijakan ubin OpenStreetMap meminta alamat ubin tidak ditanam di banyak tempat ("Avoid hard-coding the tile
// URL"): kalau kelak pindah penyedia ubin, cukup berkas ini yang diubah.
export const PETA = {
  // Alamat ubin RESMI OpenStreetMap: https, tanpa "{s}." (alamat lama a./b./c.tile... bisa lambat atau ditutup).
  // {z} = tingkat zoom, {x} dan {y} = nomor kotak ubin. Browser mengunduh ubin langsung dari server OpenStreetMap, jadi
  // halaman Peta butuh internet. Mengunduh ubin secara massal atau menyimpannya untuk dipakai luring DILARANG kebijakan ini.
  ubin: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  // Atribusi WAJIB terlihat di peta (syarat lisensi data OpenStreetMap). Leaflet menaruhnya di pojok kanan bawah sebagai
  // HTML, jadi tautannya bisa diklik. Petik tunggal karena teksnya memuat petik ganda.
  atribusi: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  zoomMaks: 19, // ubin OpenStreetMap tersedia sampai zoom 19 (satu ubin selebar beberapa puluh meter)
  zoomDekat: 18, // saat peta "dipaskan" ke titik-titik perangkat, paling dekat zoom 18: rumah dan jalan di sekitarnya terlihat
  // Warna isi lingkaran penanda. SVG peta tidak mengenal kelas Tailwind, jadi warnanya ditulis sebagai kode warna.
  // Warna tidak pernah sendirian: popup penanda dan keterangan di bawah peta menuliskan statusnya dengan kata.
  warnaOnline: "#15803d", // hijau (setara green-700 Tailwind): perangkat online
  warnaLain: "#64748b", // abu-abu (setara slate-500 Tailwind): offline, mode offline, belum diketahui, atau kiriman diabaikan
};
