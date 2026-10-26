// RuleForm.tsx - ONE form to create and change automation rules (Module 24).
// Its input is checked by the SAME Rule schema as the backend (the copy in schemas/rule-basics.ts) through react-hook-form +
// zodResolver: error messages show under their field before anything is sent. The backend still checks again; its 400
// errors (for example an invalid cron expression) are put in their field too.
// This file holds the form (input, save, delete, preview). Its fields are drawn by three small parts:
// WhenSection ("When?"), ThenSection ("Then?"), and ConfirmDelete (the Delete rule button + its "are you sure?" box).
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import type { FieldPath } from "react-hook-form";
import { useNavigate } from "react-router";
import { ApiError, createRule, deleteRule, updateRule } from "../api";
import { defaultAction, defaultCommand, defaultCondition, describeRule, deviceNameOf, friendlyMessages, parse400 } from "../rules";
import { BOX, fieldId, LABEL, useFieldErrors } from "../fields";
import { Rule } from "../schemas/rule-basics";
import type { SetCommand } from "../schemas/contract";
import { toast } from "../toast";
import { handleSessionExpired, useLiveStore } from "../store";
import WhenSection from "./WhenSection";
import ThenSection from "./ThenSection";
import ConfirmDelete from "./ConfirmDelete";

type Props = {
  id: number | null; // null = a new rule (POST); a number = changing the rule with that number (PUT)
  initial: Rule; // the form's starting content
};

// Fields that have a place for an error message on the screen. A 400 error from the backend for ANOTHER field (for example
// "condition.kind" from an old backend that doesn't know "below-threshold" yet) is written above the Save button, so it isn't lost.
const SHOWN_FIELDS = ["name", "condition.cron", "condition.device_id", "condition.on_above", "condition.off_below",
  "condition.on_below", "condition.off_above", "condition.for_seconds", "action.kind", "action.device_id", "action.command.value"];

export default function RuleForm({ id, initial }: Props) {
  const navigate = useNavigate();
  const devices = useLiveStore((s) => s.devices) ?? [];
  const [deleting, setDeleting] = useState(false); // true while DELETE /rules/:id is running

  // mode "onTouched": a field is checked after it has been left once, then every time it is typed in.
  // zodResolver(Rule, { error: friendlyMessages }): the same schema as the backend + a map of friendlier messages.
  const form = useForm({ resolver: zodResolver(Rule, { error: friendlyMessages }), mode: "onTouched", defaultValues: initial });
  const { register, control, handleSubmit, setValue, unregister, setError, clearErrors, formState } = form;
  const { aria, showError } = useFieldErrors(control); // for the Name field (the other parts call useFieldErrors() themselves)

  // useWatch = "watch" the condition and action input: this component is drawn again every time they change. Used to
  // choose which fields show (depending on "When?" and "Then?") and for the sentence preview.
  const [condition, action] = useWatch({ control, name: ["condition", "action"] });

  // Changing "When?": the WHOLE condition is replaced at once. The old option's fields leave the input too, so the strict
  // schema (strictObject) doesn't refuse them with "Unrecognized key".
  function changeWhen(kind: Rule["condition"]["kind"]) {
    if (kind === condition.kind) return;
    const deviceId = "device_id" in condition ? condition.device_id : action.device_id;
    setValue("condition", defaultCondition(kind, deviceId), { shouldDirty: true });
    clearErrors("condition");
    // a schedule only has a start, no end: its action must be a one-time command, not a switch
    if (kind === "schedule" && action.kind === "switch") changeAction("command");
  }

  // Changing "Then?": the whole action is replaced at once (the device and the Telegram choice are kept).
  function changeAction(kind: Rule["action"]["kind"]) {
    if (kind === action.kind) return;
    unregister("action.command.value"); // see changeTarget below
    setValue("action", defaultAction(kind, action.device_id, action.notify), { shouldDirty: true });
    clearErrors("action");
  }

  // Changing the command kind (pump, lamp, fan, curtain). The value field changes kind: a number for the pump and curtain,
  // on/off for the lamp and fan. The old field is released first (unregister), so its way of reading (valueAsNumber)
  // isn't carried over to the new field.
  function changeTarget(target: SetCommand["target"]) {
    unregister("action.command.value");
    setValue("action.command", defaultCommand(target), { shouldDirty: true });
    clearErrors("action.command");
  }

  // handleSubmit calls this ONLY if the input passes the schema; while this function runs, isSubmitting = true
  async function save(content: Rule) {
    try {
      if (id === null) await createRule(content);
      else await updateRule(id, content);
      toast('Rule "' + content.name + '" saved.', "success");
      // replace: the Back button on the rule list doesn't open the saved form again
      navigate("/rules", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.code === 401) return handleSessionExpired();
      if (err instanceof ApiError && err.code === 400) {
        // errors only the backend can find (for example the cron "61 * * * *"): put them in their field, then focus the first
        // wrong field. Errors for a field without a message place are gathered above the Save button.
        const general: string[] = [];
        let first = true;
        for (const f of parse400(err.message)) {
          if (SHOWN_FIELDS.includes(f.field)) {
            // the field name comes from the text of the backend's answer, so TypeScript can't check it: "as" = we vouch for it
            setError(f.field as FieldPath<Rule>, { type: "server", message: f.message }, { shouldFocus: first });
            first = false;
          } else {
            general.push(f.field === "" ? f.message : f.field + ": " + f.message);
          }
        }
        if (general.length > 0) setError("root.server", { message: "Refused by the server: " + general.join("; ") });
        return;
      }
      setError("root.server", { message: err instanceof ApiError ? err.message : "Couldn't save the rule." });
    }
  }

  async function handleDelete() {
    if (id === null) return;
    setDeleting(true);
    try {
      const result = await deleteRule(id);
      toast('Rule "' + result.name + '" deleted.', "success");
      navigate("/rules", { replace: true }); // Back doesn't open the form of a deleted rule again
    } catch (err) {
      setDeleting(false);
      if (err instanceof ApiError && err.code === 401) return handleSessionExpired();
      if (err instanceof ApiError && err.code === 404) {
        toast("This rule no longer exists (maybe it was deleted from another dashboard).", "info");
        return navigate("/rules", { replace: true });
      }
      setError("root.server", { message: err instanceof ApiError ? err.message : "Couldn't delete the rule." });
    }
  }

  return (
    // FormProvider: the parts inside it (WhenSection, ThenSection) use the same form through useFormContext.
    // noValidate: the browser's built-in checks are turned off, so every message comes from the same schema as the backend.
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(save)} noValidate className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{id === null ? "New rule" : "Edit rule " + id}</h2>

        <label htmlFor={fieldId("name")} className={LABEL}>
          Rule name
        </label>
        <input id={fieldId("name")} placeholder="for example Water if the soil is dry" {...aria("name")} {...register("name")} className={BOX} />
        {showError("name")}

        <WhenSection condition={condition} changeWhen={changeWhen} />
        <ThenSection action={action} schedule={condition.kind === "schedule"} changeAction={changeAction} changeTarget={changeTarget} />

        {/* preview: the rule sentence from the current input, changing while you type */}
        <div className="mt-5 rounded-lg bg-slate-100 p-3 text-sm text-slate-800 dark:bg-slate-900 dark:text-slate-100">
          <p className="font-medium">Preview</p>
          <p className="mt-1">{describeRule({ name: "", active: true, condition, action }, (d) => deviceNameOf(devices, d))}</p>
        </div>

        {/* an error from the server's answer that doesn't point at one field: role="alert" = read out by screen readers at once */}
        {formState.errors.root?.server ? (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 p-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
            {formState.errors.root.server.message}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={formState.isSubmitting || deleting}
            className="min-h-11 rounded-lg bg-teal-600 px-5 font-medium text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {formState.isSubmitting ? "Saving…" : "Save rule"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/rules")}
            className="min-h-11 rounded-lg border border-slate-300 px-4 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          {id !== null ? <ConfirmDelete name={initial.name} deleting={deleting} onDelete={handleDelete} /> : null}
        </div>
      </form>
    </FormProvider>
  );
}
