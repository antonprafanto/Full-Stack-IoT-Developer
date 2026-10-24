// Gauge.tsx - gauge setengah lingkaran (RadialBarChart Recharts) untuk besaran yang batasnya jelas: 0-100 %.
// Skalanya WAJIB ditulis (domain 0-100). Tanpa itu, Recharts mengukur busur terhadap nilainya sendiri, dan gauge
// selalu tampak penuh walaupun isinya hanya 14 %.
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";

type Props = {
  label: string; // misalnya "Kelembapan tanah"
  nilai: number | null; // persen; null = sensor gagal dibaca: busur kosong dan angka "—"
  ambangRendah?: number; // di bawah angka ini: warna peringatan + tulisan "rendah"
};

export default function Gauge({ label, nilai, ambangRendah }: Props) {
  const rendah = nilai !== null && ambangRendah !== undefined && nilai < ambangRendah;
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <p className="truncate text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <div className="relative mx-auto mt-2 max-w-48">
        {/* startAngle 180 -> endAngle 0 = setengah lingkaran dari kiri ke kanan; cy="100%" = pusatnya di tepi bawah */}
        <RadialBarChart
          responsive
          style={{ width: "100%", aspectRatio: 2 }}
          data={[{ nilai: nilai ?? 0 }]}
          startAngle={180}
          endAngle={0}
          cy="100%"
          innerRadius="140%"
          outerRadius="200%"
        >
          {/* skala tetap 0-100: tanpa baris ini, busurnya selalu penuh */}
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar
            dataKey="nilai"
            background={{ fill: "var(--warna-lintasan)" }} // lintasan abu-abu di belakang busur
            cornerRadius={6}
            fill={rendah ? "var(--color-amber-500)" : "var(--color-teal-500)"}
            isAnimationActive={false}
          />
        </RadialBarChart>
        {/* angka + satuan di tengah lengkungan */}
        <p className="absolute inset-x-0 bottom-0 text-center text-2xl font-semibold text-slate-800 dark:text-slate-100">
          {nilai ?? "—"}
          {nilai !== null ? <span className="ml-0.5 text-base font-normal text-slate-400">%</span> : null}
        </p>
      </div>
      {/* warna tidak pernah sendirian: keadaan "rendah" juga ditulis */}
      {rendah ? (
        <p className="mt-1 text-center text-sm font-medium text-amber-700 dark:text-amber-400">rendah (di bawah {ambangRendah} %)</p>
      ) : null}
    </div>
  );
}
