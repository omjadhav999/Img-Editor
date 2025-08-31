import { useState, useCallback } from 'react';
import { getCroppedImg } from '../utils/imageUtils';

export default function useImageEditor(initialImage) {
  const [image, setImage] = useState(initialImage);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isFlippedHorizontally, setIsFlippedHorizontally] = useState(false);
  const [isFlippedVertically, setIsFlippedVertically] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const rotateImage = useCallback(() => {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  }, []);

  const flipHorizontally = useCallback(() => {
    setIsFlippedHorizontally((prev) => !prev);
  }, []);

  const flipVertically = useCallback(() => {
    setIsFlippedVertically((prev) => !prev);
  }, []);

  const replaceImage = useCallback((newImageSrc) => {
    setImage((prevImage) => ({
      ...prevImage,
      src: newImageSrc,
    }));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setIsFlippedHorizontally(false);
    setIsFlippedVertically(false);
    setCroppedAreaPixels(null);
  }, []);

  const saveEditedImage = useCallback(async () => {
    try {
      if (!croppedAreaPixels) {
        return image;
      }

      const croppedImageUrl = await getCroppedImg(
        image.src,
        croppedAreaPixels,
        rotation,
        isFlippedHorizontally,
        isFlippedVertically
      );

      return {
        ...image,
        src: croppedImageUrl,
        edited: true,
      };
    } catch (e) {
      console.error('Error saving image:', e);
      return image;
    }
  }, [
    image,
    croppedAreaPixels,
    rotation,
    isFlippedHorizontally,
    isFlippedVertically,
  ]);

  return {
    image,
    crop,
    zoom,
    rotation,
    isFlippedHorizontally,
    isFlippedVertically,
    setCrop,
    setZoom,
    onCropComplete,
    rotateImage,
    flipHorizontally,
    flipVertically,
    replaceImage,
    saveEditedImage,
  };
}