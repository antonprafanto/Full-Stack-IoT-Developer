// App.tsx - the root of the dashboard. Its three jobs, each done ONCE for the whole dashboard:
// 1. asking the backend "who am I?" (GET /auth/me) when the page opens;
// 2. keeping the live connection (Socket.IO) while logged in (Module 23);
// 3. holding the route map (Module 24): which address shows which screen, and which screens are guarded.
//    Module 25: plus the /map screen (the device map).
import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router";
import { ApiError, whoAmI } from "./api";
import RequireLogin from "./components/RequireLogin";
import AdminOnly from "./components/AdminOnly";
import Layout from "./components/Layout";
import RulesPage from "./pages/Rules";
import DevicesPage from "./pages/Devices";
import DetailsPage from "./pages/Details";
import RuleFormPage from "./pages/RuleForm";
import LoginPage from "./pages/Login";
import MapPage from "./pages/Map";
import HistoryPage from "./pages/History";
import NotFound from "./pages/NotFound";
import { useRealtime } from "./socket";
import { handleSessionExpired, useLiveStore } from "./store";

export default function App() {
  // Once when App appears ([] = no dependencies): check whether the login cookie from an earlier visit is still valid.
  // Its result is written to the store, where the route guard (RequireLogin) and the Log in screen read it.
  useEffect(() => {
    let ignore = false;
    whoAmI()
      .then((p) => {
        if (!ignore) useLiveStore.getState().setUser(p);
      })
      .catch((err) => {
        if (ignore) return;
        // 401 = simply not logged in: just show the form. Anything else (backend or database down): say so.
        const notLoggedIn = err instanceof ApiError && err.code === 401;
        useLiveStore.getState().setNotLoggedIn(notLoggedIn ? null : err instanceof ApiError ? err.message : "Couldn't check the login.");
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Module 24: the Back button sometimes restores an OLD page whole from the browser's "back/forward cache" (bfcache), with
  // the store content of an account that has logged out (it happens when its address was typed straight into the address
  // bar). A page restored like that is reloaded, so App asks "who am I?" again and the route guard works from the start.
  useEffect(() => {
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) location.reload(); // persisted = restored from the bfcache, not freshly loaded
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  // Module 23: the live connection (Socket.IO) lives while logged in. Module 24: this hook stays here, ABOVE <Routes>,
  // so switching screens doesn't cut the live connection.
  const loggedIn = useLiveStore((s) => s.user !== null && s.user !== "loading");
  useRealtime(loggedIn, handleSessionExpired);

  // The route map: every <Route> pairs one address pattern with one screen. :id = the part of the address that changes,
  // read by its screen with useParams(). A Route without a path (RequireLogin, Layout) = a "layout route": it draws
  // itself, then puts the matching child screen where its <Outlet /> is.
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireLogin />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/devices" replace />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/devices/:id" element={<DetailsPage />} />
          <Route path="/devices/:id/history" element={<HistoryPage />} />
          {/* Module 25: the device map, for admins and viewers (outside the AdminOnly guard) */}
          <Route path="/map" element={<MapPage />} />
          <Route path="/rules" element={<RulesPage />} />
          {/* the second guard: screens that change something are for admins only */}
          <Route element={<AdminOnly />}>
            <Route path="/rules/new" element={<RuleFormPage />} />
            <Route path="/rules/:id" element={<RuleFormPage />} />
          </Route>
        </Route>
      </Route>
      {/* any other address that matches no pattern, logged in or not */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
