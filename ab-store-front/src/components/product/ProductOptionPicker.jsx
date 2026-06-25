import { getOptionGroupLabel } from '../../utils/productOptions';

export default function ProductOptionPicker({
  optionGroups = [],
  selectedOptions = {},
  onSelect,
  compact = false,
  t,
}) {
  if (!optionGroups.length) return null;

  return (
    <div className={compact ? 'space-y-2' : 'space-y-4'}>
      {optionGroups.map((group) => (
        <div key={group.name}>
          <p
            className={`mb-1.5 font-semibold text-gray-900 ${
              compact ? 'text-xs' : 'text-sm'
            }`}
          >
            {getOptionGroupLabel(group.name, t)}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {group.values.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onSelect(group.name, value)}
                className={`rounded-lg border font-medium transition ${
                  compact ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm'
                } ${
                  selectedOptions[group.name] === value
                    ? 'border-gold bg-gold text-black'
                    : 'border-border hover:border-gold'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
