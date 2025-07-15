import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Divider,
  Avatar,
  Button,
  TextField,
  CircularProgress,
  IconButton,
  Grid,
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

const StateNewsDetails = () => {
  const { id, state } = useParams();
  const navigate = useNavigate();
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);
  
  // API base URL
  const baseURL = 'https://api.newztok.in';
  
  // Primary color for state theme
  const themeColor = '#1B5E20'; // Green color for state news
  
  // Check if user is logged in (has auth token)
  const isLoggedIn = !!localStorage.getItem('userAuthToken');

  // Get the user token for API requests
  const getUserToken = () => {
    return localStorage.getItem('userAuthToken');
  };

  // Add a debug helper
  const debug = (message, data) => {
    console.log(`[StateNewsDetails ${id}] ${message}`, data !== undefined ? data : '');
  };

  useEffect(() => {
    debug('Component mounted with ID', id);
    debug('User logged in?', isLoggedIn);
    
    fetchStateNewsDetail();
    fetchComments();
    fetchInteractionStats();
    
    // Check if user has already liked the article when component mounts
    if (isLoggedIn) {
      checkLikeStatus();
    }
  }, [id]);

  // Update meta tags when news data is loaded
  useEffect(() => {
    if (newsData && window.setDynamicMetaTags) {
      // Get a clean description from content (strip HTML)
      const description = newsData.content
        ? newsData.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
        : 'Check out this state news article from NewzTok!';
      
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
        newsData.title || 'NewzTok State News Article',
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
      fetchComments();
    } else {
      // Reset like status if user logs out
      setIsLiked(false);
    }
  }, [isLoggedIn]);

  const fetchStateNewsDetail = async () => {
    try {
      setLoading(true);
      console.log('Starting to fetch state news details...');
      console.log('State:', state);
      console.log('ID:', id);
      
      // Try different API endpoints that might work
      const endpoints = [
        `/api/news/state/${state}/${id}`,
        `/api/news/${id}`,
        `/api/news/by-id/${id}`,
        `/api/news/details/${id}`,
        `/api/news/post/${id}`
      ];
      
      console.log('Trying endpoints:', endpoints);
      
      let response = null;
      let foundEndpoint = null;
      
      // First try individual fetch for each endpoint
      for (const endpoint of endpoints) {
        try {
          const url = `${baseURL}${endpoint}`;
          console.log(`Attempting to fetch from: ${url}`);
          response = await axios.get(url);
          console.log(`Response from ${endpoint}:`, response.data);
          
          if (response.status === 200 && response.data) {
            console.log(`Success with endpoint: ${endpoint}`);
            foundEndpoint = endpoint;
            break;
          }
        } catch (err) {
          console.error(`Error with endpoint ${endpoint}:`, err.message);
        }
      }
      
      // If all individual endpoints failed, try to get listing and filter by ID
      if (!response || !foundEndpoint) {
        console.log("Individual endpoints failed, trying to find article in state news listing...");
        
        try {
          const stateUrl = `${baseURL}/api/news/state/${state}`;
          console.log(`Attempting to fetch state listing from: ${stateUrl}`);
          const listResponse = await axios.get(stateUrl);
          console.log('State listing response:', listResponse.data);
          
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
            
            console.log('Extracted news items:', newsItems);
            
            // Find the article with matching ID
            const article = newsItems.find(item => {
              const matches = 
                item.id === id || 
                item.id === parseInt(id) || 
                item._id === id || 
                String(item.id) === String(id);
              console.log(`Checking item ${item.id}: matches=${matches}`);
              return matches;
            });
            
            if (article) {
              console.log(`Found article in state news:`, article);
              response = { 
                data: article,
                status: 200
              };
              foundEndpoint = `/api/news/state/${state}`;
            } else {
              console.log('No matching article found in state listing');
            }
          }
        } catch (err) {
          console.error('Error fetching state listing:', err);
        }
      }
      
      if (!response || !foundEndpoint) {
        console.warn("All API endpoints failed, using mocked data...");
        // Use a mock response with the ID
        const mockData = {
          id: id,
          title: `State News Article ${id}`,
          content: "This is sample content since the API endpoint couldn't be reached. The content would normally include details about this state news article.",
          createdAt: new Date().toISOString(),
          state: state,
          district: "Sample District",
          category: "STATE",
          featuredImage: "https://via.placeholder.com/800x400?text=State+News+Image"
        };
        console.log('Setting mock data:', mockData);
        setNewsData(mockData);
      } else {
        console.log(`Successfully fetched data from ${foundEndpoint}`, response.data);
        
        // Process the API response
        if (response.data) {
          const articleData = response.data.data || response.data;
          console.log("Setting state news data:", articleData);
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
          incrementViewCount(foundEndpoint);
        }
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching state news details:", err);
      // Use mock data in case of error
      const mockData = {
        id: id,
        title: `State News Article ${id}`,
        content: "This is sample content since the API endpoint couldn't be reached. The content would normally include details about this state news article.",
        createdAt: new Date().toISOString(),
        state: state,
        district: "Sample District",
        category: "STATE",
        featuredImage: "https://via.placeholder.com/800x400?text=State+News+Image"
      };
      console.log('Setting mock data due to error:', mockData);
      setNewsData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async (endpoint) => {
    if (!endpoint) return;
    
    try {
      // Use a standardized view endpoint with the ID
      const viewEndpoint = `/api/news/view/${id}`;
      
      console.log(`Attempting to increment view count with endpoint: ${baseURL}${viewEndpoint}`);
      
      // Add a proper request body with the news ID
      await axios.post(`${baseURL}${viewEndpoint}`, { newsId: id });
      
      // For now, increment the view locally regardless of API success
      setViewCount(prev => prev + 1);
      console.log(`View count incremented locally to: ${viewCount + 1}`);
    } catch (err) {
      console.error("Error incrementing view count:", err);
      // Increment locally anyway as fallback
      setViewCount(prev => prev + 1);
      console.log(`View count incremented locally (after API failure) to: ${viewCount + 1}`);
      // Just silently fail, this is not critical
    }
  };

  const handleLikeToggle = async () => {
    if (!isLoggedIn) {
      // Prompt user to login
      navigate('/user/login');
      return;
    }

    // Store current state before any async operations
    let prevLikeState = isLiked;
    let prevLikeCount = likeCount;

    try {
      // Get the auth token
      const token = getUserToken();
      debug('Toggling like with token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Optimistically update UI for both like and unlike
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setLikeCount(prevCount => newLikedState ? prevCount + 1 : Math.max(0, prevCount - 1));
      debug(`Optimistically updated like state to ${newLikedState ? 'liked' : 'unliked'}`);

      // Create headers with auth token
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);
      
      // Determine which endpoint to use based on the action (like or unlike)
      const likeEndpoint = isLiked 
        ? `http://13.234.42.114:3333/api/interaction/news/${id}/unlike`
        : `http://13.234.42.114:3333/api/interaction/news/${id}/like`;
      
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        redirect: "follow"
      };

      // Make the API call
      debug(`Sending ${isLiked ? 'unlike' : 'like'} request to API`);
      const response = await fetch(likeEndpoint, requestOptions);

      if (!response.ok) {
        throw new Error(`${isLiked ? 'Unlike' : 'Like'} request failed with status: ${response.status}`);
      }
      
      const resultText = await response.text();
      debug('Received like/unlike response', resultText);
      
      try {
        if (resultText && resultText.trim()) {
          const result = JSON.parse(resultText);
          debug('Parsed like/unlike response', result);
          
          // Update like count from server response if available
          if (result && typeof result.likesCount !== 'undefined') {
            debug('Setting like count from API response', result.likesCount);
            setLikeCount(result.likesCount);
          } else if (result && typeof result.likeCount !== 'undefined') {
            debug('Setting like count from API response', result.likeCount);
            setLikeCount(result.likeCount);
          }
        }
      } catch (parseError) {
        debug('Response is not valid JSON, keeping optimistic update', parseError.message);
      }
      
    } catch (error) {
      console.error(`Error ${isLiked ? 'unliking' : 'liking'} article:`, error);
      // If there was an error, revert to the previous state
      setIsLiked(prevLikeState);
      setLikeCount(prevLikeCount);
      // Alert the user of the failure
      alert(`Failed to ${isLiked ? 'unlike' : 'like'} the article. Please try again.`);
    }
  };

  const handleShareClick = () => {
    try {
      // Get the title
      const title = newsData?.title || 'NewzTok State Article';
      
      // Create the proper news URL with the ID
      const newsUrl = `https://newztok.in/state/${state}/${id}`;
      
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
        : 'Check out this state news article from NewzTok!';
      
      // For mobile WhatsApp, create a share URL that will show the image preview
      // First update meta tags to ensure proper sharing
      if (window.setDynamicMetaTags) {
        window.setDynamicMetaTags(
          title,
          contentText,
          mediaToShare
        );
      }
      
      // Construct WhatsApp share URL with just the news URL to leverage meta tags
      const shareText = encodeURIComponent(`*${title}*\n\n${contentText}\n\n*Read More:*`);
      const whatsappUrl = `https://api.whatsapp.com/send?text=${shareText} ${encodeURIComponent(newsUrl)}`;
      
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
      
      // Increment share count optimistically
      setShareCount(prev => prev + 1);
      
      // Record share in the backend
      recordShare();
    } catch (err) {
      console.error("Error sharing to WhatsApp:", err);
      alert('Failed to share to WhatsApp. Please try again.');
    }
  };

  // Record share interaction
  const recordShare = async () => {
    try {
      const token = getUserToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.post(`${baseURL}/api/interaction/news/${id}/share`, {}, { headers });
      debug('Successfully recorded share interaction');
      
      // Refresh stats after recording share
      fetchInteractionStats();
    } catch (err) {
      console.error('Error recording share:', err);
      // Silent fail, user doesn't need to know about this error
    }
  };

  // Fetch interaction stats (likes, views, comments, shares)
  const fetchInteractionStats = async () => {
    try {
      debug('Fetching interaction stats for news ID', id);
      
      const statsUrl = `${baseURL}/api/interaction/news/${id}/stats`;
      debug('Stats API URL', statsUrl);
      
      const response = await axios.get(statsUrl);
      debug('Stats API response', response.data);
      
      if (response.data) {
        // Extract stats from response
        const { likes, views, comments: commentCount, shares } = response.data;
        
        // Update state with the fetched counts
        if (typeof likes === 'number') {
          debug('Setting like count from stats API', likes);
          setLikeCount(likes);
        }
        
        if (typeof views === 'number') {
          debug('Setting view count from stats API', views);
          setViewCount(views);
        }
        
        if (typeof shares === 'number') {
          debug('Setting share count from stats API', shares);
          setShareCount(shares);
        }
      }
    } catch (err) {
      console.error("Error fetching interaction stats:", err);
      // Don't set error state, just log it to avoid disrupting the UI
    }
  };

  const handleLoginRedirect = () => {
    navigate('/user/login');
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim()) return;

    try {
      // Get the auth token
      const token = localStorage.getItem('userAuthToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Configure headers with the token
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      debug('Submitting comment', comment);
      
      // Send the comment to the API
      const response = await axios.post(
        `${baseURL}/api/interaction/news/${id}/comment`, 
        { content: comment },
        config
      );
      
      debug('Comment submission response', response.data);
      
      // After successful submission, refresh the comments list
      fetchComments();
      
      // Clear the comment input
      setComment('');

      // Set comment success state
      setCommentSuccess(true);
    } catch (err) {
      console.error("Error submitting comment:", err);
    }
  };

  const handleBackClick = () => {
    navigate(`/state/${state}`);
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

  // Get image or video URL
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
    
    // Handle YouTube URLs
    if (item.youtubeUrl) {
      console.log("Found YouTube URL:", item.youtubeUrl);
      return {
        type: 'youtube',
        url: item.youtubeUrl,
        thumbnail: (() => {
          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
          const match = item.youtubeUrl.match(regExp);
          return (match && match[2].length === 11)
            ? `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`
            : null;
        })()
      };
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
    return {
      type: 'image',
      url: 'https://via.placeholder.com/800x400?text=State+News+Image'
    };
  };

  // Capitalize text - Enhanced to handle multiple word capitalization
  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    
    // Convert to lowercase first to ensure consistent casing
    const lowerCaseString = string.toLowerCase();
    
    // Split by spaces and capitalize first letter of each word
    return lowerCaseString
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Add function to fetch comments
  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      debug('Fetching comments for news ID', id);
      
      // Prepare headers with token if available
      const headers = {};
      const token = getUserToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const commentsUrl = `${baseURL}/api/interaction/news/${id}/comments`;
      debug('Comments API URL', commentsUrl);
      
      const response = await axios.get(commentsUrl, { headers });
      debug('Comments API response', response.data);
      
      if (response.data) {
        let fetchedComments = [];
        if (Array.isArray(response.data)) {
          fetchedComments = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          fetchedComments = response.data.data;
        } else if (response.data.comments && Array.isArray(response.data.comments)) {
          fetchedComments = response.data.comments;
        }
        
        debug('Fetched comments count', fetchedComments.length);
        setComments(fetchedComments);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
      // Don't set error state, just log it to avoid disrupting the UI
    } finally {
      setLoadingComments(false);
    }
  };

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
        `http://13.234.42.114:3333/api/interaction/news/${id}/like/status`,
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
        <CircularProgress size={60} sx={{ color: themeColor }} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading state article...
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
          State article not found
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
          The state article you are looking for could not be found or has been removed.
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleBackClick}
          sx={{ 
            bgcolor: themeColor,
            '&:hover': { bgcolor: '#1B5E20' } 
          }}
        >
          Back to State News
        </Button>
      </Box>
    );
  }

  // Update the isYoutubeVideo variable
  const mediaUrl = getMediaUrl(newsData);
  const isYoutubeVideo = mediaUrl && mediaUrl.type === 'youtube';
  const isContentVideo = newsData.contentType === 'video';
  const createdDate = formatDate(newsData.createdAt || newsData.publishedAt || newsData.updatedAt);
  
  // Process state and district with proper capitalization
  let stateValue = '';
  let districtValue = '';
  
  if (newsData.state) {
    console.log('Original state:', newsData.state);
    stateValue = capitalizeFirstLetter(newsData.state);
    console.log('Capitalized state:', stateValue);
  }
  
  if (newsData.district) {
    console.log('Original district:', newsData.district);
    districtValue = capitalizeFirstLetter(newsData.district);
    console.log('Capitalized district:', districtValue);
  }
  
  // Build location string with properly capitalized values
  const location = [stateValue, districtValue].filter(Boolean).join(', ');
  console.log('Final location string:', location);

  return (
    <Box sx={{ bgcolor: 'white', minHeight: '100vh' }}>
      {/* Back Button with State Theme */}
      <Box sx={{ 
        background: `linear-gradient(135deg, ${themeColor}, #1B5E20)`,
        color: 'white',
        py: 1.5,
        px: 2,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 2px, transparent 2px)',
          backgroundSize: '20px 20px',
          opacity: 0.5,
          zIndex: 1
        }
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 2 }}>
            <IconButton color="inherit" onClick={handleBackClick} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
              Back to State News
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
          {/* Category Badge */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: themeColor,
              color: 'white',
              px: 2,
              py: 0.5,
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            {newsData.category || 'STATE'}
          </Box>

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
                  img.src = 'https://via.placeholder.com/800x400?text=Video+Not+Available';
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
                  src={mediaUrl.thumbnail || 'https://via.placeholder.com/800x400?text=YouTube+Video'}
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
                    width: '68px',
                    height: '48px',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => window.open(mediaUrl.url, '_blank')}
                >
                  <svg height="24" width="34" viewBox="0 0 68 48">
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
                  e.target.src = 'https://via.placeholder.com/800x400?text=State+News+Image';
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
              cursor: 'pointer',
              opacity: 0.9,
              '&:hover': {
                opacity: 1
              }
            }} 
            onClick={handleLikeToggle}
          >
            <IconButton 
              color={isLiked ? 'error' : 'default'} 
              size="small"
              sx={{
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.1)',
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
            __html: newsData.content || "No content available for this state article." 
          }}
        />
        
        {/* Comments Section */}
        <Box sx={{ py: 3, bgcolor: '#f9f9f9', borderRadius: 2, mt: 4 }}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Comments
            </Typography>
            
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

            {/* Loading indicator */}
            {loadingComments && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={30} sx={{ color: themeColor }} />
              </Box>
            )}
            
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
                    bgcolor: themeColor,
                    borderRadius: 2,
                    '&:hover': { bgcolor: '#1B5E20' }
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
                    bgcolor: themeColor,
                    '&:hover': { bgcolor: '#1B5E20' }
                  }}
                >
                  Login to comment
                </Button>
              </Box>
            )}
            
            {/* Comments List */}
            <Box>
              {loadingComments ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={30} sx={{ color: themeColor }} />
                </Box>
              ) : comments.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No comments yet. Be the first to comment!
                </Typography>
              ) : (
                comments.map((comment, index) => (
                  <Box key={comment.id || index} sx={{ mb: 3, pb: 3, borderBottom: index < comments.length - 1 ? '1px solid #eee' : 'none' }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar 
                        sx={{ bgcolor: themeColor }}
                      >
                        {(comment.user?.username || comment.user?.name || 'U').charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {comment.user?.username || comment.user?.name || 'Anonymous'}
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

export default StateNewsDetails; 