import axios from 'axios';
import * as Device from 'expo-device';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    Accept: 'application/json',
  },
  timeout: 10000,
});

function getDeviceName() {
  return Device.deviceName || `${Device.brand ?? ''} ${Device.modelName ?? ''}`.trim() || 'mobile';
}

function handleError(error) {
  if (!error.response) {
    throw { message: 'Няма връзка със сървъра.', network: true };
  }

  const { status, data } = error.response;
  throw {
    status,
    message: data.message || 'Нещо се обърка.',
    errors: data.errors || {},
  };
}

export function login(email, password) {
  return api
    .post('/login', { email, password, device_name: getDeviceName() })
    .then((r) => r.data)
    .catch(handleError);
}

export function register(name, email, password, passwordConfirmation) {
  return api
    .post('/register', {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
      device_name: getDeviceName(),
    })
    .then((r) => r.data)
    .catch(handleError);
}

export function getUser(token) {
  return api
    .get('/user', { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data)
    .catch(handleError);
}

export function updateProfile(token, { name }) {
  return api
    .put('/user/profile', { name }, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data)
    .catch(handleError);
}

export function updatePassword(token, { current_password, password, password_confirmation }) {
  return api
    .put('/user/password', { current_password, password, password_confirmation }, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data)
    .catch(handleError);
}

export function logout(token) {
  return api
    .post('/logout', null, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data)
    .catch(handleError);
}

export function getCategories(token) {
  return api
    .get('/categories', { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data)
    .catch(handleError);
}

export function getProducts(token, categoryId, page = 1) {
  const params = { page };
  if (categoryId) params.category = categoryId;
  return api
    .get('/products', { params, headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data)
    .catch(handleError);
}

export function searchProducts(token, q, page = 1) {
  return api
    .get('/products', { params: { q, page }, headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data)
    .catch(handleError);
}

export function getProduct(token, id) {
  return api
    .get(`/products/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data)
    .catch(handleError);
}

export function createOrder(token, { address_id, notes, items }) {
  return api
    .post(
      '/orders',
      { address_id, notes, items },
      { headers: { Authorization: `Bearer ${token}` } },
    )
    .then((r) => r.data)
    .catch(handleError);
}

export function getOrders(token, page = 1) {
  return api
    .get('/orders', {
      params: { page },
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((r) => r.data)
    .catch(handleError);
}

export function getOrder(token, id) {
  return api
    .get(`/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data)
    .catch(handleError);
}

export function cancelOrder(token, id) {
  return api
    .patch(`/orders/${id}/cancel`, null, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data)
    .catch(handleError);
}

export function getAddresses(token) {
  return api
    .get('/user/addresses', { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data)
    .catch(handleError);
}

export function createAddress(token, data) {
  return api
    .post('/user/addresses', data, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data)
    .catch(handleError);
}

export function updateAddress(token, id, data) {
  return api
    .put(`/user/addresses/${id}`, data, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data)
    .catch(handleError);
}

export function deleteAddress(token, id) {
  return api
    .delete(`/user/addresses/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data)
    .catch(handleError);
}

export function getComplaints(token, page = 1) {
  return api
    .get('/complaints', {
      params: { page },
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((r) => r.data)
    .catch(handleError);
}

export function getComplaint(token, id) {
  return api
    .get(`/complaints/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data)
    .catch(handleError);
}

export function createComplaint(token, formData) {
  return api
    .post('/complaints', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: (data) => data,
    })
    .then((r) => r.data)
    .catch(handleError);
}

export function getFavorites(token, page = 1) {
  return api
    .get('/user/favorites', {
      params: { page },
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((r) => r.data)
    .catch(handleError);
}

export function addFavorite(token, productId) {
  return api
    .post('/user/favorites', { product_id: productId }, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data)
    .catch(handleError);
}

export function removeFavorite(token, favoriteId) {
  return api
    .delete(`/user/favorites/${favoriteId}`, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data)
    .catch(handleError);
}

