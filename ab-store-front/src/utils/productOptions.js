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

export const formatSelectedOptions = (selectedOptions) => {
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
    .map(([key, value]) => `${key}: ${value}`)
    .join(' · ');
};

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
