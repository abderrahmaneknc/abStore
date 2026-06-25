export default function OptionChipSelector({ label, hint, presets, selected = [], onChange }) {
  const toggle = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
      return;
    }
    onChange([...selected, value]);
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => toggle(preset)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              selected.includes(preset)
                ? 'border-gold bg-gold text-black'
                : 'border-gray-300 text-gray-700 hover:border-gold'
            }`}
          >
            {preset}
          </button>
        ))}
      </div>
      {hint && <p className="mt-2 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
