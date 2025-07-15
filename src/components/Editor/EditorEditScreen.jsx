import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';
import EditorHeader from './EditorHeader';
import EditorFooter from './EditorFooter';
import EditorSidebar from './EditorSidebar';
import './editor.css';
import TinyMCEEditor from '../common/TinyMCEEditor';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button
} from '@mui/material';

// API base URL configuration
const API_BASE_URL = 'https://api.newztok.in';

// Debug the API base URL
console.log('Editor is using API_BASE_URL:', API_BASE_URL);

// Define the state and district data structure
const locationData = {
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
        // Added districts
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
        // Added districts
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
        // Added districts
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

// Configure axios with increased timeout
axios.defaults.timeout = 120000; // 2 minutes timeout

// Special timeout for video uploads (10 minutes)
const VIDEO_UPLOAD_TIMEOUT = 600000; // 10 minutes

const EditorEditScreen = () => {
  const { newsId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isVideoContent, setIsVideoContent] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('pendingApprovals');
  const [isSaving, setIsSaving] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMethod, setUploadMethod] = useState('youtube'); // 'youtube' or 'file'
  const [showSessionExpiredDialog, setShowSessionExpiredDialog] = useState(false);

  // Check for token expiration on component mount
  useEffect(() => {
    checkTokenExpiration();
  }, []);

  // Check for token expiration
  const checkTokenExpiration = () => {
    const tokenData = localStorage.getItem('authTokenData');
    
    if (!tokenData) {
      // No token found, user is not logged in
      setShowSessionExpiredDialog(true);
      return;
    }
    
    try {
      const parsedTokenData = JSON.parse(tokenData);
      const tokenTimestamp = parsedTokenData.timestamp;
      const currentTime = Date.now();
      
      // Check if token is older than 24 hours (86400000 ms)
      const tokenAge = currentTime - tokenTimestamp;
      const tokenExpirationTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      if (tokenAge > tokenExpirationTime) {
        // Token has expired
        console.log('Session expired. Token age:', tokenAge, 'ms');
        setShowSessionExpiredDialog(true);
      }
    } catch (error) {
      console.error('Error checking token expiration:', error);
      setShowSessionExpiredDialog(true);
    }
  };

  // Handle redirect to login page
  const handleLoginRedirect = () => {
    // Clear auth data before redirecting
    localStorage.removeItem('authToken');
    localStorage.removeItem('authTokenData');
    localStorage.removeItem('userRole');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('authTokenData');
    sessionStorage.removeItem('userRole');
    
    // Close dialog and redirect to login page
    setShowSessionExpiredDialog(false);
    navigate('/user/login');
  };

  // Fetch news data on component mount
  useEffect(() => {
    fetchNewsData();
  }, [newsId]);

  // Debug effect to track video path changes
  useEffect(() => {
    if (newsData) {
      console.log('VIDEO PATH UPDATE:', {
        videoPath: newsData.videoPath,
        video: newsData.video,
        contentType: newsData.contentType,
        uploadMethod
      });
      
      // Automatically set upload method based on detected paths
      if (newsData.videoPath && (
          newsData.videoPath.includes('/uploads/videos/video-') ||
          newsData.videoPath.includes('uploads/videos/video-')
      )) {
        console.log('Video path detected with the proper format, setting upload method to file');
        setUploadMethod('file');
      }
    }
  }, [newsData?.videoPath, newsData?.video, newsData?.contentType, uploadMethod]);

  // Enhanced getAuthToken function with session expiration handling
  const getEnhancedAuthToken = () => {
    // Get token from all possible storage locations with fallbacks
    const storageOptions = [localStorage, sessionStorage];
    const tokenKeys = ['authToken', 'token', 'jwtToken', 'userToken', 'accessToken'];
    
    for (const storage of storageOptions) {
      for (const key of tokenKeys) {
        const token = storage.getItem(key);
        if (token) {
          console.log(`Found token with key '${key}'`);
          try {
            // Ensure token is properly formatted and not wrapped in quotes
            const cleanToken = token.trim().replace(/^["'](.*)["']$/, '$1');
            // Verify the token looks like a JWT (crude validation)
            if (cleanToken.split('.').length === 3) {
              return cleanToken;
            } else {
              console.warn('Token found but does not appear to be a valid JWT format');
            }
          } catch (e) {
            console.error('Error parsing token:', e);
          }
          return token;
        }
      }
    }
    
    console.error('No authentication token found');
    setShowSessionExpiredDialog(true);
    return null;
  };

  // Function to save a working token with timestamp
  const saveWorkingToken = (token) => {
    if (!token) return;
    
    // Save to both storage types for redundancy
    localStorage.setItem('authToken', token);
    sessionStorage.setItem('authToken', token);
    
    // Store timestamp for expiration tracking
    const tokenData = {
      token: token,
      timestamp: Date.now()
    };
    localStorage.setItem('authTokenData', JSON.stringify(tokenData));
    sessionStorage.setItem('authTokenData', JSON.stringify(tokenData));
    
    console.log('Token saved to both localStorage and sessionStorage with timestamp');
  };

  const fetchNewsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check for navigation state first
      const locationState = location.state;
      if (locationState && locationState.newsData) {
        console.log('Using news data from navigation state:', locationState.newsData);
        
        // Log any video-related fields specifically
        console.log('VIDEO FIELDS FROM NAVIGATION:', {
          videoPath: locationState.newsData.videoPath,
          video: locationState.newsData.video,
          videoUrl: locationState.newsData.videoUrl,
          featuredVideo: locationState.newsData.featuredVideo,
          youtubeUrl: locationState.newsData.youtubeUrl,
          contentType: locationState.newsData.contentType,
          originalVideoData: locationState.newsData.originalVideoData
        });
        
        // Determine if any valid video path exists
        const hasValidVideoPath = !!(locationState.newsData.videoPath || 
                                   locationState.newsData.video || 
                                   locationState.newsData.videoUrl || 
                                   locationState.newsData.featuredVideo);
        
        console.log('Has valid video path:', hasValidVideoPath);
        
        // Check specifically for the expected video format
        const hasExpectedVideoFormat = !!(
          (locationState.newsData.videoPath && (
            locationState.newsData.videoPath.includes('/uploads/videos/video-') ||
            locationState.newsData.videoPath.includes('uploads/videos/video-')
          )) ||
          (locationState.newsData.video && (
            locationState.newsData.video.includes('/uploads/videos/video-') ||
            locationState.newsData.video.includes('uploads/videos/video-')
          ))
        );
        
        if (hasExpectedVideoFormat) {
          console.log('✓ Found video with expected format pattern in navigation data');
        }
        
        // Ensure state and district are included and have fallbacks
        const navData = {
          ...locationState.newsData,
          state: locationState.newsData.state || '',
          district: locationState.newsData.district || '',
          category: locationState.newsData.category || '',
          featuredImage: locationState.newsData.featuredImage || '',
          // Ensure video paths are properly captured and synchronized
          video: locationState.newsData.video || locationState.newsData.videoPath || '',
          videoPath: locationState.newsData.videoPath || locationState.newsData.video || '',
          videoUrl: locationState.newsData.videoUrl || '',
          featuredVideo: locationState.newsData.featuredVideo || '',
          youtubeUrl: locationState.newsData.youtubeUrl || '',
        };
        
        console.log('Processed navigation state data:', navData);
        
        // Check if this is a video post
        const isVideo = locationState.newsData.contentType === 'video' || 
                       !!locationState.newsData.youtubeUrl || 
                       !!locationState.newsData.videoPath || 
                       !!locationState.newsData.video ||
                       !!locationState.newsData.videoUrl || 
                       !!locationState.newsData.featuredVideo;
        
        // If it's a video post, ensure we set contentType properly
        if (isVideo && !navData.contentType) {
          navData.contentType = 'video';
          console.log('Setting contentType to video based on detected video fields');
        }
        
        setNewsData(navData);
        setIsVideoContent(isVideo);
        
        // Set upload method based on data
        if (isVideo) {
          if (navData.youtubeUrl) {
            console.log('✓ Video post with YouTube URL detected');
            setUploadMethod('youtube');
          } else {
            console.log('✓ Video post with file detected');
            console.log('Video path:', navData.videoPath);
            console.log('Video field:', navData.video);
            
            // Check if we have the expected video format
            const hasExpectedFormat = (
              (navData.videoPath && (
                navData.videoPath.includes('/uploads/videos/video-') || 
                navData.videoPath.includes('uploads/videos/video-')
              )) || 
              (navData.video && (
                navData.video.includes('/uploads/videos/video-') || 
                navData.video.includes('uploads/videos/video-')
              ))
            );
            
            if (hasExpectedFormat) {
              console.log('✓ Video has the expected format pattern: /uploads/videos/video-[ID].mp4');
            }
            
            setUploadMethod('file');
          }
        }
        
        setLoading(false);
        return;
      }
      
      // Fetch from API if no navigation state
      const token = getEnhancedAuthToken();
      if (!token) {
        setError('No authentication token found. Please login again.');
        setShowSessionExpiredDialog(true);
        setLoading(false);
        return;
      }

      // Save token with timestamp if it's valid
      saveWorkingToken(token);

      const config = { headers: { 'Authorization': `Bearer ${token}` } };

      // First try to fetch from the direct endpoint
      console.log(`Attempting to fetch news with ID ${newsId} via direct endpoint /api/news/${newsId}`);
      
      // Use a more robust approach similar to PendingApprovals
      const endpointsToTry = [
        `/api/news/${newsId}`,
        `/api/news/get/${newsId}`,
        `/api/posts/${newsId}`
      ];
      
      let response = null;
      let lastError = null;
      
      // Try each endpoint in sequence
      for (let endpoint of endpointsToTry) {
        try {
          console.log(`Trying endpoint: ${API_BASE_URL}${endpoint}`);
          const result = await axios.get(`${API_BASE_URL}${endpoint}`, config);
          console.log(`Successful response from ${endpoint}:`, result.data);
          response = result;
          break; // Exit loop on success
        } catch (err) {
          console.log(`Error with endpoint ${endpoint}:`, err.message);
          
          // Check for authentication errors (401/403)
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            console.log('Token is invalid or expired');
            setShowSessionExpiredDialog(true);
            setLoading(false);
            return;
          }
          
          lastError = err;
          // Continue to next endpoint
        }
      }
      
      // If direct endpoints failed, try fetching from lists
      if (!response) {
        console.log('All direct endpoints failed, trying to find item in lists...');
        
        // Try finding in pending list first
        try {
          console.log('Fetching pending news list...');
          const pendingResponse = await axios.get(`${API_BASE_URL}/api/news/pending`, config);
          
          if (pendingResponse.data) {
            console.log('Pending news list retrieved, searching for ID', newsId);
            const newsItems = Array.isArray(pendingResponse.data) ? 
              pendingResponse.data : 
              (pendingResponse.data.data || []);
            
            const foundItem = newsItems.find(item => item.id == newsId);
            if (foundItem) {
              console.log('Found matching item in pending list:', foundItem);
              response = { data: foundItem };
            }
          }
        } catch (pendingErr) {
          console.log('Error fetching pending list:', pendingErr.message);
          
          // Check for authentication errors
          if (pendingErr.response && (pendingErr.response.status === 401 || pendingErr.response.status === 403)) {
            console.log('Token is invalid or expired');
            setShowSessionExpiredDialog(true);
            setLoading(false);
            return;
          }
          
          // Try rejected list as last resort
          try {
            console.log('Fetching rejected news list...');
            const rejectedResponse = await axios.get(`${API_BASE_URL}/api/news/rejected`, config);
            
            if (rejectedResponse.data) {
              console.log('Rejected news list retrieved, searching for ID', newsId);
              const newsItems = Array.isArray(rejectedResponse.data) ? 
                rejectedResponse.data : 
                (rejectedResponse.data.data || []);
              
              const foundItem = newsItems.find(item => item.id == newsId);
              if (foundItem) {
                console.log('Found matching item in rejected list:', foundItem);
                response = { data: foundItem };
              }
            }
          } catch (rejectedErr) {
            console.log('Error fetching rejected list:', rejectedErr.message);
            
            // Check for authentication errors
            if (rejectedErr.response && (rejectedErr.response.status === 401 || rejectedErr.response.status === 403)) {
              console.log('Token is invalid or expired');
              setShowSessionExpiredDialog(true);
              setLoading(false);
              return;
            }
          }
        }
      }
      
      if (!response) {
        throw new Error(`News item ${newsId} not found in any endpoint.`);
      }
      
      console.log('Successfully retrieved news data:', response.data);
      
      if (response.data) {
        const newsItem = response.data.data || response.data;
        
        // Extract potential video fields
        const videoFields = {
          videoPath: newsItem.videoPath || null,
          video: newsItem.video || null,
          featuredVideo: newsItem.featuredVideo || null,
          videoUrl: newsItem.videoUrl || null,
          youtubeUrl: newsItem.youtubeUrl || null,
        };
        
        console.log('Found video fields in API response:', videoFields);
        
        // Log each field individually for easier debugging
        console.log('API Response Video Path Fields:');
        console.log('- videoPath:', newsItem.videoPath);
        console.log('- video:', newsItem.video);
        console.log('- featuredVideo:', newsItem.featuredVideo);
        console.log('- videoUrl:', newsItem.videoUrl);
        console.log('- youtubeUrl:', newsItem.youtubeUrl);
        
        // Determine the most suitable video path
        // Priority: videoPath > video > featuredVideo > videoUrl
        const bestVideoPath = newsItem.videoPath || newsItem.video || newsItem.featuredVideo || newsItem.videoUrl || '';
        
        // Process fetched data with fallbacks - specifically handle all possible video fields
        const processedNewsData = {
          id: newsItem.id,
          title: newsItem.title || '',
          content: newsItem.content || '',
          featuredImage: newsItem.featuredImage || newsItem.image || '',
          category: newsItem.category || '',
          state: newsItem.state || '',
          district: newsItem.district || '',
          contentType: newsItem.contentType || 'standard',
          status: newsItem.status || 'pending',
          youtubeUrl: newsItem.youtubeUrl || '',
          thumbnailUrl: newsItem.thumbnailUrl || '',
          // Synchronize video and videoPath to ensure they have the same value
          videoPath: bestVideoPath,
          video: bestVideoPath,
          // Store original paths for reference
          featuredVideo: newsItem.featuredVideo || '',
          videoUrl: newsItem.videoUrl || '',
          // Store raw data for debugging
          originalVideoData: videoFields
        };
        
        console.log('Processed News Data:', processedNewsData); 
        console.log('Video fields found:', processedNewsData.originalVideoData);
        
        setNewsData(processedNewsData);
        
        // Enhanced video content detection - check all possible video indicators
        const isVideo = 
          processedNewsData.contentType === 'video' || 
          !!processedNewsData.youtubeUrl || 
          !!processedNewsData.videoPath || 
          Object.values(videoFields).some(val => !!val); // Check if any video field has a value
          
        setIsVideoContent(isVideo);
        console.log('Is video content:', isVideo);
        
        // Add detailed logging about video paths
        if (isVideo) {
          console.log('VIDEO PATH DETAILS:');
          console.log('- Direct videoPath:', processedNewsData.videoPath);
          console.log('- All video fields found:', JSON.stringify(videoFields, null, 2));
          console.log('- Original API videoPath:', newsItem.videoPath);
          console.log('- Original API video:', newsItem.video);
          console.log('- Original API featuredVideo:', newsItem.featuredVideo);
          console.log('- Original API videoUrl:', newsItem.videoUrl);
        }
        
        // Determine which upload method to show based on available data
        if (isVideo) {
          if (processedNewsData.youtubeUrl) {
            console.log('✓ Video post with YouTube URL detected:', processedNewsData.youtubeUrl);
            setUploadMethod('youtube');
          } else if (processedNewsData.videoPath || 
                    videoFields.video || 
                    videoFields.featuredVideo || 
                    videoFields.videoUrl) {
            console.log('✓ Video post with MP4 file detected ->', processedNewsData.videoPath || processedNewsData.video);
            console.log('✓ MP4 file will be preserved when saving');
            setUploadMethod('file');
          } else {
            // Default to file upload if contentType is video but no source is specified
            console.log('Video post without source detected, defaulting to file upload');
            setUploadMethod('file');
          }
        }
      } else {
        throw new Error('News item data is empty');
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(`Failed to load news data: ${err.message}`);
      // Set empty news data to avoid errors during rendering
      setNewsData({ id: newsId, title: '', content: '', featuredImage: '', category: '', state: '', district: '' });
    } finally {
      setLoading(false);
    }
  };

  // Function to handle form changes
  const handleInputChange = (field, value) => {
    // Special handling for state and district fields
    if (field === 'state' || field === 'district') {
      console.log(`Updating ${field} value to: "${value}"`);
    }
    
    setNewsData({
      ...newsData,
      [field]: value
    });
  };

  // Enhanced function to get a reliable video URL for display
  const getVideoUrl = (path) => {
    // If no path is provided, use the video path from newsData
    if (!path) {
      path = newsData.videoPath || newsData.video || 
             (newsData.originalVideoData ? 
               (newsData.originalVideoData.videoPath || 
                newsData.originalVideoData.video || 
                newsData.originalVideoData.featuredVideo || 
                newsData.originalVideoData.videoUrl) : '');
      
      console.log('GetVideoUrl called without path, using:', path);
    }
    
    // If still no path is found, return empty string to avoid errors
    if (!path || path === 'undefined' || path === 'null') {
      console.warn('No valid video path found');
      return '';
    }
    
    // Avoid undefined or null strings that might slip through
    if (typeof path !== 'string') {
      console.warn(`Invalid path type: ${typeof path}`);
      return '';
    }
    
    // For debugging
    console.log('Constructing video URL from path:', path);
    
    // Handle the specific format for video files
    if (path.includes('/uploads/videos/video-') || 
        path.includes('uploads/videos/video-')) {
      console.log('Found matching video path format!');
      
      // Ensure path has leading slash
      const videoPath = path.startsWith('/') ? path : `/${path}`;
      // Return the full URL with API base
      const fullUrl = `${API_BASE_URL}${videoPath}`;
      console.log('Constructed video URL:', fullUrl);
      return fullUrl;
    }
    
    // If it's already a full URL, return it
    if (path.startsWith('http')) {
      return path;
    }
    
    // If path is just a filename without any slashes
    if (!path.includes('/')) {
      // Try multiple possible paths
      const formattedPaths = [
        `${API_BASE_URL}/uploads/videos/${path}`,
        `${API_BASE_URL}/uploads/${path}`,
        `${API_BASE_URL}/${path}`,
        `${API_BASE_URL}/api/uploads/videos/${path}`
      ];
      console.log('Trying multiple possible video paths:', formattedPaths);
      
      // Return the first path for now
      return formattedPaths[0];
    }
    
    // If it starts with a slash, append it to the API base URL
    if (path.startsWith('/')) {
      return `${API_BASE_URL}${path}`;
    }
    
    // Otherwise, treat it as a relative path
    return `${API_BASE_URL}/${path}`;
  };

  // Enhanced function to safely handle video file changes
  const handleVideoFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file size (limit to 50MB for video)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError(`File size exceeds 50MB. Your file is ${(selectedFile.size/1024/1024).toFixed(2)} MB. Please select a smaller MP4 file.`);
        return;
      }
      
      // Check if file is an MP4
      if (selectedFile.type !== 'video/mp4') {
        setError(`Please select an MP4 video file. Current file type: ${selectedFile.type}`);
        return;
      }
      
      // Success feedback
      setSuccessMessage(`MP4 video "${selectedFile.name}" selected (${(selectedFile.size/1024/1024).toFixed(2)} MB). Click "Save Changes" to upload.`);
      setTimeout(() => setSuccessMessage(''), 5000);
      
      setVideoFile(selectedFile);
      setUploadMethod('file');
      // Clear YouTube URL if video file is selected
      handleInputChange('youtubeUrl', '');
      
      // Create a preview URL for the selected video
      try {
        const videoPreviewUrl = URL.createObjectURL(selectedFile);
        setNewsData(prevData => ({
          ...prevData,
          videoPreviewUrl: videoPreviewUrl
        }));
        console.log('Created video preview URL:', videoPreviewUrl);
      } catch (err) {
        console.error('Error creating video preview URL:', err);
      }
    }
  };

  // Helper function to get raw video path for display
  const getDisplayVideoPath = (videoData) => {
    if (!videoData) return '';
    
    // First check direct properties on the newsData object
    const directPath = videoData.videoPath || 
                       videoData.video || 
                       videoData.featuredVideo || 
                       videoData.videoUrl || '';
    
    // If we have originalVideoData, check that too
    if (videoData.originalVideoData) {
      const originalPath = videoData.originalVideoData.videoPath || 
                         videoData.originalVideoData.video || 
                         videoData.originalVideoData.featuredVideo || 
                         videoData.originalVideoData.videoUrl || '';
      
      // Return whichever path is available, preferring the direct path
      const finalPath = directPath || originalPath;
      console.log('Video path for display:', finalPath);
      return finalPath;
    }
    
    console.log('Video path for display:', directPath);
    return directPath;
  };

  // Function to handle YouTube URL changes
  const handleYoutubeUrlChange = (e) => {
    const url = e.target.value;
    handleInputChange('youtubeUrl', url);
    
    if (url) {
      setUploadMethod('youtube');
      setVideoFile(null);
    }
  };

  // Function to handle save changes
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      // Get token using enhanced auth token retrieval
      const token = getEnhancedAuthToken();
      
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }
      
      // Save token with timestamp for future use
      saveWorkingToken(token);

      // Create a FormData object for multipart/form-data
      const formData = new FormData();
      
      // Add basic news data
      formData.append('id', newsData.id);
      formData.append('title', newsData.title);
      formData.append('content', newsData.content);
      formData.append('status', newsData.status);
      
      // Add category, state, district if they exist
      if (newsData.category) formData.append('category', newsData.category);
      if (newsData.state) formData.append('state', newsData.state);
      if (newsData.district) formData.append('district', newsData.district);
      
      // Handle image uploads - new featured image
      if (newsData.newFeaturedImage) {
        console.log('Uploading new featured image:', newsData.newFeaturedImage.name);
        formData.append('featuredImage', newsData.newFeaturedImage);
      } else if (newsData.featuredImage) {
        console.log('Using existing featured image path:', newsData.featuredImage);
        formData.append('featuredImagePath', newsData.featuredImage);
      }
      
      // Handle video content
      if (isVideoContent) {
        console.log('Handling video content with method:', uploadMethod);
        formData.append('contentType', 'video');
        
        if (uploadMethod === 'youtube') {
          console.log('Processing YouTube URL:', newsData.youtubeUrl);
          // YouTube URL handling
          if (newsData.youtubeUrl) {
            formData.append('youtubeUrl', newsData.youtubeUrl);
            
            // Clear any video file paths if we're switching to YouTube
            formData.append('videoPath', '');
            formData.append('video', '');
          }
        } else if (uploadMethod === 'file') {
          // File upload handling
          if (videoFile) {
            console.log('Uploading new video file:', videoFile.name);
            // Use a special name for the file upload to distinguish it
            formData.append('videoFile', videoFile);
          } else if (newsData.videoPath || newsData.video) {
            console.log('Using existing video path:', newsData.videoPath || newsData.video);
            formData.append('videoPath', newsData.videoPath || newsData.video);
          }
        }
      } else {
        // Standard post
        formData.append('contentType', 'standard');
      }
      
      // Add original data to help the server identify changes
      if (newsData.originalData) {
        console.log('Adding original data to help track changes');
        formData.append('originalData', JSON.stringify(newsData.originalData));
      }
      
      // =============== CRITICAL DEBUG LOGGING ===============
      console.log('DEBUG - News ID:', newsId);
      console.log('DEBUG - Token:', getEnhancedAuthToken()?.substring(0, 10) + '...');
      console.log('DEBUG - API URL:', `${API_BASE_URL}/api/news/${newsId}`);
      
      // Display all form data keys for debugging
      console.log('Form data keys:', Array.from(formData.keys()));
      
      // Create API client configuration with proper headers
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: progressEvent => {
          if (videoFile) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${percentCompleted}%`);
            setUploadProgress(percentCompleted);
          }
        },
        timeout: videoFile ? VIDEO_UPLOAD_TIMEOUT : axios.defaults.timeout // Use extended timeout for video uploads
      };
      
      // Perform the API request to save changes
      let response;
      try {
        console.log('Attempting to save changes using PUT method first...');
        response = await axios.put(`${API_BASE_URL}/api/news/${newsId}`, formData, config);
      } catch (putError) {
        console.log('PUT method failed, falling back to POST:', putError.message);
        
        // Check for authentication errors (401/403)
        if (putError.response && (putError.response.status === 401 || putError.response.status === 403)) {
          console.log('Token is invalid or expired');
          setShowSessionExpiredDialog(true);
          setIsSaving(false);
          return;
        }
        
        // Try POST method as fallback (some APIs use different endpoints for updates)
        try {
          console.log('Trying POST to /api/news/update endpoint...');
          response = await axios.post(`${API_BASE_URL}/api/news/update`, formData, config);
        } catch (postError) {
          console.log('POST to /api/news/update failed, trying alternative endpoint:', postError.message);
          
          // Check for authentication errors (401/403)
          if (postError.response && (postError.response.status === 401 || postError.response.status === 403)) {
            console.log('Token is invalid or expired');
            setShowSessionExpiredDialog(true);
            setIsSaving(false);
            return;
          }
          
          // Final fallback to a simple PUT request with JSON data instead of FormData
          console.log('Trying last resort - PUT with JSON data');
          
          // Convert formData to JSON object
          const jsonData = {};
          formData.forEach((value, key) => {
            if (key !== 'featuredImage' && key !== 'videoFile') {
              jsonData[key] = value;
            }
          });
          
          // Handle the case where we can't upload files in this fallback
          if (newsData.newFeaturedImage || videoFile) {
            console.warn('⚠️ Files cannot be uploaded in this fallback method');
            setError('Could not upload files. Please try again later.');
            setIsSaving(false);
            return;
          }
          
          // Remove multipart/form-data content type for JSON request
          const jsonConfig = {
            ...config,
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          };
          
          response = await axios.put(`${API_BASE_URL}/api/news/${newsId}`, jsonData, jsonConfig);
        }
      }
      
      console.log('API response:', response.data);
      
      if (response.status >= 200 && response.status < 300) {
        console.log('Changes saved successfully');
        setSuccessMessage('Changes saved successfully!');
        
        // Reset upload progress
        setUploadProgress(0);
        
        // Reset videoFile state after successful upload
        setVideoFile(null);
        
        // Update the newsData state with the response data if available
        if (response.data && (response.data.data || response.data.news)) {
          const updatedNews = response.data.data || response.data.news || response.data;
          console.log('Updating news data with API response:', updatedNews);
          setNewsData(prevData => ({
            ...prevData,
            ...updatedNews,
            newFeaturedImage: null, // Clear the uploaded image reference
            newFeaturedImagePreview: null // Clear the preview
          }));
        }
        
        // Clear success message after a delay
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        throw new Error(`API returned status ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      
      // Check for authentication errors in the catch block
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.log('Token is invalid or expired');
        setShowSessionExpiredDialog(true);
        setIsSaving(false);
        return;
      }
      
      if (error.response) {
        // Server responded with a status code outside of 2xx
        const errorMsg = error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`;
        setError(`Failed to save changes: ${errorMsg}`);
      } else if (error.request) {
        // Request was made but no response was received
        setError('No response from server. Please check your internet connection and try again.');
      } else {
        // Other errors
        setError(`Error: ${error.message}`);
      }
      
      // Log the full error for debugging
      console.error('Full error object:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/editor/pendingApprovals');
  };

  const handleApprove = async () => {
    try {
      setUpdateLoading(true);
      setError(null);
      
      // Get token using enhanced retrieval method
      const token = getEnhancedAuthToken();
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setShowSessionExpiredDialog(true);
        setUpdateLoading(false);
        return;
      }
      
      // Save token with timestamp for future use
      saveWorkingToken(token);
      
      // For debugging, show the URL and token prefix
      console.log(`Approving news with ID ${newsId}`);
      console.log(`Using token: ${token.substring(0, 10)}...`);
      
      // Configure the request
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      // First save any changes if they exist
      // This helps ensure all edits are preserved during the approval
      await handleSaveChanges();
      
      // Create the approval payload
      const approvalData = {
        id: newsId,
        status: 'approved'
      };
      
      // Attempt to approve using POST method first
      let response;
      try {
        console.log('Trying to approve via POST /api/news/approve');
        response = await axios.post(`${API_BASE_URL}/api/news/approve`, approvalData, config);
      } catch (postError) {
        console.log('POST /approve failed, trying alternative endpoint:', postError.message);
        
        // Check for authentication errors (401/403)
        if (postError.response && (postError.response.status === 401 || postError.response.status === 403)) {
          console.log('Token is invalid or expired');
          setShowSessionExpiredDialog(true);
          setUpdateLoading(false);
          return;
        }
        
        // Try using PUT to update status as fallback
        try {
          console.log('Trying PUT /api/news/${newsId} as fallback');
          response = await axios.put(`${API_BASE_URL}/api/news/${newsId}`, approvalData, config);
        } catch (putError) {
          console.error('PUT fallback failed:', putError.message);
          
          // Check for authentication errors (401/403)
          if (putError.response && (putError.response.status === 401 || putError.response.status === 403)) {
            console.log('Token is invalid or expired');
            setShowSessionExpiredDialog(true);
            setUpdateLoading(false);
            return;
          }
          
          throw putError; // Rethrow for the outer catch block
        }
      }
      
      console.log('Approval response:', response.data);
      
      // Set success message
      setSuccessMessage('Article approved successfully!');
      
      // Update UI without waiting for page reload
      setNewsData(prev => ({
        ...prev,
        status: 'approved'
      }));
      
      // Navigate back to pending approvals list after a short delay
      setTimeout(() => {
        navigate('/editor/pendingApprovals');
      }, 1500);
    } catch (error) {
      console.error('Error approving article:', error);
      
      // Check for authentication errors in the catch block
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.log('Token is invalid or expired');
        setShowSessionExpiredDialog(true);
        setUpdateLoading(false);
        return;
      }
      
      if (error.response) {
        setError(`Failed to approve: ${error.response.data?.message || error.response.status}`);
      } else if (error.request) {
        setError('No response from server. Please check your internet connection.');
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setUpdateLoading(true);
      setError(null);
      
      // Get token using enhanced auth token retrieval
      const token = getEnhancedAuthToken();
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setShowSessionExpiredDialog(true);
        setUpdateLoading(false);
        return;
      }
      
      // Save token with timestamp for future use
      saveWorkingToken(token);
      
      // Configure the request
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      // Rejection reason (could be enhanced to prompt the user)
      const reason = prompt('Please provide a reason for rejection:');
      if (reason === null) {
        // User canceled the prompt
        setUpdateLoading(false);
        return;
      }
      
      const rejectionData = {
        id: newsId,
        status: 'rejected',
        rejectionReason: reason || 'No reason provided'
      };
      
      // Attempt to reject using POST method first
      let response;
      try {
        console.log('Trying to reject via POST /api/news/reject');
        response = await axios.post(`${API_BASE_URL}/api/news/reject`, rejectionData, config);
      } catch (postError) {
        console.log('POST /reject failed, trying alternative endpoint:', postError.message);
        
        // Check for authentication errors (401/403)
        if (postError.response && (postError.response.status === 401 || postError.response.status === 403)) {
          console.log('Token is invalid or expired');
          setShowSessionExpiredDialog(true);
          setUpdateLoading(false);
          return;
        }
        
        // Try using PUT to update status as fallback
        try {
          console.log('Trying PUT /api/news/${newsId} as fallback');
          response = await axios.put(`${API_BASE_URL}/api/news/${newsId}`, rejectionData, config);
        } catch (putError) {
          console.error('PUT fallback failed:', putError.message);
          
          // Check for authentication errors (401/403)
          if (putError.response && (putError.response.status === 401 || putError.response.status === 403)) {
            console.log('Token is invalid or expired');
            setShowSessionExpiredDialog(true);
            setUpdateLoading(false);
            return;
          }
          
          throw putError; // Rethrow for the outer catch block
        }
      }
      
      console.log('Rejection response:', response.data);
      
      // Set success message
      setSuccessMessage('Article rejected successfully!');
      
      // Update UI without waiting for page reload
      setNewsData(prev => ({
        ...prev,
        status: 'rejected',
        rejectionReason: reason || 'No reason provided'
      }));
      
      // Navigate back to pending approvals list after a short delay
      setTimeout(() => {
        navigate('/editor/pendingApprovals');
      }, 1500);
    } catch (error) {
      console.error('Error rejecting article:', error);
      
      // Check for authentication errors in the catch block
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.log('Token is invalid or expired');
        setShowSessionExpiredDialog(true);
        setUpdateLoading(false);
        return;
      }
      
      if (error.response) {
        setError(`Failed to reject: ${error.response.data?.message || error.response.status}`);
      } else if (error.request) {
        setError('No response from server. Please check your internet connection.');
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  // Function to handle route change from sidebar
  const handleSectionChange = (section) => {
    setActiveSection(section);
    navigate(`/editor/${section}`);
  };

  return (
    <div className="editor-container">
      {/* Session Expired Dialog */}
      <Dialog
        open={showSessionExpiredDialog}
        onClose={() => {}}
        aria-labelledby="session-expired-dialog-title"
        aria-describedby="session-expired-dialog-description"
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: '450px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            backgroundColor: 'white',
            position: 'absolute',
            top: '50%',
            left: '60%',
            transform: 'translate(-50%, -50%)',
            m: 0,
            p: 3,
            alignItems: "center"
          }
        }}
      >
        <DialogTitle id="session-expired-dialog-title" sx={{ 
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '24px',
          pb: 1,
          pt: 2
        }}>
          Session Expired
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 2, pt: 0 }}>
          <DialogContentText id="session-expired-dialog-description" sx={{ 
            color: '#4b5563',
            textAlign: 'center',
            fontSize: '16px',
            lineHeight: 1.5
          }}>
            Your session has expired. Please login again to continue.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ 
          px: 3, 
          pb: 2, 
          pt: 1,
          justifyContent: 'center'
        }}>
          <Button 
            onClick={handleLoginRedirect} 
            variant="contained"
            autoFocus
            sx={{
              bgcolor: '#6366f1',
              color: 'white',
              px: 4,
              py: 1.2,
              borderRadius: '6px',
              minWidth: '130px',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: '#4f46e5'
              }
            }}
          >
            LOGIN
          </Button>
        </DialogActions>
      </Dialog>

      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <EditorHeader />
        
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div style={{ width: '250px', backgroundColor: '#1e2029' }}>
            <EditorSidebar onSectionChange={handleSectionChange} activeSection={activeSection} />
          </div>
          
          <main style={{ flex: 1, overflow: 'auto', backgroundColor: '#f8fafc', padding: '30px' }}>
            {loading ? (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                height: '300px',
                flexDirection: 'column',
                gap: '20px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '3px solid #e5e7eb',
                  borderTopColor: '#4f46e5',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <div style={{ color: '#6b7280' }}>Loading post data...</div>
              </div>
            ) : error ? (
              <div style={{ 
                backgroundColor: '#fee2e2', 
                color: '#b91c1c', 
                padding: '24px', 
                borderRadius: '8px', 
                marginBottom: '20px',
                maxWidth: '800px',
                margin: '0 auto'
              }}>
                <h2 style={{ 
                  fontSize: '20px',
                  marginTop: 0,
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  Error Loading News Item
                </h2>
                
                <p style={{ marginBottom: '16px' }}>
                  {error}
                </p>
                
                <p style={{ marginBottom: '16px', color: '#9b1c1c' }}>
                  This may be happening because:
                </p>
                
                <ul style={{ 
                  marginBottom: '24px', 
                  paddingLeft: '20px',
                  color: '#9b1c1c',
                  lineHeight: '1.5'
                }}>
                  <li>The news item might have been deleted</li>
                  <li>Your authentication token may have expired</li>
                  <li>There could be a network connectivity issue</li>
                  <li>The server might be temporarily unavailable</li>
                </ul>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => navigate('/editor/pendingApprovals')}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#1f2937',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12"></line>
                      <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Return to Pending Approvals
                  </button>
                  
                  <button
                    onClick={() => fetchNewsData()}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#4f46e5',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1 4 1 10 7 10"></polyline>
                      <polyline points="23 20 23 14 17 14"></polyline>
                      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                    </svg>
                    Try Again
                  </button>
                </div>
              </div>
            ) : newsData ? (
              <div>
                {/* Page Header */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '24px',
                  alignItems: 'center'
                }}>
                  <div>
                    <h1 style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold', 
                      margin: '0 0 4px 0', 
                      color: '#111827' 
                    }}>
                      {isVideoContent ? 'Edit Video Post' : 'Edit Standard Post'}
                    </h1>
                    <p style={{ margin: 0, color: '#6b7280' }}>
                      Make changes to the {isVideoContent ? 'video' : 'news'} content 
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={handleCancel}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#1f2937',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    
                    {/* Download Button - Only show for video content */}
                    {isVideoContent && newsData.videoPath && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          
                          // Get video URL
                          const videoUrl = getVideoUrl(newsData.videoPath || newsData.video);
                          console.log('Forcing download from:', videoUrl);
                          
                          // Show feedback
                          setSuccessMessage('Starting download...');
                          
                          // Use Fetch API to force download without redirection
                          fetch(videoUrl)
                            .then(response => response.blob())
                            .then(blob => {
                              // Create blob URL and force download
                              const blobUrl = window.URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              
                              // Configure as download-only
                              link.href = blobUrl;
                              link.download = `video-${newsId}.mp4`;
                              link.style.display = 'none';
                              
                              // Add to DOM, trigger download, then clean up
                              document.body.appendChild(link);
                              link.click();
                              
                              // Clean up
                              window.URL.revokeObjectURL(blobUrl);
                              document.body.removeChild(link);
                              
                              setSuccessMessage('Download complete!');
                              setTimeout(() => setSuccessMessage(''), 3000);
                            })
                            .catch(error => {
                              console.error('Download failed:', error);
                              setError('Download failed. Please try again.');
                            });
                        }}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '14px'
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download
                      </button>
                    )}
                    
                    <button
                      onClick={handleReject}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      Reject
                    </button>
                    <button
                      onClick={handleApprove}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#4f46e5',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                        opacity: isSaving ? 0.7 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      {isSaving ? (
                        <>
                          <div style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderTopColor: 'white',
                            animation: 'spin 1s linear infinite'
                          }} />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </div>

                {/* Success message */}
                {successMessage && (
                  <div style={{ 
                    backgroundColor: '#d1fae5', 
                    color: '#047857', 
                    padding: '16px', 
                    borderRadius: '8px', 
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontWeight: 'bold' }}>✓</span> {successMessage}
                  </div>
                )}

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '2fr 1fr', 
                  gap: '24px',
                  marginBottom: '120px' // Extra space for footer
                }}>
                  {/* Main Content Section */}
                  <div>
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '16px',
                        fontWeight: '500',
                        color: '#111827',
                        marginBottom: '8px'
                      }}>
                        {isVideoContent ? 'Video Title' : 'Post Title/Headline'}
                      </label>
                      <input
                        type="text"
                        value={newsData.title || ''}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Write title here..."
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #D1D5DB',
                          borderRadius: '6px',
                          fontSize: '16px'
                        }}
                      />
                    </div>

                    {isVideoContent && (
                      <div>
                        {/* Video Source Selection */}
                        <div style={{ marginBottom: '24px' }}>
                          <label style={{
                            display: 'block',
                            fontSize: '16px',
                            fontWeight: '500',
                            color: '#111827',
                            marginBottom: '8px'
                          }}>
                            Video Source
                          </label>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setUploadMethod('youtube');
                                setVideoFile(null);
                              }}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: uploadMethod === 'youtube' ? '#4f46e5' : '#e5e7eb',
                                color: uploadMethod === 'youtube' ? 'white' : '#374151',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: '500',
                                cursor: 'pointer'
                              }}
                            >
                              {newsData.youtubeUrl ? 'Current: YouTube URL' : 'YouTube URL'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setUploadMethod('file');
                                handleInputChange('youtubeUrl', '');
                              }}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: uploadMethod === 'file' ? '#4f46e5' : '#e5e7eb',
                                color: uploadMethod === 'file' ? 'white' : '#374151',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: '500',
                                cursor: 'pointer'
                              }}
                            >
                              {newsData.videoPath ? 'Current: MP4 File' : 'Upload MP4 File'}
                            </button>
                          </div>
                        </div>
                      
                        {/* YouTube URL input - show only if YouTube method is selected */}
                        {uploadMethod === 'youtube' && (
                          <div style={{ marginBottom: '24px' }}>
                            <label style={{
                              display: 'block',
                              fontSize: '16px',
                              fontWeight: '500',
                              color: '#111827',
                              marginBottom: '8px'
                            }}>
                              Video URL (YouTube, Vimeo, etc.)
                            </label>
                            <input
                              type="url"
                              value={newsData.youtubeUrl || ''}
                              onChange={handleYoutubeUrlChange}
                              placeholder="https://"
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #D1D5DB',
                                borderRadius: '6px',
                                fontSize: '16px'
                              }}
                            />
                          </div>
                        )}
                        
                        {/* Video File Upload - show only if File method is selected */}
                        {uploadMethod === 'file' && (
                          <div style={{ marginBottom: '24px' }}>
                            <label 
                              htmlFor="videoFile"
                              style={{ 
                                display: 'block', 
                                fontWeight: '500', 
                                marginBottom: '8px', 
                                fontSize: '16px',
                                color: '#111827'
                              }}
                            >
                              Video File <span style={{ color: '#6b7280', fontSize: '12px' }}>(Max 50MB, MP4 only)</span>
                            </label>
                            
                            {/* Current Video Path display (similar to featuredImage) */}
                            <div style={{ marginBottom: '16px' }}>
                              <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#4B5563',
                                marginBottom: '8px'
                              }}>
                                Current Video Path:
                              </label>
                              <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                gap: '4px'
                              }}>
                                <div style={{
                                  position: 'relative',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}>
                                  <input
                                    type="text"
                                    value={newsData.videoPath || newsData.video || 
                                          (newsData.originalVideoData ? 
                                           (newsData.originalVideoData.videoPath || 
                                            newsData.originalVideoData.video || 
                                            newsData.originalVideoData.featuredVideo || 
                                            newsData.originalVideoData.videoUrl || '') : '')}
                                    readOnly
                                    style={{
                                      width: '100%',
                                      padding: '10px 12px',
                                      border: '1px solid #D1D5DB',
                                      borderRadius: '6px',
                                      fontSize: '14px',
                                      backgroundColor: '#f9fafb'
                                    }}
                                  />
                                  {/* Always show the clear button for debugging purposes */}
                                  <button
                                    onClick={() => {
                                      console.log('CLEAR VIDEO PATH BUTTON CLICKED');
                                      console.log('Before clearing - Current state:', {
                                        videoPath: newsData.videoPath,
                                        video: newsData.video,
                                        originalVideoData: newsData.originalVideoData,
                                        uploadMethod
                                      });
                                      
                                      // FORCE CLEAR ALL VIDEO PATHS
                                      // Method 1: Direct assignment with spread
                                      const clearedData = {
                                        ...newsData,
                                        videoPath: '',
                                        video: '',
                                        featuredVideo: '',
                                        videoUrl: '',
                                        // Force clear original data too
                                        originalVideoData: null
                                      };
                                      
                                      // Apply cleared data
                                      setNewsData(clearedData);
                                      console.log('After clearing - New state:', clearedData);
                                      
                                      // Method 2: Force YouTube mode
                                      console.log('Setting upload method to youtube');
                                      setUploadMethod('youtube');
                                      
                                      // Show confirmation
                                      alert('Video path cleared! You can now use YouTube URL.');
                                      setSuccessMessage('Video path cleared successfully. You can now use YouTube URL option.');
                                      
                                      // Debug message
                                      console.log('CLEAR OPERATION COMPLETED');
                                    }}
                                    style={{
                                      position: 'absolute',
                                      right: '10px',
                                      background: 'none',
                                      border: 'none',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                      color: '#EF4444',
                                      width: '30px',
                                      height: '30px',
                                      borderRadius: '50%',
                                      padding: '0'
                                    }}
                                    title="Clear video path"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <line x1="18" y1="6" x2="6" y2="18"></line>
                                      <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                  </button>
                                </div>
                                {(newsData.videoPath || newsData.video) && (
                                  <div style={{ 
                                    fontSize: '13px', 
                                    color: '#10B981',
                                    paddingLeft: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}>
                                    <span style={{ fontWeight: 'bold' }}>✓</span> MP4 video file stored (will be preserved when saving)
                                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#6B7280' }}>
                                      Format: <code style={{ backgroundColor: '#f3f4f6', padding: '2px 4px', borderRadius: '2px' }}>/uploads/videos/video-[timestamp]-[id].mp4</code>
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Upload New Video section (similar to Upload New Image) */}
                            <div style={{
                              borderTop: '1px solid #E5E7EB',
                              paddingTop: '16px',
                              marginTop: '16px'
                            }}>
                              <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#4B5563',
                                marginBottom: '8px'
                              }}>
                                Upload New Video:
                              </label>
                              
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                marginBottom: '16px'
                              }}>
                                <label 
                                  htmlFor="videoFileInput"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 16px',
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    color: '#374151',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                  </svg>
                                  Choose File
                                </label>
                                <span style={{ marginLeft: '12px', color: '#6B7280', fontSize: '14px' }}>
                                  {videoFile ? videoFile.name : 'No file selected'}
                                </span>
                                <input
                                  id="videoFileInput"
                                  type="file"
                                  accept="video/mp4"
                                  onChange={handleVideoFileChange}
                                  style={{ display: 'none' }}
                                />
                              </div>
                            </div>
                            
                            {/* Video Preview Section */}
                            {uploadMethod === 'file' && (
                              <div style={{ 
                                borderTop: '1px solid #E5E7EB',
                                paddingTop: '16px',
                                marginTop: '16px'
                              }}>
                                <label style={{
                                  display: 'block',
                                  fontSize: '14px',
                                  fontWeight: '500',
                                  color: '#4B5563',
                                  marginBottom: '8px'
                                }}>
                                  Current video:
                                </label>
                                
                                {/* Preview based on whether a new file is selected */}
                                {videoFile ? (
                                  /* Preview of newly selected video */
                                  <div>
                                    <p style={{ fontSize: '14px', color: '#10B981', marginBottom: '8px', fontWeight: '500' }}>
                                      ✓ New video selected (will be uploaded when you save)
                                    </p>
                                    <div style={{ position: 'relative' }}>
                                      <div style={{ 
                                        position: 'relative', 
                                        paddingBottom: '56.25%', /* 16:9 aspect ratio */
                                        height: 0,
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                        backgroundColor: '#f3f4f6',
                                        border: '2px solid #10B981',
                                        padding: '2px'
                                      }}>
                                        <video 
                                          src={newsData.videoPreviewUrl || URL.createObjectURL(videoFile)}
                                          controls
                                          style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'contain'
                                          }}
                                          onError={(e) => {
                                            console.error("Preview video failed to load:", e);
                                            e.target.parentNode.innerHTML = `
                                              <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; background-color: #f3f4f6; color: #6b7280;">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                                  <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                                                </svg>
                                                <p style="margin-top: 8px; font-size: 14px;">Video preview cannot be displayed</p>
                                              </div>
                                            `;
                                          }}
                                        ></video>
                                      </div>
                                      {/* Remove button */}
                                      <button 
                                        onClick={() => {
                                          setVideoFile(null);
                                          setNewsData(prev => ({
                                            ...prev,
                                            videoPreviewUrl: null
                                          }));
                                        }}
                                        style={{
                                          position: 'absolute',
                                          top: '10px',
                                          right: '10px',
                                          width: '36px',
                                          height: '36px',
                                          borderRadius: '50%',
                                          backgroundColor: 'rgba(239, 68, 68, 0.9)',
                                          color: 'white',
                                          border: 'none',
                                          display: 'flex',
                                          justifyContent: 'center',
                                          alignItems: 'center',
                                          cursor: 'pointer',
                                          zIndex: 1000
                                        }}
                                        title="Remove video"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                          <line x1="18" y1="6" x2="6" y2="18"></line>
                                          <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  /* Preview of existing video */
                                  (() => {
                                    const videoPath = newsData.videoPath || newsData.video;
                                    
                                    // Special handling for known video path format
                                    if (videoPath && (videoPath.includes('/uploads/videos/video-') || videoPath.includes('uploads/videos/video-'))) {
                                      console.log('Found matching video path format in preview section:', videoPath);
                                      
                                      // Format appropriate URL
                                      const formattedPath = videoPath.startsWith('/') ? videoPath : `/${videoPath}`;
                                      const videoUrl = `${API_BASE_URL}${formattedPath}`;
                                      
                                      console.log('Video URL constructed:', videoUrl);
                                      
                                      // Try preloading the video to check availability
                                      const videoElement = document.createElement('video');
                                      videoElement.muted = true;
                                      videoElement.preload = 'metadata';
                                      videoElement.src = videoUrl;
                                      
                                      videoElement.addEventListener('loadedmetadata', () => {
                                        console.log('✓ Video metadata loaded successfully:', videoUrl);
                                      });
                                      
                                      videoElement.addEventListener('error', (err) => {
                                        console.error('✗ Video preload failed:', err);
                                      });
                                      
                                      return (
                                        <div>
                                          <p style={{ fontSize: '14px', color: '#4B5563', marginBottom: '8px', fontWeight: '500' }}>
                                            ✓ MP4 video file: {videoPath}
                                          </p>
                                          
                                          {/* Using div with relative positioning to ensure buttons stay on top */}
                                          <div style={{ position: 'relative' }}>
                                            {/* Video container */}
                                            <div style={{ 
                                              position: 'relative', 
                                              paddingBottom: '56.25%',
                                              height: 0,
                                              borderRadius: '4px',
                                              overflow: 'hidden',
                                              backgroundColor: '#f3f4f6',
                                              border: '2px solid #10B981',
                                              padding: '2px'
                                            }}>
                                              <video 
                                                key={`video-${videoPath}`}
                                                src={videoUrl}
                                                controls
                                                preload="metadata"
                                                style={{
                                                  position: 'absolute',
                                                  top: 0,
                                                  left: 0,
                                                  width: '100%',
                                                  height: '100%',
                                                  objectFit: 'contain'
                                                }}
                                              ></video>
                                            </div>
                                            
                                            {/* Remove button removed */}
                                          </div>
                                        </div>
                                      );
                                    }
                                    
                                    // Any other video format
                                    else if (newsData.videoPath || newsData.video || 
                                       (newsData.originalVideoData && (
                                         newsData.originalVideoData.videoPath || 
                                         newsData.originalVideoData.video || 
                                         newsData.originalVideoData.featuredVideo || 
                                         newsData.originalVideoData.videoUrl
                                      ))) {
                                      // Get the best available video URL
                                      const videoUrl = getVideoUrl(newsData.videoPath || newsData.video || 
                                                     (newsData.originalVideoData ? 
                                                       (newsData.originalVideoData.videoPath || 
                                                        newsData.originalVideoData.video || 
                                                        newsData.originalVideoData.featuredVideo || 
                                                        newsData.originalVideoData.videoUrl) : ''));
                                      
                                      console.log('Video URL for OTHER format:', videoUrl);
                                      
                                      // Handle other video formats
                                      return (
                                        <div style={{ position: 'relative' }}>
                                          {/* Video container */}
                                          <div style={{ 
                                            position: 'relative', 
                                            paddingBottom: '56.25%',
                                            height: 0,
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                            backgroundColor: '#f3f4f6',
                                            border: '2px solid #e5e7eb',
                                            padding: '2px'
                                          }}>
                                            <video 
                                              controls
                                              style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain'
                                              }}
                                              src={videoUrl}
                                              onError={(e) => {
                                                console.error("Video failed to load", e);
                                                e.target.parentNode.innerHTML = `
                                                  <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; background-color: #f3f4f6; color: #6b7280;">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                                      <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                                                    </svg>
                                                    <p style="margin-top: 8px; font-size: 14px;">Video cannot be previewed</p>
                                                    <p style="margin-top: 4px; font-size: 12px;">Path: ${newsData.videoPath || newsData.video || 'unknown'}</p>
                                                    <p style="margin-top: 4px; font-size: 12px;">Source URL: ${e.target.src || 'unknown'}</p>
                                                    <button onclick="console.log('Attempting to reload video with new path'); window.location.reload();" style="margin-top: 8px; padding: 6px 12px; background: #4f46e5; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                                      Reload Page
                                                    </button>
                                                  </div>
                                                `;
                                              }}
                                            ></video>
                                          </div>
                                          
                                          {/* Remove button removed */}
                                        </div>
                                      );
                                    }
                                    
                                    // No video available
                                    else {
                                      return (
                                        <div style={{
                                          padding: '20px',
                                          backgroundColor: '#f9fafb',
                                          border: '1px dashed #d1d5db',
                                          borderRadius: '4px',
                                          textAlign: 'center'
                                        }}>
                                          <p style={{ color: '#6b7280', fontSize: '14px' }}>No video file currently associated with this post</p>
                                          <p style={{ color: '#4b5563', fontSize: '13px', marginTop: '8px' }}>
                                            Select "Choose File" above to upload a new MP4 video
                                          </p>
                                        </div>
                                      );
                                    }
                                  })()
                                )}
                              </div>
                            )}
                            
                            {/* Upload progress indicator */}
                            {uploadProgress > 0 && uploadProgress < 100 && (
                              <div style={{ 
                                backgroundColor: '#f0fdf4', 
                                color: '#15803d', 
                                padding: '12px', 
                                borderRadius: '6px',
                                marginTop: '16px'
                              }}>
                                Uploading: {uploadProgress}% complete
                                <div style={{ 
                                  width: '100%', 
                                  height: '8px', 
                                  backgroundColor: '#dcfce7', 
                                  borderRadius: '4px', 
                                  marginTop: '8px', 
                                  overflow: 'hidden' 
                                }}>
                                  <div style={{ 
                                    width: `${uploadProgress}%`, 
                                    height: '100%', 
                                    backgroundColor: '#34d399', 
                                    borderRadius: '4px',
                                    transition: 'width 0.3s ease'
                                  }} />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* YouTube preview if URL is provided */}
                        {uploadMethod === 'youtube' && newsData.youtubeUrl && (
                          <div style={{ marginTop: '12px', marginBottom: '24px' }}>
                            <div style={{ 
                              position: 'relative', 
                              paddingBottom: '56.25%', /* 16:9 aspect ratio */
                              height: 0,
                              overflow: 'hidden',
                              borderRadius: '8px'
                            }}>
                              <iframe
                                src={`https://www.youtube.com/embed/${newsData.youtubeUrl.split('v=')[1] || newsData.youtubeUrl.split('/').pop()}`}
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  border: '1px solid #e5e7eb'
                                }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title="YouTube Video"
                              ></iframe>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!isVideoContent && (
                      <div style={{ marginBottom: '24px' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '16px',
                          fontWeight: '500',
                          color: '#111827',
                          marginBottom: '8px'
                        }}>
                          Featured Image
                        </label>
                        <div style={{
                          border: '1px solid #D1D5DB',
                          borderRadius: '6px',
                          padding: '10px',
                          backgroundColor: '#f9fafb'
                        }}>
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontSize: '14px', fontWeight: '500', color: '#4B5563' }}>Current Image Path:</span>
                            </div>
                            <input
                              type="text"
                              value={newsData.featuredImage || ''}
                              onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                              placeholder="Image path or URL"
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #D1D5DB',
                                borderRadius: '6px',
                                fontSize: '14px'
                              }}
                            />
                          </div>
                          
                          <div style={{
                            borderTop: '1px solid #E5E7EB',
                            paddingTop: '12px',
                            marginTop: '12px'
                          }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontSize: '14px', fontWeight: '500', color: '#4B5563' }}>Upload New Image:</span>
                            </div>
                            
                            <input
                              type="file"
                              id="featured-image-upload"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const newFile = e.target.files[0];
                                  setNewsData({
                                    ...newsData,
                                    newFeaturedImage: newFile,
                                    newFeaturedImagePreview: URL.createObjectURL(newFile)
                                  });
                                }
                              }}
                              style={{ display: 'none' }}
                            />
                            <label 
                              htmlFor="featured-image-upload"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #D1D5DB',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: '#374151',
                                cursor: 'pointer'
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                              </svg>
                              Choose File
                            </label>
                            <span style={{ marginLeft: '12px', color: '#6B7280', fontSize: '14px' }}>
                              {newsData.newFeaturedImage ? newsData.newFeaturedImage.name : 'No file selected'}
                            </span>
                          </div>
                          
                          {/* Image Preview */}
                          {newsData.newFeaturedImagePreview ? (
                            <div style={{ marginTop: '12px' }}>
                              <p style={{ fontSize: '14px', color: '#10B981', marginBottom: '8px', fontWeight: '500' }}>
                                ✓ New image selected (will be uploaded when you save)
                              </p>
                              <img 
                                src={newsData.newFeaturedImagePreview}
                                alt="New Featured" 
                                style={{ 
                                  maxWidth: '100%', 
                                  maxHeight: '200px', 
                                  borderRadius: '4px',
                                  border: '2px solid #10B981',
                                  padding: '2px'
                                }}
                              />
                            </div>
                          ) : newsData.featuredImage && (
                            <div style={{ marginTop: '10px' }}>
                              <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Current image:</p>
                              <img 
                                src={newsData.featuredImage.startsWith('http') 
                                  ? newsData.featuredImage 
                                  : newsData.featuredImage.startsWith('/') 
                                    ? `${API_BASE_URL}${newsData.featuredImage}`
                                    : `${API_BASE_URL}/${newsData.featuredImage}`
                                }
                                alt="Featured" 
                                style={{ 
                                  maxWidth: '100%', 
                                  maxHeight: '200px', 
                                  borderRadius: '4px',
                                  border: '2px solid #e5e7eb',
                                  padding: '2px'
                                }} 
                                onError={(e) => {
                                  console.error("Image failed to load");
                                  e.target.src = "https://via.placeholder.com/400x200?text=Image+Not+Found";
                                  e.target.style.opacity = "0.5";
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div style={{ marginBottom: '24px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '16px',
                        fontWeight: '500',
                        color: '#111827',
                        marginBottom: '8px'
                      }}>
                        {isVideoContent ? 'Video Description' : 'Content'}
                      </label>
                      <TinyMCEEditor
                        value={newsData.content || ''}
                        onEditorChange={(content) => handleInputChange('content', content)}
                        height={500}
                        customConfig={{
                          branding: false,
                          promotion: false,
                          plugins: [
                            'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
                            'checklist', 'mediaembed', 'casechange', 'formatpainter', 'pageembed'
                          ],
                          toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                          tinycomments_mode: 'embedded',
                          tinycomments_author: 'Editor'
                        }}
                      />
                    </div>
                  </div>

                  {/* Organization Section */}
                  <div>
                    <div style={{
                      backgroundColor: '#F9FAFB',
                      padding: '24px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#111827',
                        marginTop: 0,
                        marginBottom: '16px'
                      }}>
                        Organize
                      </h3>
                      
                      {/* Category Dropdown - Limited options */}
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#111827',
                          marginBottom: '8px'
                        }}>
                          CATEGORY
                        </label>
                        <select
                          value={newsData.category || ''} // Ensure binding
                          onChange={(e) => handleInputChange('category', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #D1D5DB',
                            borderRadius: '6px',
                            backgroundColor: '#FFFFFF'
                          }}
                        >
                          <option value="">---------</option> {/* Placeholder like EditPost */}
                          <option value="national">राष्ट्रीय | National</option>
                          <option value="international">अंतरराष्ट्रीय | International</option>
                          <option value="sports">खेल | Sports</option>
                          <option value="entertainment">मनोरंजन | Entertainment</option>
                          {/* Removed other categories */}
                        </select>
                      </div>
                      
                      {/* State Dropdown - Limited options */}
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#111827',
                          marginBottom: '8px'
                        }}>
                          STATE
                        </label>
                        <select
                          value={newsData.state || ''} // Ensure binding
                          onChange={(e) => {
                            const newState = e.target.value;
                            console.log('STATE CHANGED TO:', newState);
                            
                            // First update the state
                            setNewsData({
                              ...newsData,
                              state: newState,
                              district: '' // Reset district when state changes
                            });
                            
                            // Log the change for debugging
                            console.log('Updated newsData with new state:', newState);
                            console.log('District has been reset');
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #D1D5DB',
                            borderRadius: '6px',
                            backgroundColor: '#FFFFFF'
                          }}
                        >
                          <option value="">---------</option> {/* Placeholder like EditPost */}
                          <option value="bihar">बिहार | Bihar</option>
                          <option value="jharkhand">झारखंड | Jharkhand</option>
                          <option value="up">उत्तर प्रदेश | Uttar Pradesh</option>
                          {/* Removed other states */}
                        </select>
                      </div>
                      
                      {/* District Dropdown - Updated values */}
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#111827',
                          marginBottom: '8px'
                        }}>
                          DISTRICT
                        </label>
                        <select
                          value={newsData.district || ''} // Ensure binding
                          onChange={(e) => {
                            const newDistrict = e.target.value;
                            console.log('DISTRICT CHANGED TO:', newDistrict);
                            
                            // Directly update the newsData state
                            setNewsData({
                              ...newsData,
                              district: newDistrict
                            });
                            
                            // Log the change for debugging
                            console.log('Updated newsData with new district:', newDistrict);
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #D1D5DB',
                            borderRadius: '6px',
                            backgroundColor: newsData.state ? '#FFFFFF' : '#f3f4f6' // Style when disabled
                          }}
                          disabled={!newsData.state} // Disable if no state is selected
                        >
                          <option value="">---------</option> {/* Placeholder like EditPost */}
                          {newsData.state && locationData[newsData.state] && locationData[newsData.state].map(district => (
                            // Use the specific 'value' from the updated locationData
                            <option key={district.value} value={district.value}>
                              {district.hindi} | {district.english}
                            </option>
                          ))}
                          {newsData.state && !locationData[newsData.state] && (
                             <option value="" disabled>No districts found for this state</option>
                          )}
                        </select>
                      </div>
                      
                      {/* Status section showing current status */}
                      <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f1f5f9', borderRadius: '6px' }}>
                        <div style={{ fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                          CURRENT STATUS
                        </div>
                        <div style={{ 
                          display: 'inline-block', 
                          padding: '4px 12px', 
                          borderRadius: '16px',
                          fontSize: '14px',
                          fontWeight: '500',
                          backgroundColor: newsData.status === 'pending' ? '#fef3c7' : 
                                           newsData.status === 'approved' ? '#d1fae5' : 
                                           newsData.status === 'rejected' ? '#fee2e2' : '#e5e7eb',
                          color: newsData.status === 'pending' ? '#92400e' : 
                                 newsData.status === 'approved' ? '#065f46' : 
                                 newsData.status === 'rejected' ? '#b91c1c' : '#374151'
                        }}>
                          {newsData.status === 'pending' ? 'Pending Approval' : 
                           newsData.status === 'approved' ? 'Approved' : 
                           newsData.status === 'rejected' ? 'Rejected' : 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </main>
        </div>
        
        <EditorFooter />
      </div>
    </div>
  );
};

export default EditorEditScreen; 