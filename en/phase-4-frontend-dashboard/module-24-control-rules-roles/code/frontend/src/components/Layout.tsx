// Layout.tsx - the frame of every screen after logging in: the header (title, Live badge, menu, name, Log out button) and
// <Outlet />, where React Router puts the screen that matches the address (Devices, Details, History, Rules).
import { useEffect } from "react";
import { NavLink, Outlet } from "react-router";
import { ApiError, getDevices, logout } from "../api";
import { socket } from "../socket";
import { clearAll, handleSessionExpired, useLiveStore } from "../store";
import ConnectionBadge from "./ConnectionBadge";
import ToastRegion from "./ToastRegion";

// The menu links' style. NavLink calls this function with isActive = true when its address is open.
function menuClass({ isActive }: { isActive: boolean }): string {
  return (
    "inline-flex min-h-11 items-center rounded-lg px-3 " +
    (isActive
      ? "bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200"
      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700")
  );
}

export default function Layout() {
  const user = useLiveStore((s) => s.user);

  // The device list is fetched ONCE every time this frame appears (after logging in), not on the Devices screen. That way
  // a Details screen opened directly through its address (a link, the Back button, or F5) already has its device data too.
  useEffect(() => {
    let ignore = false;
    getDevices()
      .then((list) => {
        if (!ignore) useLiveStore.getState().setDevices(list);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof ApiError && err.code === 401) return handleSessionExpired();
        useLiveStore.getState().setDevicesError(err instanceof ApiError ? err.message : "Couldn't load the devices.");
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Module 24: a complete logout, four steps in order.
  async function handleLogout() {
    // 1. Cut the live connection FIRST (reason "io client disconnect": not reconnected). The other way round, the server
    //    cuts us off ("io server disconnect"), and then the socket tries to reconnect (Module 23).
    socket.disconnect();
    // 2. Delete the session in the backend. JavaScript can't delete HttpOnly cookies; only the backend's answer deletes them.
    let message = "You have logged out.";
    try {
      await logout();
    } catch {
      message =
        "Log out isn't complete: the server didn't answer, so the session on the server hasn't been deleted. When the server " +
        "is running again, reload this page and press Log out once more.";
    }
    // 3. Clear everything in the store: the next person in this tab sees no leftover data or buttons of the previous account.
    //    true = logged out on purpose: this screen's address isn't handed to the Log in screen (see RequireLogin).
    clearAll(message, true);
    // 4. Moving to the Log in screen: done by the route guard (RequireLogin) as soon as the store is empty, with replace. Back
    //    doesn't return to the dashboard screen; even if Back is used, the guard still redirects to /login.
  }

  // RequireLogin has already made sure the user is logged in; this line only tells TypeScript
  if (user === null || user === "loading") return null;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        {/* flex-wrap: on a narrow screen, the menu and the Log out button drop to the next row, not crowding the title */}
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Mini Smart Home</h1>
            <ConnectionBadge />
          </div>
          {/* NavLink = a Link that knows whether its address is open: isActive is true on /devices AND on /devices/<id>
              (no end prop), and React Router sets aria-current="page" for screen readers */}
          <nav aria-label="Main menu" className="flex gap-1 text-sm font-medium">
            <NavLink to="/devices" className={menuClass}>
              Devices
            </NavLink>
            {/* no end prop either: still active on /rules/new and /rules/<number> */}
            <NavLink to="/rules" className={menuClass}>
              Rules
            </NavLink>
          </nav>
          {/* min-w-0 + truncate: a long name is cut off with "…", it doesn't push the Log out button off the screen */}
          <div className="flex min-w-0 items-center gap-3 text-sm">
            <span className="truncate text-slate-600 dark:text-slate-300">
              {user.name} <span className="text-slate-500 dark:text-slate-400">({user.role})</span>
            </span>
            {/* min-h-11 = a minimum height of 44 px: big enough to tap with a thumb */}
            <button
              type="button"
              onClick={handleLogout}
              className="min-h-11 shrink-0 rounded-lg border border-slate-300 px-4 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Module 24: toasts show on every screen after logging in (switching screens doesn't remove them): at the bottom of
          phones and tablets, top right on a wide laptop (see ToastRegion) */}
      <ToastRegion />

      {/* pb-64 = 16rem (256 px) of free space at the bottom of the page, as high as two four-row toasts: the lowest buttons
          (Save rule, Delete rule) can always be scrolled above the toasts. From 1280 px (xl) the toasts sit beside the
          content, so the bottom space here is only pb-6. */}
      <main className="mx-auto max-w-3xl px-4 pt-6 pb-64 xl:pb-6">
        <Outlet />
      </main>
    </div>
  );
}
