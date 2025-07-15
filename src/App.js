import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, Navigate, Link } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import HomeScreen from './components/HomeScreen';
import TrendingNews from './components/TrendingNews';
import NationalNews from './components/NationalNews';
import InternationalNews from './components/InternationalNews';
import Sports from './components/Sports';
import Entertainment from './components/Entertainment';
import StateNews from './components/State';
import StateNewsPage from './components/StateNewsPage';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import NewsDetail from './components/NewsDetail';
import TrendingNewsDetails from './components/TrendingNewsDetails';
import InternationalNewsDetails from './components/InternationalNewsDetails';
import NationalNewsDetails from './components/NationalNewsDetails';
import StateNewsDetails from './components/StateNewsDetails';
import EntertainmentNewsDetails from './components/EntertainmentNewsDetails';
import SportsNewsDetails from './components/SportsNewsDetails';
import JournalistHome from './components/Journalist/JournalistHome';
import ProtectedRoute from './components/Journalist/ProtectedRoute';
import EditPost from './components/Journalist/EditPost';
import EditorHome from './components/Editor/EditorHome';
import EditorEditScreen from './components/Editor/EditorEditScreen';
import ReEditPost from './components/Editor/ReEditPost';
import ProtectedEditorRoute from './components/ProtectedEditorRoute';
import NewsFeed from './components/NewsFeed';
import { ThemeProvider, createTheme, Box, Button } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndConditions from './components/TermsAndConditions';

// Create theme with custom fonts
const theme = createTheme({
  typography: {
    fontFamily: '"Proxima Nova", "Montserrat", "Poppins", "Lora", sans-serif',
    h1: {
      fontFamily: '"Proxima Nova", "Montserrat", sans-serif',
    },
    h2: {
      fontFamily: '"Proxima Nova", "Montserrat", sans-serif',
    },
    h3: {
      fontFamily: '"Proxima Nova", "Montserrat", sans-serif',
    },
    h4: {
      fontFamily: '"Proxima Nova", "Montserrat", sans-serif',
    },
    h5: {
      fontFamily: '"Proxima Nova", "Montserrat", sans-serif',
    },
    h6: {
      fontFamily: '"Proxima Nova", "Montserrat", sans-serif',
    },
    body1: {
      fontFamily: '"Poppins", "Lora", sans-serif',
    },
    body2: {
      fontFamily: '"Poppins", "Lora", sans-serif',
    },
  },
});

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/user/login';
  const isRegisterPage = location.pathname === '/register';
  const isJournalistPage = location.pathname.startsWith('/journalist');
  const isProfilePage = location.pathname === '/profile';
  const isNewsDetailPage = location.pathname.startsWith('/news/');
  const isTrendingDetailPage = location.pathname.startsWith('/trending/') && location.pathname !== '/trending';
  const isInternationalDetailPage = location.pathname.startsWith('/international/') && location.pathname !== '/international';
  const isNationalDetailPage = location.pathname.startsWith('/national/') && location.pathname !== '/national';
  const isStateDetailPage = location.pathname.match(/^\/state\/[^/]+\/\d+/);
  const isEntertainmentDetailPage = location.pathname.startsWith('/entertainment/') && location.pathname !== '/entertainment';
  const isSportsDetailPage = location.pathname.startsWith('/sports/') && location.pathname !== '/sports';
  const isPolicyPage = location.pathname === '/privacy-policy';
  const isTermsPage = location.pathname === '/terms-conditions';

  // Define the activeTab state and its setter function
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setActiveTab('');
    } else if (path === '/trending') {
      setActiveTab('Trending');
    } else if (path.startsWith('/state')) {
      setActiveTab('State');
    } else {
      setActiveTab(path.slice(1).charAt(0).toUpperCase() + path.slice(2));
    }
  }, [location]);

  return (
    <ThemeProvider theme={theme}>
      <Routes>
        {/* Journalist Routes */}
        <Route 
          path="/journalist/*" 
          element={
            <ProtectedRoute>
              <Routes>
                <Route path="/" element={<Navigate to="/journalist/home" replace />} />
                <Route path="/home" element={<JournalistHome />} />
                <Route path="/edit-post/:id" element={<EditPost />} />
                <Route path="/profile" element={<JournalistHome />} />
                <Route path="/standardPost" element={<JournalistHome />} />
                <Route path="/videoPost" element={<JournalistHome />} />
                <Route path="/posts" element={<JournalistHome />} />
                <Route path="/pendingApprovals" element={<JournalistHome />} />
                <Route path="/rejected" element={<JournalistHome />} />
              </Routes>
            </ProtectedRoute>
          } 
        />

        {/* Privacy Policy and Terms & Conditions Routes - Without Header and Footer */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsAndConditions />} />

        {/* Profile Route - Without Header and Footer */}
        <Route path="/profile" element={<Profile />} />
        
        {/* News Detail Route - Without Header and Footer */}
        <Route path="/news/:id" element={<NewsDetail />} />
        
        {/* Trending News Detail Route - Without Header and Footer */}
        <Route path="/trending/:id" element={<TrendingNewsDetails />} />
        
        {/* International News Detail Route - Without Header and Footer */}
        <Route path="/international/:id" element={<InternationalNewsDetails />} />
        
        {/* National News Detail Route - Without Header and Footer */}
        <Route path="/national/:id" element={<NationalNewsDetails />} />
        
        {/* State News Detail Route - Without Header and Footer */}
        <Route path="/state/:state/:id" element={<StateNewsDetails />} />
        
        {/* Entertainment News Detail Route - Without Header and Footer */}
        <Route path="/entertainment/:id" element={<EntertainmentNewsDetails />} />
        
        {/* Sports News Detail Route - Without Header and Footer */}
        <Route path="/sports/:id" element={<SportsNewsDetails />} />

        {/* User Routes */}
        <Route
          path="/*"
          element={
            <>
              {!isLoginPage && !isRegisterPage && !isJournalistPage && !isProfilePage && !isNewsDetailPage && !isTrendingDetailPage && !isInternationalDetailPage && !isNationalDetailPage && !isStateDetailPage && !isEntertainmentDetailPage && !isSportsDetailPage && !isPolicyPage && !isTermsPage && <Header />}
              <Box component="main" sx={{ flexGrow: 1 }}>
                <Routes>
                  <Route
                    path="/"
                    element={<HomeScreen />}
                  />
                  <Route path="/newsfeed" element={<NewsFeed />} />
                  <Route path="/trending" element={<TrendingNews />} />
                  <Route path="/national" element={<NationalNews />} />
                  <Route path="/international" element={<InternationalNews />} />
                  <Route path="/state" element={<StateNews />} />
                  <Route path="/state/:state" element={<StateNewsPage />} />
                  <Route path="/state/:state/:district" element={<StateNews />} />
                  <Route path="/sports" element={<Sports />} />
                  <Route path="/entertainment" element={<Entertainment />} />
                  <Route path="/user/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Routes>
              </Box>
              {!isLoginPage && !isRegisterPage && !isJournalistPage && !isProfilePage && !isNewsDetailPage && !isTrendingDetailPage && !isInternationalDetailPage && !isNationalDetailPage && !isStateDetailPage && !isEntertainmentDetailPage && !isSportsDetailPage && !isPolicyPage && !isTermsPage && <Footer />}
            </>
          }
        />

        {/* Protected Editor route */}
        <Route 
          path="/editor/*" 
          element={
            <ProtectedEditorRoute>
              <Routes>
                <Route path="/*" element={<EditorHome />} />
                <Route path="/edit/:newsId" element={<EditorEditScreen />} />
                <Route path="/re-edit/:newsId" element={<ReEditPost />} />
              </Routes>
            </ProtectedEditorRoute>
          } 
        />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
