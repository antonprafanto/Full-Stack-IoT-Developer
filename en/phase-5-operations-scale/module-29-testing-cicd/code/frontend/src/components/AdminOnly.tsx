// AdminOnly.tsx - the second guard (RequireLogin's partner): a layout route for screens that change something (the rule form).
// Admin accounts see the screen; viewer accounts see an "Admin only" explanation instead of a form that would be refused anyway.
// This is screen convenience, NOT protection: if a viewer sends a change some other way (Bruno, the Console), the backend's
// guard still answers 403.
import { Link, Outlet } from "react-router";
import { useAdmin } from "../store";

export default function AdminOnly() {
  const admin = useAdmin();
  if (admin) return <Outlet />;
  return (
    <div className="rounded-lg bg-white p-4 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Admin only</h2>
      <p className="mt-1">
        This screen is for admin accounts only. Your account is a viewer: you can see all the data, but you can't change anything.
      </p>
      <Link to="/devices" className="mt-2 inline-flex min-h-11 items-center font-medium text-teal-700 hover:underline dark:text-teal-300">
        ← Back to the device list
      </Link>
    </div>
  );
}
