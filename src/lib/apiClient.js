const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const missingConfigMessage = 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';

const TABLE_MAP = {
  University: import.meta.env.VITE_TABLE_UNIVERSITY || 'universities',
  StudentProfile: import.meta.env.VITE_TABLE_STUDENT_PROFILE || 'student_profiles',
  UserFeedback: import.meta.env.VITE_TABLE_USER_FEEDBACK || 'user_feedback',
};

const getAccessToken = () => {
  if (typeof window === 'undefined') return null;
  const fromUrl = new URLSearchParams(window.location.search).get('access_token');
  if (fromUrl) {
    window.localStorage.setItem('supabase_access_token', fromUrl);
    return fromUrl;
  }
  return window.localStorage.getItem('supabase_access_token') || window.localStorage.getItem('access_token');
};

const ensureConfig = () => {
  if (!supabaseUrl || !supabaseAnonKey) throw new Error(missingConfigMessage);
};

const request = async (path, options = {}, { useAuth = true } = {}) => {
  ensureConfig();
  const token = getAccessToken();
  const headers = {
    apikey: supabaseAnonKey,
    'Content-Type': 'application/json',
    ...(useAuth && token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${supabaseUrl}${path}`, { ...options, headers });
  if (!response.ok) {
    const text = await response.text();
    throw { status: response.status, message: text || response.statusText };
  }

  if (response.status === 204) return null;
  return response.json();
};

const normalizeSort = (sort) => {
  if (!sort) return null;
  const isDesc = sort.startsWith('-');
  const field = isDesc ? sort.slice(1) : sort;
  return `${field}.${isDesc ? 'desc' : 'asc'}`;
};

const parseJsonString = (value) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  if (!['[', '{', '"'].includes(trimmed[0])) return value;

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};

const asArray = (value) => {
  const parsed = parseJsonString(value);
  if (Array.isArray(parsed)) return parsed;
  if (typeof parsed === 'string') {
    return parsed
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const asObject = (value) => {
  const parsed = parseJsonString(value);
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
};

const asNumber = (value, fallback = 0) => {
  const normalized = typeof value === 'string' ? Number(value.replace(/,/g, '').trim()) : Number(value);
  return Number.isFinite(normalized) ? normalized : fallback;
};

const asNullableNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const normalized = typeof value === 'string' ? Number(value.replace(/,/g, '').trim()) : Number(value);
  return Number.isFinite(normalized) ? normalized : null;
};

const asString = (value, fallback = '') => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
};

const asBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes'].includes(normalized)) return true;
    if (['false', '0', 'no', ''].includes(normalized)) return false;
  }
  if (typeof value === 'number') return value !== 0;
  return Boolean(value);
};

const normalizeUniversity = (university) => {
  const row = university && typeof university === 'object' ? university : {};
  return {
    ...row,
    id: row.id ?? null,
    name: asString(row.name, 'Unknown university'),
    country: asString(row.country),
    city: asString(row.city),
    region: asString(row.region),
    language: asString(row.language),
    website: asString(row.website),
    image_url: asString(row.image_url),
    description: asString(row.description),
    application_deadline: asString(row.application_deadline),
    topikLevel: asString(row.topikLevel),
    degree_levels: asArray(row.degree_levels),
    notable_programs: asArray(row.notable_programs),
    tuition_min: asNumber(row.tuition_min, 0),
    living_cost_estimate: asNumber(row.living_cost_estimate, 8000),
    min_gpa: asNumber(row.min_gpa, 0),
    required_ielts: asNullableNumber(row.required_ielts),
    international_students_percent: asNullableNumber(row.international_students_percent),
    scholarships_available: asBoolean(row.scholarships_available),
    campus_life: asObject(row.campus_life),
    admission_requirements: asObject(row.admission_requirements),
  };
};

const normalizeEntityResult = (entityName, data) => {
  if (entityName !== 'University') return data;
  if (Array.isArray(data)) return data.map(normalizeUniversity);
  if (data && typeof data === 'object') return normalizeUniversity(data);
  return [];
};

const entityClient = (entityName) => {
  const table = TABLE_MAP[entityName] || entityName;

  return {
    list: async (sort = null, limit = 1000) => {
      const query = new URLSearchParams({ select: '*', limit: String(limit) });
      const order = normalizeSort(sort);
      if (order) query.set('order', order);
      const data = await request(`/rest/v1/${table}?${query.toString()}`);
      return normalizeEntityResult(entityName, data);
    },
    filter: async (filters = {}, sort = null, limit = 1000) => {
      const query = new URLSearchParams({ select: '*', limit: String(limit) });
      Object.entries(filters || {}).forEach(([key, value]) => query.set(key, `eq.${value}`));
      const order = normalizeSort(sort);
      if (order) query.set('order', order);
      const data = await request(`/rest/v1/${table}?${query.toString()}`);
      return normalizeEntityResult(entityName, data);
    },
    create: async (payload) => {
      const user = await auth.me().catch(() => null);
      const record = {
        ...payload,
        ...(user?.email && !payload?.created_by ? { created_by: user.email } : {}),
      };
      const data = await request(`/rest/v1/${table}`, {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(record),
      });
      return normalizeEntityResult(entityName, data?.[0] || null);
    },
    update: async (id, payload) => {
      const query = new URLSearchParams({ id: `eq.${id}`, select: '*' });
      const data = await request(`/rest/v1/${table}?${query.toString()}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(payload),
      });
      return normalizeEntityResult(entityName, data?.[0] || null);
    },
    delete: async (id) => {
      const query = new URLSearchParams({ id: `eq.${id}` });
      await request(`/rest/v1/${table}?${query.toString()}`, { method: 'DELETE' });
      return true;
    },
  };
};

const auth = {
  me: async () => {
    const user = await request('/auth/v1/user');
    return {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name,
      ...user.user_metadata,
    };
  },
  isAuthenticated: async () => {
    try {
      await auth.me();
      return true;
    } catch {
      return false;
    }
  },
  logout: async (redirectTo) => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('supabase_access_token');
      window.localStorage.removeItem('access_token');
    }
    if (redirectTo) window.location.assign(redirectTo);
  },
  redirectToLogin: async (returnTo) => {
    const next = returnTo || window.location.href;
    const loginUrl = import.meta.env.VITE_LOGIN_URL;
    window.location.assign(`${loginUrl || '/login'}?redirect_to=${encodeURIComponent(next)}`);
  },
};

const aiInvoke = async (payload) => {
  const functionName = import.meta.env.VITE_LLM_FUNCTION_NAME || 'invoke-llm';
  const data = await request(`/functions/v1/${functionName}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (typeof data === 'string') return data;
  return data?.result || data?.text || JSON.stringify(data);
};

const ai = {
  invoke: aiInvoke,
};

export const apiClient = {
  auth,
  entities: {
    University: entityClient('University'),
    StudentProfile: entityClient('StudentProfile'),
    UserFeedback: entityClient('UserFeedback'),
  },
  ai,
  appLogs: {
    logUserInApp: async () => true,
  },
};

export const authClient = apiClient.auth;
export const entitiesClient = apiClient.entities;
export const aiClient = apiClient.ai;
