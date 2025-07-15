import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useStateContext } from './Header';
import { Link, useNavigate } from 'react-router-dom';

const StateNews = () => {
  const [biharNews, setBiharNews] = useState([]);
  const [jharkhandNews, setJharkhandNews] = useState([]);
  const [upNews, setUpNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adImages, setAdImages] = useState([]);
  const { selectedState } = useStateContext();
  const navigate = useNavigate();
  
  // Base URL for API
  const baseUrl = 'https://api.newztok.in';

  useEffect(() => {
    const fetchAllStateNews = async () => {
      setLoading(true);
      try {
        // Fetch Bihar news
        const biharResponse = await axios.get('https://api.newztok.in/api/news/state/bihar', {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        console.log('Bihar API Response:', biharResponse.data);
        const biharData = Array.isArray(biharResponse.data) ? biharResponse.data : 
                         (biharResponse.data?.data || []);
        setBiharNews(biharData); // Keep all posts

        // Fetch Jharkhand news
        const jharkhandResponse = await axios.get('https://api.newztok.in/api/news/state/jharkhand', {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        console.log('Jharkhand API Response:', jharkhandResponse.data);
        const jharkhandData = Array.isArray(jharkhandResponse.data) ? jharkhandResponse.data : 
                             (jharkhandResponse.data?.data || []);
        setJharkhandNews(jharkhandData); // Keep all posts

        // Fetch UP news
        const upResponse = await axios.get('https://api.newztok.in/api/news/state/up', {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        console.log('UP API Response:', upResponse.data);
        const upData = Array.isArray(upResponse.data) ? upResponse.data : 
                      (upResponse.data?.data || []);
        setUpNews(upData); // Keep all posts

        setError(null);
      } catch (err) {
        console.error('Error fetching state news:', err);
        setError('Failed to load state news. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllStateNews();
  }, []);

  // Fetch ads
  useEffect(() => {
    const fetchSideAds = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/ads/public/web/side`);
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          setAdImages(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching side ads:', err);
      }
    };

    fetchSideAds();
  }, []);

  // Helper functions
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/400x300?text=No+Image';
    if (imagePath.startsWith('http')) return imagePath;
    return `${baseUrl}${imagePath}`;
  };

  const hasVideo = (item) => {
    return item.hasVideo || 
      item.video || 
      item.videoPath || 
      (item.featuredImage && typeof item.featuredImage === 'string' && item.featuredImage.includes('/uploads/videos/video-')) ||
      (item.image && typeof item.image === 'string' && item.image.includes('/uploads/videos/video-'));
  };

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

  // Helper function to capitalize first letter of each word
  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // NewsCard component
  const NewsCard = ({ image, title, timestamp, isVideo, item }) => {
    const handleCardClick = () => {
      navigate(`/state/${item.state ? item.state.toLowerCase() : 'all'}/${item.id}`);
    };

    return (
      <Box
        onClick={handleCardClick}
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
                backgroundColor: '#673AB7',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.75rem',
                padding: '6px 16px',
                borderRadius: '4px',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              {item?.category || 'STATE'}
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
  };

  // AdCard component
  const AdCard = ({ image, height }) => {
    const [sideAd, setSideAd] = useState(null);

    useEffect(() => {
      const fetchSideAd = async () => {
        try {
          const response = await axios.get(`${baseUrl}/api/ads/public/web/side`);
          if (response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
            setSideAd(response.data.data[0]);
          }
        } catch (err) {
          console.error('Error fetching side ad:', err);
        }
      };

      fetchSideAd();
    }, []);
    
    const handleAdClick = (e) => {
      e.preventDefault();
      if (sideAd && sideAd.redirectUrl) {
        window.open(sideAd.redirectUrl, '_blank', 'noopener,noreferrer');
      }
    };

    return (
      <Box 
        component="a"
        href={sideAd?.redirectUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleAdClick}
        sx={{ 
          width: '100%', 
          height: height, 
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
        {sideAd?.imageUrl ? (
          <Box 
            component="img"
            src={sideAd.imageUrl.startsWith('http') ? sideAd.imageUrl : `${baseUrl}${sideAd.imageUrl}`}
            alt={sideAd.title || "Advertisement"}
            sx={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
            }}
            onError={(e) => {
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
            Advertisement
          </Box>
        )}
      </Box>
    );
  };

  // TrendingCard component
  const TrendingCard = ({ image, title, date, item }) => {
    const handleCardClick = () => {
      navigate(`/state/${item.state ? item.state.toLowerCase() : 'all'}/${item.id}`);
    };

      return (
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
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        }
      }} onClick={handleCardClick}>
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
  };

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

  // Convert news data to required format
  const convertNewsToVideoFormat = (newsArray) => {
    return newsArray.slice(0, 5).map(item => ({
      image: getFullImageUrl(item.featuredImage || item.image),
      title: item.title || 'No title available',
      timestamp: formatDate(item.createdAt || item.updatedAt || item.publishedAt),
      time: new Date(item.createdAt || item.updatedAt || item.publishedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      item: item
    }));
  };

  const convertNewsToTrendingFormat = (newsArray) => {
    return newsArray.slice(0, 20).map(item => ({
      image: getFullImageUrl(item.featuredImage || item.image),
      title: item.title || 'No title available',
      date: formatDate(item.createdAt || item.updatedAt || item.publishedAt),
      item: item
    }));
  };

  const convertNewsToBottomCardsFormat = (newsArray) => {
    return newsArray.slice(0, 20).map(item => ({
      image: getFullImageUrl(item.featuredImage || item.image),
      title: item.title || 'No title available',
      item: item
    }));
  };

  const convertNewsToMostSharedFormat = (newsArray) => {
    return newsArray.slice(0, 10).map(item => ({
      image: getFullImageUrl(item.featuredImage || item.image),
      alt: item.title || 'News',
      text: item.title || 'No title available'
    }));
  };

  if (loading) {
  return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>Loading state news...</Typography>
        </Box>
    );
  }

  if (error) {
    return (
        <Box sx={{ p: 3, backgroundColor: '#FFF5F5', borderRadius: 2, color: '#E53E3E', textAlign: 'center', mb: 4 }}>
          <Typography variant="h6">{error}</Typography>
        </Box>
    );
  }

  // Convert news data
  const biharVideoNews = convertNewsToVideoFormat(biharNews);
  const biharTrendingNews = convertNewsToTrendingFormat(biharNews);
  const biharBottomCards = convertNewsToBottomCardsFormat(biharNews);

  const jharkhandVideoNews = convertNewsToVideoFormat(jharkhandNews);
  const jharkhandTrendingNews = convertNewsToTrendingFormat(jharkhandNews);
  const jharkhandBottomCards = convertNewsToBottomCardsFormat(jharkhandNews);

  const upVideoNews = convertNewsToVideoFormat(upNews);
  const upTrendingNews = convertNewsToTrendingFormat(upNews);
  const upBottomCards = convertNewsToBottomCardsFormat(upNews);

  // Most shared cards from all news
  const allNews = [...biharNews, ...jharkhandNews, ...upNews];
  const mostSharedCards = convertNewsToMostSharedFormat(allNews);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, px: 4, pt: 3, pb: 0 }}>
        {/* Bihar News Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={7} lg={7}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>Bihar News</Typography>
            <Box sx={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1, maxWidth: '520px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>VIDEOS</Typography>
                {biharVideoNews.map((news, idx) => (
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
                {biharTrendingNews.map((item, idx) => (
                  <TrendingCard key={idx} {...item} />
                ))}
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
        
        {/* Bottom Cards Row (Bihar) */}
        <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
          <AutoScrollRow>
            {biharBottomCards.map((card, idx) => (
              <Box key={idx} sx={{ minWidth: '230.22px', maxWidth: '230.22px', height: '129.5px', bgcolor: '#fff', borderRadius: 2, boxShadow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => navigate(`/state/${card.item.state ? card.item.state.toLowerCase() : 'all'}/${card.item.id}`)}>
                <img src={card.image} alt={card.title} style={{ width: '100%', height: '60%', objectFit: 'cover' }} />
                <Box sx={{ p: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#222', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.title}</Typography>
                </Box>
              </Box>
            ))}
          </AutoScrollRow>
        </Box>

        {/* Jharkhand News Section */}
        <Grid container spacing={3} sx={{ mt: 8 }}>
          <Grid item xs={12} md={7} lg={7}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>Jharkhand News</Typography>
            <Box sx={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1, maxWidth: '520px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>VIDEOS</Typography>
                {jharkhandVideoNews.map((news, idx) => (
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
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>LATEST NEWS</Typography>
                {jharkhandTrendingNews.map((item, idx) => (
                  <TrendingCard key={idx} {...item} />
                ))}
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
        
        {/* Bottom Cards Row (Jharkhand) */}
        <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
          <AutoScrollRow>
            {jharkhandBottomCards.map((card, idx) => (
              <Box key={idx} sx={{ minWidth: '230.22px', maxWidth: '230.22px', height: '129.5px', bgcolor: '#fff', borderRadius: 2, boxShadow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => navigate(`/state/${card.item.state ? card.item.state.toLowerCase() : 'all'}/${card.item.id}`)}>
                <img src={card.image} alt={card.title} style={{ width: '100%', height: '60%', objectFit: 'cover' }} />
                <Box sx={{ p: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#222', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.title}</Typography>
                </Box>
              </Box>
            ))}
          </AutoScrollRow>
        </Box>

        {/* Uttar Pradesh News Section */}
        <Grid container spacing={3} sx={{ mt: 8 }}>
          <Grid item xs={12} md={7} lg={7}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>Uttar Pradesh News</Typography>
            <Box sx={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1, maxWidth: '520px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>VIDEOS</Typography>
                {upVideoNews.map((news, idx) => (
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
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>LATEST NEWS</Typography>
                {upTrendingNews.map((item, idx) => (
                  <TrendingCard key={idx} {...item} />
                ))}
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
        
        {/* Bottom Cards Row (Uttar Pradesh) */}
        <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
          <AutoScrollRow>
            {upBottomCards.map((card, idx) => (
              <Box key={idx} sx={{ minWidth: '230.22px', maxWidth: '230.22px', height: '129.5px', bgcolor: '#fff', borderRadius: 2, boxShadow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => navigate(`/state/${card.item.state ? card.item.state.toLowerCase() : 'all'}/${card.item.id}`)}>
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

export default StateNews; 