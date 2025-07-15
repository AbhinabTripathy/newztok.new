import React from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';
import NewsCard from './NewsCard';

const NewsFeed = () => {
  // News items matching the first image exactly
  const newsItems = [
    {
      id: 1,
      category: 'TRENDING',
      title: 'जदयू नेता नायब गुलाम रसूल बलियावी भी पार्टी को कहेंगे अलविदा, कहा- सीएम नीतीश से हुई है चूक',
      image: 'https://i.ibb.co/P9KXFBJ/politician-india.jpg',
      time: 'April 10, 2025, 8:19 P.M.',
    },
    {
      id: 2,
      category: 'SPORTS',
      title: 'IPL 2025 में धोनी बने चेन्नई के कप्तान, हुआ ऐलान',
      image: 'https://i.ibb.co/RvRNB5j/dhoni-csk.jpg',
      time: 'April 10, 2025, 7:48 P.M.',
    },
    {
      id: 3,
      category: 'SPORTS',
      title: 'ओलंपिक में 128 साल बाद क्रिकेट की वापसी, छह ...',
      image: 'https://i.ibb.co/5srJ13Y/cricket-stadium.jpg',
      time: 'April 10, 2025, 7:39 P.M.',
    },
    {
      id: 4,
      category: 'TRENDING',
      title: 'महाकुंभ में अपने सास-ससुर को स्नान कराने न ले ...',
      image: 'https://i.ibb.co/VCFRfNT/train-india.jpg',
      time: 'April 10, 2025, 7:11 P.M.',
    },
    {
      id: 5,
      category: 'TRENDING',
      title: 'भारत लाया गया मुंबई आतंकी हमले का मास्टरमाइंड तहव्वुर ...',
      image: 'https://i.ibb.co/PmdtsG7/terrorist-news.jpg',
      time: 'April 10, 2025, 7:01 P.M.',
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Top section - Layout exactly matching the first image */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {/* Main featured news card */}
        <Grid item xs={12} md={6}>
          <NewsCard 
            item={newsItems[0]} 
            isMain={true} 
            showFullTitle={true}
          />
        </Grid>
        
        {/* Secondary news cards in a 2x2 grid */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <NewsCard item={newsItems[1]} showFullTitle={true} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <NewsCard item={newsItems[2]} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <NewsCard item={newsItems[3]} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <NewsCard item={newsItems[4]} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      
      {/* Advertisement Banner */}
      <Box 
        sx={{ 
          width: '100%', 
          height: 100, 
          bgcolor: '#E0E0E0', 
          mb: 3, 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          borderRadius: 1,
          position: 'relative',
        }}
      >
        970 x 100
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
          Powered by HTML.COM
        </Typography>
      </Box>
      
      {/* Bottom section - Two cards horizontally displayed */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <NewsCard 
            item={newsItems[0]} 
            articleStyle={true}
            showFullTitle={true}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <NewsCard 
            item={newsItems[1]} 
            articleStyle={true}
            showFullTitle={true}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default NewsFeed; 