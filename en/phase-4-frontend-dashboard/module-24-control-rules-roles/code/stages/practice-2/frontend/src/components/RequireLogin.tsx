// RequireLogin.tsx - a route guard (protected route). Mounted as a layout route in App: every screen inside it only shows
// for someone who is logged in. Someone who isn't is moved to /login, carrying the address they wanted (from), so after
// logging in they come back to the screen they had opened.
import { Navigate, Outlet, useLocation } from "react-router";
import { useLiveStore } from "../store";

export default function RequireLogin() {
  const user = useLiveStore((s) => s.user);
  const location = useLocation(); // the address being opened, for example /devices/f00d00000001/history

  if (user === "loading") {
    // GET /auth/me isn't answered yet: don't rush to send them to /login, the cookie may still be valid
    return <p className="flex min-h-screen items-center justify-center text-slate-500 dark:text-slate-400">Checking the session…</p>;
  }
  if (user === null) {
    // replace = the guarded address isn't left in the browser history, so the Back button doesn't bounce back here
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />; // logged in: show the child screen that matches the address
}
