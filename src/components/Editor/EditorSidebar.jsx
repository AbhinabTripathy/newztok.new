import React, { useState } from 'react';
import { 
  FaHome, 
  FaChevronRight, 
  FaRegClock, 
  FaRegTimesCircle, 
  FaRegFileAlt, 
  FaVideo,
  FaUsers,
  FaUserPlus
} from 'react-icons/fa';
import { GoFileDirectory } from 'react-icons/go';
import { useNavigate } from 'react-router-dom';

const EditorSidebar = ({ onSectionChange, activeSection }) => {
  const [addPostsExpanded, setAddPostsExpanded] = useState(
    activeSection === 'standardPost' || activeSection === 'videoPost'
  );
  const navigate = useNavigate();
  
  const toggleAddPosts = () => {
    setAddPostsExpanded(!addPostsExpanded);
  };

  const handleSectionClick = (section) => {
    onSectionChange(section);
    navigate(`/editor/${section}`);
  };

  return (
    <div style={{ 
      padding: '20px 0', 
      height: '100%',
      overflowY: 'auto',
      scrollbarWidth: 'thin',
      scrollbarColor: '#4a4a4a #1e2029',
      '&::-webkit-scrollbar': {
        width: '8px'
      },
      '&::-webkit-scrollbar-track': {
        background: '#1e2029'
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#4a4a4a',
        borderRadius: '4px'
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: '#555'
      }
    }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100%',
        color: '#ccc',
      }}>
        {/* Overview */}
        <div 
          onClick={() => handleSectionClick('overview')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '12px 20px', 
            cursor: 'pointer',
            backgroundColor: activeSection === 'overview' ? '#2a2a2a' : 'transparent',
            transition: 'background-color 0.3s'
          }}
          onMouseEnter={(e) => {
            if (activeSection !== 'overview') {
              e.currentTarget.style.backgroundColor = '#2a2a2a';
            }
          }}
          onMouseLeave={(e) => {
            if (activeSection !== 'overview') {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <div style={{ marginRight: '12px' }}>
            <FaHome size={20} />
          </div>
          <div style={{ fontWeight: 'bold' }}>Overview</div>
        </div>
        
        {/* MANAGE SUBMISSIONS Section */}
        <div style={{ 
          padding: '20px 20px 10px 20px', 
          color: '#6c757d',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          MANAGE SUBMISSIONS
        </div>
        
        {/* Add Posts with dropdown */}
        <div>
          <div 
            onClick={toggleAddPosts}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '12px 20px', 
              cursor: 'pointer',
              backgroundColor: (addPostsExpanded || activeSection === 'standardPost' || activeSection === 'videoPost') ? '#2a2a2a' : 'transparent',
              transition: 'background-color 0.3s'
            }}
            onMouseEnter={(e) => {
              if (!addPostsExpanded && activeSection !== 'standardPost' && activeSection !== 'videoPost') {
                e.currentTarget.style.backgroundColor = '#2a2a2a';
              }
            }}
            onMouseLeave={(e) => {
              if (!addPostsExpanded && activeSection !== 'standardPost' && activeSection !== 'videoPost') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <div style={{ marginRight: '12px', transform: addPostsExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
              <FaChevronRight size={15} />
            </div>
            <div style={{ marginRight: '12px' }}>
              <GoFileDirectory size={20} />
            </div>
            <div>Add Posts</div>
          </div>
          
          {/* Dropdown items */}
          {addPostsExpanded && (
            <>
              <div 
                onClick={() => handleSectionClick('standardPost')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '10px 20px 10px 58px', 
                  cursor: 'pointer',
                  backgroundColor: activeSection === 'standardPost' ? '#2a2a2a' : 'transparent',
                  transition: 'background-color 0.3s'
                }}
                onMouseEnter={(e) => {
                  if (activeSection !== 'standardPost') {
                    e.currentTarget.style.backgroundColor = '#2a2a2a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== 'standardPost') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div>Standard Post</div>
              </div>
              
              <div 
                onClick={() => handleSectionClick('videoPost')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '10px 20px 10px 58px', 
                  cursor: 'pointer',
                  backgroundColor: activeSection === 'videoPost' ? '#2a2a2a' : 'transparent',
                  transition: 'background-color 0.3s'
                }}
                onMouseEnter={(e) => {
                  if (activeSection !== 'videoPost') {
                    e.currentTarget.style.backgroundColor = '#2a2a2a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== 'videoPost') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div>Video Post</div>
              </div>
            </>
          )}
        </div>
        
        {/* Posts */}
        <div 
          onClick={() => handleSectionClick('posts')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '12px 20px', 
            cursor: 'pointer',
            backgroundColor: activeSection === 'posts' ? '#2a2a2a' : 'transparent',
            transition: 'background-color 0.3s'
          }}
          onMouseEnter={(e) => {
            if (activeSection !== 'posts') {
              e.currentTarget.style.backgroundColor = '#2a2a2a';
            }
          }}
          onMouseLeave={(e) => {
            if (activeSection !== 'posts') {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <div style={{ marginRight: '12px' }}>
            <FaRegFileAlt size={20} />
          </div>
          <div>Posts</div>
        </div>
        
        {/* Pending Approvals */}
        <div 
          onClick={() => handleSectionClick('pendingApprovals')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '12px 20px', 
            cursor: 'pointer',
            backgroundColor: activeSection === 'pendingApprovals' ? '#2a2a2a' : 'transparent',
            transition: 'background-color 0.3s'
          }}
          onMouseEnter={(e) => {
            if (activeSection !== 'pendingApprovals') {
              e.currentTarget.style.backgroundColor = '#2a2a2a';
            }
          }}
          onMouseLeave={(e) => {
            if (activeSection !== 'pendingApprovals') {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <div style={{ marginRight: '12px' }}>
            <FaRegClock size={20} />
          </div>
          <div>Pending Approvals</div>
        </div>
        
        {/* Rejected */}
        <div 
          onClick={() => handleSectionClick('rejected')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '12px 20px', 
            cursor: 'pointer',
            backgroundColor: activeSection === 'rejected' ? '#2a2a2a' : 'transparent',
            transition: 'background-color 0.3s'
          }}
          onMouseEnter={(e) => {
            if (activeSection !== 'rejected') {
              e.currentTarget.style.backgroundColor = '#2a2a2a';
            }
          }}
          onMouseLeave={(e) => {
            if (activeSection !== 'rejected') {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <div style={{ marginRight: '12px' }}>
            <FaRegTimesCircle size={20} />
          </div>
          <div>Rejected</div>
        </div>
        
        {/* MANAGE USERS Section */}
        <div style={{ 
          padding: '20px 20px 10px 20px', 
          color: '#6c757d',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          MANAGE USERS
        </div>
        
        {/* Users */}
        <div 
          onClick={() => handleSectionClick('users')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '12px 20px', 
            cursor: 'pointer',
            backgroundColor: activeSection === 'users' ? '#2a2a2a' : 'transparent',
            transition: 'background-color 0.3s'
          }}
          onMouseEnter={(e) => {
            if (activeSection !== 'users') {
              e.currentTarget.style.backgroundColor = '#2a2a2a';
            }
          }}
          onMouseLeave={(e) => {
            if (activeSection !== 'users') {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <div style={{ marginRight: '12px' }}>
            <FaUsers size={20} />
          </div>
          <div>Users</div>
        </div>
        
        {/* Add/View Users */}
        <div 
          onClick={() => handleSectionClick('addViewUsers')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '12px 20px', 
            cursor: 'pointer',
            backgroundColor: activeSection === 'addViewUsers' ? '#2a2a2a' : 'transparent',
            transition: 'background-color 0.3s'
          }}
          onMouseEnter={(e) => {
            if (activeSection !== 'addViewUsers') {
              e.currentTarget.style.backgroundColor = '#2a2a2a';
            }
          }}
          onMouseLeave={(e) => {
            if (activeSection !== 'addViewUsers') {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <div style={{ marginRight: '12px' }}>
            <FaUserPlus size={20} />
          </div>
          <div>Add/View Users</div>
        </div>
      </div>
    </div>
  );
};

export default EditorSidebar; 