import React, { useState, useEffect, createContext, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Button,
  Container,
  Stack,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  Tooltip,
  Dialog,
  DialogContent,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Menu,
  MenuItem,
  Avatar,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import FacebookIcon from '@mui/icons-material/Facebook';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import DescriptionIcon from '@mui/icons-material/Description';
import Logo from '../assets/images/NewzTok logo-2.svg';
import axios from 'axios';

// Create a context for the selected state
export const StateContext = createContext({
  selectedState: '',
  setSelectedState: () => {}
});

// Custom hook to use the state context
export const useStateContext = () => useContext(StateContext);

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    const path = location.pathname;
    if (path === '/') return '';
    if (path === '/trending') return 'Trending';
    return path.slice(1).charAt(0).toUpperCase() + path.slice(2);
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [userLocation, setUserLocation] = useState('Location not available');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const accountMenuOpen = Boolean(anchorEl);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  const navItems = ['Trending', 'International', 'National', 'State', 'Entertainment', 'Sports'];
  const stateItems = ['उत्तर प्रदेश', 'बिहार', 'झारखंड'];

  // Check if user is logged in and fetch profile data
  useEffect(() => {
    const userAuthToken = localStorage.getItem('userAuthToken');
    const isLoggedIn = !!userAuthToken;
    setIsUserLoggedIn(isLoggedIn);
    
    if (isLoggedIn) {
      fetchUserProfile(userAuthToken);
    }
  }, [location.pathname]); // Re-check when route changes

  // Fetch user profile data from API
  const fetchUserProfile = async (token) => {
    try {
      setLoading(true);
      
      // API Base URL
      const baseURL = 'https://api.newztok.in';
      
      // Configure axios headers with the token
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const response = await axios.get(`${baseURL}/api/auth/profile`, config);
      console.log('Profile response:', response.data);
      
      if (response.data) {
        setUserData(response.data.data || response.data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get initial letter from username
  const getInitial = () => {
    if (userData && userData.username) {
      return userData.username.charAt(0).toUpperCase();
    }
    return 'U'; // Default if no username
  };
  
  // Sample search results for demonstration
  const searchResults = [
    {
      id: 1,
      category: 'POLITICS',
      title: 'PM Modi ji visits to zone of discomfort to flex legacy for third term',
      image: '/state-news1.jpg',
      time: 'January 15, 2024, 8:19 P.M.',
    },
    {
      id: 2,
      category: 'HEADLINES',
      title: 'NDA stands for "non-development alliance," says JMM in rally',
      image: '/state-news2.jpg',
      time: 'January 15, 2024, 7:11 P.M.',
    }
  ];

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setActiveTab('');
    } else if (path === '/trending') {
      setActiveTab('Trending');
    } else if (path.startsWith('/state')) {
      setActiveTab('State');
    } else {
      setActiveTab(path.slice(1).charAt(0).toUpperCase() + path.slice(2));
    }
  }, [location]);

  // Get current date and time
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      // Format date as "Friday, 11 April 2025"
      const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      const formattedDate = now.toLocaleDateString('en-US', options);
      
      // Format time as "11:16"
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      
      setCurrentDate(formattedDate);
      setCurrentTime(formattedTime);
    };

    updateDateTime();
    const timerId = setInterval(updateDateTime, 60000); // Update every minute
    
    return () => clearInterval(timerId);
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          // Convert coordinates to location name using reverse geocoding
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`)
            .then(response => response.json())
            .then(data => {
              if (data.address) {
                const city = data.address.city || data.address.town || data.address.village || '';
                const state = data.address.state || '';
                setUserLocation(city ? (state ? `${city}, ${state}` : city) : 'Location detected');
              }
            })
            .catch(() => {
              setUserLocation('Location not available');
            });
        },
        () => {
          setUserLocation('Location access denied');
        }
      );
    }
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const getTabPath = (item) => {
    switch(item.toLowerCase()) {
      case 'trending':
        return '/trending';
      default:
        return `/${item.toLowerCase()}`;
    }
  };

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleLogoClick = () => {
    setActiveTab('');
  };

  const handleSearchOpen = () => {
    setSearchOpen(true);
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Account menu handlers
  const handleAccountClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAccountClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      // Get the auth token
      const userAuthToken = localStorage.getItem('userAuthToken');
      
      if (userAuthToken) {
        // Create request headers
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${userAuthToken}`);
        
        const requestOptions = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow"
        };
        
        // Make API call to logout endpoint
        await fetch("https://api.newztok.in/api/auth/logout", requestOptions);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear all auth tokens and user data
      localStorage.removeItem('userAuthToken');
      localStorage.removeItem('userType');
      
      // Close the menu
      handleAccountClose();
      
      // Redirect to home page
      navigate('/', { replace: true });
      
      // Update login state
      setIsUserLoggedIn(false);
      setUserData(null);
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleAccountClose();
  };

  const handlePrivacyClick = () => {
    navigate('/privacy-policy');
    handleAccountClose();
  };

  const handleTermsClick = () => {
    navigate('/terms-conditions');
    handleAccountClose();
  };

  const SearchResultItem = ({ item }) => (
    <Grid item xs={12} sm={6}>
      <Box sx={{ display: 'flex', mb: 3, cursor: 'pointer' }}>
        <Box 
          component="img" 
          src={item.image} 
          alt={item.title}
          sx={{ 
            width: 180, 
            height: 120, 
            objectFit: 'cover',
            borderRadius: 1,
            mr: 2
          }}
        />
        <Box>
          <Box
            sx={{
              display: 'inline-block',
              bgcolor: item.category === 'POLITICS' ? '#673AB7' : '#e73952',
              color: 'white',
              fontSize: '0.7rem',
              px: 1,
              py: 0.3,
              borderRadius: '2px',
              mb: 1,
              fontWeight: 'bold'
            }}
          >
            {item.category}
          </Box>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 'bold',
              fontSize: '0.95rem',
              lineHeight: 1.2,
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {item.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#888888"/>
              <path d="M12.5 7H11V13L16.2 16.2L17 14.9L12.5 12.2V7Z" fill="#888888"/>
            </svg>
            <Typography
              variant="caption"
              sx={{
                color: '#666',
                fontSize: '0.7rem',
                ml: 0.5
              }}
            >
              {item.time}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Grid>
  );

  // Handle state selection
  const handleStateSelect = (state) => {
    console.log('Selected state:', state);
    setSelectedState(state);
    
    // Map Hindi state names to their respective endpoints and English names
    const stateMapping = {
      'झारखंड': { endpoint: 'jharkhand', name: 'jharkhand' },
      'बिहार': { endpoint: 'bihar', name: 'bihar' },
      'उत्तर प्रदेश': { endpoint: 'up', name: 'uttar-pradesh' }
    };

    const selectedStateInfo = stateMapping[state];
    if (selectedStateInfo) {
      console.log('Navigating to:', `/state/${selectedStateInfo.name}`);
      // Navigate to the state page with the correct URL parameter
      navigate(`/state/${selectedStateInfo.name}`);
    }
    
    // Close drawer if open
    if (drawerOpen) {
      handleDrawerClose();
    }
  };

  return (
    <StateContext.Provider value={{ selectedState, setSelectedState }}>
      {/* States Bar - Purple Bar */}
      <AppBar position="static" sx={{ bgcolor: '#5448c8', width: '100%', boxShadow: 'none' }}>
        <Container maxWidth="xl" disableGutters>
          <Toolbar 
            variant="dense"
            sx={{ 
              height: '35px',
              minHeight: '35px !important',
              px: { xs: 1, md: 2 },
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <Stack direction="row" spacing={3}>
              {stateItems.map((state) => (
                <Typography 
                  key={state} 
                  onClick={() => handleStateSelect(state)}
                  sx={{ 
                    color: selectedState === state ? '#ffcc00' : 'white', 
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: selectedState === state ? 700 : 500,
                    cursor: 'pointer',
                    '&:hover': {
                      color: '#ffcc00'
                    }
                  }}
                >
                  {state}
                </Typography>
              ))}
            </Stack>
            
            {/* Account Icon with Dropdown */}
            {isUserLoggedIn ? (
              <>
                <Box
                  onClick={handleAccountClick}
                  sx={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {getInitial()}
                </Box>
                <Menu
                  anchorEl={anchorEl}
                  open={accountMenuOpen}
                  onClose={handleAccountClose}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                      mt: 1.5,
                      width: 200,
                      '& .MuiMenuItem-root': {
                        py: 1,
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem onClick={handleProfileClick}>
                    <PermIdentityIcon sx={{ mr: 1.5, fontSize: '1.2rem', color: '#666' }} />
                    <Typography variant="body2">Profile</Typography>
                  </MenuItem>
                  <MenuItem onClick={handlePrivacyClick}>
                    <PrivacyTipIcon sx={{ mr: 1.5, fontSize: '1.2rem', color: '#666' }} />
                    <Typography variant="body2">Privacy Policy</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleTermsClick}>
                    <DescriptionIcon sx={{ mr: 1.5, fontSize: '1.2rem', color: '#666' }} />
                    <Typography variant="body2">Terms & Conditions</Typography>
                  </MenuItem>
                  <Divider sx={{ my: 1 }} />
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 1.5, fontSize: '1.2rem', color: '#e73952' }} />
                    <Typography variant="body2" color="#e73952">Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Tooltip title="Login">
                <IconButton 
                  component={Link}
                  to="/user/login"
                  size="small" 
                  sx={{ 
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  <AccountCircleIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Date/Time Bar - Red Bar */}
      <Box sx={{ 
        bgcolor: '#e73952', 
        width: '100%', 
        color: 'white', 
        py: 0.7
      }}>
        <Container maxWidth="xl" disableGutters>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            px: { xs: 2, md: 3 }
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Box 
                component="span" 
                sx={{ 
                  width: 10, 
                  height: 10, 
                  bgcolor: 'rgba(255,255,255,0.5)', 
                  borderRadius: '50%',
                  display: 'inline-block',
                  mr: 1
                }} 
              />
              {currentDate}, {currentTime}, {userLocation}.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Main Navigation */}
      <AppBar position="static" sx={{ 
        bgcolor: 'white', 
        boxShadow: 'none', 
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Container maxWidth="xl" disableGutters>
          <Toolbar 
            sx={{ 
              justifyContent: 'space-between', 
              minHeight: '75px !important',
              px: { xs: 1, sm: 2, md: 3 }
            }}
          >
            {/* Logo */}
            <Box component={Link} to="/" onClick={handleLogoClick} sx={{ textDecoration: 'none' }}>
              <Box
                component="img"
                src={Logo}
                alt="NewzTok"
                sx={{ 
                  height: 70,
                  width: 'auto',
                  maxWidth: { xs: 160, sm: 200 }
                }}
              />
            </Box>

            {/* Navigation items */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flex: 1,
              ml: { xs: 1, md: 4 },
              mr: { xs: 1, md: 4 }
            }}>
              {navItems.map((item) => (
                <Box key={item} sx={{ position: 'relative' }}>
                  <Button
                    component={Link}
                    to={getTabPath(item)}
                    onClick={() => handleTabClick(item)}
                    sx={{
                      color: activeTab === item ? '#e73952' : 'black',
                      bgcolor: 'transparent',
                      fontWeight: activeTab === item ? 600 : 400,
                      '&:hover': {
                        bgcolor: 'transparent',
                        color: '#e73952'
                      },
                      transition: 'all 0.3s ease',
                      textDecoration: 'none',
                      textTransform: 'none',
                      fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' },
                      px: { xs: 0.5, sm: 1, md: 2 },
                      position: 'relative',
                      borderBottom: activeTab === item ? '3px solid #e73952' : 'none'
                    }}
                  >
                    {item}
                    {item === 'Entertainment' && (
                      <Box 
                        sx={{ 
                          position: 'relative',
                          display: 'inline-flex',
                          ml: 0.5,
                          bgcolor: '#e73952', 
                          color: 'white',
                          fontSize: '0.55rem',
                          px: 0.5,
                          py: 0.1,
                          borderRadius: '2px',
                          fontWeight: 600,
                          height: '14px',
                          alignItems: 'center',
                          lineHeight: 1
                        }}
                      >
                        Hot
                      </Box>
                    )}
                    {item === 'Sports' && (
                      <Box 
                        sx={{ 
                          position: 'relative',
                          display: 'inline-flex',
                          ml: 0.5,
                          bgcolor: '#ffcc00', 
                          color: 'black',
                          fontSize: '0.55rem',
                          px: 0.5,
                          py: 0.1,
                          borderRadius: '2px',
                          fontWeight: 600,
                          height: '14px',
                          alignItems: 'center',
                          lineHeight: 1
                        }}
                      >
                        Now
                      </Box>
                    )}
                  </Button>
                </Box>
              ))}
            </Box>

            {/* Social media icons */}
            <Stack 
              direction="row" 
              spacing={{ xs: 0.5, sm: 1, md: 1.5 }}
              sx={{
                '& .MuiIconButton-root': {
                  padding: { xs: '4px', sm: '6px', md: '8px' }
                }
              }}
            >
              <IconButton size="small" sx={{ color: '#3b5998' }} component="a" href="https://www.facebook.com/share/16BJSMtSn1/" target="_blank">
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: '#000000' }} component="a" href="https://x.com/newztok_news?t=bE27w5SMkv5Hdpu9TJPCJQ&s=09" target="_blank">
                <Box
                  component="svg"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  sx={{ width: 18, height: 18 }}
                >
                  <path
                    fill="currentColor"
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                  />
                </Box>
              </IconButton>
              <IconButton size="small" sx={{ color: '#ff0000' }} component="a" href="https://www.youtube.com/channel/UCn3IbwYbzMqebVC7AHlRD3A" target="_blank">
                <YouTubeIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: '#E1306C' }} component="a" href="https://www.instagram.com/newztok.news?utm_source=qr&igsh=MW5hOGlyZW0yZDhmaA==" target="_blank">
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: '#0e76a8' }} component="a" href="https://www.linkedin.com/company/newztok/" target="_blank">
                <LinkedInIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: '#25D366' }} component="a" href="https://whatsapp.com/channel/0029VbA2TzqG8l5AxszzsJ0E" target="_blank">
                <WhatsAppIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: '#000000' }} component="a" href="https://play.google.com/store/apps/details?id=com.newztok" target="_blank">
                <Box
                  component="svg"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  sx={{ width: 18, height: 18 }}
                >
                  <path
                    fill="currentColor"
                    d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"
                  />
                </Box>
              </IconButton>
              <IconButton size="small" sx={{ color: '#000000' }} component="a" href="https://apps.apple.com/in/app/newztok/id6746141322" target="_blank">
                <Box
                  component="svg"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  sx={{ width: 18, height: 18 }}
                >
                  <path
                    fill="currentColor"
                    d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
                  />
                </Box>
              </IconButton>
              <IconButton 
                size="small" 
                edge="end" 
                color="inherit" 
                aria-label="menu"
                onClick={handleDrawerOpen}
                sx={{ color: '#333' }}
              >
                <MenuIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Search Dialog - Commented out
      <Dialog 
        open={searchOpen} 
        onClose={handleSearchClose} 
        fullWidth 
        maxWidth="xl"
        PaperProps={{
          sx: {
            position: 'fixed',
            top: 0,
            left: 0,
            m: 0,
            width: '100vw',
            height: '100vh',
            borderRadius: 0,
            boxShadow: 'none',
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            overflowY: 'auto'
          }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            p: 2,
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 10
          }}
        >
          <IconButton onClick={handleSearchClose} color="inherit" size="large">
            <CloseIcon fontSize="medium" />
          </IconButton>
        </Box>

        <DialogContent sx={{ 
          p: 0, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'flex-start',
          height: '100%',
          minHeight: '100vh',
          pt: { xs: 8, md: 12 }
        }}>
          <Box sx={{ 
            width: '100%', 
            maxWidth: '900px', 
            px: { xs: 2, md: 4 }, 
            pb: 8,
            minHeight: 'calc(100vh - 120px)'
          }}>
            <Box sx={{ position: 'relative', mb: 6 }}>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  borderBottom: '2px solid #000',
                  pb: 1,
                  position: 'relative'
                }}
              >
                Search...
              </Typography>
              
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                autoFocus
                placeholder=""
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '2rem',
                  textAlign: 'center',
                  color: 'transparent',
                  caretColor: '#000',
                  outline: 'none'
                }}
              />
            </Box>

            <Box sx={{ mb: 6 }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 'bold', 
                  mb: 2, 
                  fontSize: '0.9rem',
                  color: '#555',
                  textTransform: 'uppercase',
                  px: 1
                }}
              >
                Recent Searches
              </Typography>
              <Stack 
                direction="row" 
                spacing={1} 
                sx={{ 
                  flexWrap: 'wrap',
                  gap: 1,
                  '& > *': { mb: 1 }
                }}
              >
                {['Politics', 'COVID-19', 'Economy', 'Sports', 'Entertainment'].map((tag) => (
                  <Box
                    key={tag}
                    sx={{
                      bgcolor: '#eee',
                      px: 2,
                      py: 0.7,
                      borderRadius: 2,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: '#e0e0e0'
                      }
                    }}
                  >
                    {tag}
                  </Box>
                ))}
              </Stack>
            </Box>

            <Grid container spacing={4}>
              {searchResults.map((result) => (
                <SearchResultItem key={result.id} item={result} />
              ))}
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>
      */}

      {/* Sidebar Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '65%', sm: '45%', md: '35%', lg: '25%' },
            height: '100%',
            bgcolor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(8px)',
          },
        }}
        variant="temporary"
      >
        <Box sx={{ 
          p: 3, 
          height: '100%', 
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            width: '100%',
            mb: 5
          }}>
            <IconButton 
              onClick={handleDrawerClose} 
              sx={{ 
                p: 0.5
              }}
            >
              <CloseIcon fontSize="medium" />
            </IconButton>
          </Box>

          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            flex: 1
          }}>
            {navItems.map((item) => (
              <Box 
                key={item}
                sx={{ 
                  width: '100%', 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Typography
                  component={Link}
                  to={getTabPath(item)}
                  onClick={() => {
                    handleTabClick(item);
                    handleDrawerClose();
                  }}
                  sx={{
                    color: '#000',
                    textDecoration: 'none',
                    fontSize: { xs: '1.25rem', md: '1.5rem' },
                    fontWeight: 600,
                    '&:hover': {
                      color: '#e73952'
                    }
                  }}
                >
                  {item}
                </Typography>

                {item === 'Entertainment' && (
                  <Box 
                    sx={{ 
                      display: 'inline-flex',
                      ml: 1.5,
                      bgcolor: '#e73952', 
                      color: 'white',
                      fontSize: '0.65rem',
                      px: 0.8,
                      py: 0.2,
                      borderRadius: '3px',
                      fontWeight: 600,
                      alignItems: 'center',
                    }}
                  >
                    Hot
                  </Box>
                )}
                {item === 'Sports' && (
                  <Box 
                    sx={{ 
                      display: 'inline-flex',
                      ml: 1.5,
                      bgcolor: '#ffcc00', 
                      color: 'black',
                      fontSize: '0.65rem',
                      px: 0.8,
                      py: 0.2,
                      borderRadius: '3px',
                      fontWeight: 600,
                      alignItems: 'center',
                    }}
                  >
                    Now
                  </Box>
                )}
              </Box>
            ))}
          </Box>

          {/* Social Media Icons */}
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'flex-start',
            gap: 1.5,
            mt: 3
          }}>
            <Box 
              component="a"
              href="https://www.facebook.com/share/16BJSMtSn1/"
              target="_blank"
              sx={{ 
                bgcolor: '#3b5998',
                color: 'white',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                textDecoration: 'none'
              }}
            >
              <FacebookIcon fontSize="small" />
            </Box>
            <Box 
              component="a"
              href="https://x.com/newztok_news?t=bE27w5SMkv5Hdpu9TJPCJQ&s=09"
              target="_blank"
              sx={{ 
                bgcolor: '#000000',
                color: 'white',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                textDecoration: 'none'
              }}
            >
              <Box
                component="svg"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                sx={{ width: 16, height: 16 }}
              >
                <path
                  fill="currentColor"
                  d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                />
              </Box>
            </Box>
            <Box 
              component="a"
              href="https://www.youtube.com/channel/UCn3IbwYbzMqebVC7AHlRD3A"
              target="_blank"
              sx={{ 
                bgcolor: '#ff0000',
                color: 'white',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                textDecoration: 'none'
              }}
            >
              <YouTubeIcon fontSize="small" />
            </Box>
            <Box 
              component="a"
              href="https://www.instagram.com/newztok.news?utm_source=qr&igsh=MW5hOGlyZW0yZDhmaA=="
              target="_blank"
              sx={{ 
                bgcolor: '#E1306C',
                color: 'white',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                textDecoration: 'none'
              }}
            >
              <InstagramIcon fontSize="small" />
            </Box>
            <Box 
              component="a"
              href="https://www.linkedin.com/company/newztok/"
              target="_blank"
              sx={{ 
                bgcolor: '#0e76a8',
                color: 'white',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                textDecoration: 'none'
              }}
            >
              <LinkedInIcon fontSize="small" />
            </Box>
            <Box 
              component="a"
              href="https://whatsapp.com/channel/0029VbA2TzqG8l5AxszzsJ0E"
              target="_blank"
              sx={{ 
                bgcolor: '#25D366',
                color: 'white',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                textDecoration: 'none'
              }}
            >
              <WhatsAppIcon fontSize="small" />
            </Box>
            <Box 
              component="a"
              href="https://play.google.com/store/apps/details?id=com.newztok"
              target="_blank"
              sx={{ 
                bgcolor: '#000000',
                color: 'white',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                textDecoration: 'none'
              }}
            >
              <Box
                component="svg"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                sx={{ width: 16, height: 16 }}
              >
                <path
                  fill="currentColor"
                  d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"
                />
              </Box>
            </Box>
            <IconButton size="small" sx={{ color: '#000000' }} component="a" href="https://apps.apple.com/in/app/newztok/id6746141322" target="_blank">
              <Box
                component="svg"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                sx={{ width: 18, height: 18 }}
              >
                <path
                  fill="currentColor"
                  d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
                />
              </Box>
            </IconButton>
          </Box>
        </Box>
      </Drawer>
    </StateContext.Provider>
  );
};

export default Header; 