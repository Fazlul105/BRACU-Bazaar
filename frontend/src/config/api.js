// Central API configuration and helper

const BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Custom fetch wrapper with proper error handling for non-JSON responses (e.g. HTML 404/fallback pages)
 */
export const apiFetch = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json'
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  });

  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    return data;
  } else {
    // Received non-JSON (e.g. HTML from SPA redirect or 404 fallback)
    const text = await response.text();
    if (!response.ok || text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      throw new Error(
        'Backend API is unreachable. If testing locally, open http://localhost:3000 instead of Netlify. If deployed, configure backend API URL in Netlify.'
      );
    }
    throw new Error(`Unexpected server response: ${text.slice(0, 100)}`);
  }
};
