// pages/Login.tsx - the /login screen: the email + password form for POST /auth/login (Module 20).
// Module 24: rewritten with react-hook-form + Zod. The form no longer uses a useState per field: react-hook-form
// keeps the input, and the LoginInput schema checks it (an error message shows under its field).
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Navigate, useLocation } from "react-router";
import { ApiError, login } from "../api";
import { LoginInput } from "../schemas/login";
import { useLiveStore } from "../store";

// aria-[invalid=true]: = a style that only applies while the box is marked wrong (a red edge, besides its error text)
const BOX =
  "mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-hidden aria-[invalid=true]:border-red-600 dark:border-slate-600 dark:bg-slate-900 dark:aria-[invalid=true]:border-red-400";

export default function LoginPage() {
  const user = useLiveStore((s) => s.user);
  const loginMessage = useLiveStore((s) => s.loginMessage); // for example "Your session has expired. Please log in again."
  const location = useLocation();
  // the address asked for before the guard moved them here (RequireLogin hands it over in state); by default /devices
  const from = (location.state as { from?: { pathname: string; search: string } } | null)?.from;
  const destination = from ? from.pathname + from.search : "/devices";

  // mode "onTouched": a field is only checked after it has been left once (blur), then every time it is typed in.
  // defaultValues are empty strings (not undefined): react-hook-form asks for a starting value for every field.
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(LoginInput), mode: "onTouched", defaultValues: { email: "", password: "" } });

  // Already logged in (just succeeded, or opened /login while the cookie is still valid): go to the destination.
  if (user !== null && user !== "loading") return <Navigate to={destination} replace />;
  if (user === "loading") {
    return <p className="flex min-h-screen items-center justify-center text-slate-500 dark:text-slate-400">Checking the session…</p>;
  }

  // handleSubmit calls this ONLY if the input passes the schema; while this function runs, isSubmitting is true
  async function submit(input: LoginInput) {
    try {
      // success: the store's user is filled in, this screen is drawn again, then the <Navigate> above moves to the destination
      useLiveStore.getState().setUser(await login(input.email, input.password));
    } catch (err) {
      // 401 "wrong email or password", 429 "too many attempts…", 503, or the backend is down: shown above the button
      setError("root.server", { message: err instanceof ApiError ? err.message : "Couldn't log in." });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-900">
      {/* noValidate: the browser's built-in checks are turned off, so every message comes from the same schema */}
      <form onSubmit={handleSubmit(submit)} noValidate className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-md dark:bg-slate-800">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Mini Smart Home</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Log in with your Module 20 account to see the dashboard.</p>
        {/* a notice from the previous screen (session expired, backend not answering): role="status" = read by screen readers */}
        {loginMessage ? (
          <p role="status" className="mt-3 rounded-lg bg-slate-100 p-2 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-200">
            {loginMessage}
          </p>
        ) : null}

        {/* htmlFor = the for attribute in HTML: tapping the label moves the cursor into its box */}
        <label htmlFor="email" className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Email
        </label>
        {/* {...register("email")} = connect this box to react-hook-form (name, onChange, onBlur, ref).
            aria-invalid + aria-describedby: screen readers also read the error message when the box is touched */}
        <input
          id="email"
          type="email"
          autoComplete="username"
          placeholder="viewer@home.test"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
          className={BOX}
        />
        {errors.email ? (
          <p id="email-error" className="mt-1 text-sm text-red-700 dark:text-red-300">
            {errors.email.message}
          </p>
        ) : null}

        <label htmlFor="password" className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? "password-error" : undefined}
          {...register("password")}
          className={BOX}
        />
        {errors.password ? (
          <p id="password-error" className="mt-1 text-sm text-red-700 dark:text-red-300">
            {errors.password.message}
          </p>
        ) : null}

        {/* an error from the server's answer (not from the schema): role="alert" = read out by screen readers at once */}
        {errors.root?.server ? (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
            {errors.root.server.message}
          </p>
        ) : null}

        {/* min-h-11 = a minimum height of 44 px: easy to tap with a thumb on a phone */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 min-h-11 w-full rounded-lg bg-teal-600 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {isSubmitting ? "Logging in…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
