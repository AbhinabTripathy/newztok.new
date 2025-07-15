import React, { useState, useEffect } from 'react';

const VideoPostScreen = ({ initialData, onSave, isEditing }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    state: '',
    district: '',
    youtubeUrl: '',
    video: '',
    thumbnailUrl: '',
    tags: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        category: initialData.category || '',
        state: initialData.state || '',
        district: initialData.district || '',
        youtubeUrl: initialData.youtubeUrl || '',
        video: initialData.video || '',
        thumbnailUrl: initialData.thumbnailUrl || '',
        tags: initialData.tags || []
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          Title
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              marginTop: '4px'
            }}
            required
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          Content
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              minHeight: '200px',
              marginTop: '4px'
            }}
            required
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          Category
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              marginTop: '4px'
            }}
            required
          />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          State
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              marginTop: '4px'
            }}
            required
          />
        </label>

        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          District
          <input
            type="text"
            name="district"
            value={formData.district}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              marginTop: '4px'
            }}
            required
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          YouTube URL
          <input
            type="url"
            name="youtubeUrl"
            value={formData.youtubeUrl}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              marginTop: '4px'
            }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          Video URL
          <input
            type="url"
            name="video"
            value={formData.video}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              marginTop: '4px'
            }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          Thumbnail URL
          <input
            type="url"
            name="thumbnailUrl"
            value={formData.thumbnailUrl}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              marginTop: '4px'
            }}
          />
        </label>
      </div>

      <button
        type="submit"
        style={{
          backgroundColor: '#4f46e5',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: '500'
        }}
      >
        {isEditing ? 'Update Post' : 'Create Post'}
      </button>
    </form>
  );
};

export default VideoPostScreen; 