const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? `http://${window.location.hostname}:5000/api` 
    : 'http://localhost:5000/api');

let isRefreshing = false;
let refreshPromise = null;

const pendingRequests = new Map();

export const apiFetch = async (endpoint, options = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isFormData = typeof window !== 'undefined' && options.body instanceof FormData;

  const defaultHeaders = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchOptions = {
    ...options,
    credentials: 'include', // Crucial for cookies
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const method = fetchOptions.method || 'GET';
  const cacheKey = method === 'GET' ? endpoint : null;

  if (cacheKey && pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  const fetchPromise = (async () => {
    try {
      let response = await fetch(`${BASE_URL}${endpoint}`, fetchOptions);
      let data = await response.json();

      if (!response.ok) {
        // Check for token expiration
        if (response.status === 401 && data.message === 'TOKEN_EXPIRED') {
          if (!isRefreshing) {
            isRefreshing = true;
            
            // Start the refresh request and store the promise
            refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' }
            }).then(async (refreshResponse) => {
              const refreshData = await refreshResponse.json();

              if (refreshResponse.ok) {
                const newToken = refreshData.data.token;
                localStorage.setItem('token', newToken);
                isRefreshing = false;
                return newToken;
              } else {
                isRefreshing = false;
                localStorage.removeItem('token');
                document.cookie = "userRole=loggedout; path=/;";
                if (typeof window !== 'undefined') {
                  if (window.location.pathname.startsWith('/b2b-india')) {
                    window.location.href = '/secure-login';
                  } else {
                    window.location.href = '/login';
                  }
                }
                throw new Error('Session expired. Please login again.');
              }
            }).catch(err => {
              isRefreshing = false;
              throw err;
            });
          }

          // Wait for the refresh promise to resolve (works for first and subsequent requests)
          try {
            const newToken = await refreshPromise;
            fetchOptions.headers['Authorization'] = `Bearer ${newToken}`;
            const retryResponse = await fetch(`${BASE_URL}${endpoint}`, fetchOptions);
            const retryData = await retryResponse.json();
            
            if (!retryResponse.ok) {
              const retryErr = new Error(retryData.message || 'Something went wrong after retry');
              retryErr.status = retryResponse.status;
              retryErr.data = retryData;
              throw retryErr;
            }
            
            return retryData;
          } catch (err) {
            throw err;
          }
        }

        const errorObj = new Error(data.message || 'Something went wrong');
        errorObj.status = response.status;
        errorObj.data = data;
        throw errorObj;
      }

      return data;
    } catch (error) {
      console.error('API Fetch Error:', error);
      throw error;
    } finally {
      if (cacheKey) pendingRequests.delete(cacheKey);
    }
  })();

  if (cacheKey) {
    pendingRequests.set(cacheKey, fetchPromise);
  }

  return fetchPromise;
};
