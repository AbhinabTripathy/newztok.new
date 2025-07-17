import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';
import AdComponent, { 
  DisplayAd, 
  InArticleAd, 
  InFeedAd, 
  SidebarAd, 
  BannerAd, 
  MobileBannerAd,
  AdPlaceholder 
} from './AdSenseAds';

// Example component showing how to use different ad types
const AdExamples = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ mb: 4 }}>
        Google AdSense Integration Examples
      </Typography>

      {/* Banner Ad Example */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Banner Ad (728x90)
        </Typography>
        <BannerAd adSlot="1234567890" />
      </Box>

      {/* Mobile Banner Ad Example */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Mobile Banner Ad (320x50)
        </Typography>
        <MobileBannerAd adSlot="1234567891" />
      </Box>

      {/* Display Ad Example */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Display Ad (Responsive)
        </Typography>
        <DisplayAd adSlot="1234567892" />
      </Box>

      {/* In-Article Ad Example */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          In-Article Ad
        </Typography>
        <InArticleAd adSlot="1234567893" />
      </Box>

      {/* In-Feed Ad Example */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          In-Feed Ad
        </Typography>
        <InFeedAd adSlot="1234567894" />
      </Box>

      {/* Sidebar Ad Example */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Sidebar Ad
        </Typography>
        <SidebarAd adSlot="1234567895" />
      </Box>

      {/* Generic AdComponent Examples */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Generic AdComponent with Different Types
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <AdComponent type="display" adSlot="1234567896" />
          </Grid>
          <Grid item xs={12} md={6}>
            <AdComponent type="banner" adSlot="1234567897" />
          </Grid>
        </Grid>
      </Box>

      {/* Development Placeholder Example */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Development Placeholder (shown in development mode)
        </Typography>
        <AdComponent type="display" adSlot="1234567898" showPlaceholder={true} />
      </Box>
    </Container>
  );
};

export default AdExamples;

// Example of how to integrate ads in different components:

/*
// 1. In NewsDetail.jsx - After article content
<Box dangerouslySetInnerHTML={{ __html: newsData.content }} />
<AdComponent type="in-article" adSlot="1234567890" />

// 2. In HomeScreen.jsx - Between news sections
<Grid container spacing={2}>
  <Grid item xs={12} md={8}>
    <NewsSection />
  </Grid>
  <Grid item xs={12} md={4}>
    <AdComponent type="sidebar" adSlot="1234567891" />
  </Grid>
</Grid>

// 3. In Header.jsx - Banner ad at top
<Box sx={{ width: '100%', mb: 2 }}>
  <AdComponent type="banner" adSlot="1234567892" />
</Box>

// 4. In Footer.jsx - Banner ad at bottom
<Box sx={{ width: '100%', mt: 2 }}>
  <AdComponent type="banner" adSlot="1234567893" />
</Box>

// 5. In news feed - In-feed ads
{newsItems.map((item, index) => (
  <React.Fragment key={item.id}>
    <NewsCard item={item} />
    {(index + 1) % 5 === 0 && (
      <AdComponent type="in-feed" adSlot="1234567894" />
    )}
  </React.Fragment>
))}

// 6. Responsive ads for mobile/desktop
<Box sx={{ display: { xs: 'none', md: 'block' } }}>
  <BannerAd adSlot="1234567895" />
</Box>
<Box sx={{ display: { xs: 'block', md: 'none' } }}>
  <MobileBannerAd adSlot="1234567896" />
</Box>
*/ 