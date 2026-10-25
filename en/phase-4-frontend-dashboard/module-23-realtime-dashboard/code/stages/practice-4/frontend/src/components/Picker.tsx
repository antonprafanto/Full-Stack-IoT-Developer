// Picker.tsx - a row of "pick one" buttons, for example Temperature / Light / Humidity. The selected button is colored.
// <T extends string> = the type of the option values is filled in by whoever uses the component (for example "temperature" |
// "light"), so TypeScript still makes sure that onSelect only accepts values that really are in the list.
type Props<T extends string> = {
  label: string; // the button group's name for screen readers, for example "Chart quantity"
  options: { value: T; text: string }[];
  selected: T;
  onSelect: (value: T) => void;
};

export default function Picker<T extends string>({ label, options, selected, onSelect }: Props<T>) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((p) => (
        <button
          key={p.value}
          type="button"
          aria-pressed={p.value === selected} // tells screen readers which button is selected right now
          onClick={() => onSelect(p.value)}
          className={
            "min-h-11 rounded-lg border px-3 text-sm font-medium " +
            (p.value === selected
              ? "border-teal-600 bg-teal-600 text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50")
          }
        >
          {p.text}
        </button>
      ))}
    </div>
  );
}
