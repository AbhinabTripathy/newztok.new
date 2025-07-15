import React, { useRef, useEffect, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import './tinymce-styles.css';

// Use CDN version instead of self-hosted to avoid 404 errors
const TINYMCE_API_KEY = 'omxjaluaxpgfpa6xkfadimoprrirfmhozsrtpb3o1uimu4c5';

// Domains where your application is deployed
const ALLOWED_DOMAINS = [
  'newztok.in',
  'www.newztok.in',
  'api.newztok.in',
  'admin.newztok.in',
  'dev.newztok.in',
  'staging.newztok.in',
  '13.234.42.114',
  'localhost',
  window.location.hostname // Current domain
];

/**
 * Enhanced TinyMCE Editor component that works with Chrome's cookie policy
 * 
 * @param {object} props - Component props
 * @param {string} props.value - Current content value
 * @param {function} props.onEditorChange - Content change handler
 * @param {object} props.editorRef - Optional ref for the editor instance
 * @param {string} props.initialValue - Initial content
 * @param {object} props.customConfig - Optional custom configuration to merge
 * @param {number} props.height - Editor height (default: 300)
 * @returns {JSX.Element} - TinyMCE Editor component
 */
const TinyMCEEditor = ({ 
  value, 
  onEditorChange,
  editorRef: externalEditorRef, 
  initialValue = "", 
  customConfig = {},
  height = 300
}) => {
  const internalEditorRef = useRef(null);
  const editorRef = externalEditorRef || internalEditorRef;
  const [editorInitialized, setEditorInitialized] = useState(false);
  const [editorError, setEditorError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set a timeout to show fallback if editor takes too long to initialize
    const timeout = setTimeout(() => {
      if (!editorInitialized) {
        setIsLoading(false);
      }
    }, 3000);

    return () => {
      clearTimeout(timeout);
    };
  }, [editorInitialized]);

  const handleEditorChange = (content, editor) => {
    if (onEditorChange) {
      onEditorChange(content, editor);
    }
  };

  const handleInit = (evt, editor) => {
    // Set the editor reference
    if (editorRef) {
      editorRef.current = editor;
    }
    
    // Mark editor as initialized
    setEditorInitialized(true);
    setIsLoading(false);
    
    // Add any custom init logic here
    try {
      // Handle cookie consent
      const doc = editor.getDoc();
      const win = doc.defaultView || doc.parentWindow;
      
      if (win && typeof win.navigator !== 'undefined' && !win.navigator.cookieEnabled) {
        console.warn('Cookies are disabled in the editor iframe. Some features may not work correctly.');
      }
    } catch (e) {
      console.error('Error during editor initialization:', e);
    }
  };

  const handleEditorError = (error) => {
    console.error('TinyMCE Editor error:', error);
    setEditorError(error.message || 'Failed to load the editor');
    setIsLoading(false);
  };

  const defaultConfig = {
    height,
    menubar: true,
    plugins: [
      'advlist', 'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 
      'image', 'link', 'lists', 'media', 'searchreplace', 'table', 
      'visualblocks', 'wordcount'
    ],
    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
    
    // These settings help with Chrome's cookie policy
    referrer_policy: 'origin',
    
    // Set valid domains to avoid cross-domain issues
    document_base_url: window.location.origin,
    
    // Disable message without affecting functionality
    promotion: false,
    
    // Add your domains
    allowed_origins: ALLOWED_DOMAINS,
    
    // Use localStorage instead of cookies when possible
    use_localstorage: true,
    
    // Important for cookies in iframes
    iframe_strip_domain: false,
    
    // Disable branding
    branding: false,
    
    // Performance optimizations
    entity_encoding: 'raw',
    convert_urls: false,
    
    // Error handling
    remove_script_host: false,
    
    // Setup function
    setup: function (editor) {
      editor.on('LoadContent', function() {
        // Script executed when content is loaded
      });
      
      // Remove domain message using DOM
      editor.on('init', function() {
        try {
          // Try to find and remove domain notification
          const iframe = document.querySelector('.tox-edit-area__iframe');
          if (iframe) {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const notification = iframeDoc.querySelector('.tox-notification--warning');
            if (notification) {
              notification.style.display = 'none';
            }
          }
          
          // Also remove any notifications in the main editor
          const notifications = document.querySelectorAll('.tox-notification--warning');
          notifications.forEach(n => n.style.display = 'none');
        } catch (e) {
          console.log('Error removing notifications:', e);
        }
      });
    }
  };

  // Merge user config with default config
  const mergedConfig = { ...defaultConfig, ...customConfig };

  // Fallback content in case TinyMCE fails to load
  if (editorError) {
    return (
      <div className="tinymce-container">
        <div className="tinymce-error">
          Failed to load the rich text editor. Please try refreshing the page. Error: {editorError}
        </div>
        <textarea
          value={value || initialValue || ''}
          onChange={(e) => handleEditorChange(e.target.value)}
          className="tinymce-fallback"
          style={{ height: `${height}px` }}
        />
      </div>
    );
  }

  // Show a loading indicator while editor initializes
  if (isLoading && !editorInitialized) {
    return (
      <div className="tinymce-container">
        <div className="tinymce-fallback" style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>Loading editor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="tinymce-container">
      <Editor
        apiKey={TINYMCE_API_KEY}
        onInit={handleInit}
        initialValue={initialValue}
        value={value}
        onEditorChange={handleEditorChange}
        init={mergedConfig}
        onError={handleEditorError}
      />
      <style>
        {`
          /* CSS to hide TinyMCE domain warning notification */
          .tox-notification--warning {
            display: none !important;
          }
        `}
      </style>
    </div>
  );
};

export default TinyMCEEditor; 