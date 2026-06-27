const API_BASE = 'https://abstore-y9p6.onrender.com/api';

async function request(endpoint, options = {}) {
  const normalizedEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`;
  const url = `${API_BASE}${normalizedEndpoint}`;

  const isFormData = options.body instanceof FormData;

  const defaultHeaders = isFormData
    ? {}
    : {
        'Content-Type': 'application/json',
      };

  const token = localStorage.getItem('token');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...authHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

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

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export const categoryApi = {
  getAll: () => request('/categories'),
  getAllAdmin: () => request('/categories/all'),
  getById: (id) => request(`/categories/${id}`),
  create: (data) =>
    request('/categories', {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  update: (id, data) =>
    request(`/categories/${id}`, {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  delete: (id) =>
    request(`/categories/${id}`, {
      method: 'DELETE',
    }),
};

export const authApi = {
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
};

export const productApi = {
  search: async (params) => {
    const query = new URLSearchParams(params).toString();
    const response = await request(`/products${query ? `?${query}` : ''}`);
    return response.content ?? response;
  },
  getById: (id) => request(`/products/${id}`),
  create: (formData) =>
    request('/products', {
      method: 'POST',
      body: formData,
    }),
  update: (id, formData) =>
    request(`/products/${id}`, {
      method: 'PUT',
      body: formData,
    }),
  delete: (id) =>
    request(`/products/${id}`, {
      method: 'DELETE',
    }),
};

export const orderApi = {
  create: (data) =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAll: () => request('/orders'),
  getById: (id) => request(`/orders/${id}`),
  updateStatus: (id, status) =>
    request(`/orders/${id}/status?status=${encodeURIComponent(status)}`, {
      method: 'PUT',
    }),
  delete: (id) =>
    request(`/orders/${id}`, {
      method: 'DELETE',
    }),
};

export const feedbackApi = {
  submit: (data) =>
    request('/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getByProduct: (productId) => request(`/feedback/product/${productId}`),
  getAll: () => request('/feedback/all'),
  toggleVisibility: (id, visible) =>
    request(`/feedback/${id}/visibility?visible=${visible}`, {
      method: 'PUT',
    }),
  delete: (id) =>
    request(`/feedback/${id}`, {
      method: 'DELETE',
    }),
};

export const contactApi = {
  submit: (data) =>
    request('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAll: () => request('/contact'),
  markAsRead: (id) =>
    request(`/contact/${id}/read`, {
      method: 'PUT',
    }),
  delete: (id) =>
    request(`/contact/${id}`, {
      method: 'DELETE',
    }),
};

export default {
  categoryApi,
  authApi,
  productApi,
  orderApi,
  feedbackApi,
  contactApi,
};
