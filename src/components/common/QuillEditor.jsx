import React, { useState, useEffect, useRef } from 'react';

/**
 * Basic Quill Editor component
 * Note: You'll need to install react-quill with a compatible version
 * or use the CDN version as shown below
 */
const QuillEditor = ({ 
  value, 
  onEditorChange,
  editorRef: externalEditorRef, 
  initialValue = "", 
  customConfig = {},
  height = 300
}) => {
  const editorContainerRef = useRef(null);
  const [editor, setEditor] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Load Quill from CDN
  useEffect(() => {
    // Skip if already loaded
    if (window.Quill) {
      setIsLoaded(true);
      return;
    }

    // Load Quill styles
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://cdn.quilljs.com/1.3.7/quill.snow.css';
    document.head.appendChild(linkElement);

    // Load Quill script
    const scriptElement = document.createElement('script');
    scriptElement.src = 'https://cdn.quilljs.com/1.3.7/quill.min.js';
    scriptElement.async = true;
    
    scriptElement.onload = () => {
      setIsLoaded(true);
    };
    
    scriptElement.onerror = () => {
      setError('Failed to load the Quill editor');
    };
    
    document.body.appendChild(scriptElement);

    // Cleanup
    return () => {
      document.body.removeChild(scriptElement);
    };
  }, []);

  // Initialize Quill editor after it's loaded
  useEffect(() => {
    if (!isLoaded || !editorContainerRef.current || editor) return;

    try {
      const quillOptions = {
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['clean'],
            ['link', 'image', 'video'],
          ],
          ...customConfig?.modules,
        },
        placeholder: 'Write something...',
        theme: 'snow',
        ...customConfig,
      };

      // Initialize Quill
      const quillEditor = new window.Quill(editorContainerRef.current, quillOptions);
      
      // Set initial content
      if (initialValue) {
        quillEditor.clipboard.dangerouslyPasteHTML(initialValue);
      }

      // Set up change handler
      quillEditor.on('text-change', () => {
        if (onEditorChange) {
          const html = quillEditor.root.innerHTML;
          onEditorChange(html, quillEditor);
        }
      });

      // Expose editor instance
      setEditor(quillEditor);
      if (externalEditorRef) {
        externalEditorRef.current = quillEditor;
      }

    } catch (err) {
      console.error('Error initializing Quill:', err);
      setError(`Failed to initialize editor: ${err.message}`);
    }
  }, [isLoaded, initialValue, onEditorChange, externalEditorRef, customConfig, editor]);

  // Update content when value prop changes
  useEffect(() => {
    if (editor && value !== undefined && editor.root.innerHTML !== value) {
      editor.clipboard.dangerouslyPasteHTML(value);
    }
  }, [value, editor]);

  if (error) {
    return (
      <div style={{ 
        border: '1px solid #ccc', 
        borderRadius: '4px',
        padding: '10px',
        marginBottom: '20px'
      }}>
        <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>
        <textarea
          value={value || initialValue || ''}
          onChange={(e) => onEditorChange && onEditorChange(e.target.value)}
          style={{ 
            width: '100%', 
            height: `${height}px`,
            padding: '8px',
            boxSizing: 'border-box' 
          }}
        />
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ 
        border: '1px solid #ccc', 
        borderRadius: '4px',
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        Loading editor...
      </div>
    );
  }

  return (
    <div>
      <div 
        ref={editorContainerRef} 
        style={{ height: `${height}px`, maxHeight: `${height}px` }}
      ></div>
    </div>
  );
};

export default QuillEditor; 