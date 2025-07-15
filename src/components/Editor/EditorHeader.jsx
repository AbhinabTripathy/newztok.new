import React, { useState, useEffect, useRef } from 'react';
import { BsSun, BsMoon } from 'react-icons/bs';
import Logo from '../../assets/images/NewzTok logo-2.svg';
import AccountDropdown from './AccountDropdown';

const EditorHeader = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [editorEmail, setEditorEmail] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const dropdownRef = useRef(null);
  
  // Get editor information from localStorage or sessionStorage
  useEffect(() => {
    const storedUsername = localStorage.getItem('username') || sessionStorage.getItem('username');
    if (storedUsername) {
      setEditorEmail(storedUsername);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAccountDropdownOpen(false);
      }
    };

    if (accountDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [accountDropdownOpen]);
  
  const toggleAccountDropdown = (e) => {
    e.stopPropagation();
    setAccountDropdownOpen(!accountDropdownOpen);
  };

  const handleDarkModeClick = () => {
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // Get the first letter of the username, or use 'U' as default
  const getInitial = () => {
    if (editorEmail && editorEmail.length > 0) {
      return editorEmail.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', backgroundColor: '#1a1a1a', position: 'relative' }}>
      <img src={Logo} alt="NewzTok Logo" style={{ height: '60px' }} />
      
      {/* Empty middle space where search was */}
      <div></div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {darkMode ? (
          <BsMoon color="#ccc" size={20} onClick={handleDarkModeClick} style={{ cursor: 'pointer' }} />
        ) : (
          <BsSun color="#ccc" size={20} onClick={handleDarkModeClick} style={{ cursor: 'pointer' }} />
        )}
        <div ref={dropdownRef}>
          <div 
            onClick={toggleAccountDropdown} 
            style={{ 
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            {getInitial()}
          </div>
          <AccountDropdown 
            isOpen={accountDropdownOpen} 
            onClose={() => setAccountDropdownOpen(false)}
            email={editorEmail}
          />
        </div>
      </div>

      {/* Notification for dark mode */}
      {showNotification && (
        <div style={{
          position: 'absolute',
          top: '70px',
          right: '20px',
          backgroundColor: '#2a2a2a',
          color: 'white',
          padding: '10px 15px',
          borderRadius: '4px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          zIndex: 100,
          animation: 'fadeIn 0.3s ease-in'
        }}>
          We're working on this feature. Coming soon!
        </div>
      )}
    </div>
  );
};

export default EditorHeader; 