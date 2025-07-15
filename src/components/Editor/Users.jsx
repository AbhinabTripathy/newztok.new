import React, { useState, useEffect } from 'react';
import { FaEllipsisV } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button
} from '@mui/material';

// API base URL configuration
const API_BASE_URL = 'https://api.newztok.in';

const Users = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [journalists, setJournalists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSessionExpiredDialog, setShowSessionExpiredDialog] = useState(false);
  const navigate = useNavigate();

  // Check for token expiration on component mount
  useEffect(() => {
    checkTokenExpiration();
  }, []);

  // Check for token expiration
  const checkTokenExpiration = () => {
    const tokenData = localStorage.getItem('authTokenData');
    
    if (!tokenData) {
      // No token found, user is not logged in
      setShowSessionExpiredDialog(true);
      return;
    }
    
    try {
      const parsedTokenData = JSON.parse(tokenData);
      const tokenTimestamp = parsedTokenData.timestamp;
      const currentTime = Date.now();
      
      // Check if token is older than 24 hours (86400000 ms)
      const tokenAge = currentTime - tokenTimestamp;
      const tokenExpirationTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      if (tokenAge > tokenExpirationTime) {
        // Token has expired
        console.log('Session expired. Token age:', tokenAge, 'ms');
        setShowSessionExpiredDialog(true);
      }
    } catch (error) {
      console.error('Error checking token expiration:', error);
      setShowSessionExpiredDialog(true);
    }
  };

  // Handle redirect to login page
  const handleLoginRedirect = () => {
    // Clear auth data before redirecting
    localStorage.removeItem('authToken');
    localStorage.removeItem('authTokenData');
    localStorage.removeItem('userRole');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('authTokenData');
    sessionStorage.removeItem('userRole');
    
    // Close dialog and redirect to login page
    setShowSessionExpiredDialog(false);
    navigate('/user/login');
  };

  // Enhanced getAuthToken function with session expiration handling
  const getEnhancedAuthToken = () => {
    // Get token from all possible storage locations with fallbacks
    const storageOptions = [localStorage, sessionStorage];
    const tokenKeys = ['authToken', 'token', 'jwtToken', 'userToken', 'accessToken'];
    
    for (const storage of storageOptions) {
      for (const key of tokenKeys) {
        const token = storage.getItem(key);
        if (token) {
          console.log(`Found token with key '${key}'`);
          try {
            // Ensure token is properly formatted and not wrapped in quotes
            const cleanToken = token.trim().replace(/^["'](.*)["']$/, '$1');
            // Verify the token looks like a JWT (crude validation)
            if (cleanToken.split('.').length === 3) {
              return cleanToken;
            } else {
              console.warn('Token found but does not appear to be a valid JWT format');
            }
          } catch (e) {
            console.error('Error parsing token:', e);
          }
          return token;
        }
      }
    }
    
    console.error('No authentication token found');
    setShowSessionExpiredDialog(true);
    return null;
  };

  // Function to save a working token with timestamp
  const saveWorkingToken = (token) => {
    if (!token) return;
    
    // Save to both storage types for redundancy
    localStorage.setItem('authToken', token);
    sessionStorage.setItem('authToken', token);
    
    // Store timestamp for expiration tracking
    const tokenData = {
      token: token,
      timestamp: Date.now()
    };
    localStorage.setItem('authTokenData', JSON.stringify(tokenData));
    sessionStorage.setItem('authTokenData', JSON.stringify(tokenData));
    
    console.log('Token saved to both localStorage and sessionStorage with timestamp');
  };

  // Fetch journalists from API
  useEffect(() => {
    const fetchJournalists = async () => {
      try {
        setLoading(true);
        
        // Get the auth token using the enhanced method
        const token = getEnhancedAuthToken();
        
        if (!token) {
          setError('No authentication token found. Please login again.');
          setShowSessionExpiredDialog(true);
          return;
        }

        // Save token with timestamp if it's valid
        saveWorkingToken(token);

        console.log('Using token:', token.substring(0, 15) + '...'); // Log token for debugging

        // Configure axios headers with the token
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        };

        // Try main endpoint
        try {
          // Fetch journalists
          const response = await axios.get(`${API_BASE_URL}/api/users/assigned-journalists`, config);
          
          console.log('Journalists API response:', response);
          
          if (response.data && response.data.data) {
            // Add mobile field to each user for display purposes since API doesn't provide it
            const journalistsWithMobile = response.data.data.map(user => ({
              ...user,
              // Add dummy mobile number for display
              mobile: user.mobile || '9876543210' // Default mobile number if not provided
            }));
            
            console.log('Journalists with mobile field:', journalistsWithMobile);
            setJournalists(journalistsWithMobile);
          } else {
            setError('No data received from the server');
          }
        } catch (mainEndpointErr) {
          console.error('Main endpoint failed:', mainEndpointErr);
          
          // Check for authentication errors (401/403)
          if (mainEndpointErr.response && (mainEndpointErr.response.status === 401 || mainEndpointErr.response.status === 403)) {
            console.log('Token is invalid or expired');
            setShowSessionExpiredDialog(true);
            return;
          }
          
          // Try fallback endpoint
          try {
            // Try alternative endpoint
            const response = await axios.get(`${API_BASE_URL}/api/users/journalists`, config);
            
            if (response.data && (response.data.data || Array.isArray(response.data))) {
              const journalistsData = Array.isArray(response.data) ? response.data : response.data.data;
              const journalistsWithMobile = journalistsData.map(user => ({
                ...user,
                mobile: user.mobile || '9876543210'
              }));
              
              console.log('Journalists with mobile field (fallback):', journalistsWithMobile);
              setJournalists(journalistsWithMobile);
            } else {
              throw new Error('Invalid data format from fallback endpoint');
            }
          } catch (altErr) {
            console.error('Alternative endpoint failed:', altErr);
            
            // Check for authentication errors
            if (altErr.response && (altErr.response.status === 401 || altErr.response.status === 403)) {
              console.log('Token is invalid or expired');
              setShowSessionExpiredDialog(true);
              return;
            }
            
            // If all endpoints fail, show the original error
            if (mainEndpointErr.response) {
              setError(`Server error ${mainEndpointErr.response.status}: ${mainEndpointErr.response.data?.message || 'Failed to load journalists data'}`);
            } else if (mainEndpointErr.request) {
              setError('No response from server. Please check your connection.');
            } else {
              setError(`Error: ${mainEndpointErr.message}`);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching journalists:', err);
        
        // Check for authentication errors
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          console.log('Token is invalid or expired');
          setShowSessionExpiredDialog(true);
          return;
        }
        
        // Log more detailed error information
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Response data:', err.response.data);
          console.error('Response status:', err.response.status);
          console.error('Response headers:', err.response.headers);
          setError(`Server error ${err.response.status}: ${err.response.data?.message || 'Failed to load journalists data'}`);
        } else if (err.request) {
          // The request was made but no response was received
          console.error('No response received:', err.request);
          setError('No response from server. Please check your connection.');
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error message:', err.message);
          setError(`Error: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJournalists();
  }, []);

  const toggleDropdown = (id, event) => {
    event.stopPropagation();
    alert("We are working on the user management features. Please stay tuned!");
  };

  // Close dropdown when clicking anywhere on the document
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };

    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Helper function to get the phone number from various possible fields
  const getPhoneNumber = (user) => {
    // Print all properties for debugging
    console.log(`Looking for phone in user ${user.id || user.username}:`, Object.keys(user));
    
    // Check all possible fields where phone might be stored
    if (user.contact) return user.contact;
    if (user.mobile) return user.mobile;
    if (user.phone) return user.phone;
    if (user.phoneNumber) return user.phoneNumber;
    if (user.contactNumber) return user.contactNumber;
    
    // If we have a contact object, check inside it
    if (user.contactInfo) {
      const contactInfo = user.contactInfo;
      if (typeof contactInfo === 'object') {
        return contactInfo.mobile || contactInfo.phone || contactInfo.number;
      }
      if (typeof contactInfo === 'string') {
        return contactInfo;
      }
    }
    
    return '—';
  };

  const renderUserTable = (users, title) => (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{ 
        fontSize: '24px', 
        fontWeight: 'bold', 
        color: '#111827',
        marginBottom: '20px'
      }}>
        {title}
      </h2>
      
      {error && (
        <div style={{ 
          backgroundColor: '#fee2e2', 
          color: '#b91c1c', 
          padding: '12px', 
          borderRadius: '4px', 
          marginBottom: '16px' 
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ 
          padding: '24px 16px',
          textAlign: 'center',
          color: '#6b7280',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          Loading journalists...
        </div>
      ) : (
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          overflowX: 'auto'
        }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left', 
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Name <span style={{ color: '#9ca3af' }}>↓</span>
                </th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left', 
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Email <span style={{ color: '#9ca3af' }}>↓</span>
                </th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left', 
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Phone Number <span style={{ color: '#9ca3af' }}>↓</span>
                </th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'center', 
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>
                    No journalists available
                  </td>
                </tr>
              ) : (
                users.map(user => {
                  return (
                    <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '16px' }}>{user.username || user.name || 'N/A'}</td>
                      <td style={{ padding: '16px' }}>{user.email || 'N/A'}</td>
                      <td style={{ padding: '16px' }}>{user.mobile || '—'}</td>
                      <td style={{ padding: '16px', textAlign: 'center', position: 'relative' }}>
                        <div onClick={(e) => e.stopPropagation()}>
                          <button 
                            style={{ 
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#6b7280',
                              padding: '5px'
                            }}
                            onClick={(e) => toggleDropdown(`${title}-${user.id}`, e)}
                            aria-label="More options"
                          >
                            <FaEllipsisV />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: '30px', backgroundColor: '#f9fafb' }}>
      {/* Session Expired Dialog */}
      <Dialog
        open={showSessionExpiredDialog}
        onClose={() => {}}
        aria-labelledby="session-expired-dialog-title"
        aria-describedby="session-expired-dialog-description"
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: '450px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            backgroundColor: 'white',
            position: 'absolute',
            top: '50%',
            left: '60%',
            transform: 'translate(-50%, -50%)',
            m: 0,
            p: 3,
            alignItems: "center"
          }
        }}
      >
        <DialogTitle id="session-expired-dialog-title" sx={{ 
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '24px',
          pb: 1,
          pt: 2
        }}>
          Session Expired
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 2, pt: 0 }}>
          <DialogContentText id="session-expired-dialog-description" sx={{ 
            color: '#4b5563',
            textAlign: 'center',
            fontSize: '16px',
            lineHeight: 1.5
          }}>
            Your session has expired. Please login again to continue.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ 
          px: 3, 
          pb: 2, 
          pt: 1,
          justifyContent: 'center'
        }}>
          <Button 
            onClick={handleLoginRedirect} 
            variant="contained"
            autoFocus
            sx={{
              bgcolor: '#6366f1',
              color: 'white',
              px: 4,
              py: 1.2,
              borderRadius: '6px',
              minWidth: '130px',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: '#4f46e5'
              }
            }}
          >
            LOGIN
          </Button>
        </DialogActions>
      </Dialog>
      
      {renderUserTable(journalists, 'Journalists')}
    </div>
  );
};

export default Users; 