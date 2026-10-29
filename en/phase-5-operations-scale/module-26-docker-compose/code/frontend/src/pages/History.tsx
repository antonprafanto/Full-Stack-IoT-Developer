// pages/History.tsx - the /devices/:id/history screen. The same as the Details page: its device is looked up from the address.
import { Link, useParams } from "react-router";
import DeviceHistory from "../components/DeviceHistory";
import { handleSessionExpired, useLiveStore } from "../store";

export default function HistoryPage() {
  const { id } = useParams();
  const list = useLiveStore((s) => s.devices);
  const error = useLiveStore((s) => s.devicesError);
  const device = list?.find((p) => p.device_id === id);

  if (error !== null) return <p className="rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{error}</p>;
  if (list === null) return <p className="text-slate-600 dark:text-slate-400">Loading devices…</p>;
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
  return <DeviceHistory key={device.device_id} device={device} onSessionExpired={handleSessionExpired} />;
}
