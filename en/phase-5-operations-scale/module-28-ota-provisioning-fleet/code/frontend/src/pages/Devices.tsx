// pages/Devices.tsx - the /devices screen: a title + the device cards (Modules 22-23).
// Module 24: every screen has a thin wrapper file in the pages/ folder. Its content is still the old component.
import DeviceList from "../components/DeviceList";

export default function DevicesPage() {
  return (
    <>
      <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">Device List</h2>
      <DeviceList />
    </>
  );
}
