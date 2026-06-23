/**
 * API Service Layer
 *
 * Centralized module for communicating with the Spring Boot backend.
 * All requests go through the Vite proxy (/api -> http://localhost:8081/api)
 * so there are no CORS issues during development.
 */

const API_BASE = '/api';

/**
 * Generic fetch wrapper with error handling.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

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
    const errorMessage = errorBody.error || errorBody.message || `HTTP ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.body = errorBody;
    throw error;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// ===================================================================
// Category API
// ===================================================================

export const categoryApi = {
  /**
   * GET /api/categories
   * @returns {Promise<Array>} list of category objects
   */
  getAll: () => request('/categories'),
  getAllAdmin: () => request('/categories/all'),

  /**
   * GET /api/categories/:id
   * @param {number} id
   * @returns {Promise<Object>} a single category
   */
  getById: (id) => request(`/categories/${id}`),

  /**
   * POST /api/categories
   * @param {Object} data - { name: string, imageUrl: string }
   * @returns {Promise<Object>} the created category
   */
  create: (data) =>
    request('/categories', {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  /**
   * PUT /api/categories/:id
   * @param {number} id
   * @param {Object|FormData} data
   * @returns {Promise<Object>} the updated category
   */
  update: (id, data) =>
    request(`/categories/${id}`, {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  /**
   * DELETE /api/categories/:id
   * @param {number} id
   * @returns {Promise<null>}
   */
  delete: (id) =>
    request(`/categories/${id}`, {
      method: 'DELETE',
    }),
};

// ===================================================================
// Auth API
// ===================================================================
export const authApi = {
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
};

// ===================================================================
// Product API
// ===================================================================
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
      body: formData, // Automatically handles multipart
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

// ===================================================================
// Order API
// ===================================================================
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

// ===================================================================
// Feedback API
// ===================================================================
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

// ===================================================================
// Contact API
// ===================================================================
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
