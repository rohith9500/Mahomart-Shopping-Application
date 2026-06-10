const BASE_URL = 'http://localhost:5000/api';

export const apiCall = async (endpoint, options = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('mahomart_token') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Something went wrong');
    }
    return await res.json();
  } catch (error) {
    console.error(`API Call error on ${endpoint}:`, error.message);
    throw error;
  }
};

export const fetchProducts = async (params = {}) => {
  const query = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      query.append(key, params[key]);
    }
  });
  const queryString = query.toString();
  return apiCall(`/products${queryString ? `?${queryString}` : ''}`);
};

export const fetchProductSuggestions = async (searchTerm) => {
  if (!searchTerm) return [];
  return apiCall(`/products/suggest?q=${encodeURIComponent(searchTerm)}`);
};

export const fetchProductById = async (id) => {
  return apiCall(`/products/${id}`);
};

export const fetchCategories = async () => {
  return apiCall('/categories');
};

export const createReview = async (productId, reviewData) => {
  return apiCall(`/products/${productId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(reviewData),
  });
};

export const createOrder = async (orderData) => {
  return apiCall('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

export const fetchMyOrders = async () => {
  return apiCall('/orders/myorders');
};

export const fetchOrderById = async (id) => {
  return apiCall(`/orders/${id}`);
};

export const updateOrderStatus = async (id, status) => {
  return apiCall(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};

export const loginUser = async (email, password) => {
  return apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const registerUser = async (name, email, password) => {
  return apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
};
