// MovePoint.tsx - Level 2 of Module 25: an admin moves a device's point on the Map. Click the map at the new spot -> a small box
// with that point's latitude and longitude (they can still be typed again) -> Save point -> PUT /devices/:id/location.
// Mounted by DeviceMap INSIDE <MapContainer> (useMapEvents needs the map), only for admins and only during "move mode".
import { zodResolver } from "@hookform/resolvers/zod";
import type { LatLng } from "leaflet";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Popup, useMapEvents } from "react-leaflet";
import { z } from "zod";
import { getDevices, ApiError, setDeviceLocation } from "../api";
import { toast } from "../toast";
import { useLiveStore } from "../store";
import type { Device } from "../types";

// The same rules as the LocationBody schema in the backend (routes/devices.ts), its error sentences included. The backend still
// checks again; the schema here only shows mistakes before sending.
const MapPoint = z.object({
  lat: z.number({ error: "Enter a number" }).min(-90, "latitude at least -90").max(90, "latitude at most 90"),
  lng: z.number({ error: "Enter a number" }).min(-180, "longitude at least -180").max(180, "longitude at most 180"),
});
type MapPoint = z.infer<typeof MapPoint>;

const BOX = "mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-2 dark:border-slate-600 dark:bg-slate-900";

// The form for one point. key={…} at its caller: every new click = a new form starting from that click's point.
function PointForm({ p, initial, done }: { p: Device; initial: LatLng; done: () => void }) {
  const round6 = (n: number) => Math.round(n * 1e6) / 1e6; // 6 digits after the point = about 10 cm, enough for a home
  const { register, handleSubmit, setError, formState } = useForm<MapPoint>({
    resolver: zodResolver(MapPoint),
    defaultValues: { lat: round6(initial.lat), lng: round6(initial.lng) },
  });
  const { errors, isSubmitting } = formState;

  async function save(content: MapPoint) {
    try {
      await setDeviceLocation(p.device_id, content.lat, content.lng);
      useLiveStore.getState().setDevices(await getDevices()); // a new list: the marker moves, the map is fitted again
      toast("Point of " + (p.name ?? p.device_id) + " moved.", "success");
      done();
    } catch (err) {
      setError("root.server", { message: err instanceof ApiError ? err.message : "Couldn't save the point." });
    }
  }

  return (
    <form onSubmit={handleSubmit(save)} className="flex min-w-52 flex-col gap-2 font-sans text-sm">
      <strong>Move {p.name ?? p.device_id} here?</strong>
      {(["lat", "lng"] as const).map((field) => (
        <label key={field} className="block">
          {field === "lat" ? "Latitude (lat)" : "Longitude (lng)"}
          <input type="number" step="any" inputMode="decimal" {...register(field, { valueAsNumber: true })} className={BOX} />
          {errors[field] ? <span className="text-red-700 dark:text-red-300">{errors[field]?.message}</span> : null}
        </label>
      ))}
      {errors.root?.server ? <span role="alert" className="text-red-700 dark:text-red-300">{errors.root.server.message}</span> : null}
      <span className="flex gap-2">
        <button type="submit" disabled={isSubmitting} className="min-h-11 rounded-lg bg-teal-700 px-3 font-medium text-white disabled:opacity-60">
          {isSubmitting ? "Saving…" : "Save point"}
        </button>
        <button type="button" onClick={done} className="min-h-11 rounded-lg border border-slate-300 px-3 dark:border-slate-600">
          Cancel
        </button>
      </span>
    </form>
  );
}

export default function MovePoint({ p, done }: { p: Device; done: () => void }) {
  const [click, setClick] = useState<LatLng | null>(null);
  useMapEvents({ click: (e) => setClick(e.latlng) }); // a click on the map (not on a marker or a popup) = the new spot
  if (click === null) return null;
  return (
    // a popup at the clicked spot. Closing it with ✕ = cancelling only this spot; a click elsewhere opens a new box.
    <Popup position={click}>
      <PointForm key={click.toString()} p={p} initial={click} done={done} />
    </Popup>
  );
}
