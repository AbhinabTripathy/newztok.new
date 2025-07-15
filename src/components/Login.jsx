import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Link as MuiLink,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../assets/images/NewzTok logo-2.svg';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Login = () => {
  const [activeTab, setActiveTab] = useState(0);
  
  // Staff login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // User login state
  const [mobileNumber, setMobileNumber] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [rememberUser, setRememberUser] = useState(false);
  
  // Common state
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check for saved credentials on component mount
  useEffect(() => {
    if (activeTab === 1) { // Staff login
      const savedEmail = localStorage.getItem('savedEmail');
      const savedPassword = localStorage.getItem('savedPassword');
      
      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    } else { // User login
      const savedMobile = localStorage.getItem('savedMobile');
      const savedUserPassword = localStorage.getItem('savedUserPassword');
      
      if (savedMobile && savedUserPassword) {
        setMobileNumber(savedMobile);
        setUserPassword(savedUserPassword);
        setRememberUser(true);
      }
    }
  }, [activeTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
    setErrorType('');
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleClickShowUserPassword = () => {
    setShowUserPassword(!showUserPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleBackClick = () => {
    navigate('/'); // Navigate to HomeScreen
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Modified request data format to match the API's expected structure
    const requestData = { 
      username: email, // Send as username instead of email
      password: password
    };
    
    console.log("Staff request data:", requestData);

    try {
      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem('savedEmail', email);
        localStorage.setItem('savedPassword', password);
      } else {
        // Clear saved credentials if remember me is unchecked
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('savedPassword');
      }

      // Make the login request with more detailed error handling
      console.log("Making staff login request to:", 'https://api.newztok.in/api/auth/login');
      
      // Add headers for content type
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.post(
        'https://api.newztok.in/api/auth/login', 
        requestData,
        config
      );
      
      // Log the entire response for debugging
      console.log("Full API response:", response);
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);

      const result = response.data;
      console.log("API Login successful:", result);
      
      // Try to extract token from multiple possible locations
      let token = null;
      let userRole = null;
      
      // Check all possible token locations (handle inconsistent API responses)
      if (result.data?.token) {
        token = result.data.token;
        console.log("Found token in result.data.token");
      } else if (result.token) {
        token = result.token;
        console.log("Found token in result.token");
      } else if (result.data?.accessToken) {
        token = result.data.accessToken;
        console.log("Found token in result.data.accessToken");
      } else if (result.accessToken) {
        token = result.accessToken;
        console.log("Found token in result.accessToken");
      }
      
      // Try to extract role from multiple possible locations
      if (result.data?.role) {
        userRole = result.data.role.toLowerCase();
        console.log("Found role in result.data.role:", userRole);
      } else if (result.role) {
        userRole = result.role.toLowerCase();
        console.log("Found role in result.role:", userRole);
      }

      // Fallback if no token found - check the entire response structure
      if (!token) {
        console.error("No token found in expected locations, searching entire response...");
        const responseStr = JSON.stringify(response);
        if (responseStr.includes("token")) {
          console.log("Response contains 'token', but not in expected location");
        }
        throw new Error('Authentication token not found in server response');
      }

      console.log("Final extracted token:", token ? "Token found (not shown for security)" : "No token found");
      console.log("Final extracted role:", userRole);

      // Store token with timestamp for expiry tracking
      const tokenData = {
        token: token,
        timestamp: Date.now(),
        role: userRole
      };

      // Store in both localStorage and sessionStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('authTokenData', JSON.stringify(tokenData));
      localStorage.setItem('userRole', userRole || '');
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('authTokenData', JSON.stringify(tokenData));
      sessionStorage.setItem('userRole', userRole || '');
      
      console.log("Stored auth data in localStorage and sessionStorage successfully");

      if (!userRole) {
        console.warn("User role is undefined or null, using default redirect");
        setError('Warning: Unable to determine user role. Using default redirection.');
      }

      // Role-based redirection
      let redirectPath = '/user';
      
      if (userRole === 'journalist') {
        redirectPath = '/journalist/home';
      } else if (userRole === 'editor') {
        redirectPath = '/editor';
      }

      console.log("Redirecting to:", redirectPath);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.error("API Login failed:", error);
      console.log("Error details:", {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.status === 502) {
        setError('We are working on the Server. Please try after some time');
        setErrorType('server');
      } else if (error.response?.status === 500) {
        setError('Internal Server Error! We are fixing it');
        setErrorType('server');
      } else {
        setError('Invalid credentials. Please try again.');
        setErrorType('auth');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Save credentials if remember me is checked
      if (rememberUser) {
        localStorage.setItem('savedMobile', mobileNumber);
        localStorage.setItem('savedUserPassword', userPassword);
      } else {
        // Clear saved credentials if remember me is unchecked
        localStorage.removeItem('savedMobile');
        localStorage.removeItem('savedUserPassword');
      }

      // Simple validation
      if (!mobileNumber || mobileNumber.length < 10) {
        throw new Error('Please enter a valid mobile number');
      }
      
      if (!userPassword) {
        throw new Error('Please enter your password');
      }

      // Log the request details for debugging
      console.log("Making user login request with mobile:", mobileNumber);
      
      // Create request body
      const requestBody = {
        mobile: mobileNumber,
        password: userPassword
      };
      
      console.log("Request body:", requestBody);
      console.log("Sending request to:", "https://api.newztok.in/api/auth/login/audience");

      // Make API call using axios for consistency
      const response = await axios.post(
        "https://api.newztok.in/api/auth/login/audience", 
        requestBody
      );
      
      // Log the entire response for debugging
      console.log("Full user login response:", response);
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      
      const result = response.data;
      console.log("User login successful, result:", result);
      
      // Try to extract token from all possible locations
      let token = null;
      
      if (result.token) {
        token = result.token;
        console.log("Found token in result.token");
      } else if (result.data?.token) {
        token = result.data.token;
        console.log("Found token in result.data.token");
      } else if (result.accessToken) {
        token = result.accessToken;
        console.log("Found token in result.accessToken");
      } else if (result.data?.accessToken) {
        token = result.data.accessToken;
        console.log("Found token in result.data.accessToken");
      }

      // Final fallback - search entire response for token
      if (!token) {
        console.error("No token found in expected locations, searching entire response...");
        const responseStr = JSON.stringify(response);
        if (responseStr.includes("token")) {
          console.log("Response contains 'token', but not in expected location");
        }
        throw new Error('Authentication token not found in server response');
      }

      console.log("Final extracted token:", token ? "Token found (not shown for security)" : "No token found");

      // Store token with timestamp for expiry tracking
      const tokenData = {
        token: token,
        timestamp: Date.now(),
        type: 'audience'
      };

      // Store auth token in both storages for consistency
      localStorage.setItem('userAuthToken', token);
      localStorage.setItem('userAuthTokenData', JSON.stringify(tokenData));
      localStorage.setItem('userType', 'audience');
      sessionStorage.setItem('userAuthToken', token);
      sessionStorage.setItem('userAuthTokenData', JSON.stringify(tokenData));
      sessionStorage.setItem('userType', 'audience');
      
      console.log("User token stored successfully in localStorage and sessionStorage");
      
      // Redirect to home page
      navigate('/', { replace: true });
    } catch (error) {
      console.error("User login failed:", error);
      console.log("Error details:", {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.status === 502) {
        setError('We are working on the Server. Please try after some time');
        setErrorType('server');
      } else if (error.response?.status === 500) {
        setError('Internal Server Error! We are fixing it');
        setErrorType('server');
      } else {
        setError('Invalid credentials. Please try again.');
        setErrorType('auth');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container 
      maxWidth={false} 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f8f8f8',
        position: 'relative',
        pt: 2
      }}
    >
      {/* Back button */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 10
        }}
      >
        <IconButton
          onClick={handleBackClick}
          sx={{
            bgcolor: 'rgba(0,0,0,0.05)',
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.1)'
            }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: 'white',
          borderRadius: 2,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Box
          component="img"
          src={Logo}
          alt="NewzTok"
          sx={{ height: 70, mb: 2 }}
        />

        {/* Tabs for switching between user and staff login */}
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{ 
            width: '100%', 
            mb: 3,
            '& .MuiTabs-indicator': {
              backgroundColor: '#e73952',
            },
            '& .Mui-selected': {
              color: '#e73952',
            }
          }}
        >
          <Tab 
            icon={<PersonIcon />} 
            label="Login as User" 
            iconPosition="start"
            sx={{ 
              textTransform: 'none', 
              fontWeight: 600,
              fontSize: '0.9rem'
            }} 
          />
          <Tab 
            icon={<WorkIcon />} 
            label="Journalist/Editor" 
            iconPosition="start"
            sx={{ 
              textTransform: 'none', 
              fontWeight: 600,
              fontSize: '0.9rem'
            }} 
          />
        </Tabs>

        {error && errorType === 'server' && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* User Login Form */}
        {activeTab === 0 && (
          <Box component="form" onSubmit={handleUserSubmit} sx={{ width: '100%' }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 600, color: '#555' }}>
                MOBILE NUMBER
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter your mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                type="tel"
                inputProps={{ maxLength: 10 }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { bgcolor: '#fff' } 
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 600, color: '#555' }}>
                PASSWORD
              </Typography>
              <TextField
                fullWidth
                type={showUserPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowUserPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showUserPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={rememberUser}
                    onChange={(e) => setRememberUser(e.target.checked)}
                    sx={{ color: '#e73952', '&.Mui-checked': { color: '#e73952' } }}
                  />
                }
                label={<Typography variant="body2">Remember me</Typography>}
              />
              <MuiLink
                component={Link}
                to="/forgot-password"
                sx={{ color: '#e73952', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { textDecoration: 'underline' } }}
              >
                Forgot Password?
              </MuiLink>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ bgcolor: '#e73952', color: 'white', py: 1.2, '&:hover': { bgcolor: '#d32f2f' }, textTransform: 'none', fontWeight: 600 }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
            
            {error && errorType === 'auth' && activeTab === 0 && (
              <Typography 
                variant="body2" 
                sx={{ color: 'error.main', textAlign: 'center', mt: 1, fontWeight: 500 }}
              >
                {error}
              </Typography>
            )}
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Don't have an account?{' '}
                <MuiLink
                  component={Link}
                  to="/register"
                  sx={{ color: '#e73952', textDecoration: 'none', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/register');
                  }}
                >
                  Register
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        )}

        {/* Staff Login Form */}
        {activeTab === 1 && (
          <Box component="form" onSubmit={handleStaffSubmit} sx={{ width: '100%' }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 600, color: '#555' }}>
                USERNAME
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter your username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 600, color: '#555' }}>
                PASSWORD
              </Typography>
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    sx={{ color: '#e73952', '&.Mui-checked': { color: '#e73952' } }}
                  />
                }
                label={<Typography variant="body2">Remember me</Typography>}
              />
              <MuiLink
                component={Link}
                to="/forgot-password"
                sx={{ color: '#e73952', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { textDecoration: 'underline' } }}
              >
                Forgot Password?
              </MuiLink>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ bgcolor: '#e73952', color: 'white', py: 1.2, '&:hover': { bgcolor: '#d32f2f' }, textTransform: 'none', fontWeight: 600 }}
            >
              {loading ? 'Signing In...' : 'Staff Sign In'}
            </Button>
            
            {error && errorType === 'auth' && activeTab === 1 && (
              <Typography 
                variant="body2" 
                sx={{ color: 'error.main', textAlign: 'center', mt: 1, fontWeight: 500 }}
              >
                {error}
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Login;