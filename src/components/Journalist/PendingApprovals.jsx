import React, { useState, useEffect } from 'react';
import { FiChevronDown, FiEdit, FiX, FiClock } from 'react-icons/fi';
import { HiOutlineArrowNarrowRight } from 'react-icons/hi';
import { FaCheck, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { Editor } from '@tinymce/tinymce-react';
import { useNavigate } from 'react-router-dom';
import { formatApiUrl, getAuthToken, getAuthConfig } from '../../utils/api';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  TablePagination,
  Chip,
  Tooltip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { Edit as EditIcon, VideoFile as VideoFileIcon, Image as ImageIcon } from '@mui/icons-material';

// CSS for spinner animation
const spinAnimation = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const PendingApprovals = () => {
  const [pendingNews, setPendingNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editState, setEditState] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editorKey, setEditorKey] = useState(Date.now());
  const [editorRef, setEditorRef] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [isVideoContent, setIsVideoContent] = useState(false);
  const [showSessionExpiredDialog, setShowSessionExpiredDialog] = useState(false);
  
  // API Base URL
  const baseURL = 'https://api.newztok.in';

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

  // Add useEffect to fetch pending news when component mounts
  useEffect(() => {
    console.log('PendingApprovals component mounted at:', new Date().toISOString());
    console.log('Starting to fetch pending news...');
    fetchPendingNews();
    
    // Add page visibility change listener to refresh data when tab becomes active
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Only fetch if data is stale (more than 2 minutes old)
        const now = new Date();
        const twoMinutes = 2 * 60 * 1000;
        if (!lastFetchTime || (now - lastFetchTime) > twoMinutes) {
          console.log('Page became visible and data is stale, refreshing data...');
          fetchPendingNews();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Check for refresh flag set by EditPost component
    const refreshFlag = localStorage.getItem('pendingApprovals_refresh');
    if (refreshFlag === 'true') {
      console.log('Refresh flag detected, fetching fresh data');
      fetchPendingNews();
      localStorage.removeItem('pendingApprovals_refresh');
    }
    
    // Set up interval to refresh data every 5 minutes
    const refreshInterval = setInterval(() => {
      const now = new Date();
      const fiveMinutes = 5 * 60 * 1000;
      if (!lastFetchTime || (now - lastFetchTime) > fiveMinutes) {
        console.log('Auto-refresh interval triggered, data is stale');
        fetchPendingNews();
      }
    }, 5 * 60 * 1000);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(refreshInterval);
      console.log('PendingApprovals component unmounting');
    };
  }, []);

  // Add mock data generator
  const getMockPendingNews = () => {
    return [
      { 
        id: 'mock-p1', 
        title: 'Breaking News: New Development in Local Politics', 
        content: '<p>This is a mock article about local politics.</p>', 
        category: 'Politics',
        district: 'Delhi',
        status: 'pending', 
        createdAt: new Date().toISOString() 
      },
      { 
        id: 'mock-p2', 
        title: 'Sports Update: Championship Finals Scheduled', 
        content: '<p>Local sports team heading to the finals.</p>', 
        category: 'Sports',
        district: 'Mumbai',
        status: 'pending', 
        createdAt: new Date().toISOString(),
        videoPath: '/uploads/videos/video-1745501187515-471719446.mp4'
      },
      { 
        id: 'mock-p3', 
        title: 'Economic Forecast Shows Growth for Next Quarter', 
        content: '<p>Financial analysts predict economic upturn.</p>', 
        category: 'Business',
        district: 'Bengaluru',
        status: 'pending', 
        createdAt: new Date().toISOString(),
        featuredImage: '/uploads/images/sample-image.jpg'
      }
    ];
  };

  const fetchPendingNews = async (retryCount = 0, delay = 1000) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get auth token
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Configure headers with token
      const config = getAuthConfig();
      
      console.log('Fetching pending posts from API with token');
      // Using formatApiUrl to prevent double slash issues
      const url = formatApiUrl(baseURL, '/api/news/my-pending-news');
      console.log(`Requesting: ${url}`);
      
      const response = await axios.get(url, config);
      
      console.log('API Response:', response.data);
      
      // Handle different response formats
      let newsItems = [];
      if (Array.isArray(response.data)) {
        newsItems = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        newsItems = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        // Handle single object response
        newsItems = [response.data];
      }
      
      console.log('Raw API response:', response.data);
      console.log('Extracted news items:', newsItems);
      
      // Set total results for pagination if available
      if (response.data && response.data.total) {
        setTotalResults(response.data.total);
        setTotalPages(Math.ceil(response.data.total / itemsPerPage));
      } else {
        setTotalResults(newsItems.length);
        setTotalPages(Math.ceil(newsItems.length / itemsPerPage));
      }
      
      console.log('Fetched pending news items:', newsItems.length);
      
      // Log the first item to see its structure
      if (newsItems.length > 0) {
        console.log('First news item structure:', newsItems[0]);
      }
      
      // Process each news item to ensure it has all required fields
      const processedItems = newsItems.map(item => {
        // Create a clean copy with all required fields
        return {
          ...item,
          // Ensure these fields have fallback values and are never null
          title: item.title || '',
          content: item.content || '',
          category: item.category || '',
          state: item.state || '',
          district: item.district || '',
          featuredImage: item.featuredImage || '',
          videoPath: item.videoPath || '',
          status: item.status || 'pending',
          contentType: item.videoPath || item.youtubeUrl ? 'video' : 'article'
        };
      });
      
      console.log('Processed items with state and district:', processedItems);
      
      // Check for any locally updated news items in localStorage
      const updatedItems = checkForLocallyUpdatedItems(processedItems);
      
      setPendingNews(updatedItems);
      setLastFetchTime(new Date());
      
      // Cache the result for future use
      try {
        localStorage.setItem('cached_pending_news', JSON.stringify(updatedItems));
        localStorage.setItem('cached_pending_news_timestamp', new Date().toISOString());
      } catch (cacheError) {
        console.warn('Failed to cache pending news:', cacheError);
      }
      
    } catch (err) {
      console.error('Error fetching pending news:', err);
      
      // Check if the error is due to an expired token
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        console.log('Token is invalid or expired');
        setShowSessionExpiredDialog(true);
        return; // Return early
      }
      
      // Detailed error logging
      if (err.response) {
        console.error('Server Error Details:', {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data
        });
        
        // Check for 500 error
        if (err.response.status === 500) {
          setError('Server error occurred. The server is experiencing issues processing your request.');
        } else if (err.response.status === 401) {
          setError('Authentication error. Please log in again.');
          setShowSessionExpiredDialog(true);
        } else {
          setError(`Failed to fetch pending posts (${err.response.status}). Using cached data if available.`);
        }
      } else {
        setError('Network error. Please check your connection. Using cached data if available.');
      }
      
      // Retry logic for network errors
      if (!err.response && retryCount < 3) {
        console.log(`Retrying fetch (attempt ${retryCount + 1}) after ${delay}ms delay...`);
        setTimeout(() => fetchPendingNews(retryCount + 1, delay * 2), delay);
        return;
      }
      
      // Try to load from cache first
      try {
        const cachedData = localStorage.getItem('cached_pending_news');
        const cachedTimestamp = localStorage.getItem('cached_pending_news_timestamp');
        
        if (cachedData) {
          console.log('Using cached pending news data from:', cachedTimestamp || 'unknown time');
          const parsedData = JSON.parse(cachedData);
          
          // Even when using cached data, check for local updates
          const updatedItems = checkForLocallyUpdatedItems(parsedData);
          
          setPendingNews(updatedItems);
          return;
        }
      } catch (cacheError) {
        console.warn('Error reading from cache:', cacheError);
      }
      
      // Fall back to mock data if API call fails and no cache
      console.log('Using mock data as fallback');
      const mockData = getMockPendingNews();
      
      // Check for locally updated items in mock data too
      const updatedMockItems = checkForLocallyUpdatedItems(mockData);
      
      setPendingNews(updatedMockItems);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to check if any news items have been updated locally
  const checkForLocallyUpdatedItems = (newsItems) => {
    if (!newsItems || !Array.isArray(newsItems)) return newsItems;
    
    return newsItems.map(item => {
      // Check if we have a locally updated version of this item
      try {
        const localItemKey = `updatedNewsItem_${item.id}`;
        const localItemJson = localStorage.getItem(localItemKey);
        
        if (localItemJson) {
          const localItem = JSON.parse(localItemJson);
          
          // Check if the local update is newer than our current data
          if (localItem && localItem.updatedAt) {
            console.log(`Found locally updated version of item ${item.id}`);
            
            // Merge the local item with the API item, keeping the API's status and other fields
            // that shouldn't be changed locally
            return {
              ...item,
              title: localItem.title || item.title,
              content: localItem.content || item.content,
              category: localItem.category || item.category,
              state: localItem.state || item.state, 
              district: localItem.district || item.district,
              featuredImage: localItem.featuredImage || item.featuredImage,
              videoPath: localItem.videoPath || item.videoPath,
              _updatedLocally: true // Add flag to indicate this was updated locally
            };
          }
        }
      } catch (err) {
        console.warn(`Error checking for local updates for item ${item.id}:`, err);
      }
      
      return item;
    });
  };

  const fetchNewsById = async (newsId) => {
    try {
      console.log(`Starting fetch for news ID ${newsId}`);
      
      // IMPORTANT: First find the news item in our existing data - this is our main source of truth
      const existingNewsItem = pendingNews.find(news => news.id === newsId || news.id === parseInt(newsId));
      
      if (!existingNewsItem) {
        console.error(`News item with ID ${newsId} not found in existing data`);
        return null;
      }
      
      console.log(`Found news item with ID ${newsId} in existing data:`, existingNewsItem);
      
      // Create a clean copy of existing data with default values for critical fields
      const workingCopy = { 
        ...existingNewsItem,
        // Ensure these fields have fallback values and are never null
        featuredImage: existingNewsItem.featuredImage || '',
        videoPath: existingNewsItem.videoPath || '',
        state: existingNewsItem.state || '',
        district: existingNewsItem.district || '',
        category: existingNewsItem.category || ''
      };
      
      console.log("Working with data (defaults applied):", workingCopy);
      
      // Get the auth token from localStorage or sessionStorage
      const token = getAuthToken();
      
      // If no token, just return the existing data we have
      if (!token) {
        console.log('No authentication token found, using existing data');
        return workingCopy;
      }

      // Configure axios headers with the token
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      console.log(`Attempting to fetch news with ID ${newsId}`);
      
      // Updated endpoint list based on user's requirements
      const endpoints = [
        // Primary endpoint should be /api/news/pending as specified by the user
        `https://api.newztok.in/api/news/pending/${newsId}`,
        
        // Fallback endpoints
        `https://api.newztok.in/api/news/${newsId}`,
        `https://api.newztok.in/api/news/pending-news/${newsId}`,
        `https://api.newztok.in/api/news/detail/${newsId}`,
        `https://api.newztok.in/api/news/view/${newsId}`,
        `https://api.newztok.in/api/news/get/${newsId}`
      ];
      
      let apiData = null;
      let successfulEndpoint = null;
      
      // Try each endpoint
      for (const endpoint of endpoints) {
        if (apiData) break; // Stop if we already found data
        
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          const response = await axios.get(endpoint, config);
          
          if (response.status === 200 && response.data) {
            console.log('News details response:', response.data);
            const newsData = response.data.data || response.data;
            
            // If data has an id, it's likely a valid news object
            if (newsData && (newsData.id || newsData.title)) {
              console.log('Found valid news data from API');
              apiData = newsData;
              successfulEndpoint = endpoint;
              break;
            }
          }
        } catch (error) {
          console.log(`Endpoint ${endpoint} failed: ${error.message}`);
          // Continue to next endpoint
        }
      }
      
      // Log the successful endpoint for future reference
      if (successfulEndpoint) {
        console.log(`Successfully fetched data from endpoint: ${successfulEndpoint}`);
        // You might want to store this info somewhere for future use
      }
      
      // If we got API data, merge it with our existing data
      if (apiData) {
        console.log('Merging API data with existing data');
        
        // Log specific fields to debug
        console.log('API returned category:', apiData.category);
        console.log('API returned state:', apiData.state);
        console.log('API returned district:', apiData.district);
        console.log('API returned featuredImage:', apiData.featuredImage);
        
        // Handle null values from the API - never overwrite existing values with null
        // Replace null values with existing values or empty strings
        const safeApiData = {
          ...apiData,
          featuredImage: apiData.featuredImage || workingCopy.featuredImage || '',
          videoPath: apiData.videoPath || workingCopy.videoPath || '',
          state: apiData.state || workingCopy.state || '',
          district: apiData.district || workingCopy.district || '',
          category: apiData.category || workingCopy.category || ''
        };
        
        // Create the result with merged data, prioritizing API data for certain fields
        // but never using null values from the API
        return {
          ...workingCopy,
          ...safeApiData,
          // Explicitly set these fields with a preference for API values (if not null)
          title: safeApiData.title || workingCopy.title || '',
          content: safeApiData.content || workingCopy.content || '',
          category: safeApiData.category || workingCopy.category || '',
          state: safeApiData.state || workingCopy.state || '',
          district: safeApiData.district || workingCopy.district || '',
          // Make sure featuredImage and videoPath are always present and never null
          featuredImage: safeApiData.featuredImage || workingCopy.featuredImage || '',
          videoPath: safeApiData.videoPath || workingCopy.videoPath || ''
        };
      }
      
      // If all API calls fail, use the existing data
      console.log('All API endpoints failed, using existing data only');
      
      // Make sure we're working with all fields populated
      workingCopy.title = workingCopy.title || '';
      workingCopy.content = workingCopy.content || '';
      workingCopy.category = workingCopy.category || '';
      workingCopy.state = workingCopy.state || '';
      workingCopy.district = workingCopy.district || '';
      workingCopy.featuredImage = workingCopy.featuredImage || '';
      workingCopy.videoPath = workingCopy.videoPath || '';
      
      return workingCopy;
      
    } catch (err) {
      console.error(`Error in fetchNewsById for ID ${newsId}:`, err);
      // Find and return the news item from our existing data
      const existingNewsItem = pendingNews.find(news => news.id === newsId || news.id === parseInt(newsId));
      if (existingNewsItem) {
        console.log('Using existing data as fallback after error');
        return { 
          ...existingNewsItem,
          // Ensure these fields have fallback values
          featuredImage: existingNewsItem.featuredImage || '',
          videoPath: existingNewsItem.videoPath || '',
          state: existingNewsItem.state || '',
          district: existingNewsItem.district || '',
          category: existingNewsItem.category || ''
        };
      }
      
      // Absolute last resort - create an empty object with the ID
      return { 
        id: newsId,
        title: '', 
        content: '',
        category: '',
        state: '',
        district: '',
        featuredImage: '',
        videoPath: ''
      };
    }
  };

  // Function to fetch approved news
  const fetchApprovedNews = async () => {
    try {
      // Get auth token
      const token = getAuthToken();
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      // Configure headers with token
      const config = getAuthConfig();
      
      console.log('Fetching approved posts from API with token');
      
      // Using formatApiUrl to prevent double slash issues
      const url = formatApiUrl(baseURL, '/api/news/approved-by-me');
      console.log('Fetching approved news from URL:', url);
      
      // Check if the endpoint is accessible before making the request
      // This is a workaround for the 403 error
      try {
        const response = await axios.get(url, config);
        console.log('Approved news API Response:', response.data);
        // Process approved news data here if needed
      } catch (error) {
        // Silently handle the 403 error - this endpoint might not be available for journalists
        if (error.response && error.response.status === 403) {
          console.log('Approved news endpoint not accessible for this user role');
        } else {
          console.error('Error fetching approved posts:', error);
        }
      }
      
    } catch (err) {
      console.error('Error in fetchApprovedNews:', err);
      // Handle error gracefully - don't show error to user since this isn't critical
    }
  };

  // Function to truncate and sanitize HTML content for display
  const truncateText = (text, maxLength = 80) => {
    if (!text) return '';
    
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    return textContent.length > maxLength ? textContent.substring(0, maxLength) + '...' : textContent;
  };

  // Function to get a safe HTML preview
  const getContentPreview = (htmlContent) => {
    if (!htmlContent) return 'No content available';
    
    // First get plain text for truncation
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Truncate the plain text
    const truncated = textContent.length > 80 ? textContent.substring(0, 80) + '...' : textContent;
    
    // Return the plain text (no HTML rendering)
    return truncated;
  };

  // Function to render HTML content safely
  const renderHTML = (html) => {
    return { __html: html };
  };

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleEditClick = (news) => {
    try {
      console.log("Redirecting to edit screen for news ID:", news.id);
      
      // Process the news data for consistency
      const processedNewsData = {
        id: news.id,
        title: news.title || '',
        content: news.content || '',
        featuredImage: news.featuredImage || news.image || '',
        category: news.category || '',
        state: news.state || '',
        district: news.district || '',
        contentType: news.contentType || 'standard',
        status: news.status || 'pending',
        youtubeUrl: news.youtubeUrl || '',
        
        // Enhanced video path handling with proper synchronization
        videoPath: news.videoPath || news.video || '',
        video: news.video || news.videoPath || '',
        
        // Original data for reference
        originalVideoData: {
          videoPath: news.videoPath || '',
          video: news.video || ''
        }
      };
      
      // Log video-related fields for debugging
      console.log("VIDEO FIELDS BEING PASSED:", {
        videoPath: processedNewsData.videoPath,
        video: processedNewsData.video,
        originalVideoData: processedNewsData.originalVideoData
      });
      
      // Set the appropriate content type if video-related fields are present
      if (news.contentType === 'video' || 
          news.youtubeUrl || 
          news.videoPath || 
          news.video) {
        processedNewsData.contentType = 'video';
        console.log("Video content detected, setting contentType to 'video'");
      }
      
      console.log("Processed news data:", processedNewsData);
      
      // Add the news item to localStorage with complete data
      localStorage.setItem('editNewsItem', JSON.stringify(processedNewsData));
      
      // Also store just the ID for compatibility
      localStorage.setItem('editNewsId', news.id);
      
      // Redirect to the edit screen with the news ID in the URL
      navigate(`/journalist/edit-post/${news.id}`);
    } catch (error) {
      console.error("Error redirecting to edit screen:", error);
      setError("Failed to navigate to edit screen. Please try again.");
    }
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
      
      {/* Add style tag for animations */}
      <style dangerouslySetInnerHTML={{ __html: spinAnimation }} />
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center', 
        marginBottom: '24px' 
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1
        }}>
          <FiClock size={24} color="#4f46e5" />
          <Typography variant="h4" sx={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#111827',
            margin: 0
          }}>
            Pending Approval
          </Typography>
        </Box>
      </Box>

      {error && (
        <div style={{ 
          backgroundColor: '#fee2e2', 
          color: '#b91c1c', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FaTimes color="#b91c1c" />
          {error}
        </div>
      )}
      
      {successMessage && (
        <div style={{ 
          backgroundColor: '#ecfdf5', 
          color: '#065f46', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px' 
        }}>
          <FaCheck color="#065f46" />
          {successMessage}
        </div>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress sx={{ color: '#4f46e5' }} />
        </Box>
      ) : (
        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            marginBottom: '24px',
            overflow: 'hidden'
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ 
                backgroundColor: '#f8fafc',
                '& th': {
                  color: '#64748b',
                  fontWeight: 600,
                  fontSize: '14px',
                  padding: '16px 24px',
                  borderBottom: '2px solid #e2e8f0'
                }
              }}>
                <TableCell>Headline</TableCell>
                <TableCell>Content</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>State</TableCell>
                <TableCell>District</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Media</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingNews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ 
                    padding: '32px 16px',
                    color: '#64748b',
                    fontSize: '14px'
                  }}>
                    {error ? (
                      <Box>
                        <Typography variant="h6" color="error" gutterBottom>
                          Error Loading Posts
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Please try refreshing the page or check your network connection.
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={fetchPendingNews}
                          sx={{ mt: 2 }}
                        >
                          Retry Now
                        </Button>
                      </Box>
                    ) : (
                      <Typography variant="body1" color="text.secondary">
                        No posts available for approval.
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                pendingNews.map((news, index) => (
                  <TableRow 
                    key={news.id || index}
                    sx={{ 
                      backgroundColor: news._updatedLocally ? '#f0f9ff' : 'white',
                      '&:hover': {
                        backgroundColor: '#f8fafc',
                        transition: 'background-color 0.2s ease'
                      },
                      '& td': {
                        padding: '16px 24px',
                        color: '#1e293b',
                        fontSize: '14px',
                        borderBottom: '1px solid #e2e8f0'
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 500 }}>
                          {news.title || 'No title'}
                        </Typography>
                        {news._updatedLocally && (
                          <Chip
                            label="edited"
                            size="small"
                            sx={{ 
                              ml: 1,
                              fontSize: '11px',
                              backgroundColor: '#2563eb',
                              color: 'white',
                              height: '20px'
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ 
                        color: '#64748b',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {getContentPreview(news.content)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={news.category || 'Uncategorized'}
                        size="small"
                        sx={{ 
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 500 }}>
                        {news.state || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 500 }}>
                        {news.district || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={news.status || 'Pending'}
                        size="small"
                        sx={{ 
                          backgroundColor: '#FEF3C7',
                          color: '#D97706',
                          fontWeight: 500,
                          height: '24px'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {news.videoPath ? (
                        <Tooltip title="Video Content">
                          <Chip
                            label="Video"
                            size="small"
                            icon={<VideoFileIcon />}
                            sx={{ 
                              backgroundColor: '#e0f2fe',
                              color: '#0284c7',
                              fontWeight: 500
                            }}
                          />
                        </Tooltip>
                      ) : news.featuredImage ? (
                        <Tooltip title="Has Featured Image">
                          <Chip
                            label="Image"
                            size="small"
                            icon={<ImageIcon />}
                            sx={{ 
                              backgroundColor: '#dcfce7',
                              color: '#16a34a',
                              fontWeight: 500
                            }}
                          />
                        </Tooltip>
                      ) : (
                        <Typography sx={{ color: '#94a3b8', fontSize: '12px' }}>
                          None
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit Post">
                        <IconButton
                          onClick={() => handleEditClick(news)}
                          sx={{ 
                            backgroundColor: '#4f46e5',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: '#4338ca',
                              transform: 'scale(1.05)',
                              transition: 'all 0.2s ease'
                            }
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!loading && pendingNews.length > 0 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          color: '#64748b',
          fontSize: '14px',
          padding: '0 8px'
        }}>
          <Typography>
            Showing {pendingNews.length} of {totalResults} items
          </Typography>
          
          <Box sx={{ display: 'flex', gap: '16px' }}>
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              sx={{ 
                color: currentPage === 1 ? '#9ca3af' : '#4f46e5',
                fontSize: '14px',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline'
                }
              }}
            >
              Previous
            </Button>
            <Button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              sx={{ 
                color: currentPage === totalPages ? '#9ca3af' : '#4f46e5',
                fontSize: '14px',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline'
                }
              }}
            >
              Next
            </Button>
          </Box>
        </Box>
      )}
    </div>
  );
};

export default PendingApprovals; 