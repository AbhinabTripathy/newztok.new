import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  IconButton,
  CircularProgress,
  Avatar,
  Divider,
  Grid
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon
} from '@mui/icons-material';

const Profile = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    mobile: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // API Base URL
  const baseURL = 'https://api.newztok.in';

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Get the auth token from localStorage
      const userAuthToken = localStorage.getItem('userAuthToken');
      
      if (!userAuthToken) {
        throw new Error('No authentication token found');
      }

      // Configure headers with the token
      const config = {
        headers: {
          'Authorization': `Bearer ${userAuthToken}`
        }
      };

      // Fetch user profile data
      const response = await axios.get(`${baseURL}/api/auth/profile`, config);
      
      if (response.data) {
        // Extract the user data from response
        const profileData = response.data.data || response.data;
        
        setUserData({
          username: profileData.username || 'User',
          email: profileData.email || 'Not provided',
          mobile: profileData.mobile || 'Not provided'
        });
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load profile information');
      
      // Try to get data from localStorage as fallback
      const mobile = localStorage.getItem('userMobile') || '';
      
      if (mobile) {
        setUserData(prev => ({
          ...prev,
          mobile
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="sm" sx={{ 
      py: 6, 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh'
    }}>
      <Paper elevation={6} sx={{ 
        borderRadius: 3, 
        overflow: 'hidden',
        width: '100%',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header with back button */}
        <Box 
          sx={{ 
            p: 3, 
            bgcolor: '#5448c8', 
            color: 'white',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <IconButton 
            onClick={handleGoBack}
            sx={{ color: 'white', mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">My Profile</Typography>
        </Box>

        {/* Profile content */}
        <Box sx={{ p: 4 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 2, color: 'error.main', textAlign: 'center' }}>
              {error}
            </Box>
          ) : (
            <>
              {/* Profile avatar */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                mb: 4
              }}>
                <Avatar 
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    bgcolor: '#5448c8',
                    fontSize: '2.5rem',
                    mb: 2
                  }}
                >
                  {userData.username.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h5" fontWeight="bold">
                  {userData.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  NewzTok Reader
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Profile details */}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: 'rgba(84, 72, 200, 0.1)'
                    }}>
                      <PersonIcon color="primary" />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Username
                      </Typography>
                      <Typography variant="body1">
                        {userData.username}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: 'rgba(84, 72, 200, 0.1)'
                    }}>
                      <EmailIcon color="primary" />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {userData.email}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: 'rgba(84, 72, 200, 0.1)'
                    }}>
                      <PhoneIcon color="primary" />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Mobile
                      </Typography>
                      <Typography variant="body1">
                        {userData.mobile}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {/* Back to home button */}
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <IconButton 
                  onClick={handleGoBack}
                  sx={{ 
                    bgcolor: '#e73952', 
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#d32f2f'
                    }
                  }}
                >
                  <HomeIcon />
                </IconButton>
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile; 