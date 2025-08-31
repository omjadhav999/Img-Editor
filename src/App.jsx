import React, { useState } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import AppLayout from './components/AppLayout.jsx';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  const [images, setImages] = useState([]);

  const addImage = (newImage) => {
    setImages((prevImages) => [...prevImages, newImage]);
  };

  const updateImage = (id, updatedImage) => {
    setImages((prevImages) =>
      prevImages.map((image) => (image.id === id ? { ...image, ...updatedImage } : image))
    );
  };

  const deleteImage = (id) => {
    setImages((prevImages) => prevImages.filter((image) => image.id !== id));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppLayout
        images={images}
        onAddImage={addImage}
        onUpdateImage={updateImage}
        onDeleteImage={deleteImage}
      />
    </ThemeProvider>
  );
}

export default App;

