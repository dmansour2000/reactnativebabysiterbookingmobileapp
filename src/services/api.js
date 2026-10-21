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
    'x-client-platform': 'mobile',
    ...(options.headers || {}),
  };

  const isFormData = Boolean(
    options.body &&
    (options.body instanceof FormData ||
     typeof options.body.append === 'function' ||
     options.body._parts != null)
  );

  // If not FormData, set Content-Type to application/json
  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  } else if (isFormData) {
    delete headers['Content-Type'];
  }

  if (token) {
    if (!headers['x-auth-token']) headers['x-auth-token'] = token;
    if (!headers['Authorization']) headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrl}${cleanEndpoint}`;

  // When sending FormData with local file URIs in modern Expo/React Native,
  // Expo's WinterCG fetch throws 'Unsupported FormDataPart implementation'.
  // Using native XMLHttpRequest bridges directly to RCTNetworking, uploading seamlessly.
  if (isFormData) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const method = (options.method || 'POST').toUpperCase();
      xhr.open(method, fullUrl, true);

      for (const key of Object.keys(headers)) {
        if (key.toLowerCase() !== 'content-type') {
          xhr.setRequestHeader(key, headers[key]);
        }
      }

      xhr.onload = () => {
        let data = xhr.responseText;
        const contentType = xhr.getResponseHeader('content-type') || '';
        if (contentType.includes('application/json') || (typeof data === 'string' && data.trim().startsWith('{'))) {
          try {
            data = JSON.parse(data);
          } catch (_) {}
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          const errorMsg = (typeof data === 'object' && (data?.msg || data?.message))
            || xhr.statusText
            || `Request failed with status ${xhr.status}`;
          const err = new Error(errorMsg);
          err.status = xhr.status;
          err.data = data;
          reject(err);
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network upload request failed'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Network upload timed out'));
      };

      xhr.send(options.body);
    });
  }

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
