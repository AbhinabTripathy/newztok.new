/**
 * TinyMCE initialization script to handle Chrome's third-party cookie restrictions
 * This script should be loaded before TinyMCE in the application
 */

(function() {
  // Set the TinyMCE base URL and API key
  window.tinymceBaseUrl = '/tinymce';
  window.tinymceApiKey = '74ezfl12d3caazs304xdpxge6jtfxivf5ps8xuc8x259fgn4';

  // Handle local storage for settings instead of cookies
  const originalStorage = window.localStorage;
  const originalSessionStorage = window.sessionStorage;

  // Create a tiny-specific storage
  const createTinyStorage = (storage) => {
    return {
      getItem: function(key) {
        return storage.getItem('tiny_' + key);
      },
      setItem: function(key, value) {
        try {
          storage.setItem('tiny_' + key, value);
        } catch (e) {
          console.warn('TinyMCE storage error:', e);
        }
      },
      removeItem: function(key) {
        storage.removeItem('tiny_' + key);
      }
    };
  };

  // Create TinyMCE-specific storage wrappers
  window.tinyLocalStorage = createTinyStorage(originalStorage);
  window.tinySessionStorage = createTinyStorage(originalSessionStorage);

  // Cookie consent handler
  window.handleTinyCookieConsent = function() {
    // This function will be called when TinyMCE loads
    // Chrome's SameSite=None cookies require secure connection
    document.cookie = "tinymce_cookie_consent=true; SameSite=None; Secure; Path=/";
    
    // Add a flag in localStorage to remember user preference
    try {
      localStorage.setItem('tinymce_cookie_consent', 'true');
    } catch (e) {
      console.warn('Failed to store cookie consent in localStorage:', e);
    }
  };

  // Call the consent handler when the script loads
  window.handleTinyCookieConsent();

  // Monkey patch XMLHttpRequest to handle CORS issues with TinyMCE
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    // Check if this is a TinyMCE request
    if (typeof url === 'string' && url.indexOf('tinymce') !== -1) {
      // Add cache-busting parameter
      const separator = url.indexOf('?') !== -1 ? '&' : '?';
      url = url + separator + '_=' + new Date().getTime();
      
      // Log TinyMCE requests for debugging
      console.debug('TinyMCE request:', url);
    }
    
    // Call the original method
    return originalOpen.call(this, method, url, async, user, password);
  };

  // Detect cookie blockers and provide warnings
  if (navigator.cookieEnabled === false) {
    console.warn('Cookies are disabled. TinyMCE functionality may be limited.');
    // You could show a UI warning here
  }

  // Create global TinyMCE configuration defaults
  window.tinyMCEPreInit = {
    suffix: '.min',
    baseURL: window.tinymceBaseUrl
  };

  console.log('TinyMCE initialization script loaded');
})(); 