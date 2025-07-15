import React from 'react';

const MenuItem = ({ icon, text, onClick }) => (
  <div
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      padding: '12px 16px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      color: '#374151'
    }}
    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
  >
    <div style={{ marginRight: '12px', color: '#6b7280' }}>{icon}</div>
    <div>{text}</div>
  </div>
);

export default MenuItem; 