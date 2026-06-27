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

export const extractCustomOptionGroups = (options) => {
  const groups = parseProductOptions(options);
  return groups
    .filter(
      (group) =>
        !matchesOptionKey(group.name, COLOR_KEYS) &&
        !matchesOptionKey(group.name, STORAGE_KEYS)
    )
    .map((group) => ({
      id: crypto.randomUUID(),
      name: group.name,
      values: [...group.values],
    }));
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

export const buildProductOptions = (colors = [], storage = [], customGroups = []) => {
  const groups = [];
  const colorValues = colors.filter(Boolean);
  const storageValues = storage.filter(Boolean);

  if (colorValues.length > 0) {
    groups.push({ name: OPTION_COLOR, values: colorValues });
  }
  if (storageValues.length > 0) {
    groups.push({ name: OPTION_STORAGE, values: storageValues });
  }

  customGroups.forEach((group) => {
    const name = String(group.name || '').trim();
    const values = (group.values || []).filter(Boolean);
    if (name && values.length > 0) {
      groups.push({ name, values });
    }
  });

  return mergeOptionGroups(groups);
};

export const buildColorStorageOptions = (colors = [], storage = []) =>
  buildProductOptions(colors, storage, []);

const normalizeGroupValues = (values) => {
  if (Array.isArray(values)) {
    return values.map((value) => String(value).trim()).filter(Boolean);
  }

  if (typeof values === 'string') {
    return values
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }

  if (values != null && values !== '') {
    return [String(values).trim()].filter(Boolean);
  }

  return [];
};

const normalizeRawGroup = (group) => {
  if (!group || typeof group !== 'object') return null;

  const name = String(group.name ?? group.key ?? group.label ?? '').trim();
  const values = normalizeGroupValues(group.values ?? group.value ?? group.options);

  if (!name || values.length === 0) return null;

  return { name, values };
};

const canonicalOptionName = (name) => {
  const normalized = String(name || '').trim();
  const lower = normalized.toLowerCase();
  if (matchesOptionKey(lower, COLOR_KEYS)) return OPTION_COLOR;
  if (matchesOptionKey(lower, STORAGE_KEYS)) return OPTION_STORAGE;
  return normalized;
};

const mergeOptionGroups = (groups) => {
  const merged = new Map();

  groups.forEach((group) => {
    const displayName = canonicalOptionName(group.name);
    const key = displayName.toLowerCase();
    const existing = merged.get(key);

    if (existing) {
      existing.values = [...new Set([...existing.values, ...group.values])];
      return;
    }

    merged.set(key, {
      name: displayName,
      values: [...new Set(group.values)],
    });
  });

  return Array.from(merged.values()).filter((group) => group.values.length > 0);
};

export const parseProductOptions = (options) => {
  if (!options) return [];

  try {
    const parsed = typeof options === 'string' ? JSON.parse(options) : options;

    if (Array.isArray(parsed)) {
      const groups = parsed
        .map(normalizeRawGroup)
        .filter(Boolean);

      return mergeOptionGroups(groups);
    }

    if (parsed && typeof parsed === 'object') {
      const groups = Object.entries(parsed)
        .map(([name, values]) => normalizeRawGroup({ name, values }))
        .filter(Boolean);

      return mergeOptionGroups(groups);
    }
  } catch {
    return [];
  }

  return [];
};

export const serializeProductOptions = (optionGroups) => {
  const groups = mergeOptionGroups(
    (optionGroups || [])
      .map((group) => normalizeRawGroup(group))
      .filter(Boolean)
  ).map((group) => ({
    name: group.name?.trim(),
    values: group.values
      .map((value) => String(value).trim())
      .filter(Boolean),
  }));

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
