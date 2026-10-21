import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE = 'https://nodejsbabysitterbookingplatformbackend.onrender.com';

export function getApiBaseUrl() {
  return API_BASE;
}

export async function apiRequest(endpoint, options = {}) {
  const baseUrl = API_BASE;
  const token = await AsyncStorage.getItem('@carenest_token');

  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  // If not FormData, set Content-Type to application/json
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token && !headers['x-auth-token']) {
    headers['x-auth-token'] = token;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrl}${cleanEndpoint}`;

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json().catch(() => ({})) : await response.text();

    if (!response.ok) {
      const errorMsg = (typeof data === 'object' && data?.msg) 
        || (typeof data === 'object' && data?.message) 
        || response.statusText 
        || `Request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    console.warn(`[API] ${options.method || 'GET'} ${cleanEndpoint} failed:`, err.message);
    throw err;
  }
}
