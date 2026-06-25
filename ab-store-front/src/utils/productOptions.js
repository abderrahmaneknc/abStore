const COLOR_KEYS = ['couleur', 'color', 'colour', 'colors', 'couleurs'];
const STORAGE_KEYS = ['stockage', 'storage', 'capacity', 'capacite', 'capacité', 'capacités'];

const matchesOptionKey = (name, keys) =>
  keys.some((key) => name.toLowerCase().includes(key));

export const getOptionGroupLabel = (name, t) => {
  if (!name) return '';
  if (matchesOptionKey(name, COLOR_KEYS)) return t('color');
  if (matchesOptionKey(name, STORAGE_KEYS)) return t('storage');
  return name;
};

export const extractColorAndStorage = (options) => {
  const groups = parseProductOptions(options);
  let colors = [];
  let storage = [];

  groups.forEach((group) => {
    if (matchesOptionKey(group.name, COLOR_KEYS)) {
      colors = group.values;
    } else if (matchesOptionKey(group.name, STORAGE_KEYS)) {
      storage = group.values;
    }
  });

  return { colors, storage };
};

export const OPTION_COLOR = 'color';
export const OPTION_STORAGE = 'storage';

export const PRESET_COLORS = [
  'Noir',
  'Blanc',
  'Or',
  'Argent',
  'Bleu',
  'Rouge',
  'Vert',
  'Violet',
  'Rose',
  'Gris',
];

export const PRESET_STORAGE = ['64GB', '128GB', '256GB', '512GB', '1TB'];

export const buildColorStorageOptions = (colors = [], storage = []) => {
  const groups = [];
  const colorValues = colors.filter(Boolean);
  const storageValues = storage.filter(Boolean);

  if (colorValues.length > 0) {
    groups.push({ name: OPTION_COLOR, values: colorValues });
  }
  if (storageValues.length > 0) {
    groups.push({ name: OPTION_STORAGE, values: storageValues });
  }

  return groups;
};

export const parseProductOptions = (options) => {
  if (!options) return [];

  try {
    const parsed = typeof options === 'string' ? JSON.parse(options) : options;

    if (Array.isArray(parsed)) {
      return parsed
        .filter((group) => group?.name && Array.isArray(group.values) && group.values.length > 0)
        .map((group) => ({
          name: group.name,
          values: group.values.filter(Boolean),
        }));
    }

    if (parsed && typeof parsed === 'object') {
      return Object.entries(parsed)
        .filter(([, values]) => Array.isArray(values) && values.length > 0)
        .map(([name, values]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          values: values.filter(Boolean),
        }));
    }
  } catch {
    return [];
  }

  return [];
};

export const serializeProductOptions = (optionGroups) => {
  const groups = (optionGroups || [])
    .map((group) => ({
      name: group.name?.trim(),
      values: (group.values || [])
        .map((value) => String(value).trim())
        .filter(Boolean),
    }))
    .filter((group) => group.name && group.values.length > 0);

  return groups.length > 0 ? JSON.stringify(groups) : null;
};

export const makeCartKey = (productId, selectedOptions = {}) =>
  `${productId}::${JSON.stringify(selectedOptions || {})}`;

export const formatSelectedOptions = (selectedOptions, t) => {
  if (!selectedOptions) return '';

  let parsed = selectedOptions;

  if (typeof selectedOptions === 'string') {
    try {
      parsed = JSON.parse(selectedOptions);
    } catch {
      return selectedOptions;
    }
  }

  if (typeof parsed !== 'object') return '';

  return Object.entries(parsed)
    .map(([key, value]) =>
      `${t ? getOptionGroupLabel(key, t) : key}: ${value}`
    )
    .join(' · ');
};

export const getMissingOptions = (optionGroups = [], selectedOptions = {}) =>
  optionGroups.filter((group) => !selectedOptions[group.name]);

export const parseSelectedOptions = (selectedOptions) => {
  if (!selectedOptions) return {};

  if (typeof selectedOptions === 'object') {
    return selectedOptions;
  }

  try {
    return JSON.parse(selectedOptions);
  } catch {
    return {};
  }
};
