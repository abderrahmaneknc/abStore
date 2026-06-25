import { getOptionGroupLabel } from '../../utils/productOptions';

export default function ProductOptionPicker({
  optionGroups = [],
  selectedOptions = {},
  onSelect,
  compact = false,
  variant = 'light',
  t,
}) {
  if (!optionGroups.length) return null;

  const isDark = variant === 'dark';

  return (
    <div className={compact ? 'space-y-2' : 'space-y-4'}>
      {optionGroups.map((group) => (
        <div
          key={group.name}
          className={compact ? 'flex min-w-0 items-center gap-2' : undefined}
        >
          <p
            className={`font-semibold whitespace-nowrap ${
              compact ? 'mb-0 text-xs' : 'mb-1.5 text-sm'
            } ${isDark ? 'text-gray-200' : 'text-gray-900'}`}
          >
            {getOptionGroupLabel(group.name, t)}
          </p>
          <div
            className={`flex gap-1.5 ${
              compact ? 'min-w-0 flex-1 flex-nowrap overflow-x-auto scrollbar-hide' : 'flex-wrap'
            }`}
          >
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
                    : isDark
                      ? 'border-gray-600 text-gray-200 hover:border-gold hover:text-white'
                      : 'border-border text-gray-700 hover:border-gold'
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
