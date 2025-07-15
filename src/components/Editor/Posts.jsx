import React, { useState, useRef, useEffect } from 'react';
import { FaPlus, FaEllipsisV, FaFileAlt, FaVideo, FaStar, FaTrash, FaEdit, FaExternalLinkAlt, FaRegStar } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatApiUrl, getAuthToken, getAuthConfig } from '../../utils/api';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button
} from '@mui/material';

const Posts = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [actionDropdowns, setActionDropdowns] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(5);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [showSessionExpiredDialog, setShowSessionExpiredDialog] = useState(false);
  const dropdownRef = useRef(null);
  const actionDropdownRefs = useRef({});
  const navigate = useNavigate();

  // API Base URL
  const baseURL = 'https://api.newztok.in';

  // Check for token expiration on component mount
  useEffect(() => {
    checkTokenExpiration();
    fetchApprovedPosts();
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

  // Helper function to format dates to IST
  const formatToIST = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      // Format to IST (UTC+5:30)
      return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Return original string if formatting fails
    }
  };

  // Fetch approved posts
  const fetchApprovedPosts = async () => {
    try {
      setLoading(true);
      
      // Get the auth token
      const token = getEnhancedAuthToken();
      
      if (!token) {
        setShowSessionExpiredDialog(true);
        throw new Error('No authentication token found');
      }

      // Save token with timestamp if it's valid
      saveWorkingToken(token);

      // Configure axios headers with the token
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // Fetch approved posts with properly formatted URL
      const url = `${baseURL}/api/news/approved-by-me`;
      const response = await axios.get(url, config);
      
      console.log('Approved posts response:', response.data);
      
      // Update the posts array based on response format and ensure featured status is properly set
      let fetchedPosts = [];
      
      if (Array.isArray(response.data)) {
        fetchedPosts = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        fetchedPosts = response.data.data;
      } else {
        console.log('Unexpected API response format:', response.data);
        fetchedPosts = [];
      }
      
      // Get list of deleted post IDs from localStorage
      let deletedPostIds = [];
      try {
        deletedPostIds = JSON.parse(localStorage.getItem('deletedPosts') || '[]');
      } catch (error) {
        console.warn('Could not parse deleted posts from localStorage:', error);
      }
      
      // Filter out any posts that have been deleted
      fetchedPosts = fetchedPosts.filter(post => {
        const postId = post._id || post.id;
        return !deletedPostIds.includes(postId);
      });
      
      // Log complete post objects to examine structure
      console.log('Complete post objects after filtering deleted posts:', fetchedPosts);
      
      // Set posts with a clean object to ensure reactivity and handle missing properties
      const processedPosts = fetchedPosts.map(post => {
        // More comprehensive check for featured status
        let isFeaturedValue = 
          post.isFeatured === true || 
          post.featured === true || 
          post.is_featured === true ||
          post.isFeatured === 'true' || 
          post.featured === 'true' || 
          post.is_featured === 'true' ||
          post.isFeatured === 1 ||
          post.featured === 1 ||
          post.is_featured === 1;
        
        const postId = post._id || post.id;
        
        // Also check localStorage for featured status which may have been set by user
        try {
          const localStorageFeatured = localStorage.getItem(`featured_post_${postId}`);
          if (localStorageFeatured === 'true') {
            isFeaturedValue = true;
          }
        } catch (error) {
          console.warn(`Could not check localStorage for post ${postId}:`, error);
        }
        
        // Log the featured status
        console.log(`Post ${postId} featured status:`, {
          originalValue: post.isFeatured,
          processed: isFeaturedValue,
          localStorage: localStorage.getItem(`featured_post_${postId}`)
        });
        
        // Extract journalist information with proper logging for debugging
        let journalistName = 'Unknown';
        const journalistInfo = post.journalist || post.createdBy || post.submittedBy || post.author;
        
        console.log('Journalist info for post', post._id || post.id, ':', journalistInfo);
        
        if (journalistInfo) {
          if (typeof journalistInfo === 'object') {
            if (journalistInfo.name) {
              journalistName = journalistInfo.name;
            } else if (journalistInfo.fullName) {
              journalistName = journalistInfo.fullName;
            } else if (journalistInfo.userName) {
              journalistName = journalistInfo.userName;
            } else if (journalistInfo.username) {
              journalistName = journalistInfo.username;
            } else {
              // If we have an object but no recognizable name property, try to format what we have
              journalistName = `ID: ${journalistInfo.id || 'unknown'}`;
              if (journalistInfo.email) journalistName += ` (${journalistInfo.email})`;
              
              // Log the object for debugging
              console.log('Journalist object without standard name property:', journalistInfo);
            }
          } else if (typeof journalistInfo === 'string') {
            journalistName = journalistInfo;
          }
        }
          
        // Extract editor information with proper logging for debugging
        let editorName = 'Unknown';
        const editorInfo = post.editor || post.approvedBy;
        
        console.log('Editor info for post', post._id || post.id, ':', editorInfo);
        
        if (editorInfo) {
          if (typeof editorInfo === 'object') {
            if (editorInfo.name) {
              editorName = editorInfo.name;
            } else if (editorInfo.fullName) {
              editorName = editorInfo.fullName;
            } else if (editorInfo.userName) {
              editorName = editorInfo.userName;
            } else if (editorInfo.username) {
              editorName = editorInfo.username;
            } else {
              // If we have an object but no recognizable name property, try to format what we have
              editorName = `ID: ${editorInfo.id || 'unknown'}`;
              if (editorInfo.email) editorName += ` (${editorInfo.email})`;
              
              // Log the object for debugging
              console.log('Editor object without standard name property:', editorInfo);
            }
          } else if (typeof editorInfo === 'string') {
            editorName = editorInfo;
          }
        }
        
        // Format dates to IST
        const formattedSubmittedAt = formatToIST(post.createdAt || post.submittedAt);
        const formattedApprovedAt = formatToIST(post.approvedAt || post.updatedAt);
        
        // Process state and district data
        let stateData = post.state || '';
        let districtData = post.district || '';
        
        // Format state names if available
        if (stateData) {
          // Map state values to display names if needed
          switch(stateData.toLowerCase()) {
            case 'jharkhand': 
              stateData = 'झारखंड | Jharkhand';
              break;
            case 'bihar': 
              stateData = 'बिहार | Bihar';
              break;
            case 'up':
              stateData = 'उत्तर प्रदेश | Uttar Pradesh';
              break;
            default:
              // Leave as is if not one of the main states
              break;
          }
        }
        
        // Format district names if available
        if (districtData) {
          // Fetch district information from application data
          // This uses common district patterns based on state
          console.log(`Processing district: ${districtData} for state: ${post.state}`);
          
          // You can expand this with the actual district mapping if needed
          // For now, we'll just make it clear this is a district value
          if (!districtData.includes('|')) {
            districtData = `${districtData} District`;
          }
        }
        
        // Log the extracted names for debugging
        console.log(`Post ${post._id || post.id} - Journalist: ${journalistName}, Editor: ${editorName}, State: ${stateData}, District: ${districtData}`);
          
        return {
          ...post,
          // Keep both consistent
          featured: isFeaturedValue,
          isFeatured: isFeaturedValue,
          // Store journalist and editor info
          journalistName,
          editorName,
          // Store formatted dates
          formattedSubmittedAt,
          formattedApprovedAt,
          // Store formatted location data
          formattedState: stateData,
          formattedDistrict: districtData
        };
      });
      
      // Sort by most recently approved first
      const sortedPosts = processedPosts.sort((a, b) => {
        const dateA = new Date(a.approvedAt || a.updatedAt || 0);
        const dateB = new Date(b.approvedAt || b.updatedAt || 0);
        return dateB - dateA; // Descending order (newest first)
      });
      
      setPosts(sortedPosts);
      setError(null);

    } catch (err) {
      console.error('Error fetching approved posts:', err);
      
      // Check for authentication errors (401/403)
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        console.log('Token is invalid or expired');
        setShowSessionExpiredDialog(true);
        return;
      }
      
      setError('Failed to load approved posts data');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to toggle featured status
  const toggleFeatured = async (postId, currentFeatured) => {
    try {
      console.log(`Starting toggleFeatured for post ${postId}`);
      console.log('Current featured status:', currentFeatured);
      
      // Get the auth token
      const token = getEnhancedAuthToken();
      if (!token) {
        setShowSessionExpiredDialog(true);
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Save token with timestamp if it's valid
      saveWorkingToken(token);

      // Update UI optimistically
      const newFeaturedStatus = !currentFeatured;
      
      // Update UI state immediately for better UX and also update localStorage before the API call
      if (newFeaturedStatus) {
        localStorage.setItem(`featured_post_${postId}`, 'true');
        console.log(`Stored featured status in localStorage for post ${postId}`);
      } else {
        localStorage.removeItem(`featured_post_${postId}`);
        console.log(`Removed featured status from localStorage for post ${postId}`);
      }
      
      // Update post state in the UI
      updatePostFeaturedState(postId, newFeaturedStatus);
      
      // Create request body with the new status
      const requestBody = {
        isFeatured: newFeaturedStatus
      };
      console.log('Request body:', requestBody);

      // Direct API call without using formatApiUrl
      const endpoint = `${baseURL}/api/news/featured/${postId}`;
      console.log('Making PUT request to:', endpoint);

      // Create headers manually instead of using getAuthConfig
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Make the PUT request using axios with explicit configuration
      const response = await axios({
        method: 'PUT',  // Explicitly using PUT method
        url: endpoint,
        data: requestBody,
        headers: headers
      });
      
      console.log('Response data:', response.data);

      // Handle successful response
      if (response.status >= 200 && response.status < 300) {
        // Show success message
        setSuccessMessage(newFeaturedStatus 
          ? "News marked as featured successfully!" 
          : "Featured status removed successfully!"
        );
        
        // Refresh the list after a delay
        setTimeout(() => {
          fetchApprovedPosts();
        }, 1000);
      } else {
        throw new Error(`Server returned status: ${response.status}`);
      }
    } catch (err) {
      console.error('Featured toggle error:', err);
      
      // Check for authentication errors (401/403)
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        console.log('Token is invalid or expired');
        setShowSessionExpiredDialog(true);
        return;
      }
      
      // Revert the optimistic UI update and localStorage since the API call failed
      if (!currentFeatured) {
        localStorage.removeItem(`featured_post_${postId}`);
      } else {
        localStorage.setItem(`featured_post_${postId}`, 'true');
      }
      
      // Revert the posts state
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (String(post.id) === String(postId) || String(post._id) === String(postId)) {
            return {
              ...post,
              isFeatured: currentFeatured,
              featured: currentFeatured
            };
          }
          return post;
        })
      );
      
      setError(`Failed to update featured status. Please try again.`);
      setTimeout(() => setError(null), 3000);
      
      // Close dropdown in case of error
      toggleActionDropdown(postId);
    }
  };

  // Helper function to update featured state in UI
  const updatePostFeaturedState = (postId, newFeaturedStatus) => {
    console.log(`Updating featured status for post ${postId} to ${newFeaturedStatus}`);
    
    // Update the posts state with the new featured status
    setPosts(prevPosts => 
      prevPosts.map(post => {
        // Verify the ID match more strictly with string conversion
        if (String(post.id) === String(postId) || String(post._id) === String(postId)) {
          const updatedPost = {
            ...post,
            isFeatured: newFeaturedStatus,
            featured: newFeaturedStatus
          };
          console.log('Updated post data:', updatedPost);
          return updatedPost;
        }
        return post;
      })
    );

    // Show success message but don't close dropdown yet
    setSuccessMessage(newFeaturedStatus 
      ? "News marked as featured successfully!" 
      : "Featured status removed successfully!"
    );

    // Close the dropdown
    toggleActionDropdown(postId);
  };

  // Function to handle remove post (delete request)
  const handleRemovePost = async (postId) => {
    try {
      // Confirm with the user before deleting
      if (!window.confirm('Are you sure you want to permanently delete this post? This action cannot be undone.')) {
        return;
      }

      console.log("Trying to delete post:", postId);
      const token = getEnhancedAuthToken();
      
      if (!token) {
        setShowSessionExpiredDialog(true);
        throw new Error('Authentication token not found');
      }

      // Save token with timestamp if it's valid
      saveWorkingToken(token);

      // Use the direct endpoint without formatApiUrl
      const deleteUrl = `${baseURL}/api/news/delete/${postId}`;
      console.log("Making delete request to:", deleteUrl);

      const response = await axios({
        method: 'DELETE',
        url: deleteUrl,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Delete response:", response);

      if (response.status === 200 || response.status === 204) {
        // Remove post from UI and show success message
        setPosts(prevPosts => prevPosts.filter(post => 
          String(post.id) !== String(postId) && String(post._id) !== String(postId)
        ));
        setSuccessMessage("Post has been permanently deleted");
        setTimeout(() => setSuccessMessage(null), 3000);
        
        // Close the dropdown
        toggleActionDropdown(postId);
      }
      
    } catch (error) {
      console.error("Error deleting post:", error);
      
      // Check for authentication errors
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.log('Token is invalid or expired');
        setShowSessionExpiredDialog(true);
        return;
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete post';
      setError(`Failed to delete post: ${errorMessage}. Please try again or contact support.`);
      setTimeout(() => setError(null), 5000);
    }
  };

  // Toggle action dropdown for a specific post
  const toggleActionDropdown = (postId) => {
    setActionDropdowns(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }

      // Close action dropdowns when clicking outside
      Object.keys(actionDropdownRefs.current).forEach(postId => {
        if (
          actionDropdownRefs.current[postId] && 
          !actionDropdownRefs.current[postId].contains(event.target)
        ) {
          setActionDropdowns(prev => ({
            ...prev,
            [postId]: false
          }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavigate = (path) => {
    setDropdownOpen(false);
    // These would be the paths to your post creation screens
    if (path === 'standard') {
      navigate('/editor/standardPost');
    } else if (path === 'video') {
      navigate('/editor/videoPost');
    }
  };

  // Calculate pagination
  const indexOfLastPost = showAllPosts ? posts.length : currentPage * postsPerPage;
  const indexOfFirstPost = showAllPosts ? 0 : (currentPage - 1) * postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  // Handle pagination navigation
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleViewAll = () => {
    setShowAllPosts(true);
  };

  const handleViewPaginated = () => {
    setShowAllPosts(false);
    setCurrentPage(1);
  };

  // Function to handle edit action
  const handleEdit = (postId) => {
    // Find the post from the existing posts array
    const postToEdit = posts.find(post => {
      return String(post.id) === String(postId) || String(post._id) === String(postId);
    });
    
    if (postToEdit) {
      // Log the post object to debug
      console.log("Post to edit (raw data from list):", postToEdit);
      
      // Process the post data for consistency
      const processedPostData = {
        id: postToEdit.id || postToEdit._id,
        title: postToEdit.title || postToEdit.headline || '',
        content: postToEdit.content || '',
        featuredImage: postToEdit.featuredImage || postToEdit.image || '',
        category: postToEdit.category || '',
        state: postToEdit.state || '',
        district: postToEdit.district || '',
        contentType: postToEdit.contentType || 'standard',
        status: postToEdit.status || 'approved',
        youtubeUrl: postToEdit.youtubeUrl || '',
        thumbnailUrl: postToEdit.thumbnailUrl || '',
        
        // Enhanced video path handling with proper synchronization
        videoPath: postToEdit.videoPath || postToEdit.video || '',
        video: postToEdit.video || postToEdit.videoPath || '',
        videoUrl: postToEdit.videoUrl || '',
        featuredVideo: postToEdit.featuredVideo || '',
        
        // Store original data for reference
        originalVideoData: {
          videoPath: postToEdit.videoPath || '',
          video: postToEdit.video || '',
          videoUrl: postToEdit.videoUrl || '',
          featuredVideo: postToEdit.featuredVideo || ''
        },
        
        // Location data with comprehensive backups
        state: postToEdit.state || '',
        district: postToEdit.district || '',
        
        // Featured status
        isFeatured: postToEdit.isFeatured || postToEdit.featured || false
      };
      
      // Log location data for debugging
      console.log("LOCATION DATA BEING PASSED:", {
        state: processedPostData.state,
        district: processedPostData.district,
        originalState: postToEdit.state,
        originalDistrict: postToEdit.district,
        formattedState: postToEdit.formattedState,
        formattedDistrict: postToEdit.formattedDistrict
      });
      
      // Log each video-related field for debugging
      console.log("VIDEO FIELDS BEING PASSED:", {
        videoPath: processedPostData.videoPath,
        video: processedPostData.video,
        videoUrl: processedPostData.videoUrl,
        featuredVideo: processedPostData.featuredVideo,
        originalVideoData: processedPostData.originalVideoData
      });
      
      // Set the appropriate content type if video-related fields are present
      if (postToEdit.contentType === 'video' || 
          postToEdit.youtubeUrl || 
          postToEdit.videoPath || 
          postToEdit.video || 
          postToEdit.videoUrl || 
          postToEdit.featuredVideo) {
        processedPostData.contentType = 'video';
        console.log("Video content detected, setting contentType to 'video'");
      }
      
      console.log("Processed post data:", processedPostData);
      
      // Navigate to the ReEditPost screen with the post ID and pass the data in state
      navigate(`/editor/re-edit/${postId}`, { state: { newsData: processedPostData } });
    } else {
      setError('Could not find the post to edit');
      setTimeout(() => setError(null), 3000);
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

      {/* Header section with title and button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px' 
      }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: '#111827',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          All Approved Posts 
          <span style={{ 
            fontSize: '24px', 
            color: '#6b7280', 
            fontWeight: 'normal'
          }}>
            ({posts.length})
          </span>
        </h1>
        
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <FaPlus size={16} />
            Add new Post
          </button>
          
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '4px',
              backgroundColor: 'white',
              borderRadius: '6px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              width: '180px',
              zIndex: 10
            }}>
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb',
                  transition: 'background-color 0.2s'
                }}
                onClick={() => handleNavigate('standard')}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <FaFileAlt size={16} color="#4f46e5" />
                <span>Standard Post</span>
              </div>
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  color: '#374151',
                  transition: 'background-color 0.2s'
                }}
                onClick={() => handleNavigate('video')}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <FaVideo size={16} color="#4f46e5" />
                <span>Video Post</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success message */}
      {successMessage && (
        <div style={{ 
          backgroundColor: '#d1fae5', 
          color: '#065f46', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontWeight: 'bold' }}>✓</span> {successMessage}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div style={{ 
          backgroundColor: '#fee2e2', 
          color: '#b91c1c', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '16px' 
        }}>
          {error}
        </div>
      )}

      {/* Loading indicator */}
      {loading ? (
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '24px',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          Loading approved posts...
        </div>
      ) : (
        /* Table */
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          overflowX: 'auto'
        }}>
          {posts.length === 0 ? (
            <div style={{ 
              padding: '24px', 
              textAlign: 'center', 
              color: '#6b7280'
            }}>
              No approved posts found
            </div>
          ) : (
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left', 
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    Headline <span style={{ color: '#9ca3af' }}>↓</span>
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left', 
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    Category <span style={{ color: '#9ca3af' }}>↓</span>
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left', 
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    State <span style={{ color: '#9ca3af' }}>↓</span>
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left', 
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    District <span style={{ color: '#9ca3af' }}>↓</span>
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left', 
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    Submitted By <span style={{ color: '#9ca3af' }}>↓</span>
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left', 
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    Approved By <span style={{ color: '#9ca3af' }}>↓</span>
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left', 
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    Submitted At <span style={{ color: '#9ca3af' }}>↓</span>
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left', 
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    Approved At <span style={{ color: '#9ca3af' }}>↓</span>
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'center', 
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentPosts.map((post, index) => {
                  const postId = post._id || post.id || `post-${index}`;
                  // Check for either featured or isFeatured property being true
                  const isPostFeatured = post.featured || post.isFeatured;
                  
                  console.log(`Rendering post ${postId} with featured status:`, isPostFeatured);
                  
                  return (
                    <tr key={postId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '16px', maxWidth: '300px' }}>
                        <div style={{ marginBottom: isPostFeatured ? '5px' : '0' }}>
                          <Link 
                            to="#" 
                            style={{ 
                              color: '#3b82f6', 
                              textDecoration: 'none',
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '300px'
                            }}
                          >
                            {post.title || post.headline || 'No title'}
                          </Link>
                        </div>
                        {isPostFeatured && (
                          <span style={{ 
                            backgroundColor: '#ecfdf5', 
                            color: '#10b981',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <FaStar size={10} /> TRENDING NEWS
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '16px' }}>{post.category || 'Uncategorized'}</td>
                      <td style={{ padding: '16px' }}>{post.formattedState || post.state || 'Not specified'}</td>
                      <td style={{ padding: '16px' }}>{post.formattedDistrict || post.district || 'Not specified'}</td>
                      <td style={{ padding: '16px' }}>
                        {/* Show the journalist information */}
                        {post.journalist && typeof post.journalist === 'object' ? 
                          post.journalist.username || post.journalist.name || `ID: ${post.journalist.id}` 
                          : 
                          post.journalistName || post.author || post.submittedBy || post.createdBy || 'Unknown'
                        }
                      </td>
                      <td style={{ padding: '16px' }}>
                        {/* Show the editor information */}
                        {post.editor && typeof post.editor === 'object' ? 
                          post.editor.username || post.editor.name || `ID: ${post.editor.id}` 
                          : 
                          post.editorName || post.approvedBy || 'Unknown'
                        }
                      </td>
                      <td style={{ padding: '16px' }}>{post.formattedSubmittedAt}</td>
                      <td style={{ padding: '16px' }}>{post.formattedApprovedAt}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ position: 'relative' }}>
                          <button 
                            style={{ 
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#6b7280',
                              padding: '5px'
                            }}
                            aria-label="More options"
                            onClick={() => toggleActionDropdown(postId)}
                          >
                            <FaEllipsisV />
                          </button>
                          
                          {/* Action dropdown menu */}
                          {actionDropdowns[postId] && (
                            <div 
                              ref={el => actionDropdownRefs.current[postId] = el}
                              style={{
                                position: 'absolute',
                                right: '0',
                                top: '100%',
                                backgroundColor: 'white',
                                borderRadius: '6px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                width: '180px',
                                zIndex: 20
                              }}
                            >
                              {/* Mark/Remove Featured Button */}
                              <div 
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  padding: '12px 16px',
                                  cursor: 'pointer',
                                  color: isPostFeatured ? '#b91c1c' : '#047857',
                                  borderBottom: '1px solid #e5e7eb',
                                  transition: 'background-color 0.2s'
                                }}
                                onClick={() => toggleFeatured(postId, isPostFeatured)}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <FaStar size={16} />
                                <span>{isPostFeatured ? 'Remove Trending' : 'Mark Trending'}</span>
                              </div>
                              
                              {/* Edit Post Button */}
                              <div 
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  padding: '12px 16px',
                                  cursor: 'pointer',
                                  color: '#4b5563',
                                  borderBottom: '1px solid #e5e7eb',
                                  transition: 'background-color 0.2s'
                                }}
                                onClick={() => handleEdit(postId)}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <FaEdit size={16} />
                                <span>Edit Post</span>
                              </div>
                              
                              {/* Remove Post Button */}
                              <div 
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  padding: '12px 16px',
                                  cursor: 'pointer',
                                  color: '#b91c1c',
                                  transition: 'background-color 0.2s'
                                }}
                                onClick={() => handleRemovePost(postId)}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <FaTrash size={16} />
                                <span>Remove</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {posts.length > 0 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '16px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>
                {showAllPosts ? (
                  <span>
                    Showing all {posts.length} items — <Link 
                      to="#" 
                      onClick={handleViewPaginated}
                      style={{ color: '#3b82f6', textDecoration: 'none' }}
                    >
                      View paginated
                    </Link>
                  </span>
                ) : (
                  <span>
                    {indexOfFirstPost + 1} to {Math.min(indexOfLastPost, posts.length)} of {posts.length} items — <Link 
                      to="#" 
                      onClick={handleViewAll}
                      style={{ color: '#3b82f6', textDecoration: 'none' }}
                    >
                      View all
                    </Link>
                  </span>
                )}
              </div>
              {!showAllPosts && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    style={{ 
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: currentPage === 1 ? '#e2e8f0' : '#3b82f6',
                      color: currentPage === 1 ? '#6b7280' : 'white',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      opacity: currentPage === 1 ? 0.7 : 1
                    }}
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <button 
                    style={{ 
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: currentPage === totalPages ? '#e2e8f0' : '#3b82f6',
                      color: currentPage === totalPages ? '#6b7280' : 'white',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      opacity: currentPage === totalPages ? 0.7 : 1
                    }}
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Posts;