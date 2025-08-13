import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';
import { useStateContext } from './Header'; // Import state context
import { Link } from 'react-router-dom';

const TrendingNews = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [secondSectionNews, setSecondSectionNews] = useState([]);
  const [additionalNews, setAdditionalNews] = useState([]);
  const [fourthSectionNews, setFourthSectionNews] = useState([]);
  const [fifthSectionNews, setFifthSectionNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedState } = useStateContext(); // Get selected state from context

  // Helper function to capitalize first letter
  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Category tabs data
  const categoryTabs = [
    { name: 'Active', count: '11' },
    { name: 'Business', count: '10' },
    { name: 'Crazy', count: '5' },
  ];

  // Social media stats
  const socialStats = [
    { platform: 'facebook', icon: 'https://cdn.iconscout.com/icon/free/png-256/free-facebook-logo-2019-1597680-1350125.png', count: '32.4k', label: 'likes' },
    { platform: 'instagram', icon: 'https://static.vecteezy.com/system/resources/previews/017/743/717/original/instagram-icon-logo-free-png.png', count: '25.6k', label: 'followers' },
    { platform: 'x', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/X_icon_2.svg/2048px-X_icon_2.svg.png', count: '14.2k', label: 'followers' },
    { platform: 'youtube', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1024px-YouTube_full-color_icon_%282017%29.svg.png', count: '9.2k', label: 'subscribers' },
    { platform: 'whatsapp', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/767px-WhatsApp.svg.png', count: '43.8k', label: 'members' },
  ];

  // Base URL for API
  const baseUrl = 'https://api.newztok.in';

  useEffect(() => {
    fetchTrendingNews();
  }, [selectedState]); // Re-fetch when selected state changes

  const fetchTrendingNews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching trending news from endpoint...');
      const response = await axios.get('https://api.newztok.in/api/news/featured');
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
          // Define properties to check for video paths and YouTube URLs
          const propertiesToCheck = [
            'video', 'videoPath', 'featuredImage', 'image', 'additionalImage', 'media', 'url', 'source', 'youtubeUrl'
          ];
          
          let foundVideoPath = null;
          let foundYoutubeUrl = null;
          
          // First check for YouTube URL
          if (obj.youtubeUrl && typeof obj.youtubeUrl === 'string') {
            foundYoutubeUrl = obj.youtubeUrl;
            console.log(`Found YouTube URL: ${foundYoutubeUrl}`);
          }
          
          // Then check each property for a video path
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
          
          return { videoPath: foundVideoPath, youtubeUrl: foundYoutubeUrl };
        };
        
        // Get video path and YouTube URL from the item
        const { videoPath, youtubeUrl } = checkForVideoPath(item);
        
        // Create the processed item
        const processedItem = {
          ...item,
          hasVideo: false,
          youtubeUrl: youtubeUrl
        };
        
        if (videoPath) {
          console.log(`Found video for news item "${item.title}": ${videoPath}`);
          
          // Ensure video URL has the base URL if it's a relative path
          const fullVideoUrl = videoPath.startsWith('http') 
            ? videoPath 
            : `https://api.newztok.in${videoPath}`;
          
          console.log(`Full video URL for "${item.title}": ${fullVideoUrl}`);
          
          processedItem.video = fullVideoUrl;
          processedItem.hasVideo = true;
        }
        
        if (youtubeUrl) {
          console.log(`Found YouTube URL for "${item.title}": ${youtubeUrl}`);
          processedItem.hasVideo = true;
        }
        
        return processedItem;
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
          additionalImage: item.additionalImage,
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
        // The request was made but no response received
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

  // Format date function for consistent display
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

  // News card component
  const NewsCard = ({ item }) => {
    const [imageError, setImageError] = useState(false);
    
    const handleImageError = () => {
      console.error(`Error loading image for "${item.title}"`);
      setImageError(true);
    };
    
    // Get image URL with proper handling including additionalImage
    const getImageUrl = () => {
      console.log(`Getting image URL for item with title "${item.title}":`, {
        id: item.id,
        featuredImage: item.featuredImage,
        image: item.image,
        additionalImage: item.additionalImage,
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
      if (item.images && Array.isArray(item.images) && item.images.length > 0 && typeof item.images[0] === 'string') {
        console.log(`Using images[0] from array for "${item.title}": ${item.images[0]}`);
        return item.images[0];
      }
      
      // If item has featuredImage
      if (item.featuredImage && typeof item.featuredImage === 'string') {
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
      if (item.image && typeof item.image === 'string') {
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
      
      // If item has additionalImage property
      if (item.additionalImage && typeof item.additionalImage === 'string') {
        // Check if it's a full URL or just a path
        if (item.additionalImage.startsWith('http')) {
          console.log(`Using full additionalImage URL for "${item.title}": ${item.additionalImage}`);
          return item.additionalImage;
        } else {
          // Add base URL for relative paths
          const fullUrl = `https://api.newztok.in${item.additionalImage}`;
          console.log(`Using relative additionalImage with base URL for "${item.title}": ${fullUrl}`);
          return fullUrl;
        }
      }
      
      // Fallback to placeholder
      console.log(`No image found for "${item.title}", using placeholder`);
      return 'https://via.placeholder.com/400x300?text=No+Image';
    };
    
    // Check if item has video - either directly set hasVideo flag or check paths including additionalImage
    const hasVideo = item.hasVideo || item.video || item.videoPath ||
      (item.featuredImage && item.featuredImage.includes('/uploads/videos/video-')) ||
      (item.image && item.image.includes('/uploads/videos/video-')) ||
      (item.additionalImage && item.additionalImage.includes('/uploads/videos/video-'));
    
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
      
      // Check other fields for video paths including additionalImage
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
      
      if (item.additionalImage && item.additionalImage.includes('/uploads/videos/video-')) {
        return item.additionalImage.startsWith('http') 
          ? item.additionalImage 
          : `https://api.newztok.in${item.additionalImage}`;
      }
      
      return null;
    };
    
    const videoUrl = hasVideo ? getVideoUrl() : null;
    const imageUrl = !hasVideo ? getImageUrl() : null;
    
    // Check if it's a YouTube video
    const isYouTubeVideo = !!item.youtubeUrl;

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

    // Handle card click to track view
    const handleCardClick = (e) => {
      e.preventDefault();
      trackView(item.id);
      // After tracking the view, navigate to the news page
      window.location.href = `/trending/${item.id}`;
    };
    
    return (
      <Box sx={{ position: 'relative', height: '100%', mb: 2 }}>
        <Link 
          to={`/trending/${item.id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
          onClick={handleCardClick}
        >
          <Card 
            sx={{ 
              position: 'relative',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              height: 360,
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              backgroundColor: 'white',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              }
            }}
          >
            {hasVideo ? (
              <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
                {item.youtubeUrl ? (
                  <Box sx={{ position: 'relative', height: '360px' }}>
                    {(() => {
                      // Function to extract YouTube video ID from various URL formats
                      const getYouTubeVideoId = (url) => {
                        if (!url) return null;
                        
                        try {
                          const urlObj = new URL(url);
                          
                          // Handle YouTube Shorts
                          if (urlObj.pathname.includes('/shorts/')) {
                            const shortsId = urlObj.pathname.split('/shorts/')[1];
                            return shortsId.split('?')[0];
                          }
                          
                          // Handle regular YouTube URLs
                          if (urlObj.searchParams.get('v')) {
                            return urlObj.searchParams.get('v');
                          }
                          
                          // Handle youtu.be URLs
                          if (urlObj.hostname === 'youtu.be') {
                            return urlObj.pathname.slice(1);
                          }
                          
                          // Handle embed URLs
                          if (urlObj.pathname.includes('/embed/')) {
                            return urlObj.pathname.split('/embed/')[1];
                          }
                        } catch (err) {
                          console.error('Error parsing YouTube URL:', err);
                        }
                        
                        return null;
                      };

                      const videoId = getYouTubeVideoId(item.youtubeUrl);
                      
                      if (!videoId) {
                        return (
                          <Box
                            sx={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: '#f5f5f5',
                              color: '#666',
                            }}
                          >
                            Video not available
                          </Box>
                        );
                      }

                      return (
                        <Box
                          component="iframe"
                          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`}
                          title={item.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          onClick={(e) => e.stopPropagation()}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: 'none',
                          }}
                          onError={(e) => {
                            console.error('YouTube iframe error:', e);
                          }}
                        />
                      );
                    })()}
                  </Box>
                ) : (
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
                      height: '360px',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      console.error('Video failed to load:', videoUrl);
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </Box>
            ) : !imageError ? (
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="360"
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
                  height: 360,
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
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                zIndex: 2,
                backgroundColor: hasVideo ? '#E53E3E' : '#0039CB',
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
              {hasVideo && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
              {capitalize(item.category || 'TRENDING')}
              {hasVideo && ' VIDEO'}
            </Box>
          </Card>
        
          <Box sx={{ pt: 2 }}>
            <Typography
              variant="h6"
              sx={{
                color: 'black',
                fontWeight: '700',
                mb: 1,
                lineHeight: 1.3,
                fontSize: '1rem',
              }}
            >
              {item.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5,
                  color: '#777',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#888888"/>
                  <path d="M12.5 7H11V13L16.2 16.2L17 14.9L12.5 12.2V7Z" fill="#888888"/>
                </svg>
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: '#666',
                  fontSize: '0.8rem',
                }}
              >
                {formatDate(item.createdAt || item.publishedAt || item.updatedAt)}
              </Typography>
            </Box>
            
            {/* Show state and district if available */}
            {(item.state || item.district) && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1.5,
                    color: '#777',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#888888"/>
                  </svg>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#666',
                    fontSize: '0.8rem',
                  }}
                >
                  {[item.state ? capitalize(item.state) : '', item.district ? capitalize(item.district) : ''].filter(Boolean).join(', ')}
                </Typography>
              </Box>
            )}
          </Box>
        </Link>
      </Box>
    );
  };
  
  // Second section news card component with different style and comprehensive additionalImage support
  const SecondSectionNewsCard = ({ item }) => {
    const [imageError, setImageError] = useState(false);
    
    const handleImageError = () => {
      console.error(`Error loading image for "${item.title}"`);
      setImageError(true);
    };
    
    // Get image URL with proper handling including additionalImage
    const getImageUrl = () => {
      console.log(`Getting image URL for SecondSection item with title "${item.title}":`, {
        id: item.id,
        featuredImage: item.featuredImage,
        image: item.image,
        additionalImage: item.additionalImage,
        images: item.images,
        youtubeUrl: item.youtubeUrl
      });
      
      // If item has YouTube URL, use YouTube thumbnail
      if (item.youtubeUrl) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = item.youtubeUrl.match(regExp);
        if (match && match[2].length === 11) {
          const videoId = match[2];
          return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      }
      
      // If item has images array with content
      if (item.images && Array.isArray(item.images) && item.images.length > 0 && typeof item.images[0] === 'string') {
        console.log(`Using images[0] from array for SecondSection "${item.title}": ${item.images[0]}`);
        return item.images[0];
      }
      
      // If item has featuredImage
      if (item.featuredImage && typeof item.featuredImage === 'string') {
        // Check if it's a full URL or just a path
        if (item.featuredImage.startsWith('http')) {
          console.log(`Using full featuredImage URL for SecondSection "${item.title}": ${item.featuredImage}`);
          return item.featuredImage;
        } else {
          // Add base URL for relative paths
          const fullUrl = `https://api.newztok.in${item.featuredImage}`;
          console.log(`Using relative featuredImage with base URL for SecondSection "${item.title}": ${fullUrl}`);
          return fullUrl;
        }
      }
      
      // If item has image property
      if (item.image && typeof item.image === 'string') {
        // Check if it's a full URL or just a path
        if (item.image.startsWith('http')) {
          console.log(`Using full image URL for SecondSection "${item.title}": ${item.image}`);
          return item.image;
        } else {
          // Add base URL for relative paths
          const fullUrl = `https://api.newztok.in${item.image}`;
          console.log(`Using relative image with base URL for SecondSection "${item.title}": ${fullUrl}`);
          return fullUrl;
        }
      }
      
      // If item has additionalImage property
      if (item.additionalImage && typeof item.additionalImage === 'string') {
        // Check if it's a full URL or just a path
        if (item.additionalImage.startsWith('http')) {
          console.log(`Using full additionalImage URL for SecondSection "${item.title}": ${item.additionalImage}`);
          return item.additionalImage;
        } else {
          // Add base URL for relative paths
          const fullUrl = `https://api.newztok.in${item.additionalImage}`;
          console.log(`Using relative additionalImage with base URL for SecondSection "${item.title}": ${fullUrl}`);
          return fullUrl;
        }
      }
      
      // Fallback to placeholder
      return 'https://via.placeholder.com/400x300?text=No+Image';
    };

    // Check if item has video - either directly set hasVideo flag or check paths including additionalImage
    const hasVideo = item.hasVideo || item.video || item.videoPath ||
      (item.featuredImage && item.featuredImage.includes('/uploads/videos/video-')) ||
      (item.image && item.image.includes('/uploads/videos/video-')) ||
      (item.additionalImage && item.additionalImage.includes('/uploads/videos/video-'));
    
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
      
      // Check other fields for video paths including additionalImage
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
      
      if (item.additionalImage && item.additionalImage.includes('/uploads/videos/video-')) {
        return item.additionalImage.startsWith('http') 
          ? item.additionalImage 
          : `https://api.newztok.in${item.additionalImage}`;
      }
      
      return null;
    };
    
    const videoUrl = hasVideo ? getVideoUrl() : null;
    const imageUrl = !hasVideo ? getImageUrl() : null;
    
    // Check if it's a YouTube video
    const isYouTubeVideo = !!item.youtubeUrl;

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

    // Handle card click to track view
    const handleCardClick = (e) => {
      e.preventDefault();
      trackView(item.id);
      // After tracking the view, navigate to the news page
      window.location.href = `/trending/${item.id}`;
    };
      
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', mb: 4, height: '100%' }}>
        <Link 
          to={`/trending/${item.id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
          onClick={handleCardClick}
        >
          <Card 
            sx={{ 
              position: 'relative',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              height: 280,
              backgroundColor: 'white',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              }
            }}
          >
            {hasVideo ? (
              <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
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
                    height: '280px',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    console.error('Video failed to load:', videoUrl);
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
              </Box>
            ) : !imageError ? (
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="280"
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
                  height: 280,
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
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                zIndex: 2,
                backgroundColor: hasVideo ? '#E53E3E' : '#0039CB',
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
              {hasVideo && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
              {capitalize(item.category || 'TRENDING')}
              {hasVideo && ' VIDEO'}
            </Box>
          </Card>
        
          <Box sx={{ pt: 2 }}>
            <Typography
              variant="h6"
              sx={{
                color: 'black',
                fontWeight: '700',
                mb: 1,
                lineHeight: 1.3,
                fontSize: '1rem',
                height: '2.6rem',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {item.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                component="img"
                src="https://cdn-icons-png.flaticon.com/512/3524/3524636.png"
                alt="clock"
                sx={{ 
                  width: 16,
                  height: 16,
                  mr: 1,
                  opacity: 0.7
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: '#666',
                  fontSize: '0.8rem',
                }}
              >
                {formatDate(item.createdAt || item.publishedAt || item.updatedAt)}
              </Typography>
            </Box>
            
            {/* Show state and district if available */}
            {(item.state || item.district) && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1,
                    opacity: 0.7
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#888888"/>
                  </svg>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#666',
                    fontSize: '0.8rem',
                  }}
                >
                  {[item.state ? capitalize(item.state) : '', item.district ? capitalize(item.district) : ''].filter(Boolean).join(', ')}
                </Typography>
              </Box>
            )}
          </Box>
        </Link>
      </Box>
    );
  };
  
  // Category tab component
  const CategoryTab = ({ name, count }) => (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: '#000',
        color: 'white',
        p: 2,
        borderRadius: 2,
        mb: 2,
        cursor: 'pointer',
        '&:hover': {
          opacity: 0.9
        }
      }}
    >
      <Typography fontWeight="medium">{name}</Typography>
      <Box 
        sx={{ 
          backgroundColor: 'white', 
          color: 'black', 
          width: 30, 
          height: 30, 
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '0.9rem'
        }}
      >
        {count}
      </Box>
    </Box>
  );

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

  // Side Ad component
  const SideAd = () => {
    const [sideAd, setSideAd] = useState(null);
    const [sideError, setSideError] = useState(null);
    const [sideLoading, setSideLoading] = useState(true);

    useEffect(() => {
      const fetchSideAd = async () => {
        try {
          setSideLoading(true);
          setSideError(null);
          console.log('Fetching side ad from API...');
          
          const response = await axios.get(`${baseUrl}/api/ads/public/web/side`);
          console.log('Side ad API response:', response.data);
          
          if (response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
            // Take the first ad from the array
            const ad = response.data.data[0];
            // Log the redirect URL for debugging
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

      fetchSideAd();
    }, []);
    
    // Handle ad click
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
            height: 350, 
            bgcolor: '#f5f5f5', 
            mb: 3, 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 0,
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
            height: 350, 
            bgcolor: '#E0E0E0', 
            mb: 3, 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            borderRadius: 0,
            position: 'relative',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          {sideError ? 'Failed to load ad' : '380 x 350'}
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

    // If we have a valid side ad, display it
    return (
      <Box 
        component="a"
        href={sideAd.redirectUrl || sideAd.link || '#'}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleAdClick}
        sx={{ 
          width: '100%', 
          height: 350, 
          mb: 3, 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 0,
          overflow: 'hidden',
          textDecoration: 'none',
          position: 'relative',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
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
              e.target.src = "https://via.placeholder.com/380x350?text=Advertisement";
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

  // Banner Ad component
  const BannerAd = () => {
    const [bannerAd, setBannerAd] = useState(null);
    const [bannerError, setBannerError] = useState(null);
    const [bannerLoading, setBannerLoading] = useState(true);

    useEffect(() => {
      const fetchBannerAd = async () => {
        try {
          setBannerLoading(true);
          setBannerError(null);
          console.log('Fetching banner ad from API...');
          
          const response = await axios.get(`${baseUrl}/api/ads/public/web/banner`);
          console.log('Banner ad API response:', response.data);
          
          if (response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
            // Take the first ad from the array
            const ad = response.data.data[0];
            // Log the redirect URL for debugging
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

      fetchBannerAd();
    }, []);
    
    // Handle ad click
    const handleAdClick = (e) => {
      e.preventDefault();
      if (bannerAd && bannerAd.redirectUrl) {
        console.log('Redirecting to banner ad URL:', bannerAd.redirectUrl);
        window.open(bannerAd.redirectUrl, '_blank', 'noopener,noreferrer');
      }
    };

    if (bannerLoading) {
      return (
        <Box 
          sx={{ 
            width: '100%', 
            height: 100, 
            bgcolor: '#f5f5f5', 
            mb: 4, 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 0,
          }}
        >
          <CircularProgress size={24} />
        </Box>
      );
    }

    if (bannerError || !bannerAd) {
      return (
        <Box 
          sx={{ 
            width: '100%', 
            height: 100, 
            bgcolor: '#E0E0E0', 
            mb: 4, 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            borderRadius: 0,
            position: 'relative',
          }}
        >
          {bannerError ? 'Failed to load ad' : '970 x 100'}
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

    // If we have a valid banner ad, display it
    return (
      <Box 
        component="a"
        href={bannerAd.redirectUrl || bannerAd.link || '#'}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleAdClick}
        sx={{ 
          width: '100%', 
          height: 100, 
          mb: 4, 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 0,
          overflow: 'hidden',
          textDecoration: 'none',
          position: 'relative',
          cursor: 'pointer',
        }}
      >
        {bannerAd.imageUrl ? (
          <Box 
            component="img"
            src={bannerAd.imageUrl.startsWith('http') ? bannerAd.imageUrl : `${baseUrl}${bannerAd.imageUrl.startsWith('/') ? '' : '/'}${bannerAd.imageUrl}`}
            alt={bannerAd.title || "Advertisement"}
            sx={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
            }}
            onError={(e) => {
              console.error('Banner image failed to load');
              e.target.onerror = null; 
              e.target.src = "https://via.placeholder.com/970x100?text=Advertisement";
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
            {bannerAd.title || "Advertisement"}
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

  return (
    <Box sx={{ width: '100%', backgroundColor: '#f5f5f5' }}>
      {/* Trending Header */}
      <Box 
        sx={{ 
          width: '100%', 
          position: 'relative',
          py: 5,
          color: 'white',
          textAlign: 'center',
          mb: 8,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #ff3366, #ff5c33)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 2px, transparent 2px)',
            backgroundSize: '40px 40px',
            opacity: 0.5,
            zIndex: 1
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpolygon fill='%23ffffff' fill-opacity='0.15' points='0,0 15,0 0,15'/%3E%3Cpolygon fill='%23ffffff' fill-opacity='0.15' points='100,100 85,100 100,85'/%3E%3C/svg%3E")`,
            zIndex: 1
          }
        }}
      >
        {/* Trending Arrows (Left Side) */}
        <Box 
          sx={{
            position: 'absolute',
            left: '5%',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            display: { xs: 'none', md: 'block' }
          }}
        >
          <svg width="60" height="120" viewBox="0 0 60 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 0L60 30H45V120H15V30H0L30 0Z" fill="rgba(255,255,255,0.3)" />
          </svg>
        </Box>
        
        {/* Trending Arrows (Right Side) */}
        <Box 
          sx={{
            position: 'absolute',
            right: '5%',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            display: { xs: 'none', md: 'block' }
          }}
        >
          <svg width="60" height="120" viewBox="0 0 60 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 0L60 30H45V120H15V30H0L30 0Z" fill="rgba(255,255,255,0.3)" />
          </svg>
        </Box>
        
        {/* Wave Pattern */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '18px',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' opacity='.25' fill='%23ffffff'%3E%3C/path%3E%3Cpath d='M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z' opacity='.5' fill='%23ffffff'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundSize: '100% 18px',
            backgroundRepeat: 'no-repeat',
            zIndex: 2
          }}
        />
        
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 3 }}>
          <Box sx={{ 
            display: 'inline-block',
            px: 5, 
            py: 2, 
            position: 'relative',
          }}>
            <Typography 
              variant="h3" 
              component="h1" 
              fontWeight="bold" 
              sx={{ 
                mb: 0.5,
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                position: 'relative',
                display: 'inline-block'
              }}
            >
              Trending News
              <Box
                sx={{
                  position: 'absolute',
                  top: '-12px',
                  right: '-24px',
                  backgroundColor: '#fff',
                  color: '#ff3366',
                  fontSize: '0.9rem',
                  padding: '2px 6px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  transform: 'rotate(12deg)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                HOT!
              </Box>
            </Typography>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                opacity: 0.9,
                maxWidth: '600px',
                mx: 'auto',
                textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
              }}
            >
              Stay updated with the most viral stories from across the nation
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Main Content - First Section */}
      <Container 
        sx={{ 
          maxWidth: { xs: '95%', sm: '90%', md: '1200px' }, 
          mx: 'auto',
          mb: 8
        }}
      >
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 3, md: 3 } }}>
            {/* Left Side - News Cards */}
            <Box sx={{ flex: 7, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
              {newsItems.length >= 1 && (
                <Box sx={{ flex: 1 }}>
                  <NewsCard item={newsItems[0]} />
                </Box>
              )}
              
              {newsItems.length >= 2 && (
                <Box sx={{ flex: 1 }}>
                  <NewsCard item={newsItems[1]} />
                </Box>
              )}
            </Box>
            
            {/* Right Side - Ad and Social Media */}
            <Box sx={{ flex: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Advertisement */}
              <SideAd />
              
              {/* Social Media Stats */}
              <Box 
                sx={{ 
                  p: 2,
                  backgroundColor: 'white',
                  borderRadius: 0,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <Grid container spacing={1}>
                  {socialStats.map((stat) => (
                    <Grid item xs={stat.platform === 'whatsapp' ? 12 : 6} sm={stat.platform === 'whatsapp' ? 12 : 6} md={stat.platform === 'whatsapp' ? 12 : 6} lg={stat.platform === 'whatsapp' ? 12 : 3} key={stat.platform} sx={{ textAlign: 'center', p: 1.5 }}>
                      <Box 
                        component="img" 
                        src={stat.icon} 
                        alt={stat.platform} 
                        sx={{ 
                          width: 24, 
                          height: 24,
                          mb: 0.5,
                          objectFit: 'contain'
                        }}
                      />
                      <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold', mb: 0 }}>
                        {stat.count}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
                        {stat.label}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          </Box>
        )}
      </Container>

      {/* Banner Advertisement after content */}
      <Container 
        sx={{ 
          maxWidth: { xs: '95%', sm: '90%', md: '1200px' }, 
          mx: 'auto',
          mb: 8
        }}
      >
        <BannerAd />
      </Container>

      {/* Second Section - Scrollable News and Fixed Sidebar */}
      {!loading && !error && (
        <Container 
          sx={{ 
            maxWidth: { xs: '95%', sm: '90%', md: '1200px' }, 
            mx: 'auto',
            position: 'relative',
            mb: 8
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 3, md: 3 } }}>
            {/* Left Side - Scrollable News Cards */}
            <Box 
              sx={{ 
                flex: 7, 
                maxHeight: { md: '1200px' },
                overflowY: { md: 'auto' },
                pr: { md: 2 },
                msOverflowStyle: 'none', /* IE and Edge */
                scrollbarWidth: 'none', /* Firefox */
                '&::-webkit-scrollbar': {
                  display: 'none', /* Chrome, Safari, Opera */
                }
              }}
            >
              {secondSectionNews.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, mb: 5 }}>
                  {secondSectionNews.map((news, index) => (
                    <Box sx={{ flex: 1 }} key={news.id || index}>
                      <SecondSectionNewsCard item={news} />
                    </Box>
                  ))}
                </Box>
              )}
              
              {additionalNews.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, mb: 5 }}>
                  {additionalNews.map((news, index) => (
                    <Box sx={{ flex: 1 }} key={news.id || index}>
                      <SecondSectionNewsCard item={news} />
                    </Box>
                  ))}
                </Box>
              )}
              
              {fourthSectionNews.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, mb: 5 }}>
                  {fourthSectionNews.map((news, index) => (
                    <Box sx={{ flex: 1 }} key={news.id || index}>
                      <SecondSectionNewsCard item={news} />
                    </Box>
                  ))}
                </Box>
              )}
              
              {fifthSectionNews.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, mb: 5 }}>
                  {fifthSectionNews.map((news, index) => (
                    <Box sx={{ flex: 1 }} key={news.id || index}>
                      <SecondSectionNewsCard item={news} />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
            
            {/* Right Side - Fixed Category Tabs and Ad */}
            <Box 
              sx={{ 
                flex: 3, 
                position: { md: 'sticky' },
                top: { md: '20px' },
                alignSelf: { md: 'flex-start' },
                display: 'flex', 
                flexDirection: 'column', 
                gap: 3 
              }}
            >
              {/* Category Tabs */}
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {categoryTabs.map((tab, index) => (
                  <CategoryTab key={index} name={tab.name} count={tab.count} />
                ))}
              </Box>
              
              {/* Advertisement */}
              <SideAd />
              
              {/* Recent Posts Heading */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h5" fontWeight="bold">
                  Recent Posts
                </Typography>
                <Divider sx={{ mt: 2, mb: 2, borderColor: 'rgba(0,0,0,0.1)' }} />
              </Box>
            </Box>
          </Box>
        </Container>
      )}

      {/* Banner Advertisement at the bottom */}
      <Container 
        sx={{ 
          maxWidth: { xs: '95%', sm: '90%', md: '1200px' }, 
          mx: 'auto',
          mb: 8
        }}
      >
        <BannerAd />
      </Container>
    </Box>
  );
};

export default TrendingNews;