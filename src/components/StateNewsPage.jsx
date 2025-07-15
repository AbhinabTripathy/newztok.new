import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  OutlinedInput
} from '@mui/material';
import axios from 'axios';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const baseUrl = 'https://api.newztok.in';

const StateNewsPage = () => {
  const { state } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [districtNews, setDistrictNews] = useState([]);
  const [districtNewsLoading, setDistrictNewsLoading] = useState(false);
  const [adImages, setAdImages] = useState([]);

  // Map state names to their Hindi names and endpoints
  const stateConfig = {
    'jharkhand': {
      hindi: 'झारखंड',
      endpoint: 'api/news/state/jharkhand',
      bannerColor: '#7B1FA2'
    },
    'bihar': {
      hindi: 'बिहार',
      endpoint: 'api/news/state/bihar',
      bannerColor: '#1565C0'
    },
    'uttar-pradesh': {
      hindi: 'उत्तर प्रदेश',
      endpoint: 'api/news/state/up',
      bannerColor: '#C62828'
    }
  };

  // District data for each state
  const districtData = {
    jharkhand: [
      { hindi: "रांची", english: "Ranchi", value: "ranchi" },
      { hindi: "जमशेदपुर", english: "Jamshedpur", value: "jamshedpur" },
      { hindi: "धनबाद", english: "Dhanbad", value: "dhanbad" },
      { hindi: "बोकारो", english: "Bokaro", value: "bokaro" },
      { hindi: "देवघर", english: "Deoghar", value: "deoghar" },
      { hindi: "हजारीबाग", english: "Hazaribagh", value: "hazaribagh" },
      { hindi: "गिरिडीह", english: "Giridih", value: "giridih" },
      { hindi: "कोडरमा", english: "Koderma", value: "koderma" },
      { hindi: "चतरा", english: "Chatra", value: "chatra" },
      { hindi: "गुमला", english: "Gumla", value: "gumla" },
      { hindi: "लातेहार", english: "Latehar", value: "latehar" },
      { hindi: "लोहरदगा", english: "Lohardaga", value: "lohardaga" },
      { hindi: "पाकुड़", english: "Pakur", value: "pakur" },
      { hindi: "पलामू", english: "Palamu", value: "palamu" },
      { hindi: "रामगढ़", english: "Ramgarh", value: "ramgarh" },
      { hindi: "साहिबगंज", english: "Sahibganj", value: "sahibganj" },
      { hindi: "सिमडेगा", english: "Simdega", value: "simdega" },
      { hindi: "सिंहभूम", english: "Singhbhum", value: "singhbhum" },
      { hindi: "सरायकेला खरसावां", english: "Seraikela Kharsawan", value: "seraikela-kharsawan" },
      { hindi: "पूर्वी सिंहभूम", english: "East Singhbhum", value: "east-singhbhum" },
      { hindi: "पश्चिमी सिंहभूम", english: "West Singhbhum", value: "west-singhbhum" },
      { hindi: "डुमका", english: "Dumka", value: "dumka" },
      { hindi: "गढ़वा", english: "Garhwa", value: "garhwa" },
      { hindi: "गोड्डा", english: "Godda", value: "godda" }
    ],
    bihar: [
      { hindi: "पटना", english: "Patna", value: "patna" },
      { hindi: "गया", english: "Gaya", value: "gaya" },
      { hindi: "मुंगेर", english: "Munger", value: "munger" },
      { hindi: "भागलपुर", english: "Bhagalpur", value: "bhagalpur" },
      { hindi: "पूर्णिया", english: "Purnia", value: "purnia" },
      { hindi: "दरभंगा", english: "Darbhanga", value: "darbhanga" },
      { hindi: "मुजफ्फरपुर", english: "Muzaffarpur", value: "muzaffarpur" },
      { hindi: "सहरसा", english: "Saharsa", value: "saharsa" },
      { hindi: "सीतामढ़ी", english: "Sitamarhi", value: "sitamarhi" },
      { hindi: "वैशाली", english: "Vaishali", value: "vaishali" },
      { hindi: "सिवान", english: "Siwan", value: "siwan" },
      { hindi: "सारण", english: "Saran", value: "saran" },
      { hindi: "गोपालगंज", english: "Gopalganj", value: "gopalganj" },
      { hindi: "बेगूसराय", english: "Begusarai", value: "begusarai" },
      { hindi: "समस्तीपुर", english: "Samastipur", value: "samastipur" },
      { hindi: "मधुबनी", english: "Madhubani", value: "madhubani" },
      { hindi: "सुपौल", english: "Supaul", value: "supaul" },
      { hindi: "अररिया", english: "Araria", value: "araria" },
      { hindi: "किशनगंज", english: "Kishanganj", value: "kishanganj" },
      { hindi: "कटिहार", english: "Katihar", value: "katihar" },
      { hindi: "पूर्वी चंपारण", english: "East Champaran", value: "east-champaran" },
      { hindi: "पश्चिमी चंपारण", english: "West Champaran", value: "west-champaran" },
      { hindi: "शिवहर", english: "Sheohar", value: "sheohar" },
      { hindi: "मधेपुरा", english: "Madhepura", value: "madhepura" },
      { hindi: "अरवल", english: "Arwal", value: "arwal" },
      { hindi: "औरंगाबाद", english: "Aurangabad", value: "aurangabad-bihar" },
      { hindi: "बांका", english: "Banka", value: "banka" },
      { hindi: "भोजपुर", english: "Bhojpur", value: "bhojpur" },
      { hindi: "बक्सर", english: "Buxar", value: "buxar" },
      { hindi: "जमुई", english: "Jamui", value: "jamui" },
      { hindi: "जहानाबाद", english: "Jehanabad", value: "jehanabad" },
      { hindi: "कैमूर", english: "Kaimur", value: "kaimur" },
      { hindi: "खगरिया", english: "Khagaria", value: "khagaria" },
      { hindi: "लखीसराय", english: "Lakhisarai", value: "lakhisarai" },
      { hindi: "नालंदा", english: "Nalanda", value: "nalanda" },
      { hindi: "नवादा", english: "Nawada", value: "nawada" },
      { hindi: "रोहतास", english: "Rohtas", value: "rohtas" },
      { hindi: "शेखपुरा", english: "Sheikhpura", value: "sheikhpura" }
    ],
    "up": [
      { hindi: "लखनऊ", english: "Lucknow", value: "lucknow" },
      { hindi: "कानपुर", english: "Kanpur", value: "kanpur" },
      { hindi: "आगरा", english: "Agra", value: "agra" },
      { hindi: "वाराणसी", english: "Varanasi", value: "varanasi" },
      { hindi: "प्रयागराज", english: "Prayagraj", value: "prayagraj" },
      { hindi: "मेरठ", english: "Meerut", value: "meerut" },
      { hindi: "नोएडा", english: "Noida", value: "noida" },
      { hindi: "गाजियाबाद", english: "Ghaziabad", value: "ghaziabad" },
      { hindi: "बरेली", english: "Bareilly", value: "bareilly" },
      { hindi: "अलीगढ़", english: "Aligarh", value: "aligarh" },
      { hindi: "मुरादाबाद", english: "Moradabad", value: "moradabad" },
      { hindi: "सहारनपुर", english: "Saharanpur", value: "saharanpur" },
      { hindi: "गोरखपुर", english: "Gorakhpur", value: "gorakhpur" },
      { hindi: "फैजाबाद", english: "Faizabad", value: "faizabad" },
      { hindi: "जौनपुर", english: "Jaunpur", value: "jaunpur" },
      { hindi: "मथुरा", english: "Mathura", value: "mathura" },
      { hindi: "बलिया", english: "Ballia", value: "ballia" },
      { hindi: "रायबरेली", english: "Rae Bareli", value: "rae-bareli" },
      { hindi: "सुल्तानपुर", english: "Sultanpur", value: "sultanpur" },
      { hindi: "फतेहपुर", english: "Fatehpur", value: "fatehpur" },
      { hindi: "प्रतापगढ़", english: "Pratapgarh", value: "pratapgarh" },
      { hindi: "कौशाम्बी", english: "Kaushambi", value: "kaushambi" },
      { hindi: "झांसी", english: "Jhansi", value: "jhansi" },
      { hindi: "ललितपुर", english: "Lalitpur", value: "lalitpur" },
      { hindi: "अम्बेडकर नगर", english: "Ambedkar Nagar", value: "ambedkar-nagar" },
      { hindi: "अमेठी", english: "Amethi", value: "amethi" },
      { hindi: "अमरोहा", english: "Amroha", value: "amroha" },
      { hindi: "औरैया", english: "Auraiya", value: "auraiya" },
      { hindi: "अयोध्या", english: "Ayodhya", value: "ayodhya" },
      { hindi: "आजमगढ़", english: "Azamgarh", value: "azamgarh" },
      { hindi: "बागपत", english: "Baghpat", value: "baghpat" },
      { hindi: "बहराइच", english: "Bahraich", value: "bahraich" },
      { hindi: "बलरामपुर", english: "Balrampur", value: "balrampur" },
      { hindi: "बांदा", english: "Banda", value: "banda" },
      { hindi: "बाराबंकी", english: "Barabanki", value: "barabanki" },
      { hindi: "बस्ती", english: "Basti", value: "basti" },
      { hindi: "भदोही", english: "Bhadohi", value: "bhadohi" },
      { hindi: "बिजनौर", english: "Bijnor", value: "bijnor" },
      { hindi: "बदायूं", english: "Budaun", value: "budaun" },
      { hindi: "बुलंदशहर", english: "Bulandshahr", value: "bulandshahr" },
      { hindi: "चंदौली", english: "Chandauli", value: "chandauli" },
      { hindi: "चित्रकूट", english: "Chitrakoot", value: "chitrakoot" },
      { hindi: "देवरिया", english: "Deoria", value: "deoria" },
      { hindi: "एटा", english: "Etah", value: "etah" },
      { hindi: "इटावा", english: "Etawah", value: "etawah" },
      { hindi: "फर्रुखाबाद", english: "Farrukhabad", value: "farrukhabad" },
      { hindi: "फिरोजाबाद", english: "Firozabad", value: "firozabad" },
      { hindi: "गौतम बुद्ध नगर", english: "Gautam Buddha Nagar", value: "gautam-buddha-nagar" },
      { hindi: "गाजीपुर", english: "Ghazipur", value: "ghazipur" },
      { hindi: "गोंडा", english: "Gonda", value: "gonda" },
      { hindi: "हमीरपुर", english: "Hamirpur", value: "hamirpur" },
      { hindi: "हापुड़", english: "Hapur", value: "hapur" },
      { hindi: "हरदोई", english: "Hardoi", value: "hardoi" },
      { hindi: "हाथरस", english: "Hathras", value: "hathras" },
      { hindi: "जालौन", english: "Jalaun", value: "jalaun" },
      { hindi: "कन्नौज", english: "Kannauj", value: "kannauj" },
      { hindi: "कानपुर देहात", english: "Kanpur Dehat", value: "kanpur-dehat" },
      { hindi: "कानपुर नगर", english: "Kanpur Nagar", value: "kanpur-nagar" },
      { hindi: "कासगंज", english: "Kasganj", value: "kasganj" },
      { hindi: "खीरी", english: "Kheri", value: "kheri" },
      { hindi: "कुशीनगर", english: "Kushinagar", value: "kushinagar" },
      { hindi: "महोबा", english: "Mahoba", value: "mahoba" },
      { hindi: "महराजगंज", english: "Mahrajganj", value: "mahrajganj" },
      { hindi: "मैनपुरी", english: "Mainpuri", value: "mainpuri" },
      { hindi: "मऊ", english: "Mau", value: "mau" },
      { hindi: "मिर्जापुर", english: "Mirzapur", value: "mirzapur" },
      { hindi: "मुजफ्फरनगर", english: "Muzaffarnagar", value: "muzaffarnagar" },
      { hindi: "पीलीभीत", english: "Pilibhit", value: "pilibhit" },
      { hindi: "रामपुर", english: "Rampur", value: "rampur" },
      { hindi: "संभल", english: "Sambhal", value: "sambhal" },
      { hindi: "संत कबीर नगर", english: "Sant Kabir Nagar", value: "sant-kabir-nagar" },
      { hindi: "शाहजहांपुर", english: "Shahjahanpur", value: "shahjahanpur" },
      { hindi: "शामली", english: "Shamli", value: "shamli" },
      { hindi: "श्रावस्ती", english: "Shrawasti", value: "shrawasti" },
      { hindi: "सिद्धार्थनगर", english: "Siddharthnagar", value: "siddharthnagar" },
      { hindi: "सीतापुर", english: "Sitapur", value: "sitapur" },
      { hindi: "सोनभद्र", english: "Sonbhadra", value: "sonbhadra" },
      { hindi: "उन्नाव", english: "Unnao", value: "unnao" }
    ]
  };

  // Handler for district change
  const handleDistrictChange = (event) => {
    const district = event.target.value;
    setSelectedDistrict(district);
    
    if (district) {
      fetchDistrictNews(district);
    } else {
      setDistrictNews([]);
    }
  };

  // Function to fetch district-specific news
  const fetchDistrictNews = async (district) => {
    if (!district || !state) return;
    
    setDistrictNewsLoading(true);
    
    try {
      const stateParam = state === 'uttar-pradesh' ? 'up' : state;
      const response = await axios.get(`${baseUrl}/api/news/location/${stateParam}/${district}`);

      let newsData = [];
      if (Array.isArray(response.data)) {
        newsData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        newsData = response.data.data;
      }

      setDistrictNews(newsData);
    } catch (err) {
      console.error(`Error fetching news for district ${district}:`, err);
    } finally {
      setDistrictNewsLoading(false);
    }
  };

  useEffect(() => {
    const fetchStateNews = async () => {
      if (!state) return;
      
      setLoading(true);
      setSelectedDistrict('');
      setDistrictNews([]);

      try {
        const stateInfo = stateConfig[state];
        if (!stateInfo) {
          throw new Error('Invalid state');
        }

        const response = await axios.get(`${baseUrl}/${stateInfo.endpoint}`);

        let newsData = [];
        if (Array.isArray(response.data)) {
          newsData = response.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          newsData = response.data.data;
        }

        if (newsData.length === 0) {
          setError('No news available for this state');
        } else {
          setNews(newsData);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news. Please try again later.');
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStateNews();
  }, [state]);

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

  const capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
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
      
  // NewsCard component with modern styling
  const NewsCard = ({ image, title, timestamp, isVideo, item }) => {
    const handleCardClick = () => {
      navigate(`/state/${state}/${item.id || item._id}`);
    };

    return (
      <Box
        onClick={handleCardClick}
        sx={{
          cursor: 'pointer',
          width: '100%',
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
        {/* Title Section - 25% height */}
        <Box sx={{ height: '25%', p: 2, display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="h6"
            sx={{
              color: 'black',
              fontWeight: '700',
              lineHeight: 1.3,
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
        </Box>

        {/* Media Section - 55% height */}
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
                backgroundColor: stateConfig[state]?.bannerColor || '#673AB7',
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
        
        {/* Location and Date Section - 20% height */}
        <Box sx={{ height: '20%', p: 2, display: 'flex', alignItems: 'center', borderTop: '1px solid #f0f0f0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888' }}>
            <LocationOnIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
              {capitalizeFirstLetter(item?.district) || capitalizeFirstLetter(item?.location) || (state === 'uttar-pradesh' ? 'Uttar Pradesh' : state === 'jharkhand' ? 'Jharkhand' : 'Bihar')}
            </Typography>
            <FiberManualRecordIcon sx={{ fontSize: 6, mx: 0.5 }} />
            <AccessTimeIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2" sx={{ color: '#666' }}>
              {timestamp}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  // AdCard component
  const AdCard = ({ height }) => {
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
          borderRadius: 2,
          overflow: 'hidden',
          textDecoration: 'none',
          position: 'relative',
          cursor: 'pointer',
          boxShadow: 1,
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

  // TrendingCard component for sidebar
  const TrendingCard = ({ image, title, date, item }) => {
    const handleCardClick = () => {
      navigate(`/state/${state}/${item.id || item._id}`);
    };

    return (
      <Paper elevation={0} sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        minHeight: '88.96px',
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
    return newsArray.slice(0, 10).map(item => ({
      image: getFullImageUrl(item.featuredImage || item.image),
      title: item.title || 'No title available',
      date: formatDate(item.createdAt || item.updatedAt || item.publishedAt),
      item: item
    }));
  };

  const convertNewsToBottomCardsFormat = (newsArray) => {
    return newsArray.slice(0, 15).map(item => ({
      image: getFullImageUrl(item.featuredImage || item.image),
      title: item.title || 'No title available',
      item: item
    }));
  };

  const currentState = stateConfig[state];
  const districts = state ? districtData[state === 'uttar-pradesh' ? 'up' : state] || [] : [];

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
  const videoNews = convertNewsToVideoFormat(news);
  const trendingNews = convertNewsToTrendingFormat(news);
  const bottomCards = convertNewsToBottomCardsFormat(news);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', display: 'flex', flexDirection: 'column' }}>
      {/* State Banner */}
      <Box 
        sx={{ 
          width: '100%',
          position: 'relative',
          py: 8,
          color: 'white',
          textAlign: 'center',
          mb: 8,
          overflow: 'hidden',
          background: `linear-gradient(180deg, ${currentState?.bannerColor || '#1B5E20'} 0%, ${currentState?.bannerColor ? currentState.bannerColor + '99' : '#2E7D32'} 100%)`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: state === 'uttar-pradesh' ?
              `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath fill='%23FFFFFF' fill-opacity='0.15' d='M10,90 L10,60 L20,60 L20,70 L30,70 L30,60 L40,60 L40,70 L50,70 L50,60 L60,60 L60,70 L70,70 L70,60 L80,60 L80,90 L10,90 Z M20,60 L20,50 L30,40 L40,50 L40,60 L20,60 Z M60,60 L60,50 L70,40 L80,50 L80,60 L60,60 Z'/%3E%3C/svg%3E")` :
            state === 'jharkhand' ?
              `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath fill='%23FFFFFF' fill-opacity='0.15' d='M10,10 L20,20 L30,10 L40,20 L50,10 L60,20 L70,10 L80,20 L90,10 L90,30 L80,40 L90,50 L80,60 L90,70 L80,80 L90,90 L70,90 L60,80 L50,90 L40,80 L30,90 L20,80 L10,90 L10,70 L20,60 L10,50 L20,40 L10,30 L10,10 Z'/%3E%3C/svg%3E")` :
              `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='100' viewBox='0 0 200 100'%3E%3Cpath fill='%23FFFFFF' fill-opacity='0.15' d='M0,20 C40,10 60,30 100,20 C140,10 160,30 200,20 L200,30 C160,40 140,20 100,30 C60,40 40,20 0,30 L0,20 Z M0,50 C40,40 60,60 100,50 C140,40 160,60 200,50 L200,60 C160,70 140,50 100,60 C60,70 40,50 0,60 L0,50 Z M0,80 C40,70 60,90 100,80 C140,70 160,90 200,80 L200,90 C160,100 140,80 100,90 C60,100 40,80 0,90 L0,80 Z'/%3E%3C/svg%3E")`,
            backgroundSize: state === 'bihar' ? '200px 100px' : '100px 100px',
            backgroundPosition: 'center',
            zIndex: 1,
            opacity: 0.7,
            animation: 'backgroundScroll 30s linear infinite'
          },
          '@keyframes backgroundScroll': {
            '0%': { backgroundPosition: '0 0' },
            '100%': { backgroundPosition: state === 'bihar' ? '200px 0' : '100px 0' }
          }
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
            <Box sx={{ 
              display: 'inline-block',
              px: 6, 
              py: 3,
              position: 'relative',
              backgroundColor: 'rgba(0,0,0,0.3)',
              borderRadius: 4,
              backdropFilter: 'blur(4px)',
              boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontWeight: 800,
                  mb: 1.5,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  letterSpacing: '1px'
                }}
              >
                {state === 'uttar-pradesh' ? 'UTTAR PRADESH' : 
                 state === 'jharkhand' ? 'JHARKHAND' : 
                 state === 'bihar' ? 'BIHAR' : 
                 state?.replace('-', ' ')?.toUpperCase() || 'State'}
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  opacity: 0.95,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                  fontSize: '1.2rem',
                  fontWeight: 500,
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: 1
                }}
              >
                News from {state === 'uttar-pradesh' ? 'Uttar Pradesh' : 
                           state === 'jharkhand' ? 'Jharkhand' : 
                           state === 'bihar' ? 'Bihar' : 
                           state?.replace('-', ' ')} / 
                
                {districts.length > 0 ? (
                  <FormControl 
                    variant="outlined" 
                    size="small"
                    sx={{
                      minWidth: 150,
                      maxWidth: '100%',
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      borderRadius: 1,
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'rgba(255,255,255,0.3)',
                          borderWidth: '1px',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255,255,255,0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'white',
                          borderWidth: '1px',
                        },
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: 500,
                      },
                      '& .MuiSelect-icon': {
                        color: 'white',
                      }
                    }}
                  >
                    <Select
                      value={selectedDistrict}
                      onChange={handleDistrictChange}
                      displayEmpty
                      input={<OutlinedInput />}
                      renderValue={(selected) => {
                        if (!selected) {
                          return state === 'uttar-pradesh' ? 'उत्तर प्रदेश' : 
                                 state === 'jharkhand' ? 'झारखंड' :
                                 state === 'bihar' ? 'बिहार' : '';
                        }
                        const selectedDistrict = districts.find(d => d.value === selected);
                        return selectedDistrict ? selectedDistrict.hindi : selected;
                      }}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300,
                          },
                        },
                      }}
                    >
                      <MenuItem value="">
                        {state === 'uttar-pradesh' ? 'उत्तर प्रदेश' : 
                         state === 'jharkhand' ? 'झारखंड' :
                         state === 'bihar' ? 'बिहार' : ''}
                      </MenuItem>
                      {districts.map((district) => (
                        <MenuItem key={district.value} value={district.value}>
                          {district.hindi} ({district.english})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  currentState?.hindi || ''
                )}
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Box sx={{ flex: 1, px: 4, pt: 3, pb: 0 }}>
        {/* Display District-specific News if available */}
        {selectedDistrict && (
          <>
            {districtNewsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5, mb: 4 }}>
                <CircularProgress size={30} />
                <Typography variant="h6" sx={{ ml: 2 }}>Loading district news...</Typography>
              </Box>
            ) : districtNews.length > 0 ? (
              <Container maxWidth="xl" sx={{ mb: 5 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 3, 
                    pb: 2, 
                    borderBottom: `3px solid ${currentState?.bannerColor || '#1B5E20'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <LocationOnIcon /> 
                  {districts.find(d => d.value === selectedDistrict)?.english || selectedDistrict} News
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={7} lg={7}>
                    <Box sx={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1, maxWidth: '520px' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>DISTRICT NEWS</Typography>
                        {districtNews.slice(0, 2).map((news, idx) => (
                          <Box key={idx} sx={{ mb: 3, width: '100%', height: '480px' }}>
                            <NewsCard
                              image={getFullImageUrl(news.featuredImage || news.image)}
                              title={news.title}
                              timestamp={formatDate(news.createdAt || news.updatedAt)}
                              isVideo={hasVideo(news)}
                              item={news}
                            />
                  </Box>
                        ))}
                  </Box>
                      {/* Trending Section */}
                      <Box sx={{ minWidth: '369px', maxWidth: '369px', flexShrink: 0, mx: 5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>LATEST</Typography>
                        <Box sx={{ maxHeight: '800px', overflowY: 'auto', '&::-webkit-scrollbar': { display: 'none' }, msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                          {convertNewsToTrendingFormat(districtNews).map((item, idx) => (
                            <TrendingCard key={idx} {...item} />
                          ))}
                </Box>
              </Box>
                      {/* Ad Section */}
                      <Box sx={{ minWidth: '280px', maxWidth: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {[...Array(2)].map((_, idx) => (
                          <AdCard key={idx} height={350} />
                        ))}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Container>
            ) : (
              <Container maxWidth="xl" sx={{ mb: 5 }}>
              <Box sx={{ 
                p: 3, 
                backgroundColor: '#FFFDE7', 
                borderRadius: 2, 
                color: '#D97706', 
                  textAlign: 'center'
              }}>
                <Typography>No news available for {districts.find(d => d.value === selectedDistrict)?.english || selectedDistrict}</Typography>
              </Box>
              </Container>
            )}
            
            <Container maxWidth="xl">
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 3, 
                pb: 2, 
                borderBottom: `3px solid ${currentState?.bannerColor || '#1B5E20'}`
              }}
            >
              Other News from {state === 'uttar-pradesh' ? 'Uttar Pradesh' : state === 'jharkhand' ? 'Jharkhand' : 'Bihar'}
            </Typography>
            </Container>
          </>
        )}
      
        {/* Main State News Section */}
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            <Grid item xs={12} md={7} lg={7}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
                {state === 'uttar-pradesh' ? 'Uttar Pradesh' : 
                 state === 'jharkhand' ? 'Jharkhand' : 
                 'Bihar'} News
              </Typography>
              <Box sx={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1, maxWidth: '520px' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>VIDEOS</Typography>
                  {videoNews.map((news, idx) => (
                    <Box key={idx} sx={{ mb: 3, width: '100%', height: '480px' }}>
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
                    {trendingNews.map((item, idx) => (
                      <TrendingCard key={idx} {...item} />
                  ))}
              </Box>
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
          
          {/* Bottom Cards Row */}
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
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease-in-out',
                      '&:hover': { 
                      transform: 'translateY(-2px)',
                    }
                  }} 
                  onClick={() => navigate(`/state/${state}/${card.item.id || card.item._id}`)}
                  >
                  <img src={card.image} alt={card.title} style={{ width: '100%', height: '60%', objectFit: 'cover' }} />
                  <Box sx={{ p: 1 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#222', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.title}</Typography>
                      </Box>
                    </Box>
                ))}
            </AutoScrollRow>
            </Box>
      </Container>
      </Box>
    </Box>
  );
};

export default StateNewsPage; 