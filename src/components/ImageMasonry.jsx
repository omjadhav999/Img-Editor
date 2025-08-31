import React, { useState, useEffect } from 'react';  
import { Box, IconButton, Typography, CircularProgress } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  BrokenImage as BrokenImageIcon
} from '@mui/icons-material';
import Masonry from 'react-masonry-css';
import ImageEditor from './ImageEditor.jsx';
import { Drawer } from '@mui/material';

function ImageMasonry({ images, onUpdateImage, onDeleteImage }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [imageStatus, setImageStatus] = useState({});

  useEffect(() => {
    const newStatus = {};
    images.forEach(img => {
      newStatus[img.id] = { loaded: false, error: false };
    });
    setImageStatus(newStatus);
  }, [images]);

  const handleImageLoad = (id) => {
    setImageStatus(prev => ({
      ...prev,
      [id]: { ...prev[id], loaded: true }
    }));
  };

  const handleImageError = (id) => {
    setImageStatus(prev => ({
      ...prev,
      [id]: { ...prev[id], error: true }
    }));
  };

  const handleEditClick = (image) => {
    setSelectedImage(image);
    setIsEditorOpen(true);
  };

  const handleSaveEdit = (editedImage) => {
    if (selectedImage && selectedImage.src && selectedImage.src.startsWith('blob:')) {
      URL.revokeObjectURL(selectedImage.src);
    }
    
    onUpdateImage(editedImage.id, editedImage);
    setIsEditorOpen(false);
    setSelectedImage(null);
  };

  const handleCancelEdit = () => {
    setIsEditorOpen(false);
    setSelectedImage(null);
  };

  const handleDelete = (image) => {
    if (image.src && image.src.startsWith('blob:')) {
      URL.revokeObjectURL(image.src);
    }
    onDeleteImage(image.id);
  };

  const breakpointColumns = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  if (images.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="textSecondary">
          No images uploaded yet. Upload an image to get started!
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Masonry
        breakpointCols={breakpointColumns}
        className="masonry-grid"
        columnClassName="masonry-grid-column"
      >
        {images.map((image) => (
          <Box 
            key={image.id} 
            className="image-item" 
            sx={{ 
              position: 'relative', 
              margin: '0 0 16px 0',
              borderRadius: 1,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover .image-overlay': {
                opacity: 1
              }
            }}
          >
            <Box 
              sx={{ 
                position: 'relative',
                paddingTop: '75%',
                backgroundColor: 'rgba(0,0,0,0.05)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {!imageStatus[image.id]?.loaded && !imageStatus[image.id]?.error && (
                <CircularProgress 
                  size={40} 
                  sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)' 
                  }} 
                />
              )}
              
              {imageStatus[image.id]?.error ? (
                <Box sx={{ 
                  position: 'absolute', 
                  top: '0', 
                  left: '0', 
                  width: '100%', 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: 'error.main'
                }}>
                  <BrokenImageIcon sx={{ fontSize: 40 }} />
                  <Typography variant="caption">Image failed to load</Typography>
                </Box>
              ) : (
                <img 
                  src={image.src} 
                  alt={image.name || 'Uploaded image'} 
                  onLoad={() => handleImageLoad(image.id)}
                  onError={() => handleImageError(image.id)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: imageStatus[image.id]?.loaded ? 'block' : 'none'
                  }}
                />
              )}
            </Box>
            
            <Box 
              className="image-overlay"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'rgba(0,0,0,0.5)',
                opacity: 0,
                transition: 'opacity 0.3s ease'
              }}
            >
              <IconButton
                color="primary"
                onClick={() => handleEditClick(image)}
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.8)', m: 1 }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                color="error"
                onClick={() => handleDelete(image)}
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.8)', m: 1 }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Masonry>

      <Drawer
        anchor="right"
        open={isEditorOpen}
        onClose={handleCancelEdit}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: '70%', md: '50%' },
            maxWidth: '600px',
            p: 2
          }
        }}
      >
        {selectedImage && (
          <ImageEditor
            image={selectedImage}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
        )}
      </Drawer>

      <style jsx global>{`
        .masonry-grid {
          display: flex;
          width: 100%;
          margin-left: -16px;
        }
        .masonry-grid-column {
          padding-left: 16px;
          background-clip: padding-box;
        }
      `}</style>
    </>
  );
}

export default ImageMasonry;