import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import JournalistSidebar from './JournalistSidebar';
import JournalistHeader from './JournalistHeader';
import JournalistFooter from './JournalistFooter';
import Overview from './Overview';
import StandardPost from './StandardPost';
import VideoPost from './VideoPost';
import PendingApprovals from './PendingApprovals';
import JournalistPost from './JournalistPost';
import JournalistRejected from './JournalistRejected';
import Profile from './Profile';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

// Placeholder components for other screens
const Rejected = () => <div style={{ padding: '30px' }}><h1>Rejected Posts</h1></div>;

const JournalistHome = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const location = useLocation();
  const navigate = useNavigate();
  const [showSessionExpiredDialog, setShowSessionExpiredDialog] = useState(false);

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
    
    // Set up interval to check token expiration every 5 minutes
    const tokenCheckInterval = setInterval(checkTokenExpiration, 5 * 60 * 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(tokenCheckInterval);
  }, [navigate]);

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

  // Check the URL path to determine which section to show
  useEffect(() => {
    const path = location.pathname;

    if (path.includes('/journalist/standardPost')) {
      setActiveSection('standardPost');
    } else if (path.includes('/journalist/videoPost')) {
      setActiveSection('videoPost');
    } else if (path.includes('/journalist/posts')) {
      setActiveSection('posts');
    } else if (path.includes('/journalist/pendingApprovals')) {
      setActiveSection('pendingApprovals');
    } else if (path.includes('/journalist/rejected')) {
      setActiveSection('rejected');
    } else if (path.includes('/journalist/profile')) {
      setActiveSection('profile');
    } else {
      setActiveSection('overview');
    }
  }, [location]);

  // Function to share with sidebar to update active section
  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  // Render the appropriate component based on activeSection
  const renderContent = () => {
    switch (activeSection) {
      case 'standardPost':
        return <StandardPost />;
      case 'videoPost':
        return <VideoPost />;
      case 'posts':
        return <JournalistPost />;
      case 'pendingApprovals':
        return <PendingApprovals />;
      case 'rejected':
        return <JournalistRejected />;
      case 'profile':
        return <Profile />;
      default:
        return <Overview />;
    }
  };

  // Check if we should hide the header, sidebar, and footer
  const shouldShowHeaderAndSidebar = activeSection !== 'profile';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Session Expired Dialog */}
      <Dialog
        open={showSessionExpiredDialog}
        onClose={() => {}}
        aria-labelledby="session-expired-dialog-title"
        aria-describedby="session-expired-dialog-description"
      >
        <DialogTitle id="session-expired-dialog-title">
          Session Expired
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="session-expired-dialog-description">
            Your session has expired. Please login again to continue.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLoginRedirect} color="primary" autoFocus>
            Login
          </Button>
        </DialogActions>
      </Dialog>
      
      {shouldShowHeaderAndSidebar ? (
        <>
          <JournalistHeader />
          
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <div style={{ width: '250px', backgroundColor: '#1e2029' }}>
              <JournalistSidebar onSectionChange={handleSectionChange} activeSection={activeSection} />
            </div>
            
            <main style={{ flex: 1, overflow: 'auto', backgroundColor: '#f8fafc' }}>
              {renderContent()}
            </main>
          </div>
          
          <JournalistFooter />
        </>
      ) : (
        <main style={{ flex: 1, overflow: 'auto' }}>
          {renderContent()}
        </main>
      )}
    </div>
  );
};

export default JournalistHome; 