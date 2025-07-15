import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';
import { FiChevronDown } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  Button 
} from '@mui/material';

const API_BASE_URL = 'https://api.newztok.in';

axios.defaults.timeout = 120000;

// Add this compression utility function
const compressImage = (file, maxSizeMB = 5) => {
  return new Promise((resolve, reject) => {
    // If file is already smaller than target size, don't compress
    if (file.size / 1024 / 1024 <= maxSizeMB) {
      console.log('File already smaller than target size, skipping compression');
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        // Calculate dimensions to maintain aspect ratio
        let { width, height } = img;
        let maxWidth = 1920;
        let maxHeight = 1080;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * maxHeight / height);
            height = maxHeight;
          }
        }

        // Create canvas for compression
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Start with higher quality
        let quality = 0.9;
        const tryCompress = () => {
          console.log(`Trying compression with quality: ${quality}`);
          canvas.toBlob((blob) => {
            // Create a new file from the blob
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: new Date().getTime()
            });

            console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)}MB, Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
            
            // If still too large and we can compress more, retry with lower quality
            if (compressedFile.size / 1024 / 1024 > maxSizeMB && quality > 0.5) {
              quality -= 0.1;
              tryCompress();
            } else {
              resolve(compressedFile);
            }
          }, 'image/jpeg', quality);
        };

        tryCompress();
      };
      img.onerror = (error) => {
        reject(error);
      };
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
};

const StandardPost = () => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [journalistProfile, setJournalistProfile] = useState(null);
  const [showSessionExpiredDialog, setShowSessionExpiredDialog] = useState(false);
  const editorRef = useRef(null);
  const navigate = useNavigate();

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

  // Check for token expiration
  useEffect(() => {
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
    
    // Check token expiration on component mount
    checkTokenExpiration();
  }, []);

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

  // Function to get auth token
  const getAuthToken = () => {
    const storageLocations = [localStorage, sessionStorage];
    const possibleKeys = ['authToken', 'token', 'jwtToken', 'userToken', 'accessToken'];
    
    for (const storage of storageLocations) {
      for (const key of possibleKeys) {
        const token = storage.getItem(key);
        if (token) {
          console.log(`Found token with key '${key}' in ${storage === localStorage ? 'localStorage' : 'sessionStorage'}`);
          return token;
        }
      }
    }
    
    return null;
  };

  // Fetch journalist profile on component mount
  useEffect(() => {
    const fetchJournalistProfile = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          setError('Authentication token not found. Please login again.');
          setShowSessionExpiredDialog(true);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/users/my-profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Journalist profile:', response.data);
        setJournalistProfile(response.data);
        
        // Set state and district from journalist profile
        if (response.data.assignState) {
          setState(response.data.assignState);
          console.log('Setting assigned state:', response.data.assignState);
        }
        
        if (response.data.assignDistrict) {
          setDistrict(response.data.assignDistrict);
          console.log('Setting assigned district:', response.data.assignDistrict);
        }
      } catch (err) {
        console.error('Failed to fetch journalist profile:', err);
        
        // Check if the error is due to an expired token
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          console.log('Token is invalid or expired');
          setShowSessionExpiredDialog(true);
        }
        
        // Don't show error to user for profile fetch, just log it
      }
    };

    fetchJournalistProfile();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check if file is too large (over 50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size exceeds 50MB. Please select a smaller image.');
        return;
      }
      
      // Set loading state
      setLoading(true);
      
      // Show compressing message
      setError('Compressing image for better upload performance. Please wait...');
      
      // Compress the image before setting it (target 5MB)
      compressImage(selectedFile, 5)
        .then(compressedFile => {
          setFile(compressedFile);
          setError(''); // Clear the compression message
          
          // Provide feedback about compression
          const originalSizeMB = (selectedFile.size / 1024 / 1024).toFixed(2);
          const compressedSizeMB = (compressedFile.size / 1024 / 1024).toFixed(2);
          
          console.log(`Image compressed from ${originalSizeMB}MB to ${compressedSizeMB}MB`);
          if (originalSizeMB > compressedSizeMB) {
            const savingsPercentage = (100 - (compressedFile.size / selectedFile.size * 100)).toFixed(0);
            alert(`Image optimized! Reduced by ${savingsPercentage}% (from ${originalSizeMB}MB to ${compressedSizeMB}MB)`);
          }
        })
        .catch(err => {
          console.error('Error compressing image:', err);
          // Fallback to original file
          setFile(selectedFile);
          setError('');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleDiscard = () => {
    alert("We are working on the discard functionality. Please stay tuned!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get content from editor if available before validation
    let editorContent = '';
    if (editorRef.current) {
      editorContent = editorRef.current.getContent();
    }
    
    // Ensure the content has actual content and not just empty HTML tags
    const actualContent = editorContent || content;
    const hasContent = actualContent && !/<p>\s*<\/p>$/.test(actualContent) && actualContent !== '<p></p>';
    
    // Validate form fields
    if (!title || title.trim() === '') {
      setError('Please enter a title for your post');
      return;
    }
    
    if (!hasContent || actualContent.trim() === '') {
      setError('Please add some content to your post');
      return;
    }
    
    if (!category || category.trim() === '') {
      setError('Please select a category for your post');
      return;
    }
    
    if (!file) {
      setError('Please select a featured image');
      return;
    }

    // Get the auth token
    const token = getAuthToken();
    
    if (!token) {
      setError('No authentication token found. Please login again.');
      setShowSessionExpiredDialog(true);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Add retry functionality
      const maxRetries = 3;
      let retryCount = 0;
      let success = false;
      
      // Create FormData to send the post with all data including the image
      const formData = new FormData();
      
      // Add required fields
      formData.append('title', title.trim()); // Post Title/Headline
      formData.append('content', actualContent.trim()); // Content
      formData.append('category', category); // CATEGORY
      formData.append('contentType', 'standard');
      formData.append('featuredImage', file); // Featured Image
      
      // Add state and district from journalist profile
      // If journalist has assigned state/district, use those values
      const stateToUse = journalistProfile?.assignState || state;
      const districtToUse = journalistProfile?.assignDistrict || district;
      
      // Add state and district to formData
      if (stateToUse && stateToUse.trim() !== '') formData.append('state', stateToUse);
      if (districtToUse && districtToUse.trim() !== '') formData.append('district', districtToUse);
      
      // Show the submission data in the console
      console.log('Submitting post with the following data:', {
        title: title.trim(),
        content: `${actualContent.trim().substring(0, 50)}${actualContent.length > 50 ? '...' : ''}`,
        category,
        contentType: 'standard',
        state: stateToUse || '[not set]',
        district: districtToUse || '[not set]',
        featuredImage: {
          name: file.name,
          size: `${(file.size / 1024).toFixed(2)} KB`,
          type: file.type
        }
      });
      
      // Try main endpoint
      let response;
      try {
        console.log('Attempting main endpoint: /api/news/create');
        // Make the API request
        response = await axios({
          method: 'post',
          url: `${API_BASE_URL}/api/news/create`,
          data: formData,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        });
      } catch (mainEndpointErr) {
        console.error('Main endpoint failed:', mainEndpointErr);
        
        // Check if the error is due to an expired token
        if (mainEndpointErr.response && (mainEndpointErr.response.status === 401 || mainEndpointErr.response.status === 403)) {
          console.log('Token is invalid or expired');
          setShowSessionExpiredDialog(true);
          throw mainEndpointErr; // Re-throw to skip the other endpoints
        }
        
        // Try to extract detailed error information
        let errorDetail = '';
        if (mainEndpointErr.response && mainEndpointErr.response.data) {
          try {
            errorDetail = typeof mainEndpointErr.response.data === 'object' 
              ? JSON.stringify(mainEndpointErr.response.data) 
              : mainEndpointErr.response.data;
            console.log('Server error details:', errorDetail);
          } catch (e) {
            console.error('Could not parse error details');
          }
        }
        
        // Try alternative endpoint #1 - /api/posts
        try {
          console.log('Trying alternative endpoint #1: /api/posts');
          response = await axios({
            method: 'post',
            url: `${API_BASE_URL}/api/posts`,
            data: formData,
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });
        } catch (alt1Err) {
          console.error('Alternative endpoint #1 failed:', alt1Err);
          
          // Check if the error is due to an expired token
          if (alt1Err.response && (alt1Err.response.status === 401 || alt1Err.response.status === 403)) {
            console.log('Token is invalid or expired');
            setShowSessionExpiredDialog(true);
            throw alt1Err; // Re-throw to skip the other endpoints
          }
          
          // Try alternative endpoint #2 - /api/content
          try {
            console.log('Trying alternative endpoint #2: /api/content');
            response = await axios({
              method: 'post',
              url: `${API_BASE_URL}/api/content`,
              data: formData,
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              }
            });
          } catch (alt2Err) {
            console.error('Alternative endpoint #2 failed:', alt2Err);
            
            // Check if the error is due to an expired token
            if (alt2Err.response && (alt2Err.response.status === 401 || alt2Err.response.status === 403)) {
              console.log('Token is invalid or expired');
              setShowSessionExpiredDialog(true);
              throw alt2Err; // Re-throw to skip the other endpoints
            }
            
            // Last resort - Try alternative endpoint #3 with minimal JSON
            try {
              console.log('Last resort - using /api/v2/news with JSON only');
              
              // Create minimal JSON without problematic fields
              const minimalData = {
                title: title.trim(),
                content: actualContent.trim(),
                category,
                status: 'pending',
                state: stateToUse,
                district: districtToUse
              };
              
              response = await axios.post(
                `${API_BASE_URL}/api/v2/news`,
                minimalData,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
            } catch (lastResortErr) {
              console.error('All endpoints failed:', lastResortErr);
              
              // Check if the error is due to an expired token
              if (lastResortErr.response && (lastResortErr.response.status === 401 || lastResortErr.response.status === 403)) {
                console.log('Token is invalid or expired');
                setShowSessionExpiredDialog(true);
                throw lastResortErr;
              }
              
              // Let the main error handler deal with this
              throw {
                message: 'Server unavailable: All API endpoints failed',
                originalErrors: {
                  main: mainEndpointErr?.message,
                  alt1: alt1Err?.message,
                  alt2: alt2Err?.message,
                  lastResort: lastResortErr?.message
                },
                serverDetail: errorDetail
              };
            }
          }
        }
      }
      
      console.log('Post created successfully:', response.data);
      
      // Handle success
      setLoading(false);
      setError('');
      
      // Show success message
      alert('🎉 Success! Your post has been submitted for review.');
      
      // Clear form directly instead of calling handleDiscard
      setTitle('');
      setContent('');
      setFile(null);
      setCategory('');
      if (!journalistProfile?.assignState) setState('');
      if (!journalistProfile?.assignDistrict) setDistrict('');
      if (editorRef.current) {
        editorRef.current.setContent('');
      }
      
      // Navigate after a short delay
      setTimeout(() => {
        navigate('/journalist/pendingApprovals');
      }, 2000);
      
    } catch (err) {
      console.error('API request failed:', err);
      
      // Check for session expiration
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        console.log('Token is invalid or expired');
        setShowSessionExpiredDialog(true);
        setLoading(false);
        setUploadProgress(0);
        return;
      }
      
      // Enhanced error reporting with more details
      if (err.originalErrors) {
        const errorDetails = Object.entries(err.originalErrors)
          .map(([key, value]) => `${key}: ${value}`)
          .join('; ');
        
        setError(`All API endpoints failed. Please contact the admin with this error: ${err.message}. 
          Try again later or use another browser. 
          Server details: ${err.serverDetail || 'Unknown'}`);
      } else if (err.response && err.response.data) {
        // Try to extract message from various response formats
        let message = err.message;
        try {
          if (typeof err.response.data === 'object' && err.response.data.message) {
            message = err.response.data.message;
          } else if (typeof err.response.data === 'string') {
            const match = err.response.data.match(/"message"\s*:\s*"([^"]+)"/);
            if (match && match[1]) {
              message = match[1];
            }
          }
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        
        setError(`Server error: ${message}. Status: ${err.response.status}`);
      } else {
        setError(`Error: ${err.message}`);
      }
      
      // Display a more user-friendly error 
      setError(<div>
        <div style={{fontWeight: 'bold', marginBottom: '8px'}}>Unable to create post</div>
        <div>The server is currently experiencing issues. This appears to be a server-side database problem.</div>
        <div style={{marginTop: '8px'}}>
          <strong>Please try:</strong>
          <ul style={{marginLeft: '20px', marginTop: '4px'}}>
            <li>Using the "Save Draft" option instead</li>
            <li>Contact your technical support team</li>
            <li>Try again in a few hours after the database issues are resolved</li>
          </ul>
        </div>
        <div style={{marginTop: '8px', fontSize: '13px', color: '#666'}}>
          Technical details: {err.message || 'Unknown error'}
        </div>
      </div>);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleEditorChange = (content, editor) => {
    setContent(content);
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);
  };

  return (
    <div style={{ padding: '30px', backgroundColor: '#f9fafb' }}>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '5px' }}>Create a Standard Post</h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Create and publish news content for the platform</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#1f2937', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
            onClick={handleDiscard}
            disabled={loading}
          >
            Discard
          </button>
          <button 
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#4f46e5', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              fontWeight: '500',
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
              pointerEvents: loading ? 'none' : 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading && (
              <div style={{ 
                width: '16px', 
                height: '16px', 
                borderRadius: '50%', 
                border: '2px solid rgba(255,255,255,0.3)', 
                borderTopColor: 'white',
                animation: 'spin 1s linear infinite'
              }} />
            )}
            {loading ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ 
          backgroundColor: '#fee2e2', 
          color: '#b91c1c', 
          padding: '16px', 
          borderRadius: '6px',
          marginBottom: '20px',
          maxHeight: error.length > 200 ? '200px' : 'auto',
          overflow: error.length > 200 ? 'auto' : 'visible'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '16px' }}>
            {error.includes('Server Error') ? 'Server Error Detected' : 'Error'}
          </div>
          <div style={{ 
            whiteSpace: 'pre-line',  // Preserves line breaks in the error message
            marginBottom: '12px'
          }}>
            {error}
          </div>
          {error.includes('Server Error') && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button 
                onClick={handleSubmit}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Retry Submission
              </button>
              <button 
                onClick={() => window.location.reload()}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Reload Page
              </button>
            </div>
          )}
        </div>
      )}

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div style={{ 
          backgroundColor: '#f0fdf4', 
          color: '#15803d', 
          padding: '12px', 
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          Uploading: {uploadProgress}% complete
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: '3' }}>
          <form>
            {/* Post Title/Headline */}
            <div style={{ marginBottom: '24px' }}>
              <label 
                htmlFor="title"
                style={{ 
                  display: 'block', 
                  fontWeight: '500', 
                  marginBottom: '8px', 
                  fontSize: '16px',
                  color: '#111827'
                }}
              >
                Post Title/Headline
              </label>
              <input
                id="title"
                type="text"
                placeholder="Write title here..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Featured Image */}
            <div style={{ marginBottom: '24px' }}>
              <label 
                htmlFor="featuredImage"
                style={{ 
                  display: 'block', 
                  fontWeight: '500', 
                  marginBottom: '8px', 
                  fontSize: '16px',
                  color: '#111827'
                }}
              >
                Featured Image <span style={{ color: '#6b7280', fontSize: '12px' }}>(Max 50MB)</span>
              </label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                border: '1px solid #e5e7eb', 
                borderRadius: '6px',
                overflow: 'hidden'
              }}>
                <label 
                  htmlFor="fileInput"
                  style={{
                    padding: '8px 14px',
                    backgroundColor: '#f9fafb',
                    borderRight: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Choose File
                </label>
                <span style={{ padding: '8px 14px', color: '#6b7280', fontSize: '14px' }}>
                  {file ? file.name : 'no file selected'}
                </span>
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {/* Content Editor using TinyMCE */}
            <div style={{ marginBottom: '24px' }}>
              <label 
                htmlFor="content"
                style={{ 
                  display: 'block', 
                  fontWeight: '500', 
                  marginBottom: '8px', 
                  fontSize: '16px',
                  color: '#111827'
                }}
              >
                Content
              </label>
              <Editor
                apiKey="omxjaluaxpgfpa6xkfadimoprrirfmhozsrtpb3o1uimu4c5"
                onInit={(evt, editor) => {
                  editorRef.current = editor;
                }}
                initialValue=""
                value={content}
                onEditorChange={handleEditorChange}
                init={{
                  height: 300,
                  menubar: true,
                  plugins: [
                    'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
                  ],
                  toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                }}
              />
            </div>

            {/* Category Dropdown */}
            <div style={{ marginBottom: '24px' }}>
              <label 
                htmlFor="category"
                style={{ 
                  display: 'block', 
                  fontWeight: '500', 
                  marginBottom: '8px', 
                  fontSize: '14px',
                  color: '#374151',
                  textTransform: 'uppercase'
                }}
              >
                CATEGORY
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  id="category"
                  value={category}
                  onChange={handleCategoryChange}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    appearance: 'none',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    fontSize: '14px'
                  }}
                >
                  <option value="">---------</option>
                  <option value="national">राष्ट्रीय | National</option>
                  <option value="international">अंतरराष्ट्रीय | International</option>
                  <option value="sports">खेल | Sports</option>
                  <option value="entertainment">मनोरंजन | Entertainment</option>
                </select>
                <FiChevronDown 
                  style={{ 
                    position: 'absolute', 
                    right: '10px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: '#6b7280',
                    pointerEvents: 'none'
                  }} 
                />
              </div>
            </div>
          </form>
        </div>
        
        {/* Right Sidebar */}
        <div style={{ flex: '1' }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '16px',
              color: '#111827'
            }}>
              Organize
            </h2>
            
            {/* State Dropdown */}
            <div style={{ marginBottom: '16px' }}>
              <label 
                htmlFor="state"
                style={{ 
                  display: 'block', 
                  fontWeight: '500', 
                  marginBottom: '8px', 
                  fontSize: '14px',
                  color: '#374151',
                  textTransform: 'uppercase'
                }}
              >
                STATE {journalistProfile?.assignState && '(Pre-assigned)'}
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  id="state"
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    setDistrict(''); // Reset district when state changes
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    appearance: 'none',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    backgroundColor: journalistProfile?.assignState ? '#f9fafb' : 'white',
                    fontSize: '14px'
                  }}
                  disabled={!!journalistProfile?.assignState}
                >
                  <option value="">---------</option>
                  <option value="bihar">बिहार | Bihar</option>
                  <option value="jharkhand">झारखंड | Jharkhand</option>
                  <option value="up">उत्तर प्रदेश | Uttar Pradesh</option>
                </select>
                <FiChevronDown 
                  style={{ 
                    position: 'absolute', 
                    right: '10px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: '#6b7280',
                    pointerEvents: 'none'
                  }} 
                />
              </div>
            </div>

            {/* District Dropdown */}
            <div style={{ marginBottom: '16px' }}>
              <label 
                htmlFor="district"
                style={{ 
                  display: 'block', 
                  fontWeight: '500', 
                  marginBottom: '8px', 
                  fontSize: '14px',
                  color: '#374151',
                  textTransform: 'uppercase'
                }}
              >
                DISTRICT {journalistProfile?.assignDistrict && '(Pre-assigned)'}
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  id="district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    appearance: 'none',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    backgroundColor: journalistProfile?.assignDistrict ? '#f9fafb' : 'white',
                    fontSize: '14px'
                  }}
                  disabled={!state || !!journalistProfile?.assignDistrict}
                >
                  <option value="">---------</option>
                  {state && locationData[state] && locationData[state].map(district => (
                    <option key={district.value} value={district.value}>
                      {district.hindi} | {district.english}
                    </option>
                  ))}
                </select>
                <FiChevronDown 
                  style={{ 
                    position: 'absolute', 
                    right: '10px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: '#6b7280',
                    pointerEvents: 'none'
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandardPost; 