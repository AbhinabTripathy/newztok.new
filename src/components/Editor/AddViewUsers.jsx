import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';
import axios from 'axios';

const AddViewUsers = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'journalist',
    phoneNumber: '',
    profilePicture: null,
    assignedState: 'बिहार | Bihar',
    assignedDistrict: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [availableDistricts, setAvailableDistricts] = useState([]);

  // Role options
  const roleOptions = [
    { value: 'journalist', label: 'Journalist' }
  ];

  // API Base URL
  const baseURL = 'https://api.newztok.in';
  console.log('Base URL is set to:', baseURL);

  // State options as shown in the image
  const stateOptions = [
    'बिहार | Bihar',
    'उत्तर प्रदेश | Uttar Pradesh',
    'झारखंड | Jharkhand'
  ];

  // District data for each state
  const districtData = {
    jharkhand: [
      { hindi: "रांची", english: "Ranchi" },
      { hindi: "जमशेदपुर", english: "Jamshedpur" },
      { hindi: "धनबाद", english: "Dhanbad" },
      { hindi: "बोकारो", english: "Bokaro" },
      { hindi: "देवघर", english: "Deoghar" },
      { hindi: "हजारीबाग", english: "Hazaribagh" },
      { hindi: "गिरिडीह", english: "Giridih" },
      { hindi: "कोडरमा", english: "Koderma" },
      { hindi: "चतरा", english: "Chatra" },
      { hindi: "गुमला", english: "Gumla" },
      { hindi: "लातेहार", english: "Latehar" },
      { hindi: "लोहरदगा", english: "Lohardaga" },
      { hindi: "पाकुड़", english: "Pakur" },
      { hindi: "पलामू", english: "Palamu" },
      { hindi: "रामगढ़", english: "Ramgarh" },
      { hindi: "साहिबगंज", english: "Sahibganj" },
      { hindi: "सिमडेगा", english: "Simdega" },
      { hindi: "सिंहभूम", english: "Singhbhum" },
      { hindi: "सरायकेला खरसावां", english: "Seraikela Kharsawan" },
      { hindi: "पूर्वी सिंहभूम", english: "East Singhbhum" },
      { hindi: "पश्चिमी सिंहभूम", english: "West Singhbhum" }
    ],
    bihar: [
      { hindi: "पटना", english: "Patna" },
      { hindi: "गया", english: "Gaya" },
      { hindi: "मुंगेर", english: "Munger" },
      { hindi: "भागलपुर", english: "Bhagalpur" },
      { hindi: "पूर्णिया", english: "Purnia" },
      { hindi: "दरभंगा", english: "Darbhanga" },
      { hindi: "मुजफ्फरपुर", english: "Muzaffarpur" },
      { hindi: "सहरसा", english: "Saharsa" },
      { hindi: "सीतामढ़ी", english: "Sitamarhi" },
      { hindi: "वैशाली", english: "Vaishali" },
      { hindi: "सिवान", english: "Siwan" },
      { hindi: "सारण", english: "Saran" },
      { hindi: "गोपालगंज", english: "Gopalganj" },
      { hindi: "बेगूसराय", english: "Begusarai" },
      { hindi: "समस्तीपुर", english: "Samastipur" },
      { hindi: "मधुबनी", english: "Madhubani" },
      { hindi: "सुपौल", english: "Supaul" },
      { hindi: "अररिया", english: "Araria" },
      { hindi: "किशनगंज", english: "Kishanganj" },
      { hindi: "कटिहार", english: "Katihar" },
      { hindi: "पूर्वी चंपारण", english: "East Champaran" },
      { hindi: "पश्चिमी चंपारण", english: "West Champaran" },
      { hindi: "शिवहर", english: "Sheohar" },
      { hindi: "मधेपुरा", english: "Madhepura" }
    ],
    "uttar pradesh": [
      { hindi: "लखनऊ", english: "Lucknow" },
      { hindi: "कानपुर", english: "Kanpur" },
      { hindi: "आगरा", english: "Agra" },
      { hindi: "वाराणसी", english: "Varanasi" },
      { hindi: "प्रयागराज", english: "Prayagraj" },
      { hindi: "मेरठ", english: "Meerut" },
      { hindi: "नोएडा", english: "Noida" },
      { hindi: "गाजियाबाद", english: "Ghaziabad" },
      { hindi: "बरेली", english: "Bareilly" },
      { hindi: "अलीगढ़", english: "Aligarh" },
      { hindi: "मुरादाबाद", english: "Moradabad" },
      { hindi: "सहारनपुर", english: "Saharanpur" },
      { hindi: "गोरखपुर", english: "Gorakhpur" },
      { hindi: "फैजाबाद", english: "Faizabad" },
      { hindi: "जौनपुर", english: "Jaunpur" },
      { hindi: "मथुरा", english: "Mathura" },
      { hindi: "बलिया", english: "Ballia" },
      { hindi: "रायबरेली", english: "Rae Bareli" },
      { hindi: "सुल्तानपुर", english: "Sultanpur" },
      { hindi: "फतेहपुर", english: "Fatehpur" },
      { hindi: "प्रतापगढ़", english: "Pratapgarh" },
      { hindi: "कौशाम्बी", english: "Kaushambi" },
      { hindi: "झांसी", english: "Jhansi" },
      { hindi: "ललितपुर", english: "Lalitpur" }
    ]
  };

  // Update available districts when state changes
  useEffect(() => {
    // Debug: Check if there are any references to the old endpoint
    console.log('%c Checking for deprecated URLs', 'background: orange; color: white; padding: 2px 5px;');
    console.log('Current endpoint being used:', `${baseURL}/api/auth/create-journalist`);
    
    // Force clean any cached axios configs
    axios.defaults.baseURL = baseURL;
    
    const updateDistricts = () => {
      const stateName = formData.assignedState.toLowerCase();
      let stateKey = "";
      
      if (stateName.includes("बिहार") || stateName.includes("bihar")) {
        stateKey = "bihar";
      } else if (stateName.includes("उत्तर प्रदेश") || stateName.includes("uttar pradesh")) {
        stateKey = "uttar pradesh";
      } else if (stateName.includes("झारखंड") || stateName.includes("jharkhand")) {
        stateKey = "jharkhand";
      }
      
      setAvailableDistricts(districtData[stateKey] || []);
      // Reset district selection when state changes
      setFormData(prev => ({ ...prev, assignedDistrict: '' }));
    };
    
    updateDistricts();
  }, [formData.assignedState]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        profilePicture: e.target.files[0]
      });
    }
  };

  // Function to compress image
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimensions
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round(height * MAX_WIDTH / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round(width * MAX_HEIGHT / height);
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            // Convert to file
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: new Date().getTime()
            });
            resolve(compressedFile);
          }, 'image/jpeg', 0.7); // 70% quality
        };
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate form
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      
      // Get the auth token
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      // Create FormData object for file upload
      const formDataToSend = new FormData();
      
      // Add fields with the exact names requested by the user
      formDataToSend.append('username', formData.username);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('confirmPassword', formData.confirmPassword);
      formDataToSend.append('role', 'journalist');
      
      if (formData.phoneNumber) {
        formDataToSend.append('mobile', formData.phoneNumber);
      }
      
      // Extract state and district based on format
      const stateInfo = formData.assignedState.split('|');
      const districtInfo = formData.assignedDistrict.split('|');
      
      // Get the English versions of state and district (after the | character)
      const state = stateInfo.length > 1 ? stateInfo[1].trim() : formData.assignedState.trim();
      const district = districtInfo.length > 1 ? districtInfo[1].trim() : formData.assignedDistrict.trim();
      
      formDataToSend.append('assignedState', state);
      
      if (district) {
        formDataToSend.append('assignedDistrict', district);
      }
      
      // Process profile picture - compress if exists
      if (formData.profilePicture) {
        try {
          console.log('Compressing profile picture...');
          const compressedImage = await compressImage(formData.profilePicture);
          console.log(`Original size: ${Math.round(formData.profilePicture.size / 1024)}KB, Compressed: ${Math.round(compressedImage.size / 1024)}KB`);
          formDataToSend.append('profilePicture', compressedImage);
        } catch (imgError) {
          console.error('Error compressing image:', imgError);
          // Skip image if compression fails
        }
      }
      
      // Log all fields being sent for debugging
      console.log('Sending data with these fields:', Array.from(formDataToSend.keys()));
      
      // HARDCODED URL to avoid any chance of using the wrong endpoint
      const API_URL = 'https://api.newztok.in/api/auth/create-journalist';
      
      // Simplest possible configuration
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      console.log('Making API request to:', API_URL);
      
      // Make the API call directly with the hardcoded URL
      const response = await axios.post(API_URL, formDataToSend, config);
      
      console.log('Response status:', response.status);
      console.log('API response:', response.data);
      
      if (response.status >= 200 && response.status < 300) {
        console.log('User created successfully!');
        setSuccess('Journalist created successfully!');
        
        // Reset form on success
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'journalist',
          phoneNumber: '',
          profilePicture: null,
          assignedState: 'बिहार | Bihar',
          assignedDistrict: ''
        });
      } else {
        throw new Error(`API returned status ${response.status}`);
      }
    } catch (error) {
      console.error('Error creating journalist:', error);
      
      if (error.response) {
        console.error('Error response:', error.response);
        const errorMessage = error.response.data?.message || 
                            error.response.data?.error || 
                            `Server returned ${error.response.status}`;
        setError(`Error: ${errorMessage}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        setError('No response received from server. Check your internet connection.');
      } else {
        console.error('Error message:', error.message);
        setError(error.message || 'Unknown error occurred');
      }
      
      // Local storage fallback
      try {
        console.log('Storing data locally as fallback...');
        const userId = `user_${Date.now()}`;
        
        // Extract state and district
        const stateInfo = formData.assignedState.split('|');
        const districtInfo = formData.assignedDistrict.split('|');
        const state = stateInfo.length > 1 ? stateInfo[1].trim() : formData.assignedState.trim();
        const district = districtInfo.length > 1 ? districtInfo[1].trim() : formData.assignedDistrict.trim();
        
        // Store in localStorage (without sensitive data)
        const localUsers = JSON.parse(localStorage.getItem('localJournalists') || '[]');
        localUsers.push({
          id: userId,
          username: formData.username,
          email: formData.email,
          role: 'journalist',
          phoneNumber: formData.phoneNumber,
          state,
          district,
          createdAt: new Date().toISOString()
        });
        
        localStorage.setItem('localJournalists', JSON.stringify(localUsers));
        console.log('User stored locally:', userId);
        setSuccess('User stored locally as fallback!');
        
        // Reset form
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'journalist',
          phoneNumber: '',
          profilePicture: null,
          assignedState: 'बिहार | Bihar',
          assignedDistrict: ''
        });
      } catch (localError) {
        console.error('Failed to store locally:', localError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToProfile = () => {
    navigate('/editor/users');
  };

  // Format district for display
  const formatDistrict = (district) => {
    return `${district.hindi} | ${district.english}`;
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f9fafb' 
    }}>
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto' 
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#111827', 
          marginBottom: '12px' 
        }}>
          Create User
        </h1>
        <p style={{ 
          fontSize: '14px', 
          color: '#4b5563', 
          marginBottom: '20px' 
        }}>
          Create a new user by filling out the form below.
        </p>

        <button
          onClick={handleBackToProfile}
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: '6px', 
            border: 'none', 
            fontSize: '14px', 
            fontWeight: '500', 
            cursor: 'pointer', 
            marginBottom: '24px' 
          }}
        >
          Back to Profile
        </button>

        {error && (
          <div style={{ 
            backgroundColor: '#fee2e2', 
            color: '#b91c1c', 
            padding: '10px', 
            borderRadius: '6px', 
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ 
            backgroundColor: '#d1fae5', 
            color: '#047857', 
            padding: '10px', 
            borderRadius: '6px', 
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '16px', 
            marginBottom: '20px' 
          }}>
            {/* Username */}
            <div>
              <label 
                htmlFor="username"
                style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '500', 
                  color: '#111827',
                  fontSize: '14px'
                }}
              >
                Username:
              </label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Please enter your username"
                value={formData.username}
                onChange={handleInputChange}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  fontSize: '14px' 
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label 
                htmlFor="email"
                style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '500', 
                  color: '#111827',
                  fontSize: '14px'
                }}
              >
                Email:
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  fontSize: '14px' 
                }}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label 
                htmlFor="password"
                style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '500', 
                  color: '#111827',
                  fontSize: '14px'
                }}
              >
                Password:
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  fontSize: '14px' 
                }}
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label 
                htmlFor="confirmPassword"
                style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '500', 
                  color: '#111827',
                  fontSize: '14px'
                }}
              >
                Confirm Password:
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  fontSize: '14px' 
                }}
                required
              />
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '16px', 
            marginBottom: '20px' 
          }}>
            {/* Role */}
            <div>
              <label 
                htmlFor="role"
                style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '500', 
                  color: '#111827',
                  fontSize: '14px'
                }}
              >
                Role:
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '6px', 
                    fontSize: '14px',
                    appearance: 'none',
                    backgroundColor: '#fff'
                  }}
                >
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <FiChevronDown 
                  style={{ 
                    position: 'absolute', 
                    right: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    pointerEvents: 'none',
                    color: '#6b7280',
                    fontSize: '14px'
                  }} 
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label 
                htmlFor="phoneNumber"
                style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '500', 
                  color: '#111827',
                  fontSize: '14px'
                }}
              >
                Phone Number:
              </label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                placeholder="Enter your phone number"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  fontSize: '14px' 
                }}
              />
            </div>

            {/* Profile Picture */}
            <div>
              <label 
                htmlFor="profilePicture"
                style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '500', 
                  color: '#111827',
                  fontSize: '14px'
                }}
              >
                Profile Picture:
              </label>
              <div style={{ 
                display: 'flex', 
                width: '100%' 
              }}>
                <label 
                  htmlFor="profilePictureInput"
                  style={{ 
                    backgroundColor: '#f3f4f6', 
                    padding: '8px 12px', 
                    border: '1px solid #d1d5db', 
                    borderRight: 'none', 
                    borderRadius: '6px 0 0 6px', 
                    fontSize: '14px',
                    cursor: 'pointer' 
                  }}
                >
                  Choose File
                </label>
                <span 
                  style={{ 
                    flex: 1, 
                    padding: '8px 12px', 
                    border: '1px solid #d1d5db', 
                    borderLeft: 'none', 
                    borderRadius: '0 6px 6px 0', 
                    fontSize: '14px', 
                    color: '#6b7280' 
                  }}
                >
                  {formData.profilePicture ? formData.profilePicture.name : 'no file selected'}
                </span>
                <input
                  type="file"
                  id="profilePictureInput"
                  name="profilePicture"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '16px', 
            marginBottom: '24px' 
          }}>
            {/* Assigned State */}
            <div>
              <label 
                htmlFor="assignedState"
                style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '500', 
                  color: '#111827',
                  fontSize: '14px'
                }}
              >
                Assigned State:
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  id="assignedState"
                  name="assignedState"
                  value={formData.assignedState}
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '6px', 
                    fontSize: '14px',
                    appearance: 'none',
                    backgroundColor: '#fff'
                  }}
                >
                  {stateOptions.map((state, index) => (
                    <option key={index} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                <FiChevronDown 
                  style={{ 
                    position: 'absolute', 
                    right: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    pointerEvents: 'none',
                    color: '#6b7280',
                    fontSize: '14px'
                  }} 
                />
              </div>
            </div>

            {/* Assigned District */}
            <div>
              <label 
                htmlFor="assignedDistrict"
                style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '500', 
                  color: '#111827',
                  fontSize: '14px'
                }}
              >
                Assigned District:
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  id="assignedDistrict"
                  name="assignedDistrict"
                  value={formData.assignedDistrict}
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '6px', 
                    fontSize: '14px',
                    appearance: 'none',
                    backgroundColor: '#fff'
                  }}
                >
                  <option value="">Select District</option>
                  {availableDistricts.map((district, index) => (
                    <option key={index} value={formatDistrict(district)}>
                      {formatDistrict(district)}
                    </option>
                  ))}
                </select>
                <FiChevronDown 
                  style={{ 
                    position: 'absolute', 
                    right: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    pointerEvents: 'none',
                    color: '#6b7280',
                    fontSize: '14px'
                  }} 
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ 
              backgroundColor: loading ? '#93c5fd' : '#3b82f6', 
              color: 'white', 
              padding: '8px 16px', 
              borderRadius: '6px', 
              border: 'none', 
              fontSize: '14px', 
              fontWeight: '500', 
              cursor: loading ? 'not-allowed' : 'pointer' 
            }}
          >
            {loading ? 'Creating User...' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddViewUsers; 