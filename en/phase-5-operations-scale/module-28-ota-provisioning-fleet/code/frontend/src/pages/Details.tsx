// pages/Details.tsx - the /devices/:id screen. Its device is looked up from the ADDRESS (useParams), not handed over by the
// Devices screen, so this address can be opened directly, reloaded (F5), or sent to someone else.
import { Link, useParams } from "react-router";
import DeviceDetails from "../components/DeviceDetails";
import { useLiveStore } from "../store";

export default function DetailsPage() {
  const { id } = useParams(); // the :id part of the address, for example "f00d00000001"
  const list = useLiveStore((s) => s.devices); // null = GET /devices not answered yet
  const error = useLiveStore((s) => s.devicesError);
  const device = list?.find((p) => p.device_id === id);

  if (error !== null) return <p className="rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{error}</p>;
  if (list === null) return <p className="text-slate-600 dark:text-slate-400">Loading devices…</p>;
  // an id that isn't in the list (a typo, a deleted device): nothing is requested from the API
  if (device === undefined) {
    return (
      <div className="rounded-lg bg-white p-4 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
        <p>
          Device <span className="font-mono">{id}</span> not found.
        </p>
        <Link to="/devices" className="mt-2 inline-flex min-h-11 items-center font-medium text-teal-700 hover:underline dark:text-teal-300">
          ← Back to the list
        </Link>
      </div>
    );
  }
  // key = device_id: another device means a new DeviceDetails with fresh state (React's official pattern, Module 22)
  return <DeviceDetails key={device.device_id} device={device} />;
}
