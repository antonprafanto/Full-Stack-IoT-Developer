// FirmwareUpload.tsx - the "Upload firmware" form on the Fleet screen (Module 28, admin only). The .bin file from the build folder
// (Sketch → Export Compiled Binary) is sent AS IT IS to the backend (POST /firmware/node1/<version>); the backend computes its
// SHA-256 itself, and this screen shows the result so it can be compared with the file's fingerprint on your laptop.
// The checks in the browser (size, the first byte 0xE9, the file name) are only there to make the error quick and clear: the
// backend still checks everything again.
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { ApiError, uploadFirmware } from "../api";
import { PROGRAM_SHELF, sizeText } from "../fleet";
import { OtaReport } from "../schemas/contract";
import { toast } from "../toast";
import { handleSessionExpired } from "../store";
import type { Release } from "../types";
import { wibDateTime } from "../time";

const BOX =
  "mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";
const LABEL = "mt-3 block text-sm font-medium text-slate-700 dark:text-slate-200";

// the SAME version rule as the data contract (x.y.z, for example 1.7.1): the Version schema in schemas/contract.ts, borrowed through
// OtaReport's version field (that file doesn't export Version itself)
const Version = OtaReport.shape.version;

// Other files in the build folder that ALSO end in .bin, but aren't app files for OTA
const NOT_AN_APP = /\.(merged|bootloader|partitions)\.bin$/i;

// Checks a file before it is uploaded. The result is an error sentence, or null if it looks right.
async function checkFile(file: File): Promise<string | null> {
  if (!file.name.toLowerCase().endsWith(".bin")) return "Firmware files end in .bin.";
  if (NOT_AN_APP.test(file.name)) {
    return "That isn't an app file: choose <sketch>.ino.bin, not .merged.bin, .bootloader.bin, or .partitions.bin.";
  }
  if (file.size === 0) return "The file is empty.";
  if (file.size > PROGRAM_SHELF) {
    return "Too big: " + file.size.toLocaleString("en-US") + " bytes, one program shelf is only 1,966,080 bytes.";
  }
  // the first byte of every ESP32 app file = 0xE9 (233). slice(0, 1) = a 1-byte piece only, without reading the whole file.
  const first = new Uint8Array(await file.slice(0, 1).arrayBuffer());
  if (first[0] !== 0xe9) return "Not an ESP32 app file: its first byte must be 0xE9.";
  return null;
}

type Props = {
  onDone: () => void; // a new release saved: the screen fetches the release list and the fleet again
};

export default function FirmwareUpload({ onDone }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [version, setVersion] = useState("");
  const [notes, setNotes] = useState("");
  const [test, setTest] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Release | null>(null); // the release just saved (size + sha256 from the server)
  const fileField = useRef<HTMLInputElement>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (file === null) return setError("Choose a .bin file first.");
    const fileError = await checkFile(file);
    if (fileError !== null) return setError(fileError);
    const checkVersion = Version.safeParse(version.trim());
    if (!checkVersion.success) return setError("Version must look like x.y.z, for example 1.7.1 (the same as FIRMWARE_VERSION).");
    // backend 1.5 refuses a RELEASE version with a leading zero (1.07.1 equals 1.7.1 as a number, differs as text)
    if (/(^|\.)0\d/.test(checkVersion.data)) return setError("Version without leading zeros: 1.7.1, not 1.07.1.");
    if (notes.trim().length > 200) return setError("Notes at most 200 characters.");
    setBusy(true);
    try {
      const release = await uploadFirmware(checkVersion.data, file, notes.trim(), test);
      setResult(release);
      toast("Firmware " + release.version + " saved on the server.", "success");
      // empty the form; the file field can't be emptied through React state, so through its ref
      setFile(null);
      setVersion("");
      setNotes("");
      setTest(false);
      if (fileField.current !== null) fileField.current.value = "";
      onDone();
    } catch (err) {
      if (err instanceof ApiError && err.code === 401) return handleSessionExpired();
      // an error from the backend goes in the form (not a toast): it usually needs a slow read, for example "1.7.1 already exists: …"
      setError(err instanceof ApiError ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <h4 className="font-semibold text-slate-800 dark:text-slate-100">Upload Node 1 firmware</h4>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Choose <span className="font-mono">&lt;sketch&gt;.ino.bin</span> from the folder <span className="font-mono">build</span> (made by
        Sketch → Export Compiled Binary). An existing version can't be overwritten: changed firmware always gets a new version.
      </p>

      <label htmlFor="upload-file" className={LABEL}>
        .bin file
      </label>
      <input
        ref={fileField}
        id="upload-file"
        type="file"
        accept=".bin"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="mt-1 block w-full text-sm text-slate-700 file:mr-3 file:min-h-11 file:rounded-lg file:border-0 file:bg-teal-50 file:px-4 file:font-medium file:text-teal-800 hover:file:bg-teal-100 dark:text-slate-200 dark:file:bg-teal-950 dark:file:text-teal-200"
      />
      {file !== null ? (
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          {file.name}: {sizeText(file.size)}
        </p>
      ) : null}

      <label htmlFor="upload-version" className={LABEL}>
        Version (the same as FIRMWARE_VERSION in that file)
      </label>
      <input
        id="upload-version"
        value={version}
        onChange={(e) => setVersion(e.target.value)}
        placeholder="1.7.1"
        inputMode="decimal"
        autoComplete="off"
        className={BOX + " sm:w-40"}
      />

      <label htmlFor="upload-notes" className={LABEL}>
        Notes (optional)
      </label>
      <input
        id="upload-notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        maxLength={200}
        placeholder="for example: a new-version greeting"
        className={BOX}
      />

      <label className="mt-3 flex min-h-11 items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
        <input type="checkbox" checked={test} onChange={(e) => setTest(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-teal-700" />
        <span>
          A <b>test</b> release (for example deliberately broken firmware for rollback practice): can only be sent to one device, never
          to all, and it doesn't count as the latest release.
        </span>
      </label>

      {error !== null ? (
        // role="alert": a screen reader reads the error out at once
        <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="mt-3 min-h-11 rounded-lg bg-teal-700 px-4 font-medium text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {busy ? "Uploading…" : "Upload firmware"}
      </button>

      {result !== null ? (
        <div role="status" className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-950 dark:bg-green-950 dark:text-green-100">
          <p className="font-medium">
            Saved: Node 1 {result.version}
            {result.test ? " (test)" : ""}, {wibDateTime(Date.parse(result.created_at))}
          </p>
          <p className="mt-1">Size: {sizeText(result.size)}</p>
          <p className="mt-1">SHA-256 (computed by the server from the file it received):</p>
          <p className="font-mono text-xs break-all">{result.sha256}</p>
          <p className="mt-1">
            Compare it with the file's fingerprint on your laptop (<span className="font-mono">sha256sum</span> or{" "}
            <span className="font-mono">Get-FileHash</span>): it must match exactly.
          </p>
        </div>
      ) : null}
    </form>
  );
}
