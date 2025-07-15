import React, { useState, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { HiOutlineArrowNarrowRight } from 'react-icons/hi';
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

const JournalistRejected = () => {
  const navigate = useNavigate();
  const [rejectedNews, setRejectedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSessionExpiredDialog, setShowSessionExpiredDialog] = useState(false);

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
    const fetchRejectedNews = async () => {
      try {
        setLoading(true);
        // Get the auth token from localStorage or sessionStorage
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Configure axios headers with the token
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        console.log('Making API request with token:', token);

        // Fetch rejected news
        const response = await axios.get('https://api.newztok.in/api/news/my-rejected-news', config);
        
        console.log('Rejected news response:', response.data);
        
        // Update the rejected news array
        if (response.data && response.data.data) {
          console.log('Setting rejected news from API data:', response.data.data);
          setRejectedNews(response.data.data);
        } else {
          console.log('No data found in API response');
          setError('No data received from the server');
        }

      } catch (err) {
        console.error('Error fetching rejected news:', err);
        
        // Check if the error is due to an expired token
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          console.log('Token is invalid or expired');
          setShowSessionExpiredDialog(true);
          return; // Return early
        }
        
        setError(`Failed to load rejected news data: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRejectedNews();
  }, []);

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

      <h1 style={{ 
        fontSize: '28px', 
        fontWeight: 'bold', 
        color: '#111827', 
        marginBottom: '24px' 
      }}>
        Rejected Posts
      </h1>

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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>Loading rejected news...</div>
      ) : (
        /* Table */
        <div style={{ 
          borderRadius: '8px', 
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          marginBottom: '16px'
        }}>
          {/* Table Headers */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr', 
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: 'white'
          }}>
            <div style={{ 
              color: '#374151', 
              fontWeight: '500', 
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              borderRight: '1px solid #e5e7eb'
            }}>
              Headline <FiChevronDown size={16} style={{ marginLeft: '4px', color: '#9ca3af' }} />
            </div>
            <div style={{ 
              color: '#374151', 
              fontWeight: '500', 
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              borderRight: '1px solid #e5e7eb'
            }}>
              Content <FiChevronDown size={16} style={{ marginLeft: '4px', color: '#9ca3af' }} />
            </div>
            <div style={{ 
              color: '#374151', 
              fontWeight: '500', 
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              borderRight: '1px solid #e5e7eb'
            }}>
              Category <FiChevronDown size={16} style={{ marginLeft: '4px', color: '#9ca3af' }} />
            </div>
            <div style={{ 
              color: '#374151', 
              fontWeight: '500', 
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              borderRight: '1px solid #e5e7eb'
            }}>
              State <FiChevronDown size={16} style={{ marginLeft: '4px', color: '#9ca3af' }} />
            </div>
            <div style={{ 
              color: '#374151', 
              fontWeight: '500', 
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              borderRight: '1px solid #e5e7eb'
            }}>
              District <FiChevronDown size={16} style={{ marginLeft: '4px', color: '#9ca3af' }} />
            </div>
            <div style={{ 
              color: '#374151', 
              fontWeight: '500', 
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px'
            }}>
              Status <FiChevronDown size={16} style={{ marginLeft: '4px', color: '#9ca3af' }} />
            </div>
          </div>

          {rejectedNews.length === 0 ? (
            /* Empty State */
            <div style={{ 
              padding: '24px 16px',
              textAlign: 'center',
              color: '#6b7280',
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: 'white'
            }}>
              No rejected posts available.
            </div>
          ) : (
            /* News Items */
            rejectedNews.map((post, index) => {
              console.log('Rendering rejected post:', post);
              
              return (
                <div 
                  key={post.id || index}
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr', 
                    borderBottom: index < rejectedNews.length - 1 ? '1px solid #e5e7eb' : 'none',
                    backgroundColor: 'white'
                  }}
                >
                  <div style={{ 
                    padding: '16px', 
                    borderRight: '1px solid #e5e7eb',
                    color: '#1f2937'
                  }}>
                    {post.title || 'No title'}
                  </div>
                  <div style={{ 
                    padding: '16px', 
                    borderRight: '1px solid #e5e7eb',
                    color: '#1f2937',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {post.content || post.excerpt || post.summary || 'No content available'}
                  </div>
                  <div style={{ 
                    padding: '16px', 
                    borderRight: '1px solid #e5e7eb',
                    color: '#1f2937'
                  }}>
                    {post.category || 'Uncategorized'}
                  </div>
                  <div style={{ 
                    padding: '16px', 
                    borderRight: '1px solid #e5e7eb',
                    color: '#1f2937'
                  }}>
                    {post.state || 'N/A'}
                  </div>
                  <div style={{ 
                    padding: '16px', 
                    borderRight: '1px solid #e5e7eb',
                    color: '#1f2937'
                  }}>
                    {post.district || 'N/A'}
                  </div>
                  <div style={{ 
                    padding: '16px',
                    color: '#1f2937'
                  }}>
                    <span style={{
                      backgroundColor: '#FEE2E2',
                      color: '#EF4444',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      Rejected
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {!loading && rejectedNews.length > 0 && (
        /* Pagination */
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          color: '#6b7280',
          fontSize: '14px'
        }}>
          <div>
            1 to {rejectedNews.length} Items of {rejectedNews.length} — 
            <button style={{ 
              color: '#4f46e5', 
              backgroundColor: 'transparent', 
              border: 'none', 
              padding: '0 4px', 
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              fontWeight: '500'
            }}>
              View all <HiOutlineArrowNarrowRight style={{ marginLeft: '4px' }} />
            </button>
          </div>
          
          {/* Pagination Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ 
              padding: '8px 16px', 
              backgroundColor: '#e5edff', 
              color: '#4f46e5', 
              border: 'none', 
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}>
              Previous
            </button>
            <button style={{ 
              padding: '8px 16px', 
              backgroundColor: '#e5edff', 
              color: '#4f46e5', 
              border: 'none', 
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalistRejected; 