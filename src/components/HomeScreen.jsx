import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  Divider,
  CircularProgress,
  Paper,
  IconButton,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import axios from 'axios';
import { useStateContext } from './Header'; // Import state context
import AdComponent from './AdSenseAds';

const HomeScreen = () => {
  // State variables for news sections
  const [newsItems, setNewsItems] = useState([]);
  const [secondSectionNews, setSecondSectionNews] = useState([]);
  const [additionalNews, setAdditionalNews] = useState([]);
  const [fourthSectionNews, setFourthSectionNews] = useState([]);
  const [fifthSectionNews, setFifthSectionNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bannerAd, setBannerAd] = useState(null);
  const [sideAd, setSideAd] = useState(null);
  const [bannerError, setBannerError] = useState(null);
  const [sideError, setSideError] = useState(null);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [sideLoading, setSideLoading] = useState(true);
  const { selectedState } = useStateContext(); // Get selected state from context
  const navigate = useNavigate(); // Add this line to use navigation

  // Base URL for API
  const baseUrl = 'https://api.newztok.in';

  // Helper function to capitalize first letter
  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } catch (err) {
      console.error('Date formatting error:', err);
      return dateString;
    }
  };

  useEffect(() => {
    fetchTrendingNews();
    fetchBannerAd();
    fetchSideAd();
  }, [selectedState]); // Re-fetch when selected state changes

  const fetchBannerAd = async () => {
    try {
      setBannerLoading(true);
      setBannerError(null);
      console.log('Fetching banner ad from API...');
      
      const response = await axios.get(`${baseUrl}/api/ads/public/web/banner`);
      console.log('Banner ad API response:', response.data);
      
      if (response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        const ad = response.data.data[0];
        console.log('Banner ad redirect URL:', ad.redirectUrl);
        setBannerAd(ad);
      } else if (response.data && !Array.isArray(response.data)) {
        setBannerAd(response.data);
      } else {
        setBannerError('No ads available');
      }
    } catch (err) {
      console.error('Error fetching banner ad:', err);
      setBannerError(err.message || 'Failed to load advertisement');
    } finally {
      setBannerLoading(false);
    }
  };

  const fetchSideAd = async () => {
    try {
      setSideLoading(true);
      setSideError(null);
      console.log('Fetching side ad from API...');
      
      const response = await axios.get(`${baseUrl}/api/ads/public/web/side`);
      console.log('Side ad API response:', response.data);
      
      if (response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        const ad = response.data.data[0];
        console.log('Side ad redirect URL:', ad.redirectUrl);
        setSideAd(ad);
      } else if (response.data && !Array.isArray(response.data)) {
        setSideAd(response.data);
      } else {
        setSideError('No ads available');
      }
    } catch (err) {
      console.error('Error fetching side ad:', err);
      setSideError(err.message || 'Failed to load advertisement');
    } finally {
      setSideLoading(false);
    }
  };

  const fetchTrendingNews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching trending news from endpoint...');
      const response = await axios.get('https://api.newztok.in/api/news/trending');
      console.log('API Response:', response);
      
      let fetchedNews = [];
      if (response.data && Array.isArray(response.data)) {
        console.log(`Successfully fetched ${response.data.length} trending news items`);
        fetchedNews = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log(`Successfully fetched ${response.data.data.length} trending news items from data property`);
        fetchedNews = response.data.data;
      } else if (response.data && response.data.posts && Array.isArray(response.data.posts)) {
        console.log(`Successfully fetched ${response.data.posts.length} trending news items from posts property`);
        fetchedNews = response.data.posts;
      } else {
        console.warn('Unexpected API response structure:', response.data);
        setError('Unexpected data format received from server');
        fetchedNews = [];
      }
      
      // Filter news by selected state if one is selected
      if (selectedState) {
        console.log(`Filtering trending news by state: ${selectedState}`);
        
        // First, try to match exact state name
        let filteredNews = fetchedNews.filter(item => 
          item.state && (item.state.includes(selectedState) || selectedState.includes(item.state))
        );
        
        // If no exact matches, check if state is mentioned in the content or title
        if (filteredNews.length === 0) {
          filteredNews = fetchedNews.filter(item => 
            (item.content && item.content.includes(selectedState)) || 
            (item.title && item.title.includes(selectedState))
          );
        }
        
        // If we found filtered results, use them; otherwise, fall back to all news
        if (filteredNews.length > 0) {
          console.log(`Found ${filteredNews.length} trending news items for state: ${selectedState}`);
          fetchedNews = filteredNews;
        } else {
          console.log(`No trending news items found for state: ${selectedState}, showing all trending news`);
        }
      }
      
      // Process each news item to handle videos
      fetchedNews = fetchedNews.map(item => {
        // Check all possible properties for video paths
        const checkForVideoPath = (obj) => {
          // Define properties to check for video paths
          const propertiesToCheck = [
            'video', 'videoPath', 'featuredImage', 'image', 'media', 'url', 'source'
          ];
          
          let foundVideoPath = null;
          
          // Check each property for a video path
          propertiesToCheck.forEach(prop => {
            if (obj[prop] && typeof obj[prop] === 'string' && obj[prop].includes('/uploads/videos/video-')) {
              foundVideoPath = obj[prop];
              console.log(`Found video path in ${prop} property: ${foundVideoPath}`);
            }
          });
          
          // Also check if there's a directly assigned videoPath property
          if (obj.videoPath && typeof obj.videoPath === 'string') {
            foundVideoPath = obj.videoPath;
            console.log(`Found direct videoPath property: ${foundVideoPath}`);
          }
          
          return foundVideoPath;
        };
        
        // Get video path from the item
        const videoPath = checkForVideoPath(item);
        
        if (videoPath) {
          console.log(`Found video for news item "${item.title}": ${videoPath}`);
          
          // Ensure video URL has the base URL if it's a relative path
          const fullVideoUrl = videoPath.startsWith('http') 
            ? videoPath 
            : `https://api.newztok.in${videoPath}`;
          
          console.log(`Full video URL for "${item.title}": ${fullVideoUrl}`);
          
          return {
            ...item,
            video: fullVideoUrl,
            hasVideo: true
          };
        }
        
        return item;
      });
      
      // Sort news items by date (most recent first)
      fetchedNews = fetchedNews.sort((a, b) => {
        // First try to get dates from common date fields
        const dateA = new Date(a.createdAt || a.publishedAt || a.updatedAt || 0);
        const dateB = new Date(b.createdAt || b.publishedAt || b.updatedAt || 0);
        
        // Sort in descending order (newest first)
        return dateB - dateA;
      });
      
      console.log('News items sorted by date (newest first)');
      
      // Log each fetched news item to debug
      fetchedNews.forEach((item, index) => {
        console.log(`News item ${index + 1}:`, {
          id: item.id,
          title: item.title,
          date: item.createdAt || item.publishedAt || item.updatedAt,
          featuredImage: item.featuredImage,
          image: item.image,
          images: item.images,
          video: item.video,
          videoPath: item.videoPath,
          hasVideo: item.hasVideo,
          category: item.category,
          state: item.state,
          district: item.district
        });
      });
      
      console.log(`Total fetched news items: ${fetchedNews.length}`);
      
      // Clear existing news items
      setNewsItems([]);
      setSecondSectionNews([]);
      setAdditionalNews([]);
      setFourthSectionNews([]);
      setFifthSectionNews([]);
      
      // Distribute fetched news to different sections
      if (fetchedNews.length >= 1) {
        console.log(`Setting first ${Math.min(fetchedNews.length, 2)} items as main news`);
        setNewsItems(fetchedNews.slice(0, Math.min(fetchedNews.length, 2)));
      }
      
      if (fetchedNews.length >= 3) {
        console.log('Setting items starting from index 2 as second section news');
        setSecondSectionNews(fetchedNews.slice(2, 4));
      }
      
      if (fetchedNews.length >= 5) {
        console.log('Setting items starting from index 4 as additional news');
        setAdditionalNews(fetchedNews.slice(4, 6));
      }
      
      if (fetchedNews.length >= 7) {
        console.log('Setting items starting from index 6 as fourth section news');
        setFourthSectionNews(fetchedNews.slice(6, 8));
      }
      
      if (fetchedNews.length >= 9) {
        console.log('Setting items starting from index 8 as fifth section news');
        setFifthSectionNews(fetchedNews.slice(8, 10));
      }
    } catch (err) {
      console.error('Error fetching trending news:', err);
      
      // Better error message based on the error type
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Server responded with error:', err.response.status, err.response.data);
        setError(`Server error (${err.response.status}): ${err.response.data.message || 'Unable to fetch news'}`);
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received from server');
        setError('Network error: No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', err.message);
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to track view when card is clicked
  const trackView = async (id) => {
    try {
      console.log(`Tracking view for news item with ID: ${id}`);
      await axios.post(`https://api.newztok.in/api/interaction/${id}/view`);
      console.log(`Successfully tracked view for news ID: ${id}`);
    } catch (err) {
      console.error(`Error tracking view for news ID: ${id}:`, err);
    }
  };

  // Handle card click to track view and navigate
  const handleCardClick = (e, item) => {
    e.preventDefault();
    trackView(item.id);
    // Navigate to the news detail page
    navigate(`/news/${item.id}`);
  };

  // News card component for videos
  const NewsCard = ({ item, isVideo = false }) => {
    const [imageError, setImageError] = useState(false);
    
    const handleImageError = () => {
      console.error(`Error loading image for "${item.title}"`);
      setImageError(true);
    };
    
    // Get image URL with proper handling
    const getImageUrl = () => {
      console.log(`Getting image URL for item with title "${item.title}":`, {
        id: item.id,
        featuredImage: item.featuredImage,
        image: item.image,
        images: item.images,
        youtubeUrl: item.youtubeUrl
      });
      
      // If item has YouTube URL, use YouTube thumbnail
      if (item.youtubeUrl) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = item.youtubeUrl.match(regExp);
        if (match && match[2].length === 11) {
          const videoId = match[2];
          console.log(`Using YouTube thumbnail for "${item.title}": ${videoId}`);
          return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      }
      
      // If item has images array with content
      if (item.images && item.images.length > 0) {
        console.log(`Using images[0] from array for "${item.title}": ${item.images[0]}`);
        return item.images[0];
      }
      
      // If item has featuredImage
      if (item.featuredImage) {
        // Check if it's a full URL or just a path
        if (item.featuredImage.startsWith('http')) {
          console.log(`Using full featuredImage URL for "${item.title}": ${item.featuredImage}`);
          return item.featuredImage;
        } else {
          // Add base URL for relative paths
          const fullUrl = `https://api.newztok.in${item.featuredImage}`;
          console.log(`Using relative featuredImage with base URL for "${item.title}": ${fullUrl}`);
          return fullUrl;
        }
      }
      
      // If item has image property
      if (item.image) {
        // Check if it's a full URL or just a path
        if (item.image.startsWith('http')) {
          console.log(`Using full image URL for "${item.title}": ${item.image}`);
          return item.image;
        } else {
          // Add base URL for relative paths
          const fullUrl = `https://api.newztok.in${item.image}`;
          console.log(`Using relative image with base URL for "${item.title}": ${fullUrl}`);
          return fullUrl;
        }
      }
      
      // Fallback to placeholder
      console.log(`No image found for "${item.title}", using placeholder`);
      return 'https://via.placeholder.com/400x300?text=No+Image';
    };
    
    // Check if item has video - either directly set hasVideo flag or check paths
    const hasVideo = item.hasVideo || item.video || item.videoPath ||
      (item.featuredImage && item.featuredImage.includes('/uploads/videos/video-')) ||
      (item.image && item.image.includes('/uploads/videos/video-'));
    
    // Get video URL if present
    const getVideoUrl = () => {
      // First, check if video property is already set (from our processing)
      if (item.video) {
        return item.video;
      }
      
      // Next, check for videoPath property
      if (item.videoPath) {
        return item.videoPath.startsWith('http') 
          ? item.videoPath 
          : `https://api.newztok.in${item.videoPath}`;
      }
      
      // Check other fields for video paths
      if (item.featuredImage && item.featuredImage.includes('/uploads/videos/video-')) {
        return item.featuredImage.startsWith('http') 
          ? item.featuredImage 
          : `https://api.newztok.in${item.featuredImage}`;
      }
      
      if (item.image && item.image.includes('/uploads/videos/video-')) {
        return item.image.startsWith('http') 
          ? item.image 
          : `https://api.newztok.in${item.image}`;
      }
      
      return null;
    };
    
    const videoUrl = hasVideo ? getVideoUrl() : null;
    const imageUrl = !hasVideo ? getImageUrl() : null;
    
    // Check if it's a YouTube video
    const isYouTubeVideo = !!item.youtubeUrl;
    
    return (
      <Box 
        onClick={(e) => handleCardClick(e, item)}
        sx={{ 
          cursor: 'pointer',
          width: '100%', 
          maxWidth: '520px',
          height: '480px',
          bgcolor: '#fff', 
          borderRadius: 2, 
          boxShadow: 1, 
          overflow: 'hidden', 
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          }
        }}
      >
        {/* Title/Heading Section - At the top */}
        <Box sx={{ p: 3, height: '25%', display: 'flex', flexDirection: 'column' }}>
          <Typography
            variant="h6"
            sx={{
              color: 'black',
              fontWeight: '700',
              mb: 1.5,
              lineHeight: 1.4,
              fontSize: '1.1rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {item.title}
          </Typography>
          {/* Show brief description if available */}
          {item.description && (
            <Typography
              variant="body2"
              sx={{
                color: '#555',
                fontSize: '0.9rem',
                lineHeight: 1.3,
                mb: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {item.description}
            </Typography>
          )}
        </Box>
        
        {/* Media Section - In the middle */}
        {hasVideo ? (
          <Box sx={{ position: 'relative', height: '55%', width: '100%' }}>
            <Box
              component="video"
              src={videoUrl}
              controls
              preload="metadata"
              controlsList="nodownload"
              onClick={(e) => e.stopPropagation()}
              playsInline
              muted
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                '&::-webkit-media-controls': {
                  display: 'flex !important',
                },
                '&::-webkit-media-controls-play-button': {
                  display: 'block !important',
                },
                '&::-webkit-media-controls-panel': {
                  display: 'flex !important',
                },
                '&::-webkit-media-controls-current-time-display': {
                  display: 'block !important',
                },
                '&::-webkit-media-controls-time-remaining-display': {
                  display: 'block !important',
                },
                '&::-webkit-media-controls-timeline': {
                  display: 'block !important',
                },
                '&::-webkit-media-controls-volume-slider': {
                  display: 'block !important',
                },
                '&::-webkit-media-controls-fullscreen-button': {
                  display: 'block !important',
                },
              }}
              onError={(e) => {
                console.error('Video failed to load:', videoUrl);
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
            {/* Video Badge */}
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                zIndex: 2,
                backgroundColor: '#E53E3E',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.75rem',
                padding: '6px 16px',
                borderRadius: '4px',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
              VIDEO
            </Box>
          </Box>
        ) : !imageError ? (
          <Box sx={{ position: 'relative', height: '55%' }}>
            <CardMedia
              component="img"
              height="100%"
              image={imageUrl}
              alt={item.title}
              onError={handleImageError}
              sx={{
                objectFit: 'cover',
              }}
            />
            {isYouTubeVideo && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '60px',
                  height: '60px',
                  backgroundColor: 'rgba(255, 0, 0, 0.8)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  zIndex: 2,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </Box>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              height: '55%',
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999'
            }}
          >
            Image not available
          </Box>
        )}
        
        {/* Location and Date Section - Below the media */}
        <Box sx={{ p: 3, height: '20%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Show state and district if available */}
          {(item.state || item.district) && (
            <Typography
              variant="caption"
              sx={{
                color: '#666',
                fontSize: '0.8rem',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#666"/>
              </svg>
              {[item.state ? capitalize(item.state) : '', item.district ? capitalize(item.district) : ''].filter(Boolean).join(', ')}
            </Typography>
          )}
          
          <Typography
            variant="caption"
            sx={{
              color: '#666',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#666"/>
              <path d="M12.5 7H11V13L16.2 16.2L17 14.9L12.5 12.2V7Z" fill="#666"/>
            </svg>
            {formatDate(item.createdAt || item.publishedAt || item.updatedAt)}
          </Typography>
        </Box>
      </Box>
    );
  };

  // Trending card component
  const TrendingCard = ({ item }) => (
    <Paper 
      elevation={0} 
      onClick={(e) => handleCardClick(e, item)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '369px',
        height: '88.96px',
        mb: 2,
        p: 1.5,
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        boxSizing: 'border-box',
        background: '#fff',
        gap: 2,
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        }
      }}
    >
      <Box sx={{ width: 60, height: 60, flexShrink: 0 }}>
        <img 
          src={item.featuredImage?.startsWith('http') ? item.featuredImage : `https://api.newztok.in${item.featuredImage}`} 
          alt="trending" 
          style={{ 
            width: '100%', 
            height: '100%', 
            borderRadius: 8, 
            objectFit: 'cover' 
          }} 
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/60x60?text=No+Image';
          }}
        />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ 
          fontSize: 13, 
          fontWeight: 500, 
          color: '#222', 
          lineHeight: 1.2, 
          mb: 0.5, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {item.title}
        </Typography>
        <Typography sx={{ fontSize: 11, color: '#888' }}>
          {formatDate(item.createdAt || item.publishedAt || item.updatedAt)}
        </Typography>
      </Box>
    </Paper>
  );

  // Ad card component
  const AdCard = ({ height = 198.38 }) => {
    const handleAdClick = (e) => {
      e.preventDefault();
      if (sideAd && sideAd.redirectUrl) {
        console.log('Redirecting to side ad URL:', sideAd.redirectUrl);
        window.open(sideAd.redirectUrl, '_blank', 'noopener,noreferrer');
      }
    };

    if (sideLoading) {
      return (
        <Box 
          sx={{ 
            width: '100%', 
            height: height, 
            bgcolor: '#f5f5f5', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1,
          }}
        >
          <CircularProgress size={24} />
        </Box>
      );
    }

    if (sideError || !sideAd) {
      return (
        <Box 
          sx={{ 
            width: '100%', 
            height: height, 
            bgcolor: '#E0E0E0', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            borderRadius: 1,
            position: 'relative',
          }}
        >
          {sideError ? 'Failed to load ad' : 'Ad'}
          <Typography 
            variant="caption" 
            sx={{ 
              position: 'absolute', 
              bottom: 5, 
              right: 10, 
              fontSize: '0.6rem',
              color: '#AAA' 
            }}
          >
            NewzTok Ad
          </Typography>
        </Box>
      );
    }

    return (
      <Box 
        component="a"
        href={sideAd.redirectUrl || sideAd.link || '#'}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleAdClick}
        sx={{ 
          width: '100%', 
          height: height, 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 1,
          overflow: 'hidden',
          textDecoration: 'none',
          position: 'relative',
          cursor: 'pointer',
        }}
      >
        {sideAd.imageUrl ? (
          <Box 
            component="img"
            src={sideAd.imageUrl.startsWith('http') ? sideAd.imageUrl : `${baseUrl}${sideAd.imageUrl.startsWith('/') ? '' : '/'}${sideAd.imageUrl}`}
            alt={sideAd.title || "Advertisement"}
            sx={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
            }}
            onError={(e) => {
              console.error('Side ad image failed to load');
              e.target.onerror = null; 
              e.target.src = "https://via.placeholder.com/280x198?text=Advertisement";
            }}
          />
        ) : (
          <Box 
            sx={{ 
              width: '100%', 
              height: '100%', 
              bgcolor: '#E0E0E0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
            }}
          >
            {sideAd.title || "Advertisement"}
          </Box>
        )}
        
        <Typography 
          variant="caption" 
          sx={{ 
            position: 'absolute', 
            bottom: 5, 
            right: 10, 
            fontSize: '0.6rem',
            color: '#FFF',
            bgcolor: 'rgba(0,0,0,0.5)',
            px: 0.5,
            borderRadius: 0.5
          }}
        >
          Ad
        </Typography>
      </Box>
    );
  };

  // Auto scroll row component
  const AutoScrollRow = ({ children }) => {
    const scrollRef = useRef(null);
    
    useEffect(() => {
      const scrollContainer = scrollRef.current;
      if (!scrollContainer) return;
      
      let frame;
      let speed = 1.2; // pixels per frame
      
      function animate() {
        if (scrollContainer.scrollLeft + scrollContainer.offsetWidth >= scrollContainer.scrollWidth - 1) {
          scrollContainer.scrollLeft = 0;
        } else {
          scrollContainer.scrollLeft += speed;
        }
        frame = requestAnimationFrame(animate);
      }
      
      frame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frame);
    }, []);
    
    return (
      <Box
        ref={scrollRef}
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'hidden',
          width: '100%',
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          pointerEvents: 'none', // disables user scroll
        }}
      >
        {children}
      </Box>
    );
  };

  // Multi-card auto slider for MOST SHARED
  const MultiCardAutoSlider = ({ cards, cardsPerSlide = 3, cardWidth = 370, gap = 32, height = 210 }) => {
    const [current, setCurrent] = useState(0);
    const totalCards = cards.length;
    const containerRef = useRef(null);

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrent((prev) => (prev + 1) % (totalCards - cardsPerSlide + 1));
      }, 2500);
      return () => clearInterval(interval);
    }, [totalCards, cardsPerSlide]);

    useEffect(() => {
      const container = containerRef.current;
      if (container) {
        container.scrollTo({
          left: current * (cardWidth + gap),
          behavior: 'smooth',
        });
      }
    }, [current, cardWidth, gap]);

    return (
      <Box
        ref={containerRef}
        sx={{
          width: `${cardWidth * cardsPerSlide + gap * (cardsPerSlide - 1)}px`,
          overflow: 'hidden',
          display: 'flex',
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          pointerEvents: 'none',
        }}
      >
        <Box sx={{ display: 'flex', gap: `${gap}px` }}>
          {cards.map((card, idx) => (
            <Box 
              key={idx} 
              onClick={(e) => handleCardClick(e, card)}
              sx={{ 
                width: `${cardWidth}px`, 
                bgcolor: '#fff', 
                borderRadius: 2, 
                boxShadow: 1, 
                overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                p: 0, 
                mb: 0,
                cursor: 'pointer',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                }
              }}
            >
              <img 
                src={card.featuredImage?.startsWith('http') ? card.featuredImage : `https://api.newztok.in${card.featuredImage}`} 
                alt={card.title} 
                style={{ 
                  width: '100%', 
                  height: `${height}px`, 
                  objectFit: 'cover' 
                }} 
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/370x210?text=No+Image';
                }}
              />
              <Box sx={{ p: 2, pt: 2 }}>
                <Typography sx={{ fontSize: 15, color: '#222', fontWeight: 400, lineHeight: 1.4 }}>
                  {card.title}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  // Loading component
  const LoadingSpinner = () => (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '300px',
        width: '100%'
      }}
    >
      <CircularProgress sx={{ color: '#0039CB' }} />
    </Box>
  );

  // Error component
  const ErrorMessage = () => (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '300px',
        width: '100%',
        color: 'red',
        flexDirection: 'column'
      }}
    >
      <Typography variant="h6" gutterBottom>
        {error}
      </Typography>
      <Typography 
        variant="body2" 
        component="button"
        onClick={fetchTrendingNews}
        sx={{ 
          background: 'none', 
          border: 'none', 
          color: '#0039CB', 
          cursor: 'pointer',
          textDecoration: 'underline',
          mt: 2
        }}
      >
        Try Again
      </Typography>
    </Box>
  );

  // Get all news items for bottom scrolling and most shared sections
  const getAllNewsItems = () => {
    return [
      ...newsItems,
      ...secondSectionNews,
      ...additionalNews,
      ...fourthSectionNews,
      ...fifthSectionNews
    ];
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, px: 2, pt: 2, pb: 0 }}>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage />
        ) : (
          <>
            {/* Top News Section */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={12} lg={12}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>Top News</Typography>
                                <Box sx={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1, maxWidth: '520px' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>VIDEOS</Typography>
                    {getAllNewsItems().slice(0, 3).map((news, idx) => (
                      <Box key={idx} sx={{ mb: 3 }}>
                        <NewsCard item={news} isVideo={news.hasVideo} />
                      </Box>
                    ))}
                  </Box>
                                   {/* Trending Section */}
                   <Box sx={{ minWidth: '369px', maxWidth: '369px', flexShrink: 0, mx: 5 }}>
                     <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>TRENDING</Typography>
                     <Box sx={{ maxHeight: '900px', overflowY: 'auto', pr: 1 }}>
                       {getAllNewsItems().slice(0, 13).map((item, idx) => (
                         <TrendingCard key={idx} item={item} />
                       ))}
                     </Box>
                   </Box>
                  {/* Ad Section */}
                  <Box sx={{ minWidth: '280px', maxWidth: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[...Array(4)].map((_, idx) => (
                      <AdCard key={idx} height={198.38} />
                    ))}
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Bottom Cards Row (Top News) */}
            <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
              <AutoScrollRow>
                {getAllNewsItems().slice(0, 10).map((card, idx) => (
                  <Box 
                    key={idx} 
                    onClick={(e) => handleCardClick(e, card)}
                    sx={{ 
                      minWidth: '230.22px', 
                      maxWidth: '230.22px', 
                      height: '129.5px', 
                      bgcolor: '#fff', 
                      borderRadius: 2, 
                      boxShadow: 1, 
                      overflow: 'hidden', 
                      display: 'flex', 
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      }
                    }}
                  >
                    <img 
                      src={card.featuredImage?.startsWith('http') ? card.featuredImage : `https://api.newztok.in${card.featuredImage}`} 
                      alt={card.title} 
                      style={{ 
                        width: '100%', 
                        height: '60%', 
                        objectFit: 'cover' 
                      }} 
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/230x77?text=No+Image';
                      }}
                    />
                    <Box sx={{ p: 1 }}>
                      <Typography sx={{ 
                        fontSize: 13, 
                        fontWeight: 500, 
                        color: '#222', 
                        lineHeight: 1.2, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {card.title}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </AutoScrollRow>
            </Box>

                         {/* National News Section */}
             <Grid container spacing={3} sx={{ mt: 8 }}>
               <Grid item xs={12} md={12} lg={12}>
                 <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>National News</Typography>
                 <Box sx={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
                   <Box sx={{ flex: 1, maxWidth: '520px' }}>
                     <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>VIDEOS</Typography>
                     {getAllNewsItems().slice(3, 6).map((news, idx) => (
                       <Box key={idx} sx={{ mb: 3 }}>
                         <NewsCard item={news} isVideo={news.hasVideo} />
                       </Box>
                     ))}
                   </Box>
                                     {/* Latest News Section */}
                   <Box sx={{ minWidth: '369px', maxWidth: '369px', flexShrink: 0, mx: 5 }}>
                     <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>LATEST NEWS</Typography>
                     <Box sx={{ maxHeight: '900px', overflowY: 'auto', pr: 1 }}>
                       {getAllNewsItems().slice(2, 15).map((item, idx) => (
                         <TrendingCard key={idx} item={item} />
                       ))}
                     </Box>
                   </Box>
                  {/* Ad Section */}
                  <Box sx={{ minWidth: '280px', maxWidth: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[...Array(4)].map((_, idx) => (
                      <AdCard key={idx} height={198.38} />
                    ))}
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Bottom Cards Row (National News) */}
            <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
              <AutoScrollRow>
                {getAllNewsItems().slice(2, 12).map((card, idx) => (
                  <Box 
                    key={idx} 
                    onClick={(e) => handleCardClick(e, card)}
                    sx={{ 
                      minWidth: '230.22px', 
                      maxWidth: '230.22px', 
                      height: '129.5px', 
                      bgcolor: '#fff', 
                      borderRadius: 2, 
                      boxShadow: 1, 
                      overflow: 'hidden', 
                      display: 'flex', 
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      }
                    }}
                  >
                    <img 
                      src={card.featuredImage?.startsWith('http') ? card.featuredImage : `https://api.newztok.in${card.featuredImage}`} 
                      alt={card.title} 
                      style={{ 
                        width: '100%', 
                        height: '60%', 
                        objectFit: 'cover' 
                      }} 
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/230x77?text=No+Image';
                      }}
                    />
                    <Box sx={{ p: 1 }}>
                      <Typography sx={{ 
                        fontSize: 13, 
                        fontWeight: 500, 
                        color: '#222', 
                        lineHeight: 1.2, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {card.title}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </AutoScrollRow>
            </Box>

            {/* MOST SHARED Section */}
            <Box sx={{ mt: 8, bgcolor: '#f5f5f5', py: 4, px: 0, position: 'relative' }}>
              <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 1, color: '#111', mr: 2 }}>
                    MOST
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 1, color: '#111' }}>
                    SHARED
                  </Typography>
                </Box>
                <Box sx={{ height: '2px', width: '100%', bgcolor: 'transparent', mb: 3, position: 'relative' }}>
                  <Box sx={{ position: 'absolute', left: 0, top: 0, width: '180px', height: '2px', bgcolor: '#d32f2f' }} />
                </Box>
                <MultiCardAutoSlider
                  cards={getAllNewsItems().slice(0, 10)}
                  cardsPerSlide={3}
                  cardWidth={370}
                  gap={32}
                  height={210}
                />
              </Box>
            </Box>

            {/* STAY CONNECTED Section */}
            <Box sx={{ mt: 8, mb: 8, px: 0, bgcolor: '#fafafa' }}>
              <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 2, display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'flex-start', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                {/* Social Buttons */}
                <Box sx={{ flex: 1, minWidth: 320 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#111', letterSpacing: 1 }}>STAY CONNECTED</Typography>
                  <Box sx={{ height: '2px', width: '180px', bgcolor: '#d32f2f', mb: 3 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ bgcolor: '#3b5998', color: '#fff', borderRadius: 1, width: 220, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <span style={{ display: 'flex', alignItems: 'center' }}><i className="fab fa-facebook-f" style={{ fontSize: 22, marginRight: 12 }}></i></span>
                        <Typography sx={{ fontWeight: 500, fontSize: 16, minWidth: 90, textAlign: 'left' }}>32.4k&nbsp;&nbsp;Fans</Typography>
                      </Box>
                      <Box sx={{ bgcolor: '#1da1f2', color: '#fff', borderRadius: 1, width: 220, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <span style={{ display: 'flex', alignItems: 'center' }}><i className="fab fa-x-twitter" style={{ fontSize: 22, marginRight: 12 }}></i></span>
                        <Typography sx={{ fontWeight: 500, fontSize: 16, minWidth: 90, textAlign: 'left' }}>25.6k&nbsp;&nbsp;Followers</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ bgcolor: '#0077b5', color: '#fff', borderRadius: 1, width: 220, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <span style={{ display: 'flex', alignItems: 'center' }}><i className="fab fa-linkedin-in" style={{ fontSize: 22, marginRight: 12 }}></i></span>
                        <Typography sx={{ fontWeight: 500, fontSize: 16, minWidth: 90, textAlign: 'left' }}>14.2k&nbsp;&nbsp;Connect</Typography>
                      </Box>
                      <Box sx={{ bgcolor: '#ff0000', color: '#fff', borderRadius: 1, width: 220, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <span style={{ display: 'flex', alignItems: 'center' }}><i className="fab fa-youtube" style={{ fontSize: 22, marginRight: 12 }}></i></span>
                        <Typography sx={{ fontWeight: 500, fontSize: 16, minWidth: 90, textAlign: 'left' }}>9.2k&nbsp;&nbsp;Subscribers</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ bgcolor: '#c13584', color: '#fff', borderRadius: 1, width: 220, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <span style={{ display: 'flex', alignItems: 'center' }}><i className="fab fa-instagram" style={{ fontSize: 22, marginRight: 12 }}></i></span>
                        <Typography sx={{ fontWeight: 500, fontSize: 16, minWidth: 90, textAlign: 'left' }}>25.6k&nbsp;&nbsp;Followers</Typography>
                      </Box>
                      <Box sx={{ bgcolor: '#25d366', color: '#fff', borderRadius: 1, width: 220, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <span style={{ display: 'flex', alignItems: 'center' }}><i className="fab fa-whatsapp" style={{ fontSize: 22, marginRight: 12 }}></i></span>
                        <Typography sx={{ fontWeight: 500, fontSize: 16, minWidth: 90, textAlign: 'left' }}>43.8k&nbsp;&nbsp;Members</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
                {/* Newsletter Card */}
                <Box sx={{ flex: 1, minWidth: 340, maxWidth: 420, bgcolor: '#fff', borderRadius: 2, boxShadow: 2, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#111', textAlign: 'center', letterSpacing: 1 }}>
                    SUBSCRIBE TO OUR NEWSLETTER
                  </Typography>
                  <Typography sx={{ color: '#222', fontSize: 15, mb: 3, textAlign: 'center' }}>
                    Subscribe for new update
                  </Typography>
                  <Box component="form" sx={{ width: '100%' }}>
                    <Box sx={{ bgcolor: '#f3f3ff', borderRadius: 1, mb: 2, px: 2, py: 1.5 }}>
                      <input type="email" placeholder="Enter E-mail ID" style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 16, color: '#222' }} />
                    </Box>
                    <button type="submit" style={{ width: '100%', background: '#1a1abf', color: '#fff', fontWeight: 700, fontSize: 20, border: 'none', borderRadius: 4, padding: '14px 0', cursor: 'pointer', letterSpacing: 1 }}>
                      SUBSCRIBE
                    </button>
                  </Box>
                </Box>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default HomeScreen; 