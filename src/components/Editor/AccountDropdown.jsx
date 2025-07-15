import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaShieldAlt, FaQuestionCircle, FaSignOutAlt, FaFileAlt } from 'react-icons/fa';
import MenuItem from './MenuItem';

const AccountDropdown = ({ isOpen, onClose, email }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Enhanced sign out function with better cleanup
  const handleSignOut = () => {
    try {
      console.log('Logging out editor...');
      
      // Clear all authentication data from localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('username');
      localStorage.removeItem('token');
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('userToken');
      localStorage.removeItem('accessToken');
      
      // Clear all authentication data from sessionStorage as well
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('jwtToken');
      sessionStorage.removeItem('userToken');
      sessionStorage.removeItem('accessToken');
      
      // Clear any additional items that might be set during editor operations
      localStorage.removeItem('editNewsItem');
      localStorage.removeItem('userAuthToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('cached_approved_news');
      localStorage.removeItem('cached_pending_news');
      
      // First close the dropdown
      onClose();
      
      // Log the redirection
      console.log('Authentication cleared. Redirecting to login...');
      
      // Direct navigation to login page, using replace to prevent back navigation
      navigate('/', { replace: true });
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.style.backgroundColor = '#ECFDF5';
      successMessage.style.color = '#065F46';
      successMessage.style.padding = '12px 16px';
      successMessage.style.borderRadius = '6px';
      successMessage.style.marginBottom = '16px';
      successMessage.style.fontSize = '14px';
      successMessage.style.position = 'fixed';
      successMessage.style.top = '20px';
      successMessage.style.right = '20px';
      successMessage.style.zIndex = '1000';
      successMessage.innerText = 'Successfully logged out!';
      document.body.appendChild(successMessage);
      
      // Remove the message after 2 seconds
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 2000);
    } catch (error) {
      console.error('Error during logout:', error);
      // Still attempt to navigate even if there was an error
      onClose();
      navigate('/', { replace: true });
    }
  };

  const handleProfileClick = () => {
    onClose();
    navigate('/editor/profile');
  };

  const handlePrivacyPolicyClick = () => {
    onClose();
    navigate('/privacy-policy');
  };

  const handleTermsConditionsClick = () => {
    onClose();
    navigate('/terms-conditions');
  };

  // Get the first letter of the username, or use 'E' as default
  const getInitial = () => {
    if (email && email.length > 0) {
      return email.charAt(0).toUpperCase();
    }
    return 'E';
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '60px', // Adjust based on your header height
        right: '20px',
        width: '280px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        overflow: 'hidden'
      }}
    >
      {/* Avatar and Email Section */}
      <div style={{ 
        padding: '24px 0', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          backgroundColor: '#3b82f6',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '12px',
          color: 'white',
          fontSize: '28px',
          fontWeight: 'bold'
        }}>
          {getInitial()}
        </div>
        <div style={{ 
          fontSize: '16px', 
          fontWeight: '500', 
          color: '#111827',
          textAlign: 'center'
        }}>
          {email || 'Editor'}
        </div>
      </div>
      
      {/* Menu Items */}
      <div>
        <MenuItem icon={<FaUser size={18} />} text="Profile" onClick={handleProfileClick} />
        <MenuItem icon={<FaShieldAlt size={18} />} text="Privacy Policy" onClick={handlePrivacyPolicyClick} />
        <MenuItem icon={<FaFileAlt size={18} />} text="Terms and Conditions" onClick={handleTermsConditionsClick} />
        <MenuItem icon={<FaQuestionCircle size={18} />} text="Help Center" onClick={() => {}} />
      </div>
      
      {/* Divider */}
      <div style={{ borderTop: '1px solid #e5e7eb' }}></div>
      
      {/* Sign Out Button */}
      <div style={{ padding: '8px 16px 16px' }}>
        <button
          onClick={handleSignOut}
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#f9fafb',
            fontSize: '16px',
            color: '#374151',
            cursor: 'pointer'
          }}
        >
          <FaSignOutAlt style={{ marginRight: '12px' }} />
          Sign out
        </button>
      </div>
    </div>
  );
};

export default AccountDropdown; 