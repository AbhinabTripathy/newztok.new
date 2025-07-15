import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import EditorSidebar from './EditorSidebar';
import EditorHeader from './EditorHeader';
import EditorFooter from './EditorFooter';
import Overview from './Overview';
import StandardPost from './StandardPost';
import VideoPost from './VideoPost';
import Posts from './Posts';
import PendingApprovals from './PendingApprovals';
import Rejected from './Rejected';
import Users from './Users';
import AddViewUsers from './AddViewUsers';
import Profile from './Profile';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

const EditorHome = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [showSessionExpiredDialog, setShowSessionExpiredDialog] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check the URL path to determine which section to show
  useEffect(() => {
    const path = location.pathname;

    if (path.includes('/editor/standardPost')) {
      setActiveSection('standardPost');
    } else if (path.includes('/editor/videoPost')) {
      setActiveSection('videoPost');
    } else if (path.includes('/editor/posts')) {
      setActiveSection('posts');
    } else if (path.includes('/editor/pendingApprovals')) {
      setActiveSection('pendingApprovals');
    } else if (path.includes('/editor/rejected')) {
      setActiveSection('rejected');
    } else if (path.includes('/editor/users')) {
      setActiveSection('users');
    } else if (path.includes('/editor/addViewUsers')) {
      setActiveSection('addViewUsers');
    } else if (path.includes('/editor/profile')) {
      setActiveSection('profile');
    } else {
      setActiveSection('overview');
    }
  }, [location]);

  // Check for token expiration on component mount
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
        return <Posts />;
      case 'pendingApprovals':
        return <PendingApprovals />;
      case 'rejected':
        return <Rejected />;
      case 'users':
        return <Users />;
      case 'addViewUsers':
        return <AddViewUsers />;
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

      {shouldShowHeaderAndSidebar && <EditorHeader />}
      
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {shouldShowHeaderAndSidebar && (
          <div style={{ width: '250px', backgroundColor: '#1e2029' }}>
            <EditorSidebar onSectionChange={handleSectionChange} activeSection={activeSection} />
          </div>
        )}
        
        <main style={{ flex: 1, overflow: 'auto', backgroundColor: '#f8fafc' }}>
          {renderContent()}
        </main>
      </div>
      
      {shouldShowHeaderAndSidebar && <EditorFooter />}
    </div>
  );
};

export default EditorHome; 