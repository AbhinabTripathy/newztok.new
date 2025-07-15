import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useStateContext } from './Header'; // Import state context

const TrendingNews = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [secondSectionNews, setSecondSectionNews] = useState([]);
  const [additionalNews, setAdditionalNews] = useState([]);
  const [fourthSectionNews, setFourthSectionNews] = useState([]);
  const [fifthSectionNews, setFifthSectionNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedState } = useStateContext(); // Get selected state from context

  // Base URL for API
  const baseUrl = 'https://api.newztok.in';

  // Helper function to capitalize first letter
  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Dummy ad data for consistent UI
  const adImages = [
    'https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads',
    'https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads',
    'https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads',
    'https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads',
    'https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads',
    'https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads',
    'https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads',
    'https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads',
  ];

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
        console.log(`Setting first ${Math.min(fetchedNews.length, 5)} items as video news`);
        setNewsItems(fetchedNews.slice(0, Math.min(fetchedNews.length, 5)));
      }
      
      if (fetchedNews.length >= 6) {
        console.log('Setting items starting from index 5 as second section news');
        setSecondSectionNews(fetchedNews.slice(5, 20));
      }
      
      if (fetchedNews.length >= 21) {
        console.log('Setting items starting from index 20 as additional news');
        setAdditionalNews(fetchedNews.slice(20, 25));
      }
      
      if (fetchedNews.length >= 26) {
        console.log('Setting items starting from index 25 as fourth section news');
        setFourthSectionNews(fetchedNews.slice(25, 30));
      }
      
      if (fetchedNews.length >= 31) {
        console.log('Setting items starting from index 30 as fifth section news');
        setFifthSectionNews(fetchedNews.slice(30, 35));
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

  // Format date function for consistent display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (err) {
      console.error('Date formatting error:', err);
      return dateString;
    }
  };

  // Format time function
  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } catch (err) {
      console.error('Time formatting error:', err);
      return '';
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

  // Handle card click to track view
  const handleCardClick = (item) => {
    trackView(item.id);
    // After tracking the view, navigate to the news page
    window.location.href = `/trending/${item.id}`;
  };

  // Get image URL with proper handling
  const getImageUrl = (item) => {
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
    if (item.images && item.images.length > 0) {
      return item.images[0];
    }
    
    // If item has featuredImage
    if (item.featuredImage) {
      // Check if it's a full URL or just a path
      if (item.featuredImage.startsWith('http')) {
        return item.featuredImage;
      } else {
        // Add base URL for relative paths
        return `https://api.newztok.in${item.featuredImage}`;
      }
    }
    
    // If item has image property
    if (item.image) {
      // Check if it's a full URL or just a path
      if (item.image.startsWith('http')) {
        return item.image;
      } else {
        // Add base URL for relative paths
        return `https://api.newztok.in${item.image}`;
      }
    }
    
    // Fallback to placeholder
    return 'https://via.placeholder.com/400x300?text=No+Image';
  };

  // Check if item has video
  const hasVideo = (item) => {
    return item.hasVideo || item.video || item.videoPath ||
      (item.featuredImage && item.featuredImage.includes('/uploads/videos/video-')) ||
      (item.image && item.image.includes('/uploads/videos/video-'));
  };

  // Get video URL if present
  const getVideoUrl = (item) => {
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

  // Enhanced News Card component matching Home component style
  const NewsCard = ({ image, title, timestamp, isVideo, item, onClick }) => (
    <Box
      onClick={() => onClick(item)}
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
        mb: 2,
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
          {title}
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
      {isVideo ? (
        <Box sx={{ position: 'relative', height: '55%', width: '100%' }}>
          <Box
            component="video"
            src={getVideoUrl(item)}
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
              console.error('Video failed to load:', getVideoUrl(item));
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
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
      ) : (
        <Box sx={{ position: 'relative', height: '55%' }}>
          <img 
            src={image} 
            alt={title} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover' 
            }} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 2,
              backgroundColor: '#0039CB',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.75rem',
              padding: '6px 16px',
              borderRadius: '4px',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            {capitalize(item.category || 'TRENDING')}
          </Box>
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
          {timestamp}
        </Typography>
      </Box>
    </Box>
  );

  // Ad Card component
  const AdCard = ({ image, height }) => (
    <Box
      sx={{
        width: '100%',
        height: height || 198,
        bgcolor: '#E0E0E0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#999',
        borderRadius: 1,
        position: 'relative',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}
    >
      <img 
        src={image} 
        alt="Advertisement" 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover' 
        }} 
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
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
        Ad
      </Typography>
    </Box>
  );

  // Trending Card component
  const TrendingCard = ({ image, title, date }) => (
    <Paper elevation={0} sx={{
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
    }}>
      <Box sx={{ width: 60, height: 60, flexShrink: 0 }}>
        <img 
          src={image} 
          alt="trending" 
          style={{ 
            width: '100%', 
            height: '100%', 
            borderRadius: 8, 
            objectFit: 'cover' 
          }} 
          onError={(e) => {
            e.target.onerror = null;
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
          {title}
        </Typography>
        <Typography sx={{ fontSize: 11, color: '#888' }}>{date}</Typography>
      </Box>
    </Paper>
  );

  // Auto-scrolling row component
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

  // Multi-card auto slider
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
                cursor: 'pointer'
              }}
              onClick={() => handleCardClick(card.item)}
            >
              <img 
                src={card.image} 
                alt={card.alt} 
                style={{ 
                  width: '100%', 
                  height: `${height}px`, 
                  objectFit: 'cover' 
                }} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/370x210?text=No+Image';
                }}
              />
              <Box sx={{ p: 2, pt: 2 }}>
                <Typography sx={{ fontSize: 15, color: '#222', fontWeight: 400, lineHeight: 1.4 }}>
                  {card.text}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#0039CB' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom color="error">
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
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, px: 4, pt: 3, pb: 0 }}>
        {/* Top News Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={7} lg={7}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>Trending News</Typography>
            <Box sx={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1, maxWidth: '520px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>VIDEOS</Typography>
                {newsItems.slice(0, 3).map((news, idx) => (
                  <Box key={idx} sx={{ mb: 3 }}>
                    <NewsCard
                      image={getImageUrl(news)}
                      title={news.title}
                      timestamp={`${formatDate(news.createdAt || news.publishedAt || news.updatedAt)} \u00A0 \u00A0 ${formatTime(news.createdAt || news.publishedAt || news.updatedAt)}`}
                      isVideo={hasVideo(news)}
                      item={news}
                      onClick={handleCardClick}
                    />
                  </Box>
                ))}
              </Box>
              
              {/* Trending Section */}
              <Box sx={{ minWidth: '369px', maxWidth: '369px', flexShrink: 0, mx: 5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>TRENDING</Typography>
                <Box sx={{ maxHeight: '1400px', overflowY: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
                  {secondSectionNews.slice(0, 25).map((item, idx) => (
                    <Box key={idx} onClick={() => handleCardClick(item)} sx={{ cursor: 'pointer' }}>
                      <TrendingCard 
                        image={getImageUrl(item)}
                        title={item.title}
                        date={formatDate(item.createdAt || item.publishedAt || item.updatedAt)}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
              
              {/* Ad Section */}
              <Box sx={{ minWidth: '280px', maxWidth: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {adImages.map((img, idx) => (
                  <AdCard key={idx} image={img} height={198.38} />
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        {/* Bottom Cards Row (Trending News) */}
        <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
          <AutoScrollRow>
            {additionalNews.map((card, idx) => (
              <Box 
                key={idx} 
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
                  cursor: 'pointer'
                }}
                onClick={() => handleCardClick(card)}
              >
                <img 
                  src={getImageUrl(card)} 
                  alt={card.title} 
                  style={{ 
                    width: '100%', 
                    height: '60%', 
                    objectFit: 'cover' 
                  }} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/230x80?text=No+Image';
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
                    whiteSpace: 'nowrap' 
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
          <Grid item xs={12} md={7} lg={7}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>Latest News</Typography>
            <Box sx={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1, maxWidth: '520px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>VIDEOS</Typography>
                {newsItems.slice(3, 6).map((news, idx) => (
                  <Box key={idx} sx={{ mb: 3 }}>
                    <NewsCard
                      image={getImageUrl(news)}
                      title={news.title}
                      timestamp={`${formatDate(news.createdAt || news.publishedAt || news.updatedAt)} \u00A0 \u00A0 ${formatTime(news.createdAt || news.publishedAt || news.updatedAt)}`}
                      isVideo={hasVideo(news)}
                      item={news}
                      onClick={handleCardClick}
                    />
                  </Box>
                ))}
              </Box>
              
              {/* Latest News Section */}
              <Box sx={{ minWidth: '369px', maxWidth: '369px', flexShrink: 0, mx: 5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>LATEST NEWS</Typography>
                <Box sx={{ maxHeight: '1800px', overflowY: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
                  {fourthSectionNews.slice(0, 35).map((item, idx) => (
                    <Box key={idx} onClick={() => handleCardClick(item)} sx={{ cursor: 'pointer' }}>
                      <TrendingCard 
                        image={getImageUrl(item)}
                        title={item.title}
                        date={formatDate(item.createdAt || item.publishedAt || item.updatedAt)}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
              
              {/* Ad Section */}
              <Box sx={{ minWidth: '280px', maxWidth: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {adImages.map((img, idx) => (
                  <AdCard key={idx} image={img} height={198.38} />
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        {/* Bottom Cards Row (Latest News) */}
        <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
          <AutoScrollRow>
            {fifthSectionNews.map((card, idx) => (
              <Box 
                key={idx} 
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
                  cursor: 'pointer'
                }}
                onClick={() => handleCardClick(card)}
              >
                <img 
                  src={getImageUrl(card)} 
                  alt={card.title} 
                  style={{ 
                    width: '100%', 
                    height: '60%', 
                    objectFit: 'cover' 
                  }} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/230x80?text=No+Image';
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
                    whiteSpace: 'nowrap' 
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
              cards={secondSectionNews.slice(0, 10).map((item, idx) => ({
                image: getImageUrl(item),
                alt: `Most Shared ${idx + 1}`,
                text: item.title,
                item: item
              }))}
              cardsPerSlide={3}
              cardWidth={370}
              gap={32}
              height={210}
            />
          </Box>
        </Box>


      </Box>
    </Box>
  );
};

export default TrendingNews; 