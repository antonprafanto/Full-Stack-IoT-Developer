// Login.tsx - a minimal login form: email + password to POST /auth/login. On success, the backend sets the
// login cookies in the browser, then the parent component is told through onLogin. Improved in Module 24.
import { useState } from "react";
import type { SubmitEvent } from "react"; // React's type for the "form submitted" event
import { ApiError, login } from "../api";
import type { User } from "../types";

type Props = {
  initialError: string | null; // a message from App (for example backend down or session expired), shown before logging in
  onLogin: (user: User) => void; // called after a successful login, carrying the account from the backend
};

export default function Login({ initialError, onLogin }: Props) {
  // A controlled form: what the box holds is always the same as the state, and every keystroke updates the state.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError); // its starting value comes from App; replaced on a login try
  const [busy, setBusy] = useState(false); // true while waiting for the backend's answer

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault(); // don't let the browser reload the page (a form's default behavior)
    setError(null);
    setBusy(true);
    try {
      onLogin(await login(email, password));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't log in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-md">
        <h1 className="text-xl font-bold text-slate-800">Mini Smart Home</h1>
        <p className="mt-1 text-sm text-slate-500">Log in with your Module 20 account to see the dashboard.</p>

        {/* htmlFor = the for attribute in HTML: tapping the label moves the cursor into its box */}
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
          placeholder="viewer@home.test"
          className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-hidden"
        />

        <label htmlFor="password" className="mt-4 block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-hidden"
        />

        {error ? <p className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}

        {/* min-h-11 = a minimum height of 44 px for the input boxes and the button: easy to tap with a thumb on a phone */}
        <button
          type="submit"
          disabled={busy}
          className="mt-5 min-h-11 w-full rounded-lg bg-teal-600 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
