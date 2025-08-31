import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import ImageUpload from './ImageUpload.jsx';
import ImageMasonry from './ImageMasonry.jsx';

function AppLayout({ images, onAddImage, onUpdateImage, onDeleteImage }) {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Manipulate your images here!
        </Typography>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <ImageUpload onAddImage={onAddImage} />
        </Paper>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Image Gallery
          </Typography>
          <ImageMasonry
            images={images}
            onUpdateImage={onUpdateImage}
            onDeleteImage={onDeleteImage}
          />
        </Box>
      </Box>
    </Container>
  );
}

export default AppLayout;