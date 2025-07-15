import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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

// Configure axios with increased timeout
axios.defaults.timeout = 120000; // 2 minutes timeout

// Special timeout for video uploads (10 minutes)
const VIDEO_UPLOAD_TIMEOUT = 600000; // 10 minutes

const VideoPost = () => {
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMethod, setUploadMethod] = useState('youtube'); // 'youtube' or 'file'
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
      
      // Provide success feedback about file selection
      setSuccess(`MP4 video "${selectedFile.name}" selected (${(selectedFile.size/1024/1024).toFixed(2)} MB). Click "Publish Video" to upload.`);
      setTimeout(() => setSuccess(''), 5000); // Clear message after 5 seconds
      
      setVideoFile(selectedFile);
      // If user uploads a file, switch to file upload method
      setUploadMethod('file');
      // Clear YouTube URL if video file is selected
      setYoutubeUrl('');
      // Clear any previous errors
      setError('');
    }
  };

  const handleDiscard = () => {
    alert("We are working on the discard functionality. Please stay tuned!");
  };

  const handleSaveDraft = () => {
    // Save draft logic here
    console.log('Saving draft...');
  };

  const handleYoutubeUrlChange = (e) => {
    setYoutubeUrl(e.target.value);
    if (e.target.value) {
      // If user enters a YouTube URL, switch to YouTube method
      setUploadMethod('youtube');
      // Clear video file if YouTube URL is entered
      setVideoFile(null);
    }
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
      setError('Please enter a title for your video post');
      return;
    }
    
    if (uploadMethod === 'youtube' && (!youtubeUrl || !youtubeUrl.includes('youtube'))) {
      setError('Please enter a valid YouTube URL');
      return;
    }
    
    if (uploadMethod === 'file' && !videoFile) {
      setError('Please select a video file to upload');
      return;
    }
    
    if (!hasContent || actualContent.trim() === '') {
      setError('Please add a description to your video post');
      return;
    }
    
    if (!category || category.trim() === '') {
      setError('Please select a category for your video post');
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
      setError('Uploading video... Please wait');
      setUploadProgress(0);
      
      // Create FormData with all necessary data
      const formData = new FormData();
      
      // Add required fields
      formData.append('title', title.trim());
      formData.append('content', actualContent.trim());
      formData.append('category', category);
      formData.append('contentType', 'video');
      
      // Add video data based on upload method
      if (uploadMethod === 'youtube') {
        formData.append('youtubeUrl', youtubeUrl);
        console.log('Submitting YouTube video post');
      } else {
        // Try with field name 'featuredMedia' based on similar naming to 'featuredImage' in StandardPost
        formData.append('featuredMedia', videoFile);
        console.log('Submitting MP4 video with field name "featuredMedia"');
      }
      
      // Add optional fields only if they exist
      if (state && state.trim() !== '') formData.append('state', state);
      if (district && district.trim() !== '') formData.append('district', district);
      
      // Log what we're sending for debugging
      console.log('Form data keys:', [...formData.keys()]);
      
      // Define possible field names for video upload
      const possibleFieldNames = ['featuredMedia', 'video', 'media', 'file'];
      let response = null;
      let succeeded = false;
      
      // Try each field name until one works
      for (const fieldName of possibleFieldNames) {
        if (response) break; // Stop if we already have a successful response
        
        try {
          console.log(`Trying with field name "${fieldName}"`);
          setError(`Trying upload with field name "${fieldName}"... Please wait.`);
          
          // Create a new FormData for each attempt
          const attemptFormData = new FormData();
          
          // Add all the same fields
          attemptFormData.append('title', title.trim());
          attemptFormData.append('content', actualContent.trim());
          attemptFormData.append('category', category);
          attemptFormData.append('contentType', 'video');
          
          // Add video data with the current field name
          if (uploadMethod === 'youtube') {
            attemptFormData.append('youtubeUrl', youtubeUrl);
          } else {
            attemptFormData.append(fieldName, videoFile);
          }
          
          // Add optional fields
          if (state && state.trim() !== '') attemptFormData.append('state', state);
          if (district && district.trim() !== '') attemptFormData.append('district', district);
          
          // Make API request
          response = await axios({
            method: 'post',
            url: `${API_BASE_URL}/api/news/create`,
            data: attemptFormData,
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
            timeout: uploadMethod === 'file' ? VIDEO_UPLOAD_TIMEOUT : axios.defaults.timeout,
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
              console.log(`Upload progress (${fieldName}): ${percentCompleted}%`);
            }
          });
          
          console.log(`Video post created successfully with field name "${fieldName}":`, response.data);
          succeeded = true;
          break;
          
        } catch (attemptErr) {
          console.log(`Attempt with field name "${fieldName}" failed:`, attemptErr.message);
          
          // Check if the error is due to an expired token
          if (attemptErr.response && (attemptErr.response.status === 401 || attemptErr.response.status === 403)) {
            console.log('Token is invalid or expired');
            setShowSessionExpiredDialog(true);
            throw attemptErr; // Re-throw to exit the loop
          }
          
          setError(`Attempt with field name "${fieldName}" failed. Trying another approach...`);
          
          // Log detailed error information
          if (attemptErr.response) {
            console.log('Status:', attemptErr.response.status);
            console.log('Data:', attemptErr.response.data);
          }
          
          // Continue to the next field name
        }
      }
      
      // If all attempts failed, throw an error
      if (!succeeded) {
        throw new Error('All field name attempts failed');
      }
      
      // Handle success
      setLoading(false);
      setError('');
      
      // Show success message
      setSuccess(
        <div>
          <div style={{fontWeight: 'bold', fontSize: '16px', marginBottom: '6px'}}>
            🎉 Success! Your video post has been submitted for review.
          </div>
          <div style={{marginBottom: '4px'}}>
            Title: <strong>{title}</strong>
          </div>
          <div style={{marginBottom: '4px'}}>
            Category: <strong>{category}</strong>
            {state ? <span>, State: <strong>{state}</strong></span> : ''}
            {district ? <span>, District: <strong>{district}</strong></span> : ''}
          </div>
          <div style={{marginBottom: '4px'}}>
            Source: <strong>{uploadMethod === 'youtube' ? 'YouTube' : 'Uploaded Video'}</strong>
          </div>
        </div>
      );
      
      // Reset form fields
      setTitle('');
      setYoutubeUrl('');
      setVideoFile(null);
      setContent('');
      setCategory('');
      setState(journalistProfile?.assignState || '');
      setDistrict(journalistProfile?.assignDistrict || '');
      setUploadProgress(0);
      
      // Navigate after a short delay
      setTimeout(() => {
        navigate('/journalist/pendingApprovals');
      }, 2000);
      
    } catch (err) {
      console.error('API request failed:', err);
      setLoading(false);
      
      // Check for session expiration
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        console.log('Token is invalid or expired');
        setShowSessionExpiredDialog(true);
        setLoading(false);
        setUploadProgress(0);
        return;
      }
      
      if (err.code === 'ECONNABORTED') {
        setError(
          <div>
            <div style={{fontWeight: 'bold', marginBottom: '8px'}}>Upload timed out</div>
            <div>The video file may be too large. Please try a smaller file or use YouTube URL instead.</div>
          </div>
        );
      } else if (err.response && err.response.data) {
        // Try to extract message from response
        let message = err.message;
        
        // Log the complete error response for debugging
        console.log('Error response data:', JSON.stringify(err.response.data));
        console.log('Error response status:', err.response.status);
        console.log('Error response headers:', err.response.headers);
        
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
        setError(
          <div>
            <div style={{fontWeight: 'bold', marginBottom: '8px'}}>Unable to create video post</div>
            <div>The server is currently experiencing issues. Please try again later.</div>
            <div style={{marginTop: '8px', fontSize: '13px', color: '#666'}}>
              Technical details: {err.message || 'Unknown error'}
            </div>
          </div>
        );
      }
    }
  };
  
  // Helper function for YouTube URL validation
  const isValidYouTubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(url);
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
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '5px' }}>Create a Video Post</h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Create and publish video content for the platform</p>
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
            {loading ? 'Publishing...' : 'Publish Video'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ 
          backgroundColor: '#fee2e2', 
          color: '#b91c1c', 
          padding: '12px', 
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ 
          backgroundColor: '#ecfdf5', 
          color: '#065f46', 
          padding: '12px', 
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          {success}
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
            {/* Video Title */}
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

            {/* Method Selection */}
            <div style={{ marginBottom: '24px' }}>
              <label 
                style={{ 
                  display: 'block', 
                  fontWeight: '500', 
                  marginBottom: '8px', 
                  fontSize: '16px',
                  color: '#111827'
                }}
              >
                Video Source
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setUploadMethod('youtube')}
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
                  YouTube URL
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod('file')}
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
                  Upload Video File
                </button>
              </div>
            </div>

            {/* YouTube URL field - show only if YouTube method is selected */}
            {uploadMethod === 'youtube' && (
              <div style={{ marginBottom: '24px' }}>
                <label 
                  htmlFor="youtubeUrl"
                  style={{ 
                    display: 'block', 
                    fontWeight: '500', 
                    marginBottom: '8px', 
                    fontSize: '16px',
                    color: '#111827'
                  }}
                >
                  YouTube URL
                </label>
                <input
                  id="youtubeUrl"
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={handleYoutubeUrlChange}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px'
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
                  Video File <span style={{ color: '#6b7280', fontSize: '12px' }}>(Max 50MB)</span>
                </label>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}>
                  <label 
                    htmlFor="videoFileInput"
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
                    {videoFile ? videoFile.name : 'no file selected'}
                  </span>
                  <input
                    id="videoFileInput"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileChange}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
            )}

            {/* Video Description */}
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
                Video Description
              </label>
              <TinyMCEEditor
                editorRef={editorRef}
                value={content}
                onEditorChange={handleEditorChange}
                height={300}
              />
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
            
            <div style={{ marginBottom: '16px' }}>
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

export default VideoPost; 