// kolom.tsx - pembantu kecil untuk kolom formulir aturan (Modul 24): gaya kotak dan label, id setiap kolom, serta pesan
// galat setiap kolom beserta atribut aksesibilitasnya. Dipakai FormAturan dan bagian-bagiannya (BagianKapan, BagianLalu).
import { get, useFormState } from "react-hook-form";
import type { Control, FieldError } from "react-hook-form";
import type { Aturan } from "./skema/aturan-dasar";

// gaya kotak isian. aria-[invalid=true]: = garis merah saat kolom ditandai salah. focus: = saat kotak sedang diketik:
// tepi dan garis luar teal-700, cukup kontras (lebih dari 3 : 1) di atas putih (Praktik 9)
export const KOTAK =
  "mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-teal-700 focus:outline-2 focus:outline-offset-2 focus:outline-teal-700 aria-[invalid=true]:border-red-600 dark:border-slate-600 dark:bg-slate-900 dark:focus:border-teal-400 dark:focus:outline-teal-400 dark:aria-[invalid=true]:border-red-400";
export const LABEL = "mt-4 block text-sm font-medium text-slate-700 dark:text-slate-200";

// id unik setiap kolom, dari namanya: "kondisi.cron" -> "kolom-kondisi-cron"
export const idKolom = (nama: string) => "kolom-" + nama.replaceAll(".", "-");

// useKolom - pesan galat setiap kolom (dari skema di browser, atau dari jawaban 400 backend). Tanpa control, useFormState
// membaca formulir terdekat (dari <FormProvider> di FormAturan), jadi bagian mana pun bisa memakainya tanpa dititipi props.
// FormAturan sendiri berada di LUAR <FormProvider>-nya, jadi ia memberikan control formulirnya.
export function useKolom(control?: Control<Aturan>) {
  const { errors } = useFormState({ control });
  const galat = (nama: string): string | undefined => get<typeof errors, FieldError | undefined>(errors, nama)?.message;
  // atribut aksesibilitas kotak isian: aria-invalid + aria-describedby HANYA saat kolomnya salah
  const aria = (nama: string) =>
    galat(nama) ? { "aria-invalid": true, "aria-describedby": idKolom(nama) + "-galat" } : { "aria-invalid": undefined, "aria-describedby": undefined };
  const tampilGalat = (nama: string) =>
    galat(nama) ? (
      <p id={idKolom(nama) + "-galat"} className="mt-1 text-sm text-red-700 dark:text-red-300">
        {galat(nama)}
      </p>
    ) : null;
  return { aria, tampilGalat };
}
