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

export function logout(token) {
  return api
    .post('/logout', null, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data)
    .catch(handleError);
}

export function getCategories() {
  return api
    .get('/categories')
    .then((r) => r.data)
    .catch(handleError);
}

export function getProducts(categoryId, page = 1) {
  const params = { page };
  if (categoryId) params.category = categoryId;
  return api
    .get('/products', { params })
    .then((r) => r.data)
    .catch(handleError);
}

export function getProduct(id) {
  return api
    .get(`/products/${id}`)
    .then((r) => r.data)
    .catch(handleError);
}
