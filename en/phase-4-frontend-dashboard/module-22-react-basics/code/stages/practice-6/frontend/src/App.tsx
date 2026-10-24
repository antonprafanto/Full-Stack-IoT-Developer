// App.tsx - the dashboard v0.1 frame. When it opens, App asks the backend "who am I?" (GET /auth/me),
// then picks one of three screens with plain state (React Router only comes in Module 24): login, list, or details.
import { useEffect, useState } from "react";
import { ApiError, logout, whoAmI } from "./api";
import DeviceList from "./components/DeviceList";
import DeviceDetails from "./components/DeviceDetails";
import Login from "./components/Login";
import type { Device, User } from "./types";

// the screen shown after login: the list, or one device's details (with its data from the list)
type View = { name: "list" } | { name: "details"; device: Device };

export default function App() {
  // "loading" = asking the backend; null = not logged in; an object = logged in
  const [user, setUser] = useState<User | null | "loading">("loading");
  const [initialError, setInitialError] = useState<string | null>(null); // a problem other than 401, written above the form
  const [view, setView] = useState<View>({ name: "list" });

  // Once when App appears ([] = no dependencies): check whether the login cookie from an earlier visit is still valid.
  useEffect(() => {
    let ignore = false;
    whoAmI()
      .then((p) => {
        if (!ignore) setUser(p);
      })
      .catch((err) => {
        if (ignore) return;
        // 401 = simply not logged in: just show the form. Anything else (backend or database down): say so.
        if (!(err instanceof ApiError && err.code === 401)) {
          setInitialError(err instanceof ApiError ? err.message : "Couldn't check the login.");
        }
        setUser(null);
      });
    return () => {
      ignore = true;
    };
  }, []);

  function handleLogin(p: User) {
    setInitialError(null);
    setUser(p);
    setView({ name: "list" }); // always start from the device list
  }

  function handleSessionExpired() {
    setInitialError("Your session has expired. Please log in again.");
    setUser(null);
  }

  // A minimal Log out button (improved in Module 24): delete the session in the backend, then go back to the form.
  async function handleLogout() {
    try {
      await logout();
    } catch {
      // the backend doesn't answer: the screen still goes back to the login form
    }
    setUser(null);
  }

  if (user === "loading") {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500">Loading…</div>;
  }
  if (user === null) {
    return <Login initialError={initialError} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-slate-800">Mini Smart Home</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-600">
              {user.name} <span className="text-slate-400">({user.role})</span>
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-3 py-1 hover:bg-slate-50"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {view.name === "list" ? (
          <>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Device List</h2>
            <DeviceList
              onSelect={(device) => setView({ name: "details", device })}
              onSessionExpired={handleSessionExpired}
            />
          </>
        ) : (
          // key = device_id: another device means a new DeviceDetails with fresh state,
          // not the leftover reading of the previous device (React's official "resetting state with a key" pattern)
          <DeviceDetails
            key={view.device.device_id}
            device={view.device}
            onBack={() => setView({ name: "list" })}
            onSessionExpired={handleSessionExpired}
          />
        )}
      </main>
    </div>
  );
}
