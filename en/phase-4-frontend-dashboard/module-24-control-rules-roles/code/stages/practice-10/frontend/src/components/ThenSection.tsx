// ThenSection.tsx - the "Then what happens?" part of the rule form (Module 24): a switch (on while the rule is on) or one
// command sent once, the acting device, the command's content, and two checkboxes (Telegram and Active).
// Like WhenSection, its fields are connected to RuleForm's form through useFormContext.
import { useFormContext } from "react-hook-form";
import { deviceNameOf, deviceOptions } from "../rules";
import { BOX, fieldId, LABEL, useFieldErrors } from "../fields";
import type { Rule } from "../schemas/rule-basics";
import type { SetCommand } from "../schemas/contract";
import { useLiveStore } from "../store";

type Props = {
  action: Rule["action"]; // the current action (watched by RuleForm with useWatch)
  schedule: boolean; // true if "When?" = a schedule: a switch action isn't allowed (a schedule has no end time)
  changeAction: (kind: Rule["action"]["kind"]) => void; // changes the "Then?" option (the whole action)
  changeTarget: (target: SetCommand["target"]) => void; // changes the command kind (the whole command)
};

const TARGET_NAMES: Record<SetCommand["target"], string> = { pump: "Pump (water)", lamp: "Lamp", fan: "Fan", curtain: "Curtain" };

// the option card style: the chosen one has a light teal background
const card = (selected: boolean) =>
  selected ? "border-teal-600 bg-teal-50 dark:border-teal-400 dark:bg-teal-950" : "border-slate-300 dark:border-slate-600";

export default function ThenSection({ action, schedule, changeAction, changeTarget }: Props) {
  const { register } = useFormContext<Rule>();
  const { aria, showError } = useFieldErrors();
  const devices = useLiveStore((s) => s.devices) ?? [];

  return (
    <>
      <fieldset className="mt-6">
        <legend className="font-semibold text-slate-800 dark:text-slate-100">Then what happens?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <label
            className={
              "flex min-h-11 items-start gap-2 rounded-lg border p-3 text-sm " +
              (schedule ? "cursor-not-allowed opacity-60 " : "cursor-pointer ") +
              card(action.kind === "switch")
            }
          >
            <input
              type="radio"
              name="then"
              checked={action.kind === "switch"}
              disabled={schedule}
              onChange={() => changeAction("switch")}
              className="mt-0.5 size-5 shrink-0 accent-teal-700"
            />
            <span>
              <span className="block font-medium text-slate-800 dark:text-slate-100">Turn on while the rule is on</span>
              <span className="block text-slate-600 dark:text-slate-300">
                {schedule ? "Not for schedules: a schedule has no end time." : "lamp or fan, turned off again when the rule ends"}
              </span>
            </span>
          </label>
          <label className={"flex min-h-11 cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm " + card(action.kind === "command")}>
            <input
              type="radio"
              name="then"
              checked={action.kind === "command"}
              onChange={() => changeAction("command")}
              className="mt-0.5 size-5 shrink-0 accent-teal-700"
            />
            <span>
              <span className="block font-medium text-slate-800 dark:text-slate-100">Send one command, once</span>
              <span className="block text-slate-600 dark:text-slate-300">for example water for 5 seconds</span>
            </span>
          </label>
        </div>
        {showError("action.kind")}
      </fieldset>

      <div className="grid gap-x-3 sm:grid-cols-2">
        <div>
          <label htmlFor={fieldId("action.device_id")} className={LABEL}>
            Acting device
          </label>
          <select id={fieldId("action.device_id")} {...aria("action.device_id")} {...register("action.device_id")} className={BOX}>
            {deviceOptions(devices, action.device_id, true).map((d) => (
              <option key={d} value={d}>
                {deviceNameOf(devices, d)}
              </option>
            ))}
          </select>
          {showError("action.device_id")}
        </div>
        {action.kind === "switch" ? (
          <div>
            <label htmlFor={fieldId("action.target")} className={LABEL}>
              What to turn on
            </label>
            <select id={fieldId("action.target")} {...register("action.target")} className={BOX}>
              <option value="lamp">Lamp</option>
              <option value="fan">Fan</option>
            </select>
          </div>
        ) : (
          <>
            <div>
              <label htmlFor={fieldId("action.command.target")} className={LABEL}>
                The command
              </label>
              {/* not registered: changing this option replaces the whole command (changeTarget) */}
              <select
                id={fieldId("action.command.target")}
                value={action.command.target}
                onChange={(e) => changeTarget(e.target.value as SetCommand["target"])}
                className={BOX}
              >
                {(Object.keys(TARGET_NAMES) as SetCommand["target"][]).map((t) => (
                  <option key={t} value={t}>
                    {TARGET_NAMES[t]}
                  </option>
                ))}
              </select>
            </div>
            <div key={action.command.target}>
              {action.command.target === "lamp" || action.command.target === "fan" ? (
                <>
                  <label htmlFor={fieldId("action.command.value")} className={LABEL}>
                    Turn on or off
                  </label>
                  {/* setValueAs: the option "true"/"false" (text) is read as true/false (a boolean) */}
                  <select
                    id={fieldId("action.command.value")}
                    {...register("action.command.value", { setValueAs: (v) => v === true || v === "true" })}
                    className={BOX}
                  >
                    <option value="true">Turn on</option>
                    <option value="false">Turn off</option>
                  </select>
                </>
              ) : (
                <>
                  <label htmlFor={fieldId("action.command.value")} className={LABEL}>
                    {action.command.target === "pump" ? "Watering time (seconds, 1-10)" : "Curtain angle (0-180 degrees)"}
                  </label>
                  <input
                    id={fieldId("action.command.value")}
                    type="number"
                    inputMode="numeric"
                    {...aria("action.command.value")}
                    {...register("action.command.value", { valueAsNumber: true })}
                    className={BOX}
                  />
                </>
              )}
              {showError("action.command.value")}
            </div>
          </>
        )}
      </div>

      <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
        <input type="checkbox" {...register("action.notify")} className="size-5 accent-teal-700" />
        Send a Telegram notification when the rule acts (if Module 19's Telegram is set up)
      </label>
      <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
        <input type="checkbox" {...register("active")} className="size-5 accent-teal-700" />
        Active (untick to pause without deleting)
      </label>
    </>
  );
}
