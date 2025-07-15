import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  Link as MuiLink,
  Grid
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Logo from '../assets/images/NewzTok logo-2.svg';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Common style for all text input fields
  const textFieldStyle = {
    '& .MuiOutlinedInput-root': { 
      bgcolor: '#fff',
      borderRadius: 1.5,
      height: 64  // Increased height even more
    },
    '& .MuiOutlinedInput-input': {
      fontSize: '1.1rem',  // Larger text
      padding: '16px 18px'  // More padding
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#ddd',
      borderWidth: 1.5,
      boxShadow: '0 3px 5px rgba(0,0,0,0.07)'  // Enhanced shadow
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#bbb'
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#e73952',
      borderWidth: 2
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleBackClick = () => {
    navigate('/user/login'); // Navigate back to login
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!username.trim()) {
        throw new Error('Please enter your username');
      }
      
      if (!email.trim()) {
        throw new Error('Please enter your email');
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }
      
      if (!mobile || mobile.length < 10) {
        throw new Error('Please enter a valid mobile number');
      }
      
      if (!password) {
        throw new Error('Please enter a password');
      }

      // Create request body
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      
      const raw = JSON.stringify({
        username,
        email,
        mobile,
        password
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };

      // Make API call to register endpoint
      const response = await fetch("https://api.newztok.in/api/auth/register", requestOptions);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Registration failed. Please try again.');
      }
      
      console.log("Registration successful:", result);
      
      // Store auth token if provided in response
      if (result.token) {
        localStorage.setItem('authToken', result.token);
      }
      
      // On successful registration, redirect to login page
      navigate('/user/login', { 
        state: { 
          registrationSuccess: true,
          message: 'Registration successful! Please login with your new account.'
        }
      });
      
    } catch (error) {
      console.error("Registration failed:", error);
      setError(error.message || 'Registration failed. Please try again.');
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

        <Typography variant="h5" component="h1" sx={{ mb: 1, fontWeight: 'bold', fontSize: '1.8rem' }}>
          Create Account
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 4, color: 'text.secondary' }}>
          Register as a user
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          {/* Username and Email row */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', width: '100%' }}>
              <Box sx={{ flex: 1, mr: 1 }}>
                <Typography variant="caption" sx={{ mb: 1.5, display: 'block', fontWeight: 600, color: '#555', fontSize: '0.85rem' }}>
                  USERNAME
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  sx={textFieldStyle}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ mb: 1.5, display: 'block', fontWeight: 600, color: '#555', fontSize: '0.85rem' }}>
                  EMAIL
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  sx={textFieldStyle}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ mb: 4 }}>  {/* Increased margin */}
            <Typography variant="caption" sx={{ mb: 1.5, display: 'block', fontWeight: 600, color: '#555', fontSize: '0.85rem' }}>
              MOBILE NUMBER
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter your mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              type="tel"
              inputProps={{ maxLength: 10 }}
              sx={textFieldStyle}
            />
          </Box>

          <Box sx={{ mb: 4 }}>  {/* Increased margin */}
            <Typography variant="caption" sx={{ mb: 1.5, display: 'block', fontWeight: 600, color: '#555', fontSize: '0.85rem' }}>
              PASSWORD
            </Typography>
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={textFieldStyle}
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

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ 
              bgcolor: '#e73952', 
              color: 'white', 
              py: 1.5, 
              fontSize: '1.1rem',
              height: 64,  // Match text input height
              '&:hover': { bgcolor: '#d32f2f' }, 
              textTransform: 'none', 
              fontWeight: 600, 
              borderRadius: 1.5
            }}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Already have an account?{' '}
              <MuiLink
                component={Link}
                to="/user/login"
                sx={{ color: '#e73952', textDecoration: 'none', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
              >
                Login
              </MuiLink>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register; 