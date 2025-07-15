import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLogOut } from 'react-icons/fi';
import { FaQuestionCircle, FaShieldAlt, FaFileAlt } from 'react-icons/fa';
import axios from 'axios';

const AccountDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('Journalist');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (isOpen) {
      fetchProfileData();
    }
  }, [isOpen]);
  
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Get the auth token from localStorage or sessionStorage
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      if (!token) {
        console.log('No authentication token found');
        setLoading(false);
        return;
      }

      // Configure axios headers with the token
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      // API Base URL
      const baseURL = 'https://api.newztok.in';

      try {
        const profileResponse = await axios.get(`${baseURL}/api/users/my-profile`, config);
        console.log('Profile response:', profileResponse.data);
        
        if (profileResponse.data) {
          const userData = profileResponse.data.data || profileResponse.data;
          if (userData && userData.username) {
            setUsername(userData.username);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        // Try to get the username from localStorage if API fails
        const storedUsername = localStorage.getItem('username') || sessionStorage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);
        }
      } finally {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error in fetchProfileData:', err);
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;

  const handleLogout = () => {
    try {
      console.log('Logging out user...');
      
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
      
      // Clear any additional items that might be set during login
      localStorage.removeItem('editNewsItem');
      localStorage.removeItem('userAuthToken');
      localStorage.removeItem('userType');
      
      // Clear any cached data or pending news items
      localStorage.removeItem('cached_pending_news');
      localStorage.removeItem('pendingApprovals_refresh');
      
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
    navigate('/journalist/profile');
    onClose();
  };

  const handlePrivacyPolicyClick = () => {
    navigate('/privacy-policy');
    onClose();
  };

  const handleTermsConditionsClick = () => {
    navigate('/terms-conditions');
    onClose();
  };

  return (
    <div 
      style={{ 
        position: 'absolute', 
        top: '60px', 
        right: '20px', 
        width: '300px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        border: '1px solid #e5e7eb',
        zIndex: 1000,
      }}
    >
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div 
          style={{ 
            width: '70px', 
            height: '70px', 
            borderRadius: '50%', 
            backgroundColor: '#4f46e5',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '10px',
            color: 'white',
            fontSize: '28px',
            fontWeight: 'bold'
          }}
        >
          {username.charAt(0).toUpperCase()}
        </div>
        <h3 style={{ margin: '10px 0', fontSize: '18px', fontWeight: '600', color: '#111827' }}>
          {loading ? 'Loading...' : username}
        </h3>
      </div>
      
      <div style={{ padding: '0 20px' }}>
        <div 
          onClick={handleProfileClick}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '12px 0', 
            cursor: 'pointer',
            color: '#4b5563'
          }}
        >
          <FiUser size={20} style={{ marginRight: '12px' }} />
          <span style={{ fontSize: '16px' }}>Profile</span>
        </div>
        
        <div 
          onClick={handlePrivacyPolicyClick}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '12px 0', 
            cursor: 'pointer',
            color: '#4b5563'
          }}
        >
          <FaShieldAlt size={20} style={{ marginRight: '12px' }} />
          <span style={{ fontSize: '16px' }}>Privacy Policy</span>
        </div>
        
        <div 
          onClick={handleTermsConditionsClick}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '12px 0', 
            cursor: 'pointer',
            color: '#4b5563'
          }}
        >
          <FaFileAlt size={20} style={{ marginRight: '12px' }} />
          <span style={{ fontSize: '16px' }}>Terms and Conditions</span>
        </div>
        
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '12px 0', 
            cursor: 'pointer',
            color: '#4b5563',
            borderBottom: '1px solid #e5e7eb',
            marginBottom: '12px'
          }}
        >
          <FaQuestionCircle size={20} style={{ marginRight: '12px' }} />
          <span style={{ fontSize: '16px' }}>Help Center</span>
        </div>
      </div>
      
      <div style={{ padding: '0 20px 20px' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '12px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f3f4f6',
            color: '#4b5563',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            marginBottom: '16px'
          }}
        >
          <FiLogOut style={{ marginRight: '8px' }} /> Sign out
        </button>
      </div>
    </div>
  );
};

export default AccountDropdown; 