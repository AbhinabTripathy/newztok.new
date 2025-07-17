import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const AdComponent = ({ 
  adSlot = '1234567890', 
  adFormat = 'auto', 
  fullWidthResponsive = true,
  style = {},
  className = ''
}) => {
  const adRef = useRef(null);

  useEffect(() => {
    try {
      // Wait for adsbygoogle to be available
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } else {
        // If adsbygoogle is not loaded yet, wait for it
        const checkAdsbygoogle = setInterval(() => {
          if (window.adsbygoogle) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            clearInterval(checkAdsbygoogle);
          }
        }, 100);

        // Clear interval after 10 seconds to prevent infinite checking
        setTimeout(() => clearInterval(checkAdsbygoogle), 10000);
      }
    } catch (e) {
      console.error('AdSense error:', e);
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
      className={className}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-4921721616009568"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </Box>
  );
};

export default AdComponent; 