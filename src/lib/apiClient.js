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

const entityClient = (entityName) => {
  const table = TABLE_MAP[entityName] || entityName;

  return {
    list: async (sort = null, limit = 1000) => {
      const query = new URLSearchParams({ select: '*', limit: String(limit) });
      const order = normalizeSort(sort);
      if (order) query.set('order', order);
      return request(`/rest/v1/${table}?${query.toString()}`);
    },
    filter: async (filters = {}, sort = null, limit = 1000) => {
      const query = new URLSearchParams({ select: '*', limit: String(limit) });
      Object.entries(filters || {}).forEach(([key, value]) => query.set(key, `eq.${value}`));
      const order = normalizeSort(sort);
      if (order) query.set('order', order);
      return request(`/rest/v1/${table}?${query.toString()}`);
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
      return data?.[0] || null;
    },
    update: async (id, payload) => {
      const query = new URLSearchParams({ id: `eq.${id}`, select: '*' });
      const data = await request(`/rest/v1/${table}?${query.toString()}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(payload),
      });
      return data?.[0] || null;
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
