// pages/NotFound.tsx - the screen for an address that isn't on the route map (Route path="*"), for example /devics.
import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="rounded-lg bg-white p-4 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
      <h2 className="text-lg font-semibold">Page not found</h2>
      <p className="mt-1 text-sm">This address doesn't exist in the dashboard. A typo, maybe?</p>
      {/* <Link> = React Router's link: switches screens WITHOUT reloading the page (the live connection stays up) */}
      <Link to="/devices" className="mt-2 inline-flex min-h-11 items-center font-medium text-teal-700 hover:underline dark:text-teal-300">
        To the device list
      </Link>
    </div>
  );
}
