export const getCroppedImg = async (
  imageSrc,
  pixelCrop,
  rotation = 0,
  flipHorizontal = false,
  flipVertical = false
) => {
  try {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      console.error("Canvas 2D context not available");
      return null;
    }

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.translate(safeArea / 2, safeArea / 2);
    
    ctx.rotate((rotation * Math.PI) / 180);
    
    ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
    
    ctx.translate(-image.width / 2, -image.height / 2);

    ctx.drawImage(image, 0, 0);
    
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const cropCanvas = document.createElement("canvas");
    const cropCtx = cropCanvas.getContext("2d");

    if (!cropCtx) {
      console.error("Crop canvas 2D context not available");
      return null;
    }

    cropCanvas.width = pixelCrop.width;
    cropCanvas.height = pixelCrop.height;

    const cropX = safeArea / 2 - (image.width / 2) + pixelCrop.x;
    const cropY = safeArea / 2 - (image.height / 2) + pixelCrop.y;

    cropCtx.drawImage(
      canvas,
      cropX,
      cropY,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      cropCanvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          
          try {
            const croppedImageUrl = URL.createObjectURL(blob);
            resolve(croppedImageUrl);
          } catch (e) {
            reject(new Error("Failed to create object URL"));
          }
        },
        "image/jpeg",
        0.95 
      );
    });
  } catch (e) {
    console.error("Error in image cropping:", e);
    return null;
  }
};

const createImage = (url) =>
  new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error("Image URL is empty"));
      return;
    }
    
    const image = new Image();
    
    image.addEventListener("load", () => resolve(image));

    image.addEventListener("error", (error) => {
      console.error("Error loading image:", error);
      reject(error);
    });
    
    image.setAttribute("crossOrigin", "anonymous");
    
    image.src = url;
    
    if (image.complete) {
      resolve(image);
    }
  });