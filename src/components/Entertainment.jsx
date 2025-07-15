import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Entertainment = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sideAd, setSideAd] = useState(null);
  const [bannerAd, setBannerAd] = useState(null);
  const [sideLoading, setSideLoading] = useState(true);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [sideError, setSideError] = useState(null);
  const [bannerError, setBannerError] = useState(null);
  const navigate = useNavigate();

  const baseUrl = 'https://api.newztok.in';

  useEffect(() => {
    fetchEntertainmentNews();
    fetchSideAd();
    fetchBannerAd();
  }, []);

  const fetchEntertainmentNews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching entertainment news from endpoint...');
      const response = await axios.get('https://api.newztok.in/api/news/category/entertainment');
      console.log('API Response:', response);
      
      let fetchedNews = [];
      if (response.data && Array.isArray(response.data)) {
        fetchedNews = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        fetchedNews = response.data.data;
      } else if (response.data && response.data.posts && Array.isArray(response.data.posts)) {
        fetchedNews = response.data.posts;
      } else {
        console.warn('Unexpected API response structure:', response.data);
        setError('Unexpected data format received from server');
        fetchedNews = [];
      }
      
      console.log(`Total fetched news items: ${fetchedNews.length}`);
      setNewsItems(fetchedNews);
    } catch (err) {
      console.error('Error fetching entertainment news:', err);
      if (err.response) {
        setError(`Server error (${err.response.status}): ${err.response.data.message || 'Unable to fetch news'}`);
      } else if (err.request) {
        setError('Network error: No response from server. Please check your connection.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSideAd = async () => {
    try {
      setSideLoading(true);
      setSideError(null);
      const response = await axios.get(`${baseUrl}/api/ads/public/web/side`);
      if (response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        setSideAd(response.data.data[0]);
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

  const fetchBannerAd = async () => {
    try {
      setBannerLoading(true);
      setBannerError(null);
      const response = await axios.get(`${baseUrl}/api/ads/public/web/banner`);
      if (response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        setBannerAd(response.data.data[0]);
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

  // Convert news data to video format for NewsCard
  const convertNewsToVideoFormat = (news) => {
    const hasVideo = news.hasVideo || news.video || news.videoPath || 
                    (news.featuredImage && news.featuredImage.includes('/uploads/videos/video-')) ||
                    (news.image && news.image.includes('/uploads/videos/video-'));
    
    return {
      image: getImageUrl(news),
      title: news.title,
      timestamp: formatDate(news.createdAt || news.publishedAt || news.updatedAt),
      time: formatTime(news.createdAt || news.publishedAt || news.updatedAt),
      isVideo: hasVideo,
      id: news.id,
      category: news.category || 'ENTERTAINMENT'
    };
  };

  // Convert news data to trending format
  const convertNewsToTrendingFormat = (news) => ({
    image: getImageUrl(news),
    title: news.title,
    date: formatDate(news.createdAt || news.publishedAt || news.updatedAt),
    id: news.id
  });

  // Get image URL with proper handling
  const getImageUrl = (item) => {
    if (item.youtubeUrl) {
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = item.youtubeUrl.match(youtubeRegex);
      if (match && match[1]) {
        return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
      }
    }
    
    if (item.images && item.images.length > 0) {
      return item.images[0];
    }
    
    if (item.featuredImage && !item.featuredImage.includes('/uploads/videos/video-')) {
      return item.featuredImage.startsWith('http') ? item.featuredImage : `${baseUrl}${item.featuredImage}`;
    }
    
    if (item.image && !item.image.includes('/uploads/videos/video-')) {
      return item.image.startsWith('http') ? item.image : `${baseUrl}${item.image}`;
    }
    
    return 'https://placehold.co/800x400/8E24AA/FFFFFF/png?text=Entertainment+News';
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (err) {
      return 'Recent';
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
      return '';
    }
  };

  // Capitalize first letter
  const capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // NewsCard component matching the reference structure
  const NewsCard = ({ image, title, timestamp, isVideo = false, id, category }) => {
    const [imageError, setImageError] = useState(false);
    
    const handleClick = () => {
      navigate(`/entertainment/${id}`);
    };
    
    return (
      <Box 
        sx={{ 
          width: '528.82px', 
          height: '480px', 
          bgcolor: '#fff', 
          borderRadius: 2, 
          boxShadow: 1, 
          overflow: 'hidden',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 3
          }
        }}
        onClick={handleClick}
      >
        {/* Title Section - 25% height */}
        <Box sx={{ height: '25%', p: 2, display: 'flex', alignItems: 'center' }}>
          <Typography 
            sx={{ 
              fontSize: '1.1rem', 
              fontWeight: '700', 
              color: '#222', 
              lineHeight: 1.3,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* Media Section - 55% height */}
        <Box sx={{ height: '55%', position: 'relative' }}>
          {!imageError ? (
            <Box
              component="img"
              src={image}
              alt={title}
              onError={() => setImageError(true)}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999'
              }}
            >
              Entertainment News
            </Box>
          )}
          
          {isVideo && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                backgroundColor: '#FF0000',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              <Box component="span">▶</Box>
              VIDEO
            </Box>
          )}
          
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: '#8E24AA',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}
          >
            {category}
          </Box>
        </Box>

        {/* Location and Date Section - 20% height */}
        <Box sx={{ height: '20%', p: 2, display: 'flex', alignItems: 'center', borderTop: '1px solid #f0f0f0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
            <Box
              component="span"
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: '#8E24AA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 'bold'
              }}
            >
              E
            </Box>
            <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
              {capitalizeFirstLetter(category || 'Entertainment')}
            </Typography>
            <Box sx={{ mx: 1, color: '#ccc' }}>•</Box>
            <Typography variant="body2" sx={{ color: '#666' }}>
              {timestamp}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  // TrendingCard component
  const TrendingCard = ({ image, title, date, id }) => {
    const [imageError, setImageError] = useState(false);
    
    const handleClick = () => {
      navigate(`/entertainment/${id}`);
    };
    
    return (
      <Paper 
        elevation={0} 
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
          '&:hover': {
            backgroundColor: 'rgba(142, 36, 170, 0.05)',
          }
        }}
        onClick={handleClick}
      >
        <Box sx={{ width: 60, height: 60, flexShrink: 0 }}>
          {!imageError ? (
            <Box
              component="img"
              src={image}
              alt="trending"
              onError={() => setImageError(true)}
              sx={{ width: '100%', height: '100%', borderRadius: 1, objectFit: 'cover' }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                backgroundColor: '#f0f0f0',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                fontSize: '0.7rem'
              }}
            >
              ENT
            </Box>
          )}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            sx={{ 
              fontSize: 13, 
              fontWeight: 500, 
              color: '#222', 
              lineHeight: 1.2, 
              mb: 0.5, 
              overflow: 'hidden', 
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {title}
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#888' }}>{date}</Typography>
        </Box>
      </Paper>
    );
  };

  // AdCard component
  const AdCard = ({ image, height = 198.38 }) => {
    const handleAdClick = () => {
      if (sideAd && sideAd.redirectUrl) {
        window.open(sideAd.redirectUrl, '_blank', 'noopener,noreferrer');
      }
    };

    if (sideLoading) {
      return (
        <Box 
          sx={{ 
            width: '280px', 
            height: height, 
            bgcolor: '#f5f5f5', 
            mb: 2,
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
            width: '280px', 
            height: height, 
            bgcolor: '#E0E0E0', 
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            borderRadius: 1,
            position: 'relative',
          }}
        >
          Ad
          <Typography 
            variant="caption" 
            sx={{ 
              position: 'absolute', 
              bottom: 5, 
              right: 5, 
              fontSize: '0.6rem',
              color: '#AAA' 
            }}
          >
            NewzTok
          </Typography>
        </Box>
      );
    }

    return (
      <Box 
        sx={{ 
          width: '280px', 
          height: height, 
          mb: 2,
          borderRadius: 1,
          overflow: 'hidden',
          cursor: 'pointer',
          position: 'relative',
        }}
        onClick={handleAdClick}
      >
        <Box 
          component="img"
          src={sideAd.imageUrl ? (sideAd.imageUrl.startsWith('http') ? sideAd.imageUrl : `${baseUrl}${sideAd.imageUrl}`) : image}
          alt="Advertisement"
          sx={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
          }}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/280x198?text=Advertisement";
          }}
        />
        <Typography 
          variant="caption" 
          sx={{ 
            position: 'absolute', 
            bottom: 5, 
            right: 5, 
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
              onClick={() => navigate(`/entertainment/${card.id}`)}
            >
              <Box
                component="img"
                src={card.image}
                alt={card.alt}
                sx={{ width: '100%', height: `${height}px`, objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = 'https://placehold.co/370x210/8E24AA/FFFFFF/png?text=Entertainment+News';
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

  // Loading component
  const LoadingSpinner = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
      <CircularProgress sx={{ color: '#8E24AA' }} />
    </Box>
  );

  // Error component
  const ErrorMessage = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom color="error">
        {error}
      </Typography>
      <Typography 
        variant="body2" 
        component="button"
        onClick={fetchEntertainmentNews}
        sx={{ 
          background: 'none', 
          border: 'none', 
          color: '#8E24AA', 
          cursor: 'pointer',
          textDecoration: 'underline',
          mt: 2
        }}
      >
        Try Again
      </Typography>
    </Box>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage />;
  }

  const videoNews = newsItems.slice(0, 5).map(convertNewsToVideoFormat);
  const trendingNews = newsItems.slice(5, 20).map(convertNewsToTrendingFormat);
  const bottomCards = newsItems.slice(0, 18).map(convertNewsToVideoFormat);
  const mostSharedCards = newsItems.slice(0, 10).map(news => ({
    image: getImageUrl(news),
    alt: news.title,
    text: news.title,
    id: news.id
  }));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, px: 4, pt: 3, pb: 0 }}>
        {/* Top Entertainment News Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={7} lg={7}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>Top Entertainment News</Typography>
            <Box sx={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1, maxWidth: '520px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>VIDEOS</Typography>
                {videoNews.map((news, idx) => (
                  <Box key={idx} sx={{ mb: 3 }}>
                    <NewsCard {...news} />
                  </Box>
                ))}
              </Box>
              
              {/* Trending Section */}
              <Box sx={{ minWidth: '369px', maxWidth: '369px', flexShrink: 0, mx: 5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>TRENDING</Typography>
                {trendingNews.map((item, idx) => (
                  <TrendingCard key={idx} {...item} />
                ))}
              </Box>
              
              {/* Ad Section */}
              <Box sx={{ minWidth: '280px', maxWidth: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        {/* Bottom Cards Row (Top News) */}
        <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
          <AutoScrollRow>
            {bottomCards.map((card, idx) => (
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
                onClick={() => navigate(`/entertainment/${card.id}`)}
              >
                <Box
                  component="img"
                  src={card.image}
                  alt={card.title}
                  sx={{ width: '100%', height: '60%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/230x78/8E24AA/FFFFFF/png?text=Entertainment';
                  }}
                />
                <Box sx={{ p: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#222', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {card.title}
                  </Typography>
                </Box>
              </Box>
            ))}
          </AutoScrollRow>
        </Box>
        
        {/* Other Entertainment News Section */}
        <Grid container spacing={3} sx={{ mt: 8 }}>
          <Grid item xs={12} md={7} lg={7}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>Other Entertainment News</Typography>
            <Box sx={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1, maxWidth: '520px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>VIDEOS</Typography>
                {videoNews.map((news, idx) => (
                  <Box key={idx} sx={{ mb: 3 }}>
                    <NewsCard {...news} />
                  </Box>
                ))}
              </Box>
              
              {/* Latest News Section */}
              <Box sx={{ minWidth: '369px', maxWidth: '369px', flexShrink: 0, mx: 5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>LATEST NEWS</Typography>
                {trendingNews.map((item, idx) => (
                  <TrendingCard key={idx} {...item} />
                ))}
              </Box>
              
              {/* Ad Section */}
              <Box sx={{ minWidth: '280px', maxWidth: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        {/* Bottom Cards Row (Other News) */}
        <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
          <AutoScrollRow>
            {bottomCards.map((card, idx) => (
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
                onClick={() => navigate(`/entertainment/${card.id}`)}
              >
                <Box
                  component="img"
                  src={card.image}
                  alt={card.title}
                  sx={{ width: '100%', height: '60%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/230x78/8E24AA/FFFFFF/png?text=Entertainment';
                  }}
                />
                <Box sx={{ p: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#222', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                MOST SHARED ENTERTAINMENT NEWS
              </Typography>
            </Box>
            <Box sx={{ height: '2px', width: '100%', bgcolor: 'transparent', mb: 3, position: 'relative' }}>
              <Box sx={{ position: 'absolute', left: 0, top: 0, width: '300px', height: '2px', bgcolor: '#8E24AA' }} />
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

export default Entertainment; 