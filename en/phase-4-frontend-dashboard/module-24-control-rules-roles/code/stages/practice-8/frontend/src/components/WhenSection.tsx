// WhenSection.tsx - the "When does this rule turn on?" part of the rule form (Module 24): three options (a number rising, a
// number falling, a schedule) and the fields of the chosen option. Its fields are connected to RuleForm's form through
// useFormContext, so this part doesn't need register, setValue, and the errors handed down through props.
import { useFormContext } from "react-hook-form";
import { QUANTITIES, deviceNameOf, deviceOptions } from "../rules";
import { BOX, fieldId, LABEL, useFieldErrors } from "../fields";
import { Quantity } from "../schemas/rule-basics";
import type { Rule } from "../schemas/rule-basics";
import { useLiveStore } from "../store";

type Props = {
  condition: Rule["condition"]; // the current condition (watched by RuleForm with useWatch)
  changeWhen: (kind: Rule["condition"]["kind"]) => void; // changes the "When?" option (the whole condition)
};

// the names of the four number-limit fields (two for "rising", two for "falling")
type LimitField = "condition.on_above" | "condition.off_below" | "condition.on_below" | "condition.off_above";

// the three "When?" options in everyday words
const WHEN_OPTIONS: { kind: Rule["condition"]["kind"]; title: string; example: string }[] = [
  { kind: "threshold", title: "When a number RISES above a limit", example: "for example the temperature gets hotter than 30 °C" },
  { kind: "below-threshold", title: "When a number FALLS below a limit", example: "for example the soil gets drier than 30 %" },
  { kind: "schedule", title: "At a set time", example: "for example every day at 06:00 WIB" },
];

// ready-to-click schedule examples (5-field cron: minute hour day month weekday, WIB time)
const SCHEDULE_EXAMPLES = [
  { cron: "0 6 * * *", text: "Every day 06:00" },
  { cron: "30 17 * * *", text: "Every day 17:30" },
  { cron: "*/15 * * * *", text: "Every 15 minutes" },
];

// the technical key name under the label: an error message from the schema (for example "off_above must be greater…") is
// then easy to match with its field
const keyName = (text: string) => <span className="ml-1 font-mono text-xs font-normal text-slate-500 dark:text-slate-400">{text}</span>;

export default function WhenSection({ condition, changeWhen }: Props) {
  const { register, setValue } = useFormContext<Rule>();
  const { aria, showError } = useFieldErrors();
  const devices = useLiveStore((s) => s.devices) ?? [];

  // the note in a number field's label: its unit (°C, %), or the light range. Light is written without a thousands separator:
  // "1.000" is read as 1 (a point is the decimal mark); "1,000" only works because en-US Chrome drops every comma.
  const unit =
    condition.kind === "schedule" ? "" : condition.quantity === "light" ? "0-4095, no thousands separator" : QUANTITIES[condition.quantity].unit.trim();
  // one limit field (a decimal number, used 4 times). valueAsNumber: the box's content is read as a number (an empty box =
  // NaN, refused by the schema: "Enter a number"; "2.5" = two and a half; en-US Chrome drops the comma: "2,5" is read as 25)
  const limitField = (name: LimitField, title: string) => (
    <div>
      <label htmlFor={fieldId(name)} className={LABEL}>
        {title}
        {unit ? " (" + unit + ")" : ""}
        {keyName(name.replace("condition.", ""))}
      </label>
      <input
        id={fieldId(name)}
        type="number"
        step="any"
        inputMode="decimal"
        {...aria(name)}
        {...register(name, { valueAsNumber: true })}
        className={BOX}
      />
      {showError(name)}
    </div>
  );

  return (
    <>
      {/* fieldset + legend = one group of options with its title (read out by screen readers) */}
      <fieldset className="mt-5">
        <legend className="font-semibold text-slate-800 dark:text-slate-100">When does this rule turn on?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {WHEN_OPTIONS.map((p) => (
            <label
              key={p.kind}
              className={
                "flex min-h-11 cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm " +
                (condition.kind === p.kind
                  ? "border-teal-600 bg-teal-50 dark:border-teal-400 dark:bg-teal-950"
                  : "border-slate-300 dark:border-slate-600")
              }
            >
              <input
                type="radio"
                name="when"
                checked={condition.kind === p.kind}
                onChange={() => changeWhen(p.kind)}
                className="mt-0.5 size-5 shrink-0 accent-teal-700"
              />
              <span>
                <span className="block font-medium text-slate-800 dark:text-slate-100">{p.title}</span>
                <span className="block text-slate-600 dark:text-slate-300">{p.example}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {condition.kind === "schedule" ? (
        <>
          <label htmlFor={fieldId("condition.cron")} className={LABEL}>
            Schedule (5-field cron: minute hour day month weekday, WIB time){keyName("cron")}
          </label>
          <input id={fieldId("condition.cron")} {...aria("condition.cron")} {...register("condition.cron")} className={BOX + " font-mono"} />
          {showError("condition.cron")}
          <div className="mt-2 flex flex-wrap gap-2">
            {SCHEDULE_EXAMPLES.map((c) => (
              <button
                key={c.cron}
                type="button"
                onClick={() => setValue("condition.cron", c.cron, { shouldValidate: true, shouldDirty: true })}
                className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
              >
                {c.text}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="grid gap-x-3 sm:grid-cols-2">
          <div>
            <label htmlFor={fieldId("condition.device_id")} className={LABEL}>
              Measured device
            </label>
            <select id={fieldId("condition.device_id")} {...aria("condition.device_id")} {...register("condition.device_id")} className={BOX}>
              {deviceOptions(devices, condition.device_id, false).map((d) => (
                <option key={d} value={d}>
                  {deviceNameOf(devices, d)}
                </option>
              ))}
            </select>
            {showError("condition.device_id")}
          </div>
          <div>
            <label htmlFor={fieldId("condition.quantity")} className={LABEL}>
              Measured quantity
            </label>
            <select id={fieldId("condition.quantity")} {...register("condition.quantity")} className={BOX}>
              {Quantity.options.map((q) => (
                <option key={q} value={q}>
                  {QUANTITIES[q].name}
                </option>
              ))}
            </select>
          </div>
          {condition.kind === "threshold" ? (
            <>
              {limitField("condition.on_above", "Turns on above")}
              {limitField("condition.off_below", "Ends when it falls below")}
            </>
          ) : (
            <>
              {limitField("condition.on_below", "Turns on below")}
              {limitField("condition.off_above", "Ends when it rises above")}
            </>
          )}
          <div>
            <label htmlFor={fieldId("condition.for_seconds")} className={LABEL}>
              Must last for (seconds, 0 = at once){keyName("for_seconds")}
            </label>
            {/* a whole number: "2.5" is refused by the schema with "Enter a whole number (no decimals)"; en-US Chrome reads "2,5" as 25 */}
            <input
              id={fieldId("condition.for_seconds")}
              type="number"
              inputMode="numeric"
              {...aria("condition.for_seconds")}
              {...register("condition.for_seconds", { valueAsNumber: true })}
              className={BOX}
            />
            {showError("condition.for_seconds")}
          </div>
        </div>
      )}
    </>
  );
}
