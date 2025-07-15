import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { FaFileAlt, FaTimesCircle, FaRegNewspaper, FaClock } from 'react-icons/fa';
import { 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  Button 
} from '@mui/material';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({
    approvedPosts: 0,
    pendingPosts: 0,
    rejectedPosts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tokenData, setTokenData] = useState({
    username: '',
    email: ''
  });
  const [showSessionExpiredDialog, setShowSessionExpiredDialog] = useState(false);
  const navigate = useNavigate();

  // API Base URL
  const baseURL = 'https://api.newztok.in';

  // Function to get auth token from storage (matching JournalistPost.jsx)
  const getAuthToken = () => {
    // Check all possible storage locations for the token
    const storageLocations = [localStorage, sessionStorage];
    // Use the same key order as other components for consistency
    const possibleKeys = ['authToken', 'token', 'jwtToken', 'userToken', 'accessToken'];
    
    for (const storage of storageLocations) {
      for (const key of possibleKeys) {
        const token = storage.getItem(key);
        if (token) {
          console.log(`Found token with key '${key}' in ${storage === localStorage ? 'localStorage' : 'sessionStorage'}`);
          return token;
        }
      }
    }
    
    console.error('No authentication token found');
    return null;
  };

  // Check for token expiration
  useEffect(() => {
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
    
    // Check token expiration on component mount
    checkTokenExpiration();
  }, []);

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

  // Function to decode JWT token
  const decodeToken = (token) => {
    try {
      // Get the payload part of the token (second part)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      // Decode the base64 string
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error('Error decoding token:', err);
      return {};
    }
  };

  // Extract user info directly from raw token
  const extractRawTokenInfo = (rawToken) => {
    try {
      // Try splitting the token manually
      const parts = rawToken.split('.');
      if (parts.length !== 3) return null;
      
      // Base64 decode the payload
      const payload = parts[1];
      // Add padding if needed
      const paddedPayload = payload.padEnd(payload.length + (4 - payload.length % 4) % 4, '=');
      
      // Decode base64
      const decoded = JSON.parse(atob(paddedPayload));
      console.log('Manual token decode:', decoded);
      return decoded;
    } catch (err) {
      console.error('Error in manual token decode:', err);
      return null;
    }
  };

  // Extract data from token
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      try {
        // Try the standard decoding
        let decoded = decodeToken(token);
        
        // If standard decoding failed, try the manual extraction
        if (!decoded || Object.keys(decoded).length === 0) {
          decoded = extractRawTokenInfo(token);
        }
        
        console.log('Decoded token:', decoded);
        
        if (decoded) {
          // Extract username and email from decoded token
          // JWT tokens may have email in different fields depending on the JWT provider
          const possibleEmailFields = ['email', 'sub', 'mail', 'emailAddress', 'userEmail'];
          const possibleUsernameFields = ['username', 'name', 'preferred_username', 'userName', 'login'];
          
          // Try each possible field name for email
          let tokenEmail = '';
          for (const field of possibleEmailFields) {
            if (decoded[field]) {
              tokenEmail = decoded[field];
              console.log(`Found email in field: ${field}`);
              break;
            }
          }
          
          // Try each possible field name for username
          let tokenUsername = '';
          for (const field of possibleUsernameFields) {
            if (decoded[field]) {
              tokenUsername = decoded[field];
              console.log(`Found username in field: ${field}`);
              break;
            }
          }
          
          // Log all token fields to help debug
          console.log('All token fields:', Object.keys(decoded));
          console.log('Extracted from token - Email:', tokenEmail, 'Username:', tokenUsername);
          
          setTokenData({
            username: tokenUsername,
            email: tokenEmail
          });
          
          // Store in localStorage and sessionStorage
          if (tokenUsername) {
            localStorage.setItem('username', tokenUsername);
            sessionStorage.setItem('username', tokenUsername);
          }
          
          if (tokenEmail) {
            localStorage.setItem('userEmail', tokenEmail);
            sessionStorage.setItem('userEmail', tokenEmail);
          }
        }
      } catch (error) {
        console.error('Error processing token:', error);
      }
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Get the auth token using the new getAuthToken function
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Configure axios headers with the token
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      console.log('Fetching profile with token:', token.substring(0, 15) + '...');

      // Fetch journalist profile
      try {
        const profileResponse = await axios.get(`${baseURL}/api/users/my-profile`, config);
        console.log('Profile response:', profileResponse.data);
        setProfileData(profileResponse.data);
      } catch (profileErr) {
        console.error('Error fetching profile:', profileErr);
        
        // Check if the error is due to an expired token
        if (profileErr.response && (profileErr.response.status === 401 || profileErr.response.status === 403)) {
          console.log('Token is invalid or expired');
          setShowSessionExpiredDialog(true);
          return; // Return early
        }
        
        // Try alternative profile endpoints
        try {
          const altProfileResponse = await axios.get(`${baseURL}/api/users/profile`, config);
          console.log('Alternative profile response:', altProfileResponse.data);
          setProfileData(altProfileResponse.data);
        } catch (altProfileErr) {
          console.error('Error fetching from alternative profile endpoint:', altProfileErr);
          
          // Check if the error is due to an expired token
          if (altProfileErr.response && (altProfileErr.response.status === 401 || altProfileErr.response.status === 403)) {
            console.log('Token is invalid or expired');
            setShowSessionExpiredDialog(true);
            return; // Return early
          }
          
          // Continue with token data even if profile fetch fails
        }
      }
      
      // Fetch stats data with multiple fallback endpoints
      const fetchStats = async () => {
        const statsData = {
          pendingPosts: 0,
          rejectedPosts: 0,
          approvedPosts: 0
        };
        
        // Fetch pending news with correct endpoint
        try {
          console.log(`Fetching pending posts from: ${baseURL}/api/news/my-pending-news`);
          const pendingResponse = await axios.get(`${baseURL}/api/news/my-pending-news`, config);
          console.log('Pending posts response:', pendingResponse.data);
          
          if (pendingResponse.data) {
            statsData.pendingPosts = pendingResponse.data.data?.length || 
              (Array.isArray(pendingResponse.data) ? pendingResponse.data.length : 0);
            console.log(`Found ${statsData.pendingPosts} pending posts`);
          }
        } catch (err) {
          console.log(`Failed to fetch pending posts: ${err.message}`);
          
          // Check if the error is due to an expired token
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            console.log('Token is invalid or expired while fetching pending posts');
            setShowSessionExpiredDialog(true);
          }
        }
        
        // Fetch rejected posts with correct endpoint
        try {
          console.log(`Fetching rejected posts from: ${baseURL}/api/news/my-rejected-news`);
          const rejectedResponse = await axios.get(`${baseURL}/api/news/my-rejected-news`, config);
          console.log('Rejected posts response:', rejectedResponse.data);
          
          if (rejectedResponse.data) {
            statsData.rejectedPosts = rejectedResponse.data.data?.length || 
              (Array.isArray(rejectedResponse.data) ? rejectedResponse.data.length : 0);
            console.log(`Found ${statsData.rejectedPosts} rejected posts`);
          }
        } catch (err) {
          console.log(`Failed to fetch rejected posts: ${err.message}`);
          
          // Check if the error is due to an expired token
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            console.log('Token is invalid or expired while fetching rejected posts');
            setShowSessionExpiredDialog(true);
          }
        }
        
        // Fetch approved posts with correct endpoint
        try {
          console.log(`Fetching approved posts from: ${baseURL}/api/news/my-approved-news`);
          const approvedResponse = await axios.get(`${baseURL}/api/news/my-approved-news`, config);
          console.log('Approved posts response:', approvedResponse.data);
          
          if (approvedResponse.data) {
            statsData.approvedPosts = approvedResponse.data.data?.length || 
              (Array.isArray(approvedResponse.data) ? approvedResponse.data.length : 0);
            console.log(`Found ${statsData.approvedPosts} approved posts`);
          }
        } catch (err) {
          console.log(`Failed to fetch approved posts: ${err.message}`);
          
          // Check if the error is due to an expired token
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            console.log('Token is invalid or expired while fetching approved posts');
            setShowSessionExpiredDialog(true);
          }
        }
        
        return statsData;
      };
      
      const statsData = await fetchStats();
      setStats(statsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError('Failed to load profile data');
      
      // Check if the error is due to an expired token
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        console.log('Token is invalid or expired');
        setShowSessionExpiredDialog(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/journalist/home');
  };

  // Extract data from profile response (handle different response formats)
  const extractProfileData = () => {
    if (!profileData) return {};
    
    // Check different possible structures
    if (profileData.data) {
      return profileData.data;
    }
    return profileData;
  };

  const userData = extractProfileData();
  
  // Store username and email in localStorage/sessionStorage for other components
  useEffect(() => {
    if (userData && userData.email) {
      localStorage.setItem('userEmail', userData.email);
      sessionStorage.setItem('userEmail', userData.email);
    }
    if (userData && userData.username) {
      localStorage.setItem('username', userData.username);
      sessionStorage.setItem('username', userData.username);
    }
  }, [userData]);

  // Format date string to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get the best available data, prioritizing API response over token data
  const displayName = userData.username || tokenData.username || localStorage.getItem('username') || sessionStorage.getItem('username') || 'Journalist';
  const displayEmail = userData.email || tokenData.email || localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail') || 'Not specified';
  
  // Format the status with capitalized first letter
  const formatStatus = (status) => {
    if (!status) return 'Active';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };
  
  const displayStatus = formatStatus(userData.status || 'Active');
  const isActive = displayStatus.toLowerCase() === 'active';
  
  const displayPhone = userData.mobile || 'Not specified';
  const displayState = userData.assignedState || 'Not assigned';
  const displayDistrict = userData.assignedDistrict || 'Not assigned';
  const displayStartedAt = formatDate(userData.createdAt);
  const profilePicture = userData.profilePicture || '';

  console.log('Display values:', { 
    displayName, 
    displayEmail, 
    displayStatus, 
    displayPhone, 
    displayState, 
    displayDistrict 
  });
  console.log('userData:', userData);
  console.log('tokenData:', tokenData);

  const renderProfileContent = () => {
    return (
      <div style={{ 
        padding: '30px', 
        backgroundColor: '#f4f6f8',
        minHeight: '100vh'
      }}>
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

        {/* Back Button */}
        <button 
          onClick={handleGoBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#4b5563',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '8px 0',
            marginBottom: '16px'
          }}
        >
          <FaArrowLeft /> Back to Dashboard
        </button>
  
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '350px 1fr',
          gap: '30px'
        }}>
          {/* Profile Info Card */}
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>Loading profile information...</div>
            ) : error ? (
              <div style={{ 
                padding: '20px', 
                color: '#ef4444', 
                textAlign: 'center' 
              }}>
                {error}
              </div>
            ) : (
              <>
                {/* Profile Header */}
                <div style={{ 
                  padding: '30px 20px',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  {profilePicture ? (
                    <img 
                      src={profilePicture.startsWith('http') ? profilePicture : `${baseURL}${profilePicture}`} 
                      alt="Profile" 
                      style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        marginBottom: '16px'
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${displayName}&background=4f46e5&color=fff&size=100`;
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100px',
                      height: '100px',
                      backgroundColor: '#4f46e5',
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: 'white',
                      fontSize: '40px',
                      fontWeight: 'bold',
                      marginBottom: '16px'
                    }}>
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h2 style={{ 
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#111827',
                    margin: '8px 0'
                  }}>
                    {displayName}
                  </h2>
                  <div style={{ 
                    fontSize: '16px',
                    color: '#4f46e5',
                    fontWeight: '500'
                  }}>
                    Journalist
                  </div>
                  <div style={{
                    marginTop: '8px',
                    padding: '4px 12px',
                    backgroundColor: isActive ? '#dcfce7' : '#fee2e2',
                    color: isActive ? '#166534' : '#b91c1c',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    {displayStatus}
                  </div>
                </div>
                
                {/* Profile Details */}
                <div style={{ padding: '24px' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ 
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '16px'
                    }}>
                      Profile Information
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          backgroundColor: 'rgba(79, 70, 229, 0.1)', 
                          padding: '10px', 
                          borderRadius: '8px',
                          color: '#4f46e5'
                        }}>
                          <FaUser />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>Username</div>
                          <div style={{ fontSize: '16px', color: '#111827' }}>{displayName}</div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          backgroundColor: 'rgba(79, 70, 229, 0.1)', 
                          padding: '10px', 
                          borderRadius: '8px',
                          color: '#4f46e5'
                        }}>
                          <FaEnvelope />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>Email</div>
                          <div style={{ fontSize: '16px', color: '#111827' }}>
                            {displayEmail}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          backgroundColor: 'rgba(79, 70, 229, 0.1)', 
                          padding: '10px', 
                          borderRadius: '8px',
                          color: '#4f46e5'
                        }}>
                          <FaPhone />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>Phone</div>
                          <div style={{ fontSize: '16px', color: '#111827' }}>{displayPhone}</div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          backgroundColor: 'rgba(79, 70, 229, 0.1)', 
                          padding: '10px', 
                          borderRadius: '8px',
                          color: '#4f46e5'
                        }}>
                          <FaMapMarkerAlt />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>State Assigned</div>
                          <div style={{ fontSize: '16px', color: '#111827' }}>{displayState}</div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          backgroundColor: 'rgba(79, 70, 229, 0.1)', 
                          padding: '10px', 
                          borderRadius: '8px',
                          color: '#4f46e5'
                        }}>
                          <FaMapMarkerAlt />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>District Assigned</div>
                          <div style={{ fontSize: '16px', color: '#111827' }}>{displayDistrict}</div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          backgroundColor: 'rgba(79, 70, 229, 0.1)', 
                          padding: '10px', 
                          borderRadius: '8px',
                          color: '#4f46e5'
                        }}>
                          <FaCalendarAlt />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>Started At</div>
                          <div style={{ fontSize: '16px', color: '#111827' }}>{displayStartedAt}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Stats Section */}
          <div>
            <h2 style={{ 
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '24px'
            }}>
              Activity Overview
            </h2>
            
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px'
            }}>
              {/* Approved Posts */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ 
                  backgroundColor: 'rgba(37, 99, 235, 0.1)', 
                  borderRadius: '8px',
                  padding: '12px',
                  marginRight: '20px'
                }}>
                  <FaRegNewspaper size={28} color="#1d4ed8" />
                </div>
                <div>
                  <h2 style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold', 
                    margin: '0',
                    color: '#111827'
                  }}>
                    {loading ? '...' : stats.approvedPosts}
                  </h2>
                  <div style={{ fontSize: '16px', color: '#4b5563' }}>Approved Posts</div>
                </div>
              </div>
  
              {/* Pending Posts */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ 
                  backgroundColor: 'rgba(234, 88, 12, 0.1)', 
                  borderRadius: '8px',
                  padding: '12px',
                  marginRight: '20px'
                }}>
                  <FaClock size={28} color="#ea580c" />
                </div>
                <div>
                  <h2 style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold', 
                    margin: '0',
                    color: '#111827'
                  }}>
                    {loading ? '...' : stats.pendingPosts}
                  </h2>
                  <div style={{ fontSize: '16px', color: '#4b5563' }}>Pending Posts</div>
                </div>
              </div>
  
              {/* Rejected Posts */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ 
                  backgroundColor: 'rgba(220, 38, 38, 0.1)', 
                  borderRadius: '8px',
                  padding: '12px',
                  marginRight: '20px'
                }}>
                  <FaTimesCircle size={28} color="#dc2626" />
                </div>
                <div>
                  <h2 style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold', 
                    margin: '0',
                    color: '#111827'
                  }}>
                    {loading ? '...' : stats.rejectedPosts}
                  </h2>
                  <div style={{ fontSize: '16px', color: '#4b5563' }}>Rejected Posts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return renderProfileContent();
};

export default Profile; 