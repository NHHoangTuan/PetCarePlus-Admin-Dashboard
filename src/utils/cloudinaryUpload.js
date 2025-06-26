// src/utils/cloudinaryUpload.js

// Cloudinary configuration
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/dbiadwo3j/image/upload`;
const CLOUDINARY_UPLOAD_PRESET = "PetCarePlus"; // Unsigned preset

// Function to compress image before upload
export const compressImage = (
  file,
  maxWidth = 800,
  maxHeight = 600,
  quality = 0.8
) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          // Create new file from compressed blob
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        file.type,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

// Function to compress specifically for service icons (small size)
export const compressServiceIcon = (file) => {
  return compressImage(file, 200, 200, 0.9); // 200x200px, high quality
};

export const uploadToCloudinary = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "petcare/services"); // Optional: organize uploads in folders

    // formData.append("quality", "auto:good"); // Auto quality optimization
    // formData.append("fetch_format", "auto"); // Auto format (WebP if supported)

    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// New function: Compress then upload
export const compressAndUpload = async (file, compressionOptions = {}) => {
  try {
    const {
      maxWidth = 800,
      maxHeight = 600,
      quality = 0.8,
      forServiceIcon = false,
    } = compressionOptions;

    // Step 1: Compress image
    let compressedFile;
    if (forServiceIcon) {
      compressedFile = await compressServiceIcon(file);
    } else {
      compressedFile = await compressImage(file, maxWidth, maxHeight, quality);
    }

    console.log(`Original size: ${(file.size / 1024).toFixed(2)} KB`);
    console.log(
      `Compressed size: ${(compressedFile.size / 1024).toFixed(2)} KB`
    );
    console.log(
      `Compression ratio: ${(
        (1 - compressedFile.size / file.size) *
        100
      ).toFixed(1)}%`
    );

    // Step 2: Upload compressed file
    return await uploadToCloudinary(compressedFile);
  } catch (error) {
    console.error("Error in compress and upload:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Validate file before upload
export const validateImageFile = (file) => {
  const validTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Please select a valid image file (JPEG, PNG, GIF, or WebP)",
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "File size must be less than 5MB",
    };
  }

  return { isValid: true };
};

// Advanced compression with different quality levels
export const compressWithQuality = async (file, qualityLevel = "medium") => {
  const qualitySettings = {
    low: { maxWidth: 400, maxHeight: 300, quality: 0.6 },
    medium: { maxWidth: 800, maxHeight: 600, quality: 0.8 },
    high: { maxWidth: 1200, maxHeight: 900, quality: 0.9 },
    icon: { maxWidth: 200, maxHeight: 200, quality: 0.9 },
  };

  const settings = qualitySettings[qualityLevel] || qualitySettings.medium;
  return await compressImage(
    file,
    settings.maxWidth,
    settings.maxHeight,
    settings.quality
  );
};
