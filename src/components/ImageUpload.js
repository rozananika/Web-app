import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Typography,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { fileUpload } from '../services/api';

const ImageUpload = ({ type, initialImage, onImageUpload }) => {
  const [image, setImage] = useState(initialImage);
  const [loading, setLoading] = useState(false);

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setLoading(true);
    try {
      const response = await fileUpload.uploadImage(file, type);
      const imagePath = response.data;
      setImage(imagePath);
      onImageUpload(imagePath);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    onImageUpload(null);
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      {image ? (
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={image}
            alt="Uploaded"
            style={{
              maxWidth: '100%',
              maxHeight: 300,
              objectFit: 'contain',
            }}
          />
          <IconButton
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(255, 255, 255, 0.8)',
            }}
            onClick={handleRemoveImage}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ) : (
        <Box
          sx={{
            border: '2px dashed #ccc',
            borderRadius: 2,
            p: 3,
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
            },
          }}
          component="label"
        >
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageChange}
          />
          {loading ? (
            <CircularProgress />
          ) : (
            <>
              <UploadIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Click or drag to upload image
              </Typography>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ImageUpload;
