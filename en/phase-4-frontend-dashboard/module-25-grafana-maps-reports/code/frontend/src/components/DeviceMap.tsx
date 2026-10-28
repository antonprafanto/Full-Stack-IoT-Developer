// DeviceMap.tsx - the device map (Module 25). Every device that has a point (lat, lng from GET /devices, backend
// 1.2) becomes a colored circle on an OpenStreetMap map. Its color follows the LIVE status in the store (Socket.IO events, no
// polling): a device that disconnects turns gray by itself. Tap a circle: name, status, last seen, a link to its details.
// The libraries: Leaflet (the map drawer) + react-leaflet (Leaflet in the form of React components).
import "leaflet/dist/leaflet.css"; // Leaflet's CSS: without it the map tiles are scattered and the zoom buttons have no shape
import { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import { Link } from "react-router";
import { getDevices, ApiError } from "../api";
import { MAP } from "../map";
import { toast } from "../toast";
import { handleSessionExpired, useLiveStore } from "../store";
import type { Device } from "../types";
import { StatusBadge } from "./Badge";
import LastSeen from "./LastSeen";

// A device that SURELY has a point. "p is DeviceWithPoint" tells TypeScript: if this function answers true,
// that device's lat and lng are numbers (not null), so they may be used as coordinates right away.
// typeof (not !== null): backend 1.1 doesn't send lat/lng at all (undefined), and that also means "no point".
type DeviceWithPoint = Device & { lat: number; lng: number };
function hasPoint(p: Device): p is DeviceWithPoint {
  return typeof p.lat === "number" && typeof p.lng === "number";
}

// "lat,lng;lat,lng" -> [[lat, lng], [lat, lng]]: a list of number pairs that Leaflet understands
function toCoordinates(points: string): [number, number][] {
  return points.split(";").map((t) => t.split(",").map(Number) as [number, number]);
}

// Fit the map to all points (fitBounds). points = ONE text "lat,lng;lat,lng" (the same pattern as idList in
// socket.ts): the same text = the same coordinates, so this effect only runs again when a point is moved or added,
// not every time a device status changes. A map the user is dragging or zooming doesn't jump by itself.
function FitMap({ points }: { points: string }) {
  const map = useMap(); // the Leaflet map of the <MapContainer> above it
  useEffect(() => {
    map.fitBounds(toCoordinates(points), { padding: [40, 40], maxZoom: MAP.closeZoom });
  }, [map, points]);
  return null; // this component draws nothing, it only moves the map
}

// One marker. Its own component (like DeviceCard in DeviceList) so that every marker picks its status
// ITSELF from the store: a status change of device A only redraws marker A.
function DevicePoint({ p }: { p: DeviceWithPoint }) {
  const status = useLiveStore((s) => s.status[p.device_id]) ?? p.status;
  const last = useLiveStore((s) => s.lastSeen[p.device_id]);
  // key revoked or not registered = the backend ignores its messages, so its old status isn't trusted (Module 21)
  const messagesIgnored = p.key === "revoked" || p.key === "unregistered";
  const online = status === "online" && !messagesIgnored;

  return (
    // CircleMarker = a circle drawn as SVG, not an icon picture. Leaflet's default marker icon (Marker) uses
    // image files that go missing after npm run build; a circle needs no file at all, and its color can carry the status.
    // pathOptions may change: react-leaflet calls setStyle(), so the color changes without redrawing the map.
    <CircleMarker
      center={[p.lat, p.lng]}
      radius={10}
      pathOptions={{ color: "#ffffff", weight: 3, fillColor: online ? MAP.onlineColor : MAP.otherColor, fillOpacity: 1 }}
    >
      {/* Popup: its content is only drawn when the circle is tapped. A <p> element is deliberately not used: Leaflet's CSS gives
          paragraphs inside a popup a big top and bottom gap. font-sans: the same letters as the dashboard (Leaflet uses
          its own font). The popup box colors are set in index.css (they follow dark mode). */}
      <Popup>
        <div className="flex min-w-48 flex-col gap-1 font-sans text-sm">
          {/* the name is set by the admin through the API; JSX shows it as plain text (safe from XSS) */}
          <strong className="text-base">{p.name ?? p.device_id}</strong>
          <span className="text-slate-500 dark:text-slate-400">
            {p.location ?? "location not set"} · <span className="font-mono">{p.device_id}</span>
          </span>
          <span>{messagesIgnored ? "messages ignored by the backend" : <StatusBadge status={status} />}</span>
          <LastSeen t={last} kind={p.kind} checkStale={!messagesIgnored} />
          {/* an ordinary React Router link: goes to the details screen without reloading the page */}
          <Link to={"/devices/" + p.device_id} className="inline-flex min-h-11 items-center font-medium">
            Open details →
          </Link>
        </div>
      </Popup>
    </CircleMarker>
  );
}

export default function DeviceMap() {
  const devices = useLiveStore((s) => s.devices); // null = still loading
  const error = useLiveStore((s) => s.devicesError);

  // The device list is fetched AGAIN every time the map is opened (Layout only fetches it once after logging in), so that
  // a point the admin has just set with Bruno (PUT /devices/:id/location) shows at once without F5. Points aren't sent
  // through Socket.IO; the device status stays live. In dev mode, StrictMode runs this effect twice (two GETs).
  useEffect(() => {
    let ignore = false;
    getDevices()
      .then((list) => {
        if (!ignore) useLiveStore.getState().setDevices(list);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof ApiError && err.code === 401) return handleSessionExpired();
        // the old list is already there (fetched by Layout): a toast is enough. DON'T fill devicesError, because the
        // Devices, Details, History screens and the rule form read it too and would switch to a red box although the data is there.
        if (useLiveStore.getState().devices !== null) {
          toast("Couldn't reload the device list: the map points may not be the latest.", "error");
          return;
        }
        useLiveStore.getState().setDevicesError(err instanceof ApiError ? err.message : "Couldn't load the devices.");
      });
    return () => {
      ignore = true; // the Map screen is closed already: an answer that arrives late is ignored
    };
  }, []);

  if (error !== null) return <p className="rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{error}</p>;
  if (devices === null) return <p className="text-slate-600 dark:text-slate-400">Loading devices…</p>;

  const withPoint = devices.filter(hasPoint);
  const withoutPoint = devices.filter((p) => !hasPoint(p));
  const messageBox = "rounded-lg bg-white p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300";

  // backend 1.1 (before Module 25) doesn't send the lat field at all: say so, not just "no point yet"
  if (devices.length > 0 && devices.every((p) => !("lat" in p))) {
    return <p className={messageBox}>The backend doesn't send map points (lat, lng) yet. The Map page needs backend 1.2 (Module 25).</p>;
  }
  if (withPoint.length === 0) {
    return (
      <p className={messageBox}>
        No device has coordinates yet. Set them with the Bruno request <code className="font-mono">set device location</code>.
      </p>
    );
  }

  const points = withPoint.map((p) => p.lat + "," + p.lng).join(";");

  return (
    <>
      {/* The map height MUST be written (h-96 = 24rem = 384 px): without a height, the map box is 0 px tall and can't be seen.
          isolate: Leaflet's layers (z-index 400-1000) stay inside this box, they don't cover the toasts (z-50).
          bounds = the first view; FitMap takes care of points that change afterwards. */}
      <MapContainer
        bounds={toCoordinates(points)}
        boundsOptions={{ padding: [40, 40], maxZoom: MAP.closeZoom }}
        maxZoom={MAP.maxZoom}
        className="isolate h-96 w-full rounded-xl border border-slate-200 dark:border-slate-700"
      >
        <TileLayer url={MAP.tiles} attribution={MAP.attribution} maxZoom={MAP.maxZoom} />
        <FitMap points={points} />
        {withPoint.map((p) => (
          <DevicePoint key={p.device_id} p={p} />
        ))}
      </MapContainer>

      {/* a color legend in words, because color alone can't be read by everyone */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-3 rounded-full" style={{ backgroundColor: MAP.onlineColor }} /> online
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-3 rounded-full" style={{ backgroundColor: MAP.otherColor }} /> not online,
          or its messages are ignored by the backend
        </span>
      </div>
      {withoutPoint.length > 0 ? (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          No point yet: {withoutPoint.map((p) => p.name ?? p.device_id).join(", ")}.
        </p>
      ) : null}
    </>
  );
}
