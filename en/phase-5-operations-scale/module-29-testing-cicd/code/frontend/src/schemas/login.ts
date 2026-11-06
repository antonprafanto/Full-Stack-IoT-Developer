// login.ts - the Log in form's input as a Zod schema. It mirrors the LoginBody schema in backend/src/routes/auth.ts (Module 20):
// a valid email of at most 254 characters, a password of 1-200 characters. That schema isn't in backend/src/schemas/, so it
// can't be copied whole; its two lines are written again here with friendly messages. The backend still checks again.
import { z } from "zod";

export const LoginInput = z.object({
  email: z.email("Not a valid email, for example admin@home.test").max(254, "Email is too long"),
  password: z.string().min(1, "Password is required").max(200, "Password is too long"),
});

export type LoginInput = z.infer<typeof LoginInput>; // { email: string; password: string }
