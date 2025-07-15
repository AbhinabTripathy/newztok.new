import React, { useState, useEffect } from 'react';
import { FaBuilding } from 'react-icons/fa';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { BsClockHistory } from 'react-icons/bs';
import { MdErrorOutline } from 'react-icons/md';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

const Overview = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSessionExpiredDialog, setShowSessionExpiredDialog] = useState(false);
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get the auth token from localStorage or sessionStorage
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        console.log('Using token:', token.substring(0, 15) + '...'); // Log token for debugging

        // Configure axios headers with the token
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        };

        // Set the correct base URL
        const baseURL = 'https://api.newztok.in';

        // Fetch user profile data
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
          console.error('Error fetching user profile:', err);
          // Check if the error is due to an expired token
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            console.log('Token is invalid or expired');
            setShowSessionExpiredDialog(true);
            return; // Stop further API calls
          }
        }

        // Create an array of promises for all three requests
        const promises = [
          // Fetch pending news
          axios.get(`${baseURL}/api/news/my-pending-news`, config),
          // Fetch approved news 
          axios.get(`${baseURL}/api/news/my-approved-news`, config),
          // Fetch rejected news
          axios.get(`${baseURL}/api/news/my-rejected-news`, config)
        ];

        // Wait for all requests to complete
        const [pendingResponse, approvedResponse, rejectedResponse] = await Promise.all(promises);
        
        console.log('Pending news response:', pendingResponse.data);
        console.log('Approved news response:', approvedResponse.data);
        console.log('Rejected news response:', rejectedResponse.data);
        
        // Update the counts
        setPendingCount(pendingResponse.data?.data?.length || 0);
        setApprovedCount(approvedResponse.data?.data?.length || 0);
        setRejectedCount(rejectedResponse.data?.data?.length || 0);

      } catch (err) {
        console.error('Error fetching news data:', err);
        // Check if the error is due to an expired token
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          console.log('Token is invalid or expired');
          setShowSessionExpiredDialog(true);
          return; // Return early
        }
        
        // Log more detailed error information
        if (err.response) {
          console.error('Response data:', err.response.data);
          console.error('Response status:', err.response.status);
          setError(`Server error ${err.response.status}: ${err.response.data?.message || 'Failed to load news data'}`);
        } else if (err.request) {
          console.error('No response received:', err.request);
          setError('No response from server. Please check your connection.');
        } else {
          console.error('Error message:', err.message);
          setError(`Error: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="overview-container" style={{ padding: '30px' }}>
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

      {username && (
        <h2 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold',
          color: '#4f46e5', 
          marginBottom: '30px' 
        }}>
          Welcome {username}
        </h2>
      )}

      {error && (
        <div style={{ 
          backgroundColor: '#ffe6e6', 
          color: '#ff0000', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          {error}
        </div>
      )}

      <div style={{ 
        display: 'flex', 
        gap: '24px' 
      }}>
        {/* Approved Posts Card */}
        <div style={{ 
          flex: 1, 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          padding: '24px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ 
              backgroundColor: '#e6f0ff', 
              borderRadius: '8px', 
              width: '50px', 
              height: '50px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <IoDocumentTextOutline size={24} color="#0055ff" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', marginRight: '12px' }}>
              {loading ? '...' : approvedCount}
            </h2>
            <span style={{ fontSize: '18px', color: '#6b7280' }}>Posts</span>
          </div>
          <p style={{ color: '#6b7280', margin: 0 }}>Approved</p>
        </div>

        {/* Pending Approvals Card */}
        <div style={{ 
          flex: 1, 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          padding: '24px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ 
              backgroundColor: '#fff1e6', 
              borderRadius: '8px', 
              width: '50px', 
              height: '50px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <BsClockHistory size={24} color="#ff6b00" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', marginRight: '12px' }}>
              {loading ? '...' : pendingCount}
            </h2>
            <span style={{ fontSize: '18px', color: '#6b7280' }}>Posts</span>
          </div>
          <p style={{ color: '#6b7280', margin: 0 }}>Pending Approvals</p>
        </div>

        {/* Rejected Posts Card */}
        <div style={{ 
          flex: 1, 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          padding: '24px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ 
              backgroundColor: '#ffe6e6', 
              borderRadius: '8px', 
              width: '50px', 
              height: '50px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <MdErrorOutline size={24} color="#ff0000" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', marginRight: '12px' }}>
              {loading ? '...' : rejectedCount}
            </h2>
            <span style={{ fontSize: '18px', color: '#6b7280' }}>Rejects</span>
          </div>
          <p style={{ color: '#6b7280', margin: 0 }}>Post Rejected</p>
        </div>
      </div>
    </div>
  );
};

export default Overview; 