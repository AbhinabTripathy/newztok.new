import React, { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';

// Basic Display Ad Component
export const DisplayAd = ({ adSlot, style = {} }) => {
  const adRef = useRef(null);

  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } else {
        const checkAdsbygoogle = setInterval(() => {
          if (window.adsbygoogle) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            clearInterval(checkAdsbygoogle);
          }
        }, 100);
        setTimeout(() => clearInterval(checkAdsbygoogle), 10000);
      }
    } catch (e) {
      console.error('Display Ad error:', e);
    }
  }, []);

  return (
    <Box 
      sx={{ 
        textAlign: 'center', 
        my: 3,
        minHeight: '90px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...style
      }}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-4921721616009568"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </Box>
  );
};

// In-Article Ad Component
export const InArticleAd = ({ adSlot, style = {} }) => {
  const adRef = useRef(null);

  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } else {
        const checkAdsbygoogle = setInterval(() => {
          if (window.adsbygoogle) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            clearInterval(checkAdsbygoogle);
          }
        }, 100);
        setTimeout(() => clearInterval(checkAdsbygoogle), 10000);
      }
    } catch (e) {
      console.error('In-Article Ad error:', e);
    }
  }, []);

  return (
    <Box 
      sx={{ 
        textAlign: 'center', 
        my: 4,
        minHeight: '250px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...style
      }}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client="ca-pub-4921721616009568"
        data-ad-slot={adSlot}
      />
    </Box>
  );
};

// In-Feed Ad Component
export const InFeedAd = ({ adSlot, style = {} }) => {
  const adRef = useRef(null);

  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } else {
        const checkAdsbygoogle = setInterval(() => {
          if (window.adsbygoogle) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            clearInterval(checkAdsbygoogle);
          }
        }, 100);
        setTimeout(() => clearInterval(checkAdsbygoogle), 10000);
      }
    } catch (e) {
      console.error('In-Feed Ad error:', e);
    }
  }, []);

  return (
    <Box 
      sx={{ 
        textAlign: 'center', 
        my: 2,
        minHeight: '200px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...style
      }}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-format="fluid"
        data-ad-layout-key="-fb+5w+4e-db+86"
        data-ad-client="ca-pub-4921721616009568"
        data-ad-slot={adSlot}
      />
    </Box>
  );
};

// Sidebar Ad Component
export const SidebarAd = ({ adSlot, style = {} }) => {
  const adRef = useRef(null);

  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } else {
        const checkAdsbygoogle = setInterval(() => {
          if (window.adsbygoogle) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            clearInterval(checkAdsbygoogle);
          }
        }, 100);
        setTimeout(() => clearInterval(checkAdsbygoogle), 10000);
      }
    } catch (e) {
      console.error('Sidebar Ad error:', e);
    }
  }, []);

  return (
    <Box 
      sx={{ 
        textAlign: 'center', 
        my: 2,
        minHeight: '600px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...style
      }}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-4921721616009568"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="false"
      />
    </Box>
  );
};

// Banner Ad Component
export const BannerAd = ({ adSlot, style = {} }) => {
  const adRef = useRef(null);

  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } else {
        const checkAdsbygoogle = setInterval(() => {
          if (window.adsbygoogle) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            clearInterval(checkAdsbygoogle);
          }
        }, 100);
        setTimeout(() => clearInterval(checkAdsbygoogle), 10000);
      }
    } catch (e) {
      console.error('Banner Ad error:', e);
    }
  }, []);

  return (
    <Box 
      sx={{ 
        textAlign: 'center', 
        my: 2,
        minHeight: '90px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...style
      }}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'inline-block', width: '728px', height: '90px' }}
        data-ad-client="ca-pub-4921721616009568"
        data-ad-slot={adSlot}
      />
    </Box>
  );
};

// Mobile Banner Ad Component
export const MobileBannerAd = ({ adSlot, style = {} }) => {
  const adRef = useRef(null);

  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } else {
        const checkAdsbygoogle = setInterval(() => {
          if (window.adsbygoogle) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            clearInterval(checkAdsbygoogle);
          }
        }, 100);
        setTimeout(() => clearInterval(checkAdsbygoogle), 10000);
      }
    } catch (e) {
      console.error('Mobile Banner Ad error:', e);
    }
  }, []);

  return (
    <Box 
      sx={{ 
        textAlign: 'center', 
        my: 2,
        minHeight: '50px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...style
      }}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'inline-block', width: '320px', height: '50px' }}
        data-ad-client="ca-pub-4921721616009568"
        data-ad-slot={adSlot}
      />
    </Box>
  );
};

// Ad Placeholder Component (for development/testing)
export const AdPlaceholder = ({ type = 'Ad', style = {} }) => {
  return (
    <Box 
      sx={{ 
        textAlign: 'center', 
        my: 2,
        minHeight: '90px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        border: '2px dashed #ccc',
        borderRadius: '8px',
        ...style
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {type} Placeholder
      </Typography>
    </Box>
  );
};

// Main AdComponent with type selection
const AdComponent = ({ 
  type = 'display', 
  adSlot = '1234567890', 
  style = {},
  showPlaceholder = false 
}) => {
  // Show placeholder in development or when requested
  if (showPlaceholder || process.env.NODE_ENV === 'development') {
    return <AdPlaceholder type={type} style={style} />;
  }

  switch (type.toLowerCase()) {
    case 'in-article':
      return <InArticleAd adSlot={adSlot} style={style} />;
    case 'in-feed':
      return <InFeedAd adSlot={adSlot} style={style} />;
    case 'sidebar':
      return <SidebarAd adSlot={adSlot} style={style} />;
    case 'banner':
      return <BannerAd adSlot={adSlot} style={style} />;
    case 'mobile-banner':
      return <MobileBannerAd adSlot={adSlot} style={style} />;
    case 'display':
    default:
      return <DisplayAd adSlot={adSlot} style={style} />;
  }
};

export default AdComponent; 