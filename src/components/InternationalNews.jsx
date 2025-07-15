import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useStateContext } from './Header';
import { Link } from 'react-router-dom';

const InternationalNews = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedState } = useStateContext();
  
  // Base URL for API
  const baseUrl = 'https://api.newztok.in';

  useEffect(() => {
    fetchInternationalNews();
  }, [selectedState]);

  const fetchInternationalNews = async () => {
    try {
      setLoading(true);
      
      // Add timeout to the axios request to avoid long hanging requests
      const response = await axios.get('https://api.newztok.in/api/news/category/international', {
        timeout: 10000, // 10 seconds timeout
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('International news API response:', response.data);
      
      // Process data from API
      let fetchedNews = [];
      if (Array.isArray(response.data)) {
        fetchedNews = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        fetchedNews = response.data.data;
      }
      
      // Filter news by selected state if one is selected
      if (selectedState) {
        console.log(`Filtering international news by state: ${selectedState}`);
        
        let filteredNews = fetchedNews.filter(item => 
          item.state && (item.state.includes(selectedState) || selectedState.includes(item.state))
        );
        
        if (filteredNews.length === 0) {
          filteredNews = fetchedNews.filter(item => 
            (item.content && item.content.includes(selectedState)) || 
            (item.title && item.title.includes(selectedState))
          );
        }
        
        if (filteredNews.length > 0) {
          console.log(`Found ${filteredNews.length} international news items for state: ${selectedState}`);
          fetchedNews = filteredNews;
        } else {
          console.log(`No international news items found for state: ${selectedState}, showing all international news`);
        }
      }
      
      setNewsItems(fetchedNews);
    } catch (err) {
      console.error('Error fetching international news:', err);
      
      // Try alternative URL if primary fails
      try {
        console.log('Trying alternative API endpoint...');
        const alternativeResponse = await axios.get('https://api.newztok.in/api/news/international', {
          timeout: 10000
        });
        
        let alternativeNews = [];
        if (Array.isArray(alternativeResponse.data)) {
          alternativeNews = alternativeResponse.data;
        } else if (alternativeResponse.data && alternativeResponse.data.data && Array.isArray(alternativeResponse.data.data)) {
          alternativeNews = alternativeResponse.data.data;
        }
        
        console.log('Successfully fetched from alternative endpoint:', alternativeResponse.data);
        setNewsItems(alternativeNews);
      } catch (secondErr) {
        console.error('Alternative API endpoint also failed:', secondErr);
        setError('Failed to load international news. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to capitalize first letter of each word
  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Helper function to get full image URL
    const getFullImageUrl = (imagePath) => {
      if (!imagePath) return 'https://via.placeholder.com/400x300?text=No+Image';
      if (imagePath.startsWith('http')) return imagePath;
      return `${baseUrl}${imagePath}`;
    };
    
  // Helper function to check if item has video
  const hasVideo = (item) => {
    return item.hasVideo || 
      item.video || 
      item.videoPath || 
      (item.featuredImage && typeof item.featuredImage === 'string' && item.featuredImage.includes('/uploads/videos/video-')) ||
      (item.image && typeof item.image === 'string' && item.image.includes('/uploads/videos/video-'));
  };

  // Helper function to get video URL
  const getVideoUrl = (item) => {
      if (item.video) {
        return item.video;
      }
      
      if (item.videoPath) {
        return item.videoPath.startsWith('http') 
          ? item.videoPath 
          : `${baseUrl}${item.videoPath}`;
      }
      
      if (item.featuredImage && item.featuredImage.includes('/uploads/videos/video-')) {
        return item.featuredImage.startsWith('http') 
          ? item.featuredImage 
          : `${baseUrl}${item.featuredImage}`;
      }
      
      if (item.image && item.image.includes('/uploads/videos/video-')) {
        return item.image.startsWith('http') 
          ? item.image 
          : `${baseUrl}${item.image}`;
      }
      
      return null;
    };
    
  // Separate news into recent and older based on date
  const separateNewsByDate = (items) => {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000)); // 3 days ago
    
    const recentNews = [];
    const olderNews = [];
    
    items.forEach(item => {
      const itemDate = new Date(item.createdAt || item.updatedAt || item.publishedAt);
      if (itemDate >= threeDaysAgo) {
        recentNews.push(item);
      } else {
        olderNews.push(item);
      }
    });
    
    return { recentNews, olderNews };
  };

  // NewsCard component matching the expected interface
  const NewsCard = ({ image, title, timestamp, isVideo, item, onClick }) => (
    <Box
      component={Link}
      to={`/international/${item?.id}`}
      onClick={onClick}
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
        textDecoration: 'none',
        color: 'inherit',
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
        {item?.description && (
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
              backgroundColor: '#1565C0',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.75rem',
              padding: '6px 16px',
              borderRadius: '4px',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            {item?.category || 'INTERNATIONAL'}
          </Box>
        </Box>
      )}
      
      {/* Location and Date Section - Below the media */}
      <Box sx={{ p: 3, height: '20%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* Show state and district if available */}
        {(item?.state || item?.district) && (
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
            {[item?.state ? capitalizeFirstLetter(item.state) : '', item?.district ? capitalizeFirstLetter(item.district) : ''].filter(Boolean).join(', ')}
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

  // AdCard component
  const AdCard = ({ image, height }) => {
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
            const ad = response.data.data[0];
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
    
    const handleAdClick = (e) => {
      e.preventDefault();
      if (sideAd && sideAd.redirectUrl) {
        console.log('Redirecting to side ad URL:', sideAd.redirectUrl);
        window.open(sideAd.redirectUrl, '_blank', 'noopener,noreferrer');
      }
    };

    if (sideLoading) {
      return (
        <Box sx={{ width: '100%', height: height || 198, bgcolor: '#f5f5f5', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1 }}>
          <CircularProgress size={20} />
        </Box>
      );
    }

    return (
      <Box 
        component="a"
        href={sideAd?.redirectUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleAdClick}
        sx={{ 
          width: '100%', 
          height: height || 198,
          bgcolor: '#E0E0E0',
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          borderRadius: 1,
          position: 'relative',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          textDecoration: 'none',
          cursor: 'pointer',
        }}
      >
        {sideAd?.imageUrl ? (
          <img 
            src={sideAd.imageUrl.startsWith('http') ? sideAd.imageUrl : `${baseUrl}${sideAd.imageUrl}`}
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
        ) : (
          <img 
            src={image || 'https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads'}
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

  // TrendingCard component
  const TrendingCard = ({ image, title, date, item }) => (
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
      cursor: 'pointer',
      textDecoration: 'none',
      color: 'inherit',
      transition: 'all 0.2s ease',
      '&:hover': {
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        transform: 'translateY(-1px)',
        borderColor: '#ddd',
      }
    }}
    component={Link}
    to={`/international/${item?.id}`}
    >
      <Box sx={{ width: 60, height: 60, flexShrink: 0 }}>
        <img 
          src={image} 
          alt="trending" 
          style={{ width: '100%', height: '100%', borderRadius: 8, objectFit: 'cover' }} 
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

  // AutoScrollRow component
  const AutoScrollRow = ({ children }) => {
    const scrollRef = useRef(null);
    useEffect(() => {
      const scrollContainer = scrollRef.current;
      if (!scrollContainer) return;
      let frame;
      let speed = 1.2;
      function animate() {
        if (!scrollContainer) return;
        if (scrollContainer.scrollLeft + scrollContainer.offsetWidth >= scrollContainer.scrollWidth - 1) {
          scrollContainer.scrollLeft = 0;
        } else {
          scrollContainer.scrollLeft += speed;
        }
        frame = requestAnimationFrame(animate);
      }
      frame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frame);
    }, [children]);
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
          pointerEvents: 'none',
        }}
      >
        {children}
        </Box>
      );
  };

  // MultiCardAutoSlider component
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
            <Box key={idx} sx={{ width: `${cardWidth}px`, bgcolor: '#fff', borderRadius: 2, boxShadow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 0, mb: 0 }}>
              <img src={card.image} alt={card.alt} style={{ width: '100%', height: `${height}px`, objectFit: 'cover' }} />
              <Box sx={{ p: 2, pt: 2 }}>
                <Typography sx={{ fontSize: 15, color: '#222', fontWeight: 400, lineHeight: 1.4 }}>{card.text}</Typography>
          </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  // Convert API data to expected format
  const convertToVideoNews = (items, isRecent = true) => {
    // Ensure we have enough items, fallback to available items if not enough
    let newsToUse;
    if (isRecent) {
      newsToUse = items.slice(0, Math.min(5, items.length));
    } else {
      // For older news, use different slice or fallback to remaining items
      const startIndex = Math.min(5, items.length);
      newsToUse = items.slice(startIndex, startIndex + 5);
      // If not enough older items, use some items from the beginning
      if (newsToUse.length < 3) {
        newsToUse = [...newsToUse, ...items.slice(0, 5 - newsToUse.length)];
      }
    }
    
    return newsToUse.map(item => ({
      image: getFullImageUrl(item.featuredImage || item.image),
      title: item.title || 'No title available',
      timestamp: formatDate(item.createdAt || item.updatedAt || item.publishedAt),
      time: new Date(item.createdAt || item.updatedAt || item.publishedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      item: item
    }));
  };

  const convertToTrendingNews = (items) => {
    // Use most recent items for trending, ensure we have enough items for scrolling (minimum 20)
    const recentItems = items.slice(0, 15); // Take first 15 recent items
    const extendedItems = recentItems.length < 20 ? 
      [...recentItems, ...recentItems, ...recentItems].slice(0, 20) : recentItems;
    
    return extendedItems.map(item => ({
      image: getFullImageUrl(item.featuredImage || item.image),
      title: item.title || 'No title available',
      date: formatDate(item.createdAt || item.updatedAt || item.publishedAt),
      item: item
    }));
  };

  const convertToLatestNews = (items) => {
    // Mix older news with some recent news for latest section
    const { recentNews, olderNews } = separateNewsByDate(items);
    const mixedNews = [...olderNews, ...recentNews.slice(10)]; // Older news + some recent news not used in trending
    
    const extendedItems = mixedNews.length < 20 ? 
      [...mixedNews, ...mixedNews, ...mixedNews].slice(0, 20) : mixedNews.slice(0, 20);
    
    return extendedItems.map(item => ({
      image: getFullImageUrl(item.featuredImage || item.image),
      title: item.title || 'No title available',
      date: formatDate(item.createdAt || item.updatedAt || item.publishedAt),
      item: item
    }));
  };

  const convertToBottomCards = (items) => {
    return items.map(item => ({
      image: getFullImageUrl(item.featuredImage || item.image),
      title: item.title || 'No title available',
      item: item
    }));
  };

  const convertToMostSharedCards = (items) => {
    return items.slice(0, 10).map(item => ({
      image: getFullImageUrl(item.featuredImage || item.image),
      alt: item.title || 'Most Shared',
      text: item.title || 'No title available',
      item: item
    }));
  };

  // Get dummy ad images
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

  if (loading) {
    return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ ml: 2 }}>Loading international news...</Typography>
          </Box>
    );
  }

  if (error) {
    return (
          <Box sx={{ 
            p: 3, 
            backgroundColor: '#FFF5F5', 
            borderRadius: 2, 
            color: '#E53E3E',
            textAlign: 'center',
            mb: 4
          }}>
            <Typography variant="h6">{error}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Please try again later or check your connection.
            </Typography>
          </Box>
    );
  }

  if (newsItems.length === 0) {
    return (
          <Box sx={{ 
            p: 3, 
            backgroundColor: '#F7FAFC', 
            borderRadius: 2, 
            textAlign: 'center',
            mb: 4
          }}>
            <Typography variant="h6">No international news available at the moment.</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Please check back later for updates.
            </Typography>
          </Box>
    );
  }

  // Separate news data for different sections
  const { recentNews, olderNews } = separateNewsByDate(newsItems);
  
  // Top International News section (recent news)
  // Use recent news if available, otherwise fallback to first items
  const recentVideoNews = convertToVideoNews(recentNews.length > 0 ? recentNews : newsItems, true);
  const trendingNews = convertToTrendingNews(newsItems);
  
  // Other International News section (older news)
  // Combine older news with remaining items to ensure content
  const combinedOlderNews = olderNews.length > 0 ? 
    [...olderNews, ...newsItems.slice(10)] : 
    newsItems.slice(5); // If no older news, use items starting from index 5
  const olderVideoNews = convertToVideoNews(combinedOlderNews, false);
  const latestNews = convertToLatestNews(newsItems);
  
  // Common sections (mix of all news for variety)
  const bottomCards = convertToBottomCards(newsItems);
  const mostSharedCards = convertToMostSharedCards(newsItems);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, px: 4, pt: 3, pb: 0 }}>
        {/* Top News Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={7} lg={7}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>Top International News</Typography>
            <Box sx={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1, maxWidth: '520px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>VIDEOS</Typography>
                {recentVideoNews.map((news, idx) => (
                  <Box key={idx} sx={{ mb: 3 }}>
                    <NewsCard
                      image={news.image}
                      title={news.title}
                      timestamp={`${news.timestamp} \u00A0 \u00A0 ${news.time}`}
                      isVideo={hasVideo(news.item)}
                      item={news.item}
                    />
                  </Box>
                ))}
              </Box>
              {/* Trending Section */}
              <Box sx={{ minWidth: '369px', maxWidth: '369px', flexShrink: 0, mx: 5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>TRENDING</Typography>
                <Box sx={{ maxHeight: '1400px', overflowY: 'auto', '&::-webkit-scrollbar': { display: 'none' }, msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                  {trendingNews.slice(0, 20).map((item, idx) => (
                    <TrendingCard key={idx} {...item} />
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

        {/* Bottom Cards Row (Top News) */}
        <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
          <AutoScrollRow>
            {bottomCards.map((card, idx) => (
              <Box key={idx} sx={{ minWidth: '230.22px', maxWidth: '230.22px', height: '129.5px', bgcolor: '#fff', borderRadius: 2, boxShadow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <img src={card.image} alt={card.title} style={{ width: '100%', height: '60%', objectFit: 'cover' }} />
                <Box sx={{ p: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#222', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.title}</Typography>
              </Box>
            </Box>
            ))}
          </AutoScrollRow>
          </Box>

        {/* International News Section */}
        <Grid container spacing={3} sx={{ mt: 8 }}>
          <Grid item xs={12} md={7} lg={7}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>Other International News</Typography>
            <Box sx={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
                    <Box sx={{ flex: 1, maxWidth: '520px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>VIDEOS</Typography>
                {olderVideoNews.map((news, idx) => (
                  <Box key={idx} sx={{ mb: 3 }}>
                    <NewsCard
                      image={news.image}
                      title={news.title}
                      timestamp={`${news.timestamp} \u00A0 \u00A0 ${news.time}`}
                      isVideo={hasVideo(news.item)}
                      item={news.item}
                    />
                    </Box>
                ))}
                    </Box>
              {/* Latest News Section */}
              <Box sx={{ minWidth: '369px', maxWidth: '369px', flexShrink: 0, mx: 5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>LATEST NEWS</Typography>
                <Box sx={{ maxHeight: '1400px', overflowY: 'auto', '&::-webkit-scrollbar': { display: 'none' }, msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                  {latestNews.slice(0, 20).map((item, idx) => (
                    <TrendingCard key={idx} {...item} />
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

        {/* Bottom Cards Row (International News) */}
        <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
          <AutoScrollRow>
            {bottomCards.map((card, idx) => (
              <Box key={idx} sx={{ minWidth: '230.22px', maxWidth: '230.22px', height: '129.5px', bgcolor: '#fff', borderRadius: 2, boxShadow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <img src={card.image} alt={card.title} style={{ width: '100%', height: '60%', objectFit: 'cover' }} />
                <Box sx={{ p: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#222', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.title}</Typography>
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
              cards={mostSharedCards}
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

export default InternationalNews; 