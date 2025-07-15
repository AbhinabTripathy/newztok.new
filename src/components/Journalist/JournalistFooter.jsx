import React from 'react';
import { Link } from 'react-router-dom';

const JournalistFooter = () => {
  return (
    <div style={{ 
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      height: '40px'
    }}>
      {/* Left part - dark background */}
      <div style={{ 
        width: '250px',
        backgroundColor: '#1e2029', 
        padding: '8px 16px',
        color: '#6c757d',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        height: '100%'
      }}>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Collapsed View
        </span>
      </div>
      
      {/* Right part - light background */}
      <div style={{ 
        flex: 1,
        backgroundColor: '#fff', 
        padding: '8px 16px',
        color: '#6c757d',
        fontSize: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid #e9ecef',
        height: '100%'
      }}>
        <div style={{ width: '100px' }}></div>
        <div>
          Built @ Boldtribe | 2025 © <Link to="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>Newztok</Link>
        </div>
        <div style={{ width: '100px', textAlign: 'right' }}>
          v1.14.0
        </div>
      </div>
    </div>
  );
};

export default JournalistFooter; 