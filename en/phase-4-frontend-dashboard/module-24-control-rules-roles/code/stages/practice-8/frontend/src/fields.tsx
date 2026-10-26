// fields.tsx - small helpers for the rule form's fields (Module 24): the box and label styles, each field's id, and each
// field's error message with its accessibility attributes. Used by RuleForm and its parts (WhenSection, ThenSection).
import { get, useFormState } from "react-hook-form";
import type { Control, FieldError } from "react-hook-form";
import type { Rule } from "./schemas/rule-basics";

// the input box style; aria-[invalid=true]: = a red edge when the field is marked wrong
export const BOX =
  "mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-hidden aria-[invalid=true]:border-red-600 dark:border-slate-600 dark:bg-slate-900 dark:aria-[invalid=true]:border-red-400";
export const LABEL = "mt-4 block text-sm font-medium text-slate-700 dark:text-slate-200";

// a unique id for every field, from its name: "condition.cron" -> "field-condition-cron"
export const fieldId = (name: string) => "field-" + name.replaceAll(".", "-");

// useFieldErrors - each field's error message (from the schema in the browser, or from the backend's 400 answer). Without
// control, useFormState reads the nearest form (from <FormProvider> in RuleForm), so any part can use it without props.
// RuleForm itself is OUTSIDE its own <FormProvider>, so it passes its form's control.
export function useFieldErrors(control?: Control<Rule>) {
  const { errors } = useFormState({ control });
  const error = (name: string): string | undefined => get<typeof errors, FieldError | undefined>(errors, name)?.message;
  // the input box's accessibility attributes: aria-invalid + aria-describedby ONLY while its field is wrong
  const aria = (name: string) =>
    error(name) ? { "aria-invalid": true, "aria-describedby": fieldId(name) + "-error" } : { "aria-invalid": undefined, "aria-describedby": undefined };
  const showError = (name: string) =>
    error(name) ? (
      <p id={fieldId(name) + "-error"} className="mt-1 text-sm text-red-700 dark:text-red-300">
        {error(name)}
      </p>
    ) : null;
  return { aria, showError };
}
