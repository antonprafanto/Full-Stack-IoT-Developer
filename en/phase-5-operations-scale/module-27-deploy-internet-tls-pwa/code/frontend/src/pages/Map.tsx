// pages/Map.tsx - the /map screen (Module 25): a title + the device map. Admins and viewers may both look; this map only
// shows. The points are set by the admin through the API (PUT /devices/:id/location), not written in the frontend code.
import DeviceMap from "../components/DeviceMap";

export default function MapPage() {
  return (
    <>
      <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">Device Map</h2>
      <DeviceMap />
    </>
  );
}
