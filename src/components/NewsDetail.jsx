import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdComponent from './AdSenseAds';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Button,
  TextField,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Visibility as VisibilityIcon,
  WhatsApp as WhatsAppIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);
  
  // API base URL
  const baseURL = 'https://api.newztok.in';
  
  // Check if user is logged in (has auth token)
  const isLoggedIn = !!localStorage.getItem('userAuthToken');
  
  // Get the user token for API requests
  const getUserToken = () => {
    return localStorage.getItem('userAuthToken');
  };

  // Add a debug helper
  const debug = (message, data) => {
    console.log(`[NewsDetail ${id}] ${message}`, data !== undefined ? data : '');
  };

  // Fetch news details on component mount
  useEffect(() => {
    debug('Component mounted with ID', id);
    
    fetchNewsDetail();
    fetchComments();
    
    // Check like status if user is logged in
    const token = getUserToken();
    if (token) {
      checkLikeStatus();
    }
  }, [id]);

  // Update meta tags when news data is loaded
  useEffect(() => {
    if (newsData && window.setDynamicMetaTags) {
      // Get a clean description from content (strip HTML)
      const description = newsData.content
        ? newsData.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
        : 'Check out this news article from NewzTok!';
      
      // Get the best image for sharing
      let imageUrl = 'https://api.newztok.in/uploads/newztok-logo.png'; // Default fallback
      
      // Try to get image from youtubeUrl first
      if (newsData.youtubeUrl) {
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = newsData.youtubeUrl.match(youtubeRegex);
        
        if (match && match[1]) {
          imageUrl = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
        }
      } 
      // Then try featuredImage and other sources
      else if (newsData.featuredImage) {
        imageUrl = newsData.featuredImage.startsWith('http') 
          ? newsData.featuredImage 
          : `${baseURL}${newsData.featuredImage.startsWith('/') ? '' : '/'}${newsData.featuredImage}`;
      } else if (newsData.imageUrl) {
        imageUrl = newsData.imageUrl.startsWith('http') 
          ? newsData.imageUrl 
          : `${baseURL}${newsData.imageUrl.startsWith('/') ? '' : '/'}${newsData.imageUrl}`;
      } else if (newsData.thumbnailUrl) {
        imageUrl = newsData.thumbnailUrl.startsWith('http') 
          ? newsData.thumbnailUrl 
          : `${baseURL}${newsData.thumbnailUrl.startsWith('/') ? '' : '/'}${newsData.thumbnailUrl}`;
      }
      
      // Update meta tags for better sharing
      window.setDynamicMetaTags(
        newsData.title || 'NewzTok Article',
        description,
        imageUrl
      );
    }
  }, [newsData]);

  // Clear comment success message after 3 seconds
  useEffect(() => {
    if (commentSuccess) {
      const timer = setTimeout(() => {
        setCommentSuccess(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [commentSuccess]);

  // Re-check like status whenever login state changes
  useEffect(() => {
    if (isLoggedIn) {
      debug('User login state changed, checking like status');
      checkLikeStatus();
    } else {
      // Reset like status if user logs out
      setIsLiked(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  // Add function to check if user has already liked the article
  const checkLikeStatus = async () => {
    try {
      const token = getUserToken();
      
      if (!token) {
        debug('No token found for like status check');
        return;
      }

      debug('Checking like status with token');

      // Create request headers
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);
      
      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
      };

      // Make the API call to check like status
      const response = await fetch(
        `${baseURL}/api/interaction/news/${id}/like/status`,
        requestOptions
      );

      if (!response.ok) {
        throw new Error(`Status check failed with status: ${response.status}`);
      }

      const result = await response.json();
      debug('Like status response received', result);

      // Update like status based on response
      if (result.liked || result.isLiked || result.hasLiked) {
        debug('User has liked this article', true);
        setIsLiked(true);
      } else {
        debug('User has not liked this article', false);
        setIsLiked(false);
      }

      // Update like count from response if available
      if (result.likesCount !== undefined) {
        debug('Setting like count from API', result.likesCount);
        setLikeCount(result.likesCount);
      } else if (result.likeCount !== undefined) {
        debug('Setting like count from API', result.likeCount);
        setLikeCount(result.likeCount);
      }
      
    } catch (error) {
      console.error("Error checking like status:", error);
    }
  };

  const fetchNewsDetail = async () => {
    try {
      setLoading(true);
      // Try different API endpoints that might work - more comprehensive list
      const endpoints = [
        `/api/news/${id}`,
        `/api/news/by-id/${id}`,
        `/api/news/details/${id}`,
        `/api/news/post/${id}`,
        `/api/news/trending/${id}`,
        `/api/news/category/trending/${id}`,
        `/api/news/category/national/${id}`,
        `/api/news/category/international/${id}`,
        `/api/news/category/sports/${id}`,
        `/api/news/category/entertainment/${id}`,
        `/api/news/category/district/${id}`
      ];
      
      console.log(`Trying to fetch news article with ID: ${id}`);
      
      let response = null;
      let foundEndpoint = null;
      
      // Configure axios to follow redirects
      const axiosConfig = {
        maxRedirects: 5, // Allow up to 5 redirects
        validateStatus: status => status < 500 // Accept all responses with status < 500
      };
      
      // First, try to fetch from any category endpoint
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${baseURL}${endpoint}`);
          response = await axios.get(`${baseURL}${endpoint}`, axiosConfig);
          if (response.status === 200 && response.data) {
            console.log(`Success with endpoint: ${endpoint}`);
            foundEndpoint = endpoint;
            break;
          }
        } catch (err) {
          console.log(`Endpoint ${endpoint} failed: ${err.message}`);
        }
      }
      
      // If all individual endpoints failed, try to get listing and filter by ID
      if (!response || !foundEndpoint) {
        console.log("Individual endpoints failed, trying to find article in category listings...");
        
        const categoryEndpoints = [
          '/api/news/trending',
          '/api/news/category/trending',
          '/api/news/category/national',
          '/api/news/category/international', 
          '/api/news/category/sports',
          '/api/news/category/entertainment',
          '/api/news/category/district'
        ];
        
        for (const endpoint of categoryEndpoints) {
          try {
            console.log(`Trying to find article in listing: ${baseURL}${endpoint}`);
            const listResponse = await axios.get(`${baseURL}${endpoint}`, axiosConfig);
            
            if (listResponse.status === 200 && listResponse.data) {
              // Extract the array of news items
              let newsItems = [];
              if (Array.isArray(listResponse.data)) {
                newsItems = listResponse.data;
              } else if (listResponse.data.data && Array.isArray(listResponse.data.data)) {
                newsItems = listResponse.data.data;
              } else if (listResponse.data.posts && Array.isArray(listResponse.data.posts)) {
                newsItems = listResponse.data.posts;
              }
              
              // Find the article with matching ID
              const article = newsItems.find(item => 
                item.id === id || 
                item.id === parseInt(id) || 
                item._id === id || 
                String(item.id) === String(id)
              );
              
              if (article) {
                console.log(`Found article in ${endpoint}:`, article);
                response = { 
                  data: article,
                  status: 200
                };
                foundEndpoint = endpoint;
                break;
              }
            }
          } catch (err) {
            console.log(`Category endpoint ${endpoint} failed: ${err.message}`);
          }
        }
      }
      
      if (!response || !foundEndpoint) {
        // If all endpoints failed, use empty data instead of mock data
        console.warn("All API endpoints failed, using empty data...");
        setNewsData({
          id: id,
          title: `News Article ${id}`,
          content: "This article could not be loaded. Please try again later.",
          createdAt: new Date().toISOString(),
          state: "",
          district: ""
        });
      } else {
        console.log(`Successfully fetched data from ${foundEndpoint}`, response.data);
        
        // Process the API response
        if (response.data) {
          const articleData = response.data.data || response.data;
          console.log("Setting news data:", articleData);
          
          // Log media data for debugging - with more detail
          console.log("Media data in article:", {
            featuredImage: articleData.featuredImage,
            youtubeUrl: articleData.youtubeUrl,
            video: articleData.video,
            image: articleData.image,
            images: articleData.images,
            thumbnail: articleData.thumbnail,
            thumbnailUrl: articleData.thumbnailUrl,
            imageUrl: articleData.imageUrl,
            featured_image: articleData.featured_image
          });
          
          // Ensure media properties are properly set
          if (articleData.youtubeUrl) {
            console.log("YouTube URL found:", articleData.youtubeUrl);
            
            // Debug YouTube URL extraction
            const youtubeRegex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
            const match = articleData.youtubeUrl.match(youtubeRegex);
            if (match && match[1]) {
              console.log("YouTube video ID extracted:", match[1]);
              console.log("YouTube thumbnail URL would be:", `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`);
            } else {
              console.warn("Could not extract YouTube video ID from:", articleData.youtubeUrl);
            }
          }
          
          if (articleData.featuredImage) {
            console.log("Featured image found:", articleData.featuredImage);
          }
          
          if (articleData.video) {
            console.log("Video found:", articleData.video);
          }
          
          setNewsData(articleData);
          
          // If comments are included in the API response
          if (response.data.comments || (response.data.data && response.data.data.comments)) {
            setComments(response.data.comments || response.data.data.comments || []);
          }
          // Initialize like count from API if available
          const likes = response.data.likes || (response.data.data && response.data.data.likes) || 0;
          setLikeCount(likes);
          // Initialize view count from API if available
          const views = response.data.views || (response.data.data && response.data.data.views) || 0;
          setViewCount(views);
          
          // Now that we have data, try to increment view count
          incrementViewCount();
        }
      }
      
    } catch (err) {
      console.error("Error fetching news details:", err);
      // Use empty data in case of error
      setNewsData({
        id: id,
        title: `News Article ${id}`,
        content: "This article could not be loaded. Please try again later.",
        createdAt: new Date().toISOString(),
        state: "",
        district: ""
      });
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      // Create request headers (no auth token needed for views)
      const myHeaders = new Headers();
      
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        redirect: "follow"
      };

      // Make the API call to increment view count
      debug('Sending view count increment request to API');
      const response = await fetch(
        `${baseURL}/api/interaction/news/${id}/view`,
        requestOptions
      );

      if (!response.ok) {
        throw new Error(`View increment failed with status: ${response.status}`);
      }
      
      const resultText = await response.text();
      debug('Received view count response', resultText);
      
      try {
        if (resultText && resultText.trim()) {
          const result = JSON.parse(resultText);
          debug('Parsed view count response', result);
          
          // Update view count from server response if available
          if (result && typeof result.viewsCount !== 'undefined') {
            debug('Setting view count from API response', result.viewsCount);
            setViewCount(result.viewsCount);
          } else if (result && typeof result.viewCount !== 'undefined') {
            debug('Setting view count from API response', result.viewCount);
            setViewCount(result.viewCount);
          } else if (result && typeof result.views !== 'undefined') {
            debug('Setting view count from API response', result.views);
            setViewCount(result.views);
          } else {
            // If no count returned, increment locally
            setViewCount(prev => prev + 1);
          }
        } else {
          // If no response body, increment locally
          setViewCount(prev => prev + 1);
        }
      } catch (parseError) {
        debug('Response is not valid JSON, incrementing view count locally', parseError.message);
        setViewCount(prev => prev + 1);
      }
      
    } catch (error) {
      console.error("Error incrementing view count:", error);
      // Still increment the view count locally as fallback
      setViewCount(prev => prev + 1);
    }
  };

  const handleLikeToggle = async () => {
    if (!isLoggedIn) {
      // Prompt user to login
      navigate('/user/login');
      return;
    }

    // If already liked, don't allow re-liking
    if (isLiked) {
      debug('User already liked this article, ignoring click');
      // You can show a message to the user if you want
      // alert('You have already liked this article');
      return;
    }

    try {
      // Get the auth token
      const token = getUserToken();
      debug('Toggling like with token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Optimistically update UI - only allow liking, not unliking
      setIsLiked(true);
      setLikeCount(prevCount => prevCount + 1);
      debug('Optimistically updated like state to liked');

      // Create headers with auth token
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);
      
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        redirect: "follow"
      };

      // Make the API call
      debug('Sending like request to API');
      const response = await fetch(
        `${baseURL}/api/interaction/news/${id}/like`,
        requestOptions
      );

      if (!response.ok) {
        throw new Error(`Like request failed with status: ${response.status}`);
      }
      
      const resultText = await response.text();
      debug('Received like response', resultText);
      
      try {
        if (resultText && resultText.trim()) {
          const result = JSON.parse(resultText);
          debug('Parsed like response', result);
          
          // Update like count from server response if available
          if (result && typeof result.likesCount !== 'undefined') {
            debug('Setting like count from API response', result.likesCount);
            setLikeCount(result.likesCount);
          } else if (result && typeof result.likeCount !== 'undefined') {
            debug('Setting like count from API response', result.likeCount);
            setLikeCount(result.likeCount);
          }
          
          // Always set isLiked to true after a successful like request
          setIsLiked(true);
        }
      } catch (parseError) {
        debug('Response is not valid JSON, keeping optimistic update', parseError.message);
      }
      
    } catch (error) {
      console.error("Error liking article:", error);
      // If there was an error, revert to the previous state
      setIsLiked(false);
      setLikeCount(prevCount => Math.max(0, prevCount - 1));
      // Alert the user of the failure
      alert('Failed to like the article. Please try again.');
    }
  };

  const handleShareClick = () => {
    try {
      // Get the title
      const title = newsData?.title || 'NewzTok Article';
      
      // Create the proper news URL with the ID
      const newsUrl = `https://newztok.in/news/${id}`;
      
      // First check if the newsData has a featuredImage and ensure it's properly formatted
      let mediaToShare = '';
      
      // Handle featured image with priority
      if (newsData.featuredImage) {
        // Make sure the URL is complete by adding the base URL if needed
        mediaToShare = newsData.featuredImage.startsWith('http') 
          ? newsData.featuredImage 
          : `${baseURL}${newsData.featuredImage.startsWith('/') ? '' : '/'}${newsData.featuredImage}`;
          
        console.log("Using featured image for sharing:", mediaToShare);
      }
      // If no featured image, try YouTube thumbnail
      else if (newsData.youtubeUrl) {
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = newsData.youtubeUrl.match(youtubeRegex);
        
        if (match && match[1]) {
          const videoId = match[1];
          mediaToShare = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
      }
      // Try other image sources if no featuredImage or YouTube
      else if (mediaUrl) {
        if (mediaUrl.type === 'image') {
          mediaToShare = mediaUrl.url;
        } else if (mediaUrl.type === 'youtube' && mediaUrl.thumbnail) {
          mediaToShare = mediaUrl.thumbnail;
        }
      }
      // Last resort - try other image fields
      else {
        // Try common image field names
        const imageFields = ['imageUrl', 'thumbnailUrl', 'thumbnail', 'image'];
        
        for (const field of imageFields) {
          if (newsData[field] && typeof newsData[field] === 'string') {
            mediaToShare = newsData[field].startsWith('http') 
              ? newsData[field] 
              : `${baseURL}${newsData[field].startsWith('/') ? '' : '/'}${newsData[field]}`;
            break;
          }
        }
      }
      
      // Fallback to NewzTok logo if no image found
      if (!mediaToShare) {
        mediaToShare = 'https://api.newztok.in/uploads/newztok-logo.png';
      }
      
      // Get a brief excerpt from the content (first 100 characters)
      const contentText = newsData?.content 
        ? newsData.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' 
        : 'Check out this article from NewzTok!';
      
      // For mobile WhatsApp, create a share URL that will show the image preview
      // First update meta tags to ensure proper sharing
      if (window.setDynamicMetaTags) {
        window.setDynamicMetaTags(
          title,
          contentText,
          mediaToShare
        );
      }
      
      // Construct WhatsApp share URL with news URL and app download links
      const shareText = encodeURIComponent(`*${title}*\n\n${contentText}\n\n*Read More:* ${newsUrl}\n\n📱 *Download NewzTok App:*\n• Android: https://play.google.com/store/apps/details?id=com.newztok\n• iOS: https://apps.apple.com/in/app/newztok/id6746141322`);
      const whatsappUrl = `https://api.whatsapp.com/send?text=${shareText}`;
      
      // Open WhatsApp in a new tab
      window.open(whatsappUrl, '_blank');
      
      console.log('Shared via WhatsApp:', {
        title,
        content: contentText,
        featuredImage: newsData.featuredImage,
        fullImageUrl: mediaToShare,
        shareUrl: newsUrl,
        newsId: id
      });
    } catch (err) {
      console.error("Error sharing to WhatsApp:", err);
      alert('Failed to share to WhatsApp. Please try again.');
    }
  };

  // Function to get current user information from token
  const getCurrentUser = () => {
    try {
      const token = getUserToken();
      if (!token) return null;
      
      // For JWT tokens, try to decode, but don't fail if format is different
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          debug('Decoded token payload', payload);
          
          return {
            id: payload.id || payload.userId || payload.user_id || payload.sub,
            username: payload.username || payload.name || payload.displayName || 'User',
            email: payload.email || ''
          };
        }
      } catch (parseError) {
        console.error('Error parsing token:', parseError);
      }
      
      // Return a default user if token can't be decoded
      return {
        id: 'unknown',
        username: 'User',
        email: ''
      };
    } catch (error) {
      console.error('Error decoding user token:', error);
      return null;
    }
  };

  const handleCommentSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!comment.trim()) {
      return;
    }
    
    // Get the auth token
    const token = getUserToken();
    
    if (!token) {
      navigate('/user/login');
      return;
    }
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/user/login');
      return;
    }
    
    try {
      debug('Submitting comment', { newsId: id, comment, user: currentUser });
      setIsSubmitting(true);

      // Add comment optimistically to UI for better UX
      const optimisticComment = {
        id: `temp-${Date.now()}`,
        content: comment,
        createdAt: new Date().toISOString(),
        user: {
          id: currentUser.id || currentUser._id,
          username: currentUser.username || currentUser.name || 'You'
        }
      };
      
      setComments(prevComments => [optimisticComment, ...prevComments]);
      
      // Create headers with auth token
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      // Use the exact format the server expects - simpler payload to start
      const commentPayload = {
        content: comment.trim(),
        newsId: id
      };
      
      debug('Attempting to post comment with payload:', commentPayload);
      
      const response = await fetch(
        `${baseURL}/api/interaction/news/${id}/comment`,
        {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(commentPayload)
        }
      );
      
      const responseData = await response.text();
      debug('Comment POST response:', responseData);
      
      if (!response.ok) {
        debug('Comment POST failed with status:', response.status);
        throw new Error(`Failed to post comment: ${responseData}`);
      }
      
      // Clear the comment input
      setComment("");
      
      // Fetch the latest comments to ensure we have the server version
      fetchComments();
      
      setCommentSuccess(true);
    } catch (error) {
      console.error("Error submitting comment:", error);
      
      // Remove optimistic comment on error
      setComments(prevComments => prevComments.filter(c => !c.id.startsWith('temp-')));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add function to fetch comments with user information
  const fetchComments = async () => {
    try {
      debug('Fetching comments for news ID', id);
      
      // Try multiple endpoints for fetching comments
      const endpointsToTry = [
        `${baseURL}/api/interaction/news/${id}/comments`,
        `${baseURL}/api/news/${id}/comments`,
        `${baseURL}/api/comments/news/${id}`,
        `${baseURL}/api/comments/${id}`
      ];
      
      let response;
      let successEndpoint = '';
      
      // Try each endpoint until one works
      for (const endpoint of endpointsToTry) {
        try {
          debug('Trying to fetch comments from:', endpoint);
          const resp = await fetch(endpoint);
          if (resp.ok) {
            response = resp;
            successEndpoint = endpoint;
            debug('Successfully fetched comments from:', endpoint);
            break;
          }
        } catch (endpointErr) {
          debug('Comments endpoint failed:', endpoint);
        }
      }
      
      if (!response || !response.ok) {
        debug('Could not fetch comments from any endpoint, using empty array');
        setComments([]);
        return;
      }
      
      const result = await response.json();
      debug('Received comments from API at ' + successEndpoint, result);
      
      let fetchedComments = [];
      
      // Handle various API response formats
      if (result && Array.isArray(result)) {
        fetchedComments = result;
      } else if (result && result.comments && Array.isArray(result.comments)) {
        fetchedComments = result.comments;
      } else if (result && result.data && Array.isArray(result.data)) {
        fetchedComments = result.data;
      } else if (result && typeof result === 'object') {
        // If the response is an object with comment-like properties
        // Try to extract individual comments based on common property patterns
        const possibleArrayProps = Object.keys(result).filter(key => 
          Array.isArray(result[key]) && 
          result[key].length > 0 &&
          (key.includes('comment') || key.includes('responses'))
        );
        
        if (possibleArrayProps.length > 0) {
          fetchedComments = result[possibleArrayProps[0]];
        }
      }
      
      debug('Extracted comments array', fetchedComments);
      
      // Ensure all comments have user information
      const processedComments = fetchedComments.map(comment => {
        // Default values if data is missing
        const processedComment = {
          id: comment.id || comment._id || Date.now() + Math.random().toString(36).substring(7),
          content: comment.content || comment.text || comment.message || comment.comment || 'No content',
          createdAt: comment.createdAt || comment.created_at || comment.timestamp || new Date().toISOString(),
        };
        
        // Handle various user data formats
        if (comment.user) {
          processedComment.user = {
            id: comment.user.id || comment.user._id || 'unknown',
            username: comment.user.username || comment.user.name || comment.user.displayName || 'Anonymous'
          };
        } else if (comment.userId || comment.username) {
          processedComment.user = {
            id: comment.userId || comment.user_id || 'unknown',
            username: comment.username || comment.userName || comment.authorName || 'Anonymous'
          };
        } else {
          // If no user information at all, use 'Anonymous'
          processedComment.user = {
            id: 'unknown',
            username: 'Anonymous'
          };
        }
        
        return processedComment;
      });
      
      debug('Processed comments with user data', processedComments);
      setComments(processedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      // Keep existing comments on error
    }
  };

  const handleLoginRedirect = () => {
    navigate('/user/login');
  };

  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };

  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } catch (err) {
      console.error('Date formatting error:', err);
      return dateString;
    }
  };

  // Get image or video URL and add watermark for downloads
  const getMediaUrl = (item) => {
    if (!item) return null;
    
    console.log("Getting media URL for item:", item);
    
    // Check for video content first
    if (item.videoPath) {
      console.log("Found videoPath:", item.videoPath);
      return {
        type: 'video',
        url: item.videoPath.startsWith('http') 
          ? item.videoPath 
          : `${baseURL}${item.videoPath.startsWith('/') ? '' : '/'}${item.videoPath}`
      };
    }
    
    // Check for video in other fields like image or featuredImage
    const videoPattern = '/uploads/videos/video-';
    
    if (item.featuredImage && typeof item.featuredImage === 'string' && item.featuredImage.includes(videoPattern)) {
      console.log("Found video in featuredImage:", item.featuredImage);
      return {
        type: 'video',
        url: item.featuredImage.startsWith('http') 
          ? item.featuredImage 
          : `${baseURL}${item.featuredImage.startsWith('/') ? '' : '/'}${item.featuredImage}`
      };
    }
    
    if (item.image && typeof item.image === 'string' && item.image.includes(videoPattern)) {
      console.log("Found video in image:", item.image);
      return {
        type: 'video',
        url: item.image.startsWith('http') 
          ? item.image 
          : `${baseURL}${item.image.startsWith('/') ? '' : '/'}${item.image}`
      };
    }
    
    // Handle video property
    if (item.video) {
      console.log("Found video property:", item.video);
      if (typeof item.video === 'string') {
        return {
          type: 'video',
          url: item.video.startsWith('http') ? item.video : `${baseURL}${item.video}`
        };
      } else if (typeof item.video === 'object' && (item.video.url || item.video.src)) {
        const videoSrc = item.video.url || item.video.src;
        return {
          type: 'video',
          url: videoSrc.startsWith('http') ? videoSrc : `${baseURL}${videoSrc}`
        };
      }
    }
    
    // Handle YouTube URLs
    if (item.youtubeUrl) {
      console.log("Found YouTube URL:", item.youtubeUrl);
      // Using the same robust regex pattern from HomeScreen.jsx
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = item.youtubeUrl.match(youtubeRegex);
      
      if (match && match[1]) {
        const videoId = match[1];
        console.log("Extracted YouTube video ID:", videoId);
        return {
          type: 'youtube',
          url: item.youtubeUrl,
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        };
      }
    }
    
    // Handle images with various property names
    const possibleImageProps = ['featuredImage', 'image', 'images', 'thumbnail', 'thumbnailUrl', 'imageUrl', 'featured_image'];
    
    for (const prop of possibleImageProps) {
      if (item[prop]) {
        // Handle array of images
        if (Array.isArray(item[prop]) && item[prop].length > 0) {
          const imgSrc = item[prop][0];
          console.log(`Found image in ${prop} array:`, imgSrc);
          
          if (typeof imgSrc === 'string') {
            // Skip if this is a video path, we've already handled videos
            if (imgSrc.includes(videoPattern)) continue;
            
            return {
              type: 'image',
              url: imgSrc.startsWith('http') ? imgSrc : `${baseURL}${imgSrc}`
            };
          } else if (imgSrc.url || imgSrc.src) {
            const url = imgSrc.url || imgSrc.src;
            if (url.includes(videoPattern)) continue;
            
            return {
              type: 'image',
              url: url.startsWith('http') ? url : `${baseURL}${url}`
            };
          }
        }
        
        // Handle direct string or object
        if (typeof item[prop] === 'string') {
          // Skip if this is a video path, we've already handled videos
          if (item[prop].includes(videoPattern)) continue;
          
          console.log(`Found image in ${prop}:`, item[prop]);
          return {
            type: 'image',
            url: item[prop].startsWith('http') 
              ? item[prop] 
              : `${baseURL}${item[prop]}`
          };
        } else if (typeof item[prop] === 'object' && (item[prop].url || item[prop].src)) {
          const imgSrc = item[prop].url || item[prop].src;
          if (imgSrc.includes(videoPattern)) continue;
          
          console.log(`Found image in ${prop} object:`, imgSrc);
          return {
            type: 'image',
            url: imgSrc.startsWith('http') ? imgSrc : `${baseURL}${imgSrc}`
          };
        }
      }
    }
    
    console.log("No media URL found in the item");
    // Use a more reliable placeholder image service
    return {
      type: 'image',
      url: 'https://placehold.co/800x400/000000/FFFFFF/png?text=News+Image'
    };
  };

  // Function to download image with watermark
  const downloadImageWithWatermark = async () => {
    if (!mediaUrl || mediaUrl.type !== 'image') {
      alert('No image available to download');
      return;
    }

    try {
      // Create a new image element to load the image
      const img = new Image();
      img.crossOrigin = 'Anonymous'; // This allows working with images from other domains
      
      // Wait for the image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = mediaUrl.url;
      });

      // Create a canvas element to manipulate the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions to match the image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the original image on the canvas
      ctx.drawImage(img, 0, 0);
      
      // Add watermark text
      ctx.font = 'bold 40px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Draw the diagonal watermark
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 6); // Rotate text slightly
      ctx.fillText('NewzTok', 0, 0);
      ctx.restore();
      
      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      // Create a download link and trigger it
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `NewzTok-${newsData.title?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'image'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('Image downloaded with NewzTok watermark');
    } catch (error) {
      console.error('Error downloading image with watermark:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  // Capitalize text
  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        bgcolor: '#f5f5f5'
      }}>
        <CircularProgress size={60} sx={{ color: '#e73952' }} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading article...
        </Typography>
      </Box>
    );
  }

  if (!newsData) {
    return (
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        p: 3,
        bgcolor: '#f5f5f5'
      }}>
        <Typography variant="h5" color="error" gutterBottom>
          Article not found
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
          The article you are looking for could not be found or has been removed.
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleBackClick}
          sx={{ 
            bgcolor: '#e73952',
            '&:hover': { bgcolor: '#d32f2f' } 
          }}
        >
          Go Back to
        </Button>
      </Box>
    );
  }

  // Determine media type and URL
  const mediaUrl = getMediaUrl(newsData);
  const isYoutubeVideo = mediaUrl && mediaUrl.type === 'youtube';
  const isContentVideo = newsData.contentType === 'video' || newsData.video ? true : false;
  const createdDate = formatDate(newsData.createdAt || newsData.publishedAt || newsData.updatedAt);
  const location = [
    newsData.state && capitalizeFirstLetter(newsData.state),
    newsData.district && capitalizeFirstLetter(newsData.district)
  ].filter(Boolean).join(', ');

  return (
    <Box sx={{ bgcolor: 'white', minHeight: '100vh' }}>
      {/* Back Button */}
      <Box 
        sx={{ 
          width: '100%', 
          position: 'relative',
          py: 1.5,
          color: 'white',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0039CB, #1E88E5)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 2px, transparent 2px)',
            backgroundSize: '40px 40px',
            opacity: 0.5,
            zIndex: 1
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpolygon fill='%23ffffff' fill-opacity='0.15' points='0,0 15,0 0,15'/%3E%3Cpolygon fill='%23ffffff' fill-opacity='0.15' points='100,100 85,100 100,85'/%3E%3C/svg%3E")`,
            zIndex: 1
          }
        }}
      >
        {/* Trending Arrows (Left Side) */}
        <Box 
          sx={{
            position: 'absolute',
            left: '5%',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            display: { xs: 'none', md: 'block' }
          }}
        >
          <svg width="60" height="120" viewBox="0 0 60 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 0L60 30H45V120H15V30H0L30 0Z" fill="rgba(255,255,255,0.3)" />
          </svg>
        </Box>
        
        {/* Trending Arrows (Right Side) */}
        <Box 
          sx={{
            position: 'absolute',
            right: '5%',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            display: { xs: 'none', md: 'block' }
          }}
        >
          <svg width="60" height="120" viewBox="0 0 60 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 0L60 30H45V120H15V30H0L30 0Z" fill="rgba(255,255,255,0.3)" />
          </svg>
        </Box>
            
        {/* Wave Pattern */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '18px',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' opacity='.25' fill='%23ffffff'%3E%3C/path%3E%3Cpath d='M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z' opacity='.5' fill='%23ffffff'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundSize: '100% 18px',
            backgroundRepeat: 'no-repeat',
            zIndex: 2
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton color="inherit" onClick={handleBackClick} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
              Back to Home Page
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Article Header */}
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
          {newsData.title}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
          {/* Date and Time */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTimeIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {createdDate}
            </Typography>
          </Box>
          
          {/* Location (State, District) */}
          {location && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOnIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {location}
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Media (Image or Video) */}
        {mediaUrl && (
          <Box sx={{ width: '100%', mb: 3, borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
            {mediaUrl.type === 'video' ? (
              <Box
                component="video"
                src={mediaUrl.url}
                controls
                preload="metadata"
                controlsList="nodownload"
                sx={{
                  width: '100%',
                  maxHeight: '500px',
                  borderRadius: '8px',
                  backgroundColor: '#000',
                }}
                onError={(e) => {
                  console.error("Video load error:", e);
                  e.target.onerror = null;
                  // Replace with placeholder if video fails to load
                  e.target.style.display = 'none';
                  // Create and append placeholder image
                  const img = document.createElement('img');
                  img.src = 'https://placehold.co/800x400/000000/FFFFFF/png?text=Video+Not+Available';
                  img.style.width = '100%';
                  img.style.maxHeight = '500px';
                  img.style.objectFit = 'cover';
                  img.style.borderRadius = '8px';
                  e.target.parentNode.appendChild(img);
                }}
              />
            ) : mediaUrl.type === 'youtube' ? (
              <>
                <Box 
                  component="img"
                  src={mediaUrl.thumbnail || 'https://placehold.co/800x400/000000/FFFFFF/png?text=YouTube+Video'}
                  alt={newsData.title}
                  sx={{
                    width: '100%',
                    maxHeight: '500px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                  onClick={() => window.open(mediaUrl.url, '_blank')}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80px',
                    height: '56px',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      transform: 'translate(-50%, -50%) scale(1.05)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                  onClick={() => window.open(mediaUrl.url, '_blank')}
                >
                  <svg height="34" width="48" viewBox="0 0 68 48">
                    <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path>
                    <path d="M 45,24 27,14 27,34" fill="#fff"></path>
                  </svg>
                </Box>
              </>
            ) : (
              <Box 
                component="img"
                src={mediaUrl.url}
                alt={newsData.title}
                sx={{
                  width: '100%',
                  maxHeight: '500px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  // Use a more reliable fallback image
                  e.target.src = 'https://placehold.co/800x400/000000/FFFFFF/png?text=News+Image';
                }}
              />
            )}
          </Box>
        )}
        
        {/* Action Buttons (Like, View, Share) */}
        <Box sx={{ py: 2, display: 'flex', alignItems: 'center', gap: 4, borderBottom: '1px solid #eee', mb: 3 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: isLiked ? 'default' : 'pointer',
              opacity: isLiked ? 1 : 0.9,
              '&:hover': {
                opacity: isLiked ? 1 : 1
              }
            }} 
            onClick={handleLikeToggle}
          >
            <IconButton 
              color={isLiked ? 'error' : 'default'} 
              size="small"
              disabled={isLiked}
              sx={{
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: isLiked ? 'none' : 'scale(1.1)',
                },
                '&.Mui-disabled': {
                  opacity: 1,
                  color: 'error.main'
                }
              }}
            >
              {isLiked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
            </IconButton>
            <Typography 
              variant="body2" 
              sx={{ 
                ml: 0.5,
                color: isLiked ? 'error.main' : 'text.primary',
                fontWeight: isLiked ? 'medium' : 'regular'
              }}
            >
              {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton color="default" size="small">
              <VisibilityIcon />
            </IconButton>
            <Typography variant="body2" sx={{ ml: 0.5 }}>
              {viewCount} {viewCount === 1 ? 'View' : 'Views'}
            </Typography>
          </Box>
          
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              color: '#25D366', // WhatsApp green color
              '&:hover': {
                opacity: 0.9
              }
            }} 
            onClick={handleShareClick}
          >
            <IconButton 
              size="small" 
              sx={{ 
                color: '#25D366',
                '&:hover': {
                  transform: 'scale(1.1)',
                }
              }}
            >
              <WhatsAppIcon />
            </IconButton>
            <Typography variant="body2" sx={{ ml: 0.5 }}>
              Share on WhatsApp
            </Typography>
          </Box>
        </Box>
        
        {/* Article Content */}
        <Box 
          sx={{ lineHeight: 1.8, mb: 4 }}
          dangerouslySetInnerHTML={{ 
            __html: newsData.content || "No content available for this article." 
          }}
        />
        
        {/* In-Article Ad */}
        <AdComponent type="in-article" adSlot="1234567890" />
        
        {/* Display Ad before Comments */}
        <AdComponent type="display" adSlot="1234567891" />
        
        {/* Comments Section */}
        <Box sx={{ py: 3, bgcolor: '#f9f9f9', borderRadius: 2, mt: 4 }}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Comments
            </Typography>
            
            {/* Comment Input - Show only if logged in */}
            {isLoggedIn ? (
              <Box sx={{ display: 'flex', mb: 4, gap: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Write a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'white'
                    }
                  }}
                />
                <Button
                  variant="contained"
                  disabled={!comment.trim()}
                  onClick={handleCommentSubmit}
                  sx={{ 
                    minWidth: '46px', 
                    bgcolor: '#e73952',
                    borderRadius: 2,
                    '&:hover': { bgcolor: '#d32f2f' }
                  }}
                >
                  <SendIcon />
                </Button>
              </Box>
            ) : (
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Button
                  variant="contained"
                  onClick={handleLoginRedirect}
                  sx={{ 
                    bgcolor: '#e73952',
                    '&:hover': { bgcolor: '#d32f2f' }
                  }}
                >
                  Login to comment
                </Button>
              </Box>
            )}
            
            {/* Comment Success Message */}
            {commentSuccess && (
              <Box 
                sx={{ 
                  backgroundColor: '#ecfdf5', 
                  color: '#065f46', 
                  p: 2, 
                  borderRadius: 2,
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 'medium'
                }}
              >
                <Typography variant="body2">
                  Comment posted successfully!
                </Typography>
              </Box>
            )}
            
            {/* Comments List */}
            <Box>
              {comments.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No comments yet. Be the first to comment!
                </Typography>
              ) : (
                comments.map((comment, index) => (
                  <Box key={comment.id || index} sx={{ mb: 3, pb: 3, borderBottom: index < comments.length - 1 ? '1px solid #eee' : 'none' }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar 
                        sx={{ bgcolor: '#e73952' }}
                      >
                        {(comment.user?.username || 'U').charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {comment.user?.username || 'Anonymous'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(comment.createdAt)}
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          {comment.content}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default NewsDetail; 