const API_BASE = import.meta.env.VITE_API_URL;

if (!API_BASE) {
  throw new Error('VITE_API_URL is not defined. Check your .env file.');
}

// ─── Valid values for order status ───────────────────────────────────────────
const VALID_ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

// ─── Valid MIME types for file uploads ───────────────────────────────────────
const VALID_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
const MAX_FILE_SIZE_MB = 10;

// ─── Core request function ───────────────────────────────────────────────────
async function request(endpoint, options = {}) {
  const normalizedEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`;
  const url = `${API_BASE}${normalizedEndpoint}`;

  const isFormData = options.body instanceof FormData;

  const defaultHeaders = isFormData
    ? {}
    : { 'Content-Type': 'application/json' };

  const token = localStorage.getItem('token');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...authHeaders,
      ...options.headers,
    },
    signal: options.signal ?? controller.signal,
  };

  let response;

  try {
    response = await fetch(url, config);
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      throw new Error(
        'Request timed out. Please check your connection and try again.'
      );
    }
    throw new Error(
      'Cannot connect to the server. Please check your internet connection.'
    );
  }

  clearTimeout(timeout);

  // ── Auto-logout on expired / invalid token ────────────────────────────────
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    return;
  }

  if (!response.ok) {
    let errorBody;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = { message: response.statusText };
    }
    const errorMessage =
      errorBody.error || errorBody.message || `HTTP ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.body = errorBody;
    throw error;
  }

  // ── Safe JSON parse — handles 502/503 HTML error pages ───────────────────
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    console.error('Non-JSON response from server:', text?.slice(0, 200));
    throw new Error('Unexpected server response. Please try again.');
  }
}

// ─── File upload validator ────────────────────────────────────────────────────
function validateImageFile(file) {
  if (!file) return;
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    throw new Error(
      `Invalid file type "${file.type}". Only JPEG, PNG, WEBP and GIF are allowed.`
    );
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new Error(
      `File is too large. Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`
    );
  }
}

// ─── Helper: validate FormData image fields before upload ────────────────────
function validateFormDataImages(data) {
  if (!(data instanceof FormData)) return;
  for (const [, value] of data.entries()) {
    if (value instanceof File) {
      validateImageFile(value);
    }
  }
}

// ─── Category API ─────────────────────────────────────────────────────────────
export const categoryApi = {
  getAll: () => request('/categories'),
  getAllAdmin: () => request('/categories/all'),
  getById: (id) => request(`/categories/${id}`),

  create: (data) => {
    validateFormDataImages(data);
    return request('/categories', {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  },

  update: (id, data) => {
    validateFormDataImages(data);
    return request(`/categories/${id}`, {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  },

  delete: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
};

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
};

// ─── Product API ──────────────────────────────────────────────────────────────
export const productApi = {
  search: async (params, signal) => {
    const query = new URLSearchParams(params).toString();
    const response = await request(`/products${query ? `?${query}` : ''}`, {
      signal,
    });
    return response?.content ?? response;
  },

  getById: (id) => request(`/products/${id}`),

  create: (formData) => {
    validateFormDataImages(formData);
    return request('/products', { method: 'POST', body: formData });
  },

  update: (id, formData) => {
    validateFormDataImages(formData);
    return request(`/products/${id}`, { method: 'PUT', body: formData });
  },

  delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
};

// ─── Order API ────────────────────────────────────────────────────────────────
export const orderApi = {
  create: (data) =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: () => request('/orders'),
  getById: (id) => request(`/orders/${id}`),

  updateStatus: (id, status) => {
    if (!VALID_ORDER_STATUSES.includes(status)) {
      throw new Error(
        `Invalid order status "${status}". Must be one of: ${VALID_ORDER_STATUSES.join(', ')}.`
      );
    }
    return request(
      `/orders/${id}/status?status=${encodeURIComponent(status)}`,
      {
        method: 'PUT',
      }
    );
  },

  delete: (id) => request(`/orders/${id}`, { method: 'DELETE' }),
};

// ─── Feedback API ─────────────────────────────────────────────────────────────
export const feedbackApi = {
  submit: (data) =>
    request('/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getByProduct: (productId) => request(`/feedback/product/${productId}`),
  getAll: () => request('/feedback/all'),

  toggleVisibility: (id, visible) => {
    if (typeof visible !== 'boolean') {
      throw new Error('visible must be a boolean value.');
    }
    return request(`/feedback/${id}/visibility?visible=${visible}`, {
      method: 'PUT',
    });
  },

  delete: (id) => request(`/feedback/${id}`, { method: 'DELETE' }),
};

// ─── Contact API ──────────────────────────────────────────────────────────────
export const contactApi = {
  submit: (data) =>
    request('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: () => request('/contact'),

  markAsRead: (id) => request(`/contact/${id}/read`, { method: 'PUT' }),

  delete: (id) => request(`/contact/${id}`, { method: 'DELETE' }),
};

// ─── Default export ───────────────────────────────────────────────────────────
export default {
  categoryApi,
  authApi,
  productApi,
  orderApi,
  feedbackApi,
  contactApi,
};
