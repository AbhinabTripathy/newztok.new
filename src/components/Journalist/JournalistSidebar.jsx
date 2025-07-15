import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { BsClockHistory } from 'react-icons/bs';
import { BsJournalX } from 'react-icons/bs';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { MdOutlinePostAdd } from 'react-icons/md';
import { FiPieChart } from 'react-icons/fi';
import { FiFolder } from 'react-icons/fi';
import { IoIosArrowDown, IoIosArrowForward } from 'react-icons/io';
import { CgFileDocument } from 'react-icons/cg';
import { FaVideo } from 'react-icons/fa';

const JournalistSidebar = ({ onSectionChange, activeSection }) => {
  const [showAddPostsSubmenu, setShowAddPostsSubmenu] = useState(false);
  const [activeItem, setActiveItem] = useState(activeSection || 'overview');

  // Update activeItem when activeSection prop changes
  useEffect(() => {
    if (activeSection) {
      setActiveItem(activeSection);
      if (activeSection === 'standardPost' || activeSection === 'videoPost') {
        setShowAddPostsSubmenu(true);
      }
    }
  }, [activeSection]);

  const handleItemClick = (item) => {
    setActiveItem(item);
    if (item === 'addPosts') {
      setShowAddPostsSubmenu(!showAddPostsSubmenu);
    } else {
      setShowAddPostsSubmenu(false);
      if (onSectionChange) {
        onSectionChange(item);
      }
    }
  };

  return (
    <div style={{ height: '100vh', backgroundColor: '#1e2029', padding: '20px 0', width: '250px' }}>
      {/* Overview Section */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '10px 24px', 
          marginBottom: '30px',
          backgroundColor: activeItem === 'overview' ? '#2a2b30' : 'transparent',
          color: '#fff',
          cursor: 'pointer'
        }}
        onClick={() => handleItemClick('overview')}
      >
        <FiPieChart size={24} color="#fff" style={{ marginRight: '12px' }} />
        <span style={{ color: '#fff', fontSize: '18px', fontWeight: '500' }}>Overview</span>
      </div>

      {/* MANAGE SUBMISSIONS Section */}
      <div style={{ marginTop: '20px' }}>
        <div style={{ padding: '10px 24px', color: '#6b7280', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
          MANAGE SUBMISSIONS
        </div>
        
        <div style={{ marginTop: '10px' }}>
          {/* Add Posts with dropdown arrow */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '12px 24px', 
              color: showAddPostsSubmenu || activeItem === 'addPosts' ? '#fff' : '#9ca3af', 
              backgroundColor: showAddPostsSubmenu || activeItem === 'addPosts' ? '#2a2b30' : 'transparent',
              cursor: 'pointer' 
            }}
            onClick={() => handleItemClick('addPosts')}
          >
            <span style={{ width: '24px', fontSize: '16px', marginRight: '12px', display: 'flex', alignItems: 'center' }}>
              {showAddPostsSubmenu ? <IoIosArrowDown size={16} /> : <IoIosArrowForward size={16} />}
            </span>
            <FiFolder size={20} style={{ marginRight: '12px' }} />
            <span>Add Posts</span>
          </div>

          {/* Submenu for Add Posts */}
          {showAddPostsSubmenu && (
            <div style={{ backgroundColor: '#1e2029' }}>
              {/* Standard Post */}
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '12px 24px', 
                  color: activeItem === 'standardPost' ? '#fff' : '#9ca3af', 
                  backgroundColor: activeItem === 'standardPost' ? '#2a2b30' : 'transparent',
                  cursor: 'pointer', 
                  marginLeft: '48px' 
                }}
                onClick={() => handleItemClick('standardPost')}
              >
                <CgFileDocument size={18} style={{ marginRight: '12px' }} />
                <span>Standard Post</span>
              </div>

              {/* Video Post */}
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '12px 24px', 
                  color: activeItem === 'videoPost' ? '#fff' : '#9ca3af', 
                  backgroundColor: activeItem === 'videoPost' ? '#2a2b30' : 'transparent',
                  cursor: 'pointer', 
                  marginLeft: '48px' 
                }}
                onClick={() => handleItemClick('videoPost')}
              >
                <FaVideo size={18} style={{ marginRight: '12px' }} />
                <span>Video Post</span>
              </div>
            </div>
          )}

          {/* Posts */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '12px 24px', 
              color: activeItem === 'posts' ? '#fff' : '#9ca3af',
              backgroundColor: activeItem === 'posts' ? '#2a2b30' : 'transparent',
              cursor: 'pointer', 
              marginLeft: '24px' 
            }}
            onClick={() => handleItemClick('posts')}
          >
            <IoDocumentTextOutline size={20} style={{ marginRight: '12px' }} />
            <span>Posts</span>
          </div>

          {/* Pending Approvals */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '12px 24px', 
              color: activeItem === 'pendingApprovals' ? '#fff' : '#9ca3af',
              backgroundColor: activeItem === 'pendingApprovals' ? '#2a2b30' : 'transparent',
              cursor: 'pointer', 
              marginLeft: '24px' 
            }}
            onClick={() => handleItemClick('pendingApprovals')}
          >
            <BsClockHistory size={20} style={{ marginRight: '12px' }} />
            <span>Pending Approvals</span>
          </div>

          {/* Rejected */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '12px 24px', 
              color: activeItem === 'rejected' ? '#fff' : '#9ca3af',
              backgroundColor: activeItem === 'rejected' ? '#2a2b30' : 'transparent',
              cursor: 'pointer', 
              marginLeft: '24px' 
            }}
            onClick={() => handleItemClick('rejected')}
          >
            <BsJournalX size={20} style={{ marginRight: '12px' }} />
            <span>Rejected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalistSidebar; 