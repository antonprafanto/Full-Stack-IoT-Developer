// masuk.ts - isian formulir Masuk sebagai skema Zod. Meniru skema Masuk di backend/src/routes/auth.ts (Modul 20):
// email sah paling panjang 254 huruf, sandi 1-200 huruf. Skema itu tidak ada di backend/src/schemas/, jadi tidak bisa
// disalin utuh; dua barisnya ditulis ulang di sini dengan pesan yang ramah. Backend tetap memeriksa ulang.
import { z } from "zod";

export const IsianMasuk = z.object({
  email: z.email("Email tidak sah, contohnya admin@rumah.test").max(254, "Email terlalu panjang"),
  sandi: z.string().min(1, "Sandi wajib diisi").max(200, "Sandi terlalu panjang"),
});

export type IsianMasuk = z.infer<typeof IsianMasuk>; // { email: string; sandi: string }
