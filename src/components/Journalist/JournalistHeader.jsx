import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import Logo from '../../assets/images/NewzTok logo-2.svg';
import AccountDropdown from './AccountDropdown';
import axios from 'axios';

const JournalistHeader = () => {
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Get the auth token from localStorage or sessionStorage
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      if (!token) {
        console.log('No authentication token found');
        setLoading(false);
        return;
      }

      // Configure axios headers with the token
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      // API Base URL
      const baseURL = 'https://api.newztok.in';

      try {
        const profileResponse = await axios.get(`${baseURL}/api/users/my-profile`, config);
        console.log('Profile response:', profileResponse.data);
        
        if (profileResponse.data) {
          const userData = profileResponse.data.data || profileResponse.data;
          if (userData && userData.username) {
            setUsername(userData.username);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        // Try to get the username from localStorage if API fails
        const storedUsername = localStorage.getItem('username') || sessionStorage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);
        }
      } finally {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error in fetchProfileData:', err);
      setLoading(false);
    }
  };

  const toggleAccountDropdown = () => {
    setAccountDropdownOpen(!accountDropdownOpen);
  };

  const handleBellClick = () => {
    alert('Notifications feature is coming soon! We are working on it.');
  };

  // Function to get the initial letter of the username
  const getInitial = () => {
    if (username && username.length > 0) {
      return username.charAt(0).toUpperCase();
    }
    return 'J'; // Default to 'J' for Journalist if no username is found
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', backgroundColor: '#1a1a1a', position: 'relative' }}>
      <img src={Logo} alt="NewzTok Logo" style={{ height: '70px' }} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <FaBell 
          color="#ccc" 
          size={20} 
          onClick={handleBellClick}
          style={{ cursor: 'pointer' }}
        />
        <div 
          onClick={toggleAccountDropdown}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#4f46e5',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {getInitial()}
        </div>
      </div>
      
      <AccountDropdown 
        isOpen={accountDropdownOpen} 
        onClose={() => setAccountDropdownOpen(false)}
      />
    </div>
  );
};

export default JournalistHeader; 