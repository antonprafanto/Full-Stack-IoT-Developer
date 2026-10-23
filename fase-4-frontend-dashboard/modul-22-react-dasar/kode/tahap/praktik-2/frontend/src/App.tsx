// App.tsx - komponen paling atas dashboard. Untuk sekarang isinya hanya satu judul,
// sekadar bukti bahwa React dan Tailwind sudah bekerja. Komponen lain menyusul mulai Praktik 3.
export default function App() {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      {/* className = atribut class di HTML; isinya kelas-kelas kecil Tailwind */}
      <h1 className="text-3xl font-bold text-teal-700">Rumah Pintar Mini</h1>
      <p className="mt-2 text-slate-600">Dashboard v0.1 sedang dibangun.</p>
    </main>
  );
}
