import React, { useCallback, useState } from 'react';
import { Box, Button, Typography, Drawer } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import ImageEditor from './ImageEditor.jsx';

function ImageUpload({ onAddImage }) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      
      reader.onload = () => {
        const imageDataUrl = reader.result;
        setCurrentImage({
          id: uuidv4(),
          src: imageDataUrl,
          name: file.name,
          originalFile: file,
        });
        setIsEditorOpen(true);
      };
      
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: false
  });

  const handleSaveEdit = (editedImage) => {
    onAddImage(editedImage);
    setIsEditorOpen(false);
    setCurrentImage(null);
  };

  const handleCancelEdit = () => {
    setIsEditorOpen(false);
    setCurrentImage(null);
  };

  return (
    <>
      <Box
        {...getRootProps()}
        className="dropzone"
        sx={{
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          p: 3
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Drag & drop your image here
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          or click to select your image
        </Typography>
        <Button variant="contained" color="primary" sx={{ mt: 2 }}>
          Upload Image
        </Button>
      </Box>

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
        {currentImage && (
          <ImageEditor
            image={currentImage}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
        )}
      </Drawer>
    </>
  );
}

export default ImageUpload;