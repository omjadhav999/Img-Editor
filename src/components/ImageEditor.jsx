import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  Slider,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  RotateRight as RotateRightIcon,
  FlipOutlined,
  Flip,
  Upload as UploadIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  AspectRatio as AspectRatioIcon,
  CropFree as CropFreeIcon,
} from "@mui/icons-material";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/imageUtils";
import { useDropzone } from "react-dropzone";

function ImageEditor({ image, onSave, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isFlippedHorizontally, setIsFlippedHorizontally] = useState(false);
  const [isFlippedVertically, setIsFlippedVertically] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(image.src);
  const [isReplacing, setIsReplacing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedAspect, setSelectedAspect] = useState({ value: 4/3, label: "4:3" });
  const [isImageError, setIsImageError] = useState(false);
  
  const transformationRef = useRef({
    rotation,
    isFlippedHorizontally,
    isFlippedVertically
  });
  
  useEffect(() => {
    transformationRef.current = {
      rotation,
      isFlippedHorizontally,
      isFlippedVertically
    };
  }, [rotation, isFlippedHorizontally, isFlippedVertically]);

  useEffect(() => {
    setImageLoaded(false);
    setIsImageError(false);
    
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setIsImageError(true);
    img.src = currentSrc;
  }, [currentSrc]);

  const aspectRatios = [
    { value: 1, label: "1:1" },
    { value: 4/3, label: "4:3" },
    { value: 16/9, label: "16:9" },
    { value: 3/4, label: "3:4" },
    { value: 9/16, label: "9:16" },
    { value: 0, label: "Free" }
  ];

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleAspectRatioChange = (ratio) => {
    setSelectedAspect(ratio);
    setCrop({ x: 0, y: 0 });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      let resultSrc = currentSrc;

      if (croppedAreaPixels) {
        const { rotation: currentRotation, isFlippedHorizontally: currentFlipH, isFlippedVertically: currentFlipV } = transformationRef.current;
        
        resultSrc = await getCroppedImg(
          currentSrc,
          croppedAreaPixels,
          currentRotation,
          currentFlipH,
          currentFlipV
        );
      }

      if (!resultSrc) {
        throw new Error("Failed to process image");
      }

      onSave({
        ...image,
        src: resultSrc,
        edited: true,
      });
    } catch (e) {
      console.error("Error saving image:", e);
      alert("There was a problem saving your image. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRotate = () => {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  };

  const handleFlipHorizontal = () => {
    setIsFlippedHorizontally(prev => !prev);
  };

  const handleFlipVertical = () => {
    setIsFlippedVertically(prev => !prev);
  };

  const handleZoomIn = () => {
    setZoom((prevZoom) => Math.min(prevZoom + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom((prevZoom) => Math.max(prevZoom - 0.1, 1));
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();

      reader.onload = () => {
        if (currentSrc && currentSrc.startsWith('blob:')) {
          URL.revokeObjectURL(currentSrc);
        }
        
        setCurrentSrc(reader.result);
        setIsReplacing(false);
        resetEditorState();
      };

      reader.onerror = () => {
        alert("Error reading file. Please try another image.");
      };

      reader.readAsDataURL(file);
    }
  }, [currentSrc]);

  const resetEditorState = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setIsFlippedHorizontally(false);
    setIsFlippedVertically(false);
    setCroppedAreaPixels(null);
    setSelectedAspect({ value: 4/3, label: "4:3" });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    multiple: false,
  });

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Typography variant="h6" gutterBottom>
        Edit Image
      </Typography>

      {isReplacing ? (
        <Box
          {...getRootProps()}
          sx={{
            border: "2px dashed #cccccc",
            borderRadius: 2,
            p: 3,
            mb: 2,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            "&:hover": {
              borderColor: "primary.main",
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <input {...getInputProps()} />
          <UploadIcon sx={{ fontSize: 48, mb: 2 }} />
          <Typography>
            Drag & drop a new image here, or click to select
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            onClick={(e) => {
              e.stopPropagation();
              setIsReplacing(false);
            }}
            sx={{ mt: 2 }}
          >
            Cancel Replace
          </Button>
        </Box>
      ) : (
        <Box 
          sx={{ 
            position: "relative", 
            height: 400, 
            mb: 2, 
            bgcolor: "black",
            borderRadius: 1,
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          {!imageLoaded && !isImageError && (
            <CircularProgress sx={{ position: "absolute", zIndex: 1 }} />
          )}
          
          {isImageError ? (
            <Box sx={{ textAlign: "center", color: "error.main" }}>
              <Typography variant="body1">
                Error loading image. The image may be corrupted.
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => setIsReplacing(true)}
                sx={{ mt: 2 }}
              >
                Replace Image
              </Button>
            </Box>
          ) : (
            <Cropper
              image={currentSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={selectedAspect.value || null}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              objectFit="contain"
              showGrid={true}
              onMediaLoaded={() => setImageLoaded(true)}
              transforms={{
                rotateAngle: rotation,
                scaleX: isFlippedHorizontally ? -1 : 1,
                scaleY: isFlippedVertically ? -1 : 1
              }}
              style={{
                containerStyle: {
                  width: "100%",
                  height: "100%",
                  backgroundColor: "black",
                },
                cropAreaStyle: {
                  border: "2px solid #fff",
                },
                mediaStyle: {
                  transform: `scaleX(${isFlippedHorizontally ? -1 : 1}) scaleY(${isFlippedVertically ? -1 : 1})`,
                  transition: 'transform 0.2s ease'
                }
              }}
            />
          )}
        </Box>
      )}

      {!isReplacing && imageLoaded && !isImageError && (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography gutterBottom>Aspect Ratio</Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
              {aspectRatios.map((ratio) => (
                <Button
                  key={ratio.label}
                  variant={selectedAspect.label === ratio.label ? "contained" : "outlined"}
                  size="small"
                  onClick={() => handleAspectRatioChange(ratio)}
                  startIcon={ratio.value === 0 ? <CropFreeIcon /> : <AspectRatioIcon />}
                >
                  {ratio.label}
                </Button>
              ))}
            </Stack>
            
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography sx={{ mr: 2 }}>Zoom</Typography>
              <IconButton onClick={handleZoomOut} disabled={zoom <= 1}>
                <ZoomOutIcon />
              </IconButton>
              <Slider
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e, newZoom) => setZoom(newZoom)}
                sx={{ mx: 2, flexGrow: 1 }}
              />
              <IconButton onClick={handleZoomIn} disabled={zoom >= 3}>
                <ZoomInIcon />
              </IconButton>
            </Box>
          </Box>

          <Typography gutterBottom>Transformations</Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: "wrap" }}>
            <Tooltip title="Rotate 90° clockwise">
              <IconButton
                onClick={handleRotate}
                color="primary"
                sx={{ border: "1px solid", borderColor: "divider" }}
              >
                <RotateRightIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Flip horizontally">
              <IconButton
                onClick={handleFlipHorizontal}
                color={isFlippedHorizontally ? "secondary" : "primary"}
                sx={{ border: "1px solid", borderColor: "divider" }}
              >
                <FlipOutlined style={{ transform: "rotate(90deg)" }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Flip vertically">
              <IconButton
                onClick={handleFlipVertical}
                color={isFlippedVertically ? "secondary" : "primary"}
                sx={{ border: "1px solid", borderColor: "divider" }}
              >
                <Flip />
              </IconButton>
            </Tooltip>
            <Tooltip title="Replace image">
              <IconButton
                onClick={() => setIsReplacing(true)}
                color="primary"
                sx={{ border: "1px solid", borderColor: "divider" }}
              >
                <UploadIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </>
      )}

      <Stack direction="row" spacing={2} sx={{ mt: "auto" }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={isReplacing || isSaving || isImageError || !imageLoaded}
          sx={{ flexGrow: 1 }}
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
        <Button
          variant="outlined"
          startIcon={<CancelIcon />}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </Stack>
    </Box>
  );
}

export default ImageEditor;