import React from 'react';
import { Card, Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const NewsCard = ({ item, isMain = false, articleStyle = false, showFullTitle = false }) => {
  return (
    <Card
      component={Link}
      to={`/news/${item.id}`}
      sx={{
        position: 'relative',
        width: '100%',
        height: articleStyle ? { xs: 300, md: 400 } : 
                isMain ? { xs: 350, md: 530 } : 
                { xs: 250, md: 260 },
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'block',
        textDecoration: 'none',
        color: 'white',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
        },
        mb: articleStyle ? 2 : 0,
      }}
    >
      {/* Background image */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${item.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        }}
      />

      {/* Dark overlay for better text readability */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 1,
        }}
      />

      {/* Category tag */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            backgroundColor: 
              item.category === 'TRENDING' ? '#FF5722' : 
              item.category === 'SPORTS' ? '#673AB7' :
              item.category === 'ENTERTAINMENT' ? '#E91E63' :
              item.category === 'BUSINESS' ? '#2196F3' :
              item.category === 'TECHNOLOGY' ? '#4CAF50' :
              item.category === 'NATIONAL' ? '#FFC107' : '#FF5722',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.7rem',
            padding: '4px 12px',
            borderRadius: '4px',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}
        >
          {item.category}
        </Box>
      </Box>

      {/* Title and time */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          padding: '16px',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.9))',
          zIndex: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: isMain ? '1.5rem' : articleStyle ? '1.2rem' : '1.1rem',
            fontWeight: '600',
            mb: 2,
            lineHeight: 1.3,
          }}
        >
          {item.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccessTimeIcon sx={{ fontSize: '0.9rem', mr: 0.5, opacity: 0.9 }} />
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.8rem',
              opacity: 0.9,
            }}
          >
            {item.time}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

export default NewsCard; 