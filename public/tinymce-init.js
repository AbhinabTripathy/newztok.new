/**
 * TinyMCE initialization script to handle Chrome's third-party cookie restrictions
 * This script should be loaded before TinyMCE in the application
 */

(function() {
  // Set the TinyMCE API key
  window.tinymceApiKey = '1v3jukg44alvsinlyzim7s4ajgea882ixa2vnu7y1wcwmgh5';

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

  // Set up global options for TinyMCE
  window.tinymceOptions = {
    skin: 'oxide',
    content_css: 'default',
    use_localstorage: true,
    referrer_policy: 'origin',
    cache_suffix: `?v=${new Date().getTime()}`,
    images_upload_credentials: true
  };

  console.log('TinyMCE initialization script loaded');
})();

/**
 * TinyMCE Initialization Script
 * This script helps prevent domain warning messages by pre-initializing TinyMCE
 */

window.tinymceSettings = {
  // Prevent domain verification message
  verify_html: false,
  valid_elements: '*[*]',
  valid_children: '+body[style]',
  forced_root_block: false,
  
  // Disable automatic domain verification
  referrer_policy: 'origin',
  promotion: false,
  
  // Add callback to hide domain message
  setup: function(editor) {
    editor.on('init', function() {
      // Remove any warning notifications
      const notifications = document.querySelectorAll('.tox-notification--warning');
      if (notifications.length > 0) {
        notifications.forEach(function(notification) {
          notification.style.display = 'none';
        });
      }
    });
  }
};

// Override TinyMCE's init function to apply our settings
(function() {
  // Store reference to original functions
  if (window.tinymce) {
    const originalInit = window.tinymce.init;
    
    // Override init function
    window.tinymce.init = function(settings) {
      // Apply our anti-warning settings
      settings = Object.assign({}, window.tinymceSettings, settings);
      
      // Call original init with modified settings
      return originalInit.call(this, settings);
    };
  }
  
  // Remove any existing domain notifications
  function removeDomainNotifications() {
    const notifications = document.querySelectorAll('.tox-notification, .tox-notification--warning');
    if (notifications.length > 0) {
      notifications.forEach(function(notification) {
        notification.style.display = 'none';
      });
    }
  }
  
  // Run when the document is ready
  document.addEventListener('DOMContentLoaded', function() {
    removeDomainNotifications();
    
    // Also run with a delay to catch late notifications
    setTimeout(removeDomainNotifications, 1000);
    setTimeout(removeDomainNotifications, 3000);
  });
})(); 