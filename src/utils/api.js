// API utility functions

/**
 * Constructs a properly formatted API URL without double slashes
 * @param {string} baseURL - The base URL (with or without trailing slash)
 * @param {string} endpoint - The API endpoint (with or without leading slash)
 * @returns {string} Properly formatted URL
 */
export const formatApiUrl = (baseURL, endpoint) => {
  // Remove trailing slash from baseURL if present
  const base = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
  
  // Remove leading slash from endpoint if present
  const path = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Join with a single slash
  return `${base}/${path}`;
};

/**
 * Gets the authentication token from storage
 * @returns {string|null} Auth token or null if not found
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken') || 
         sessionStorage.getItem('authToken') || 
         localStorage.getItem('editorToken') || 
         sessionStorage.getItem('editorToken') || 
         null;
};

/**
 * Creates axios config with auth headers
 * @returns {Object} Axios config object with auth headers
 */
export const getAuthConfig = () => {
  const token = getAuthToken();
  
  if (!token) {
    console.warn('No authentication token found');
    return {};
  }
  
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
}; 