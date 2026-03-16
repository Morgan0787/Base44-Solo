const parseJsonSafely = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const normalizeStringList = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : String(item ?? '').trim()))
      .filter(Boolean);
  }

  if (value == null) return [];

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
      const parsed = parseJsonSafely(trimmed);
      if (parsed !== null) return normalizeStringList(parsed);
    }

    return trimmed
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === 'object') {
    if (Array.isArray(value.items)) return normalizeStringList(value.items);
    if (Array.isArray(value.values)) return normalizeStringList(value.values);

    return Object.values(value)
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
  }

  return [String(value).trim()].filter(Boolean);
};

export const normalizeObjectList = (value) => {
  if (Array.isArray(value)) {
    return value.filter((item) => item && typeof item === 'object');
  }

  if (value == null) return [];

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    const parsed = parseJsonSafely(trimmed);
    if (parsed !== null) return normalizeObjectList(parsed);

    return [];
  }

  if (typeof value === 'object') {
    if (Array.isArray(value.items)) return normalizeObjectList(value.items);
    if (Array.isArray(value.values)) return normalizeObjectList(value.values);

    return [value];
  }

  return [];
};

export const normalizeUniversity = (university) => ({
  ...university,
  degree_levels: normalizeStringList(university?.degree_levels),
  notable_programs: normalizeStringList(university?.notable_programs),
  scholarships: normalizeObjectList(university?.scholarships),
});
