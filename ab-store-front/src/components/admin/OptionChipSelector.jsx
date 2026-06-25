import { useState } from 'react';
import { Plus } from 'lucide-react';

export default function OptionChipSelector({
  label,
  hint,
  quickChooseLabel,
  customPlaceholder,
  addLabel,
  presets,
  selected = [],
  onChange,
}) {
  const [customValue, setCustomValue] = useState('');

  const toggle = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
      return;
    }
    onChange([...selected, value]);
  };

  const addCustom = () => {
    const trimmed = customValue.trim();
    if (!trimmed) return;
    if (!selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
    }
    setCustomValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustom();
    }
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>

      {quickChooseLabel && (
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
          {quickChooseLabel}
        </p>
      )}

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

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={customPlaceholder}
          className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-gold"
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!customValue.trim()}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={14} />
          {addLabel}
        </button>
      </div>

      {hint && <p className="mt-2 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
