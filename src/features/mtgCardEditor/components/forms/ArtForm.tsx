'use client';

import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormHelperText,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useMTGCard } from '../../contexts/MTGCardContext';
import { useImageUpload } from '../../hooks/useImageUpload';

export function ArtForm() {
  const { state, updateCard } = useMTGCard();
  const { card } = state;
  const { uploadImage, isUploading } = useImageUpload();
  const [imagePreview, setImagePreview] = useState<string | null>(
    card.imageUrl || null,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async e => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setUploadError(null);

        try {
          // Upload to Backblaze
          const uploadResult = await uploadImage(
            result,
            card.name || 'untitled',
          );

          if (uploadResult.success && uploadResult.url) {
            // Update card with the Backblaze URL, not the data URL
            updateCard({ imageUrl: uploadResult.url });
          } else {
            setUploadError(uploadResult.error || 'Failed to upload image');
            // Fallback to data URL for preview
            updateCard({ imageUrl: result });
          }
        } catch (error) {
          console.error('Upload error:', error);
          setUploadError('Failed to upload image to cloud storage');
          // Fallback to data URL for preview
          updateCard({ imageUrl: result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url: string) => {
    updateCard({ imageUrl: url });
    setImagePreview(url);
    setUploadError(null);
  };

  const removeImage = () => {
    setImagePreview(null);
    updateCard({ imageUrl: undefined });
    setUploadError(null);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Image URL"
          value={card.imageUrl || ''}
          onChange={e => handleImageUrlChange(e.target.value)}
          placeholder="https://example.com/card-art.jpg"
          helperText="Enter a URL to an image file, or upload an image below"
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom>
          Upload Image
        </Typography>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="image-upload"
          type="file"
          onChange={handleImageUpload}
          disabled={isUploading}
        />
        <label htmlFor="image-upload">
          <Button
            variant="outlined"
            component="span"
            startIcon={
              isUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />
            }
            fullWidth
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Choose Image File'}
          </Button>
        </label>
        <FormHelperText>
          Accepted formats: JPG, PNG, GIF. Recommended size: 626x457 pixels
          {isUploading && (
            <Box component="span" sx={{ color: 'primary.main', ml: 1 }}>
              • Uploading to cloud storage...
            </Box>
          )}
        </FormHelperText>

        {uploadError && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            {uploadError} - Image will be stored temporarily for preview.
          </Alert>
        )}
      </Grid>

      {imagePreview && (
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Image Preview
          </Typography>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Box
              component="img"
              src={imagePreview}
              alt="Card artwork preview"
              sx={{
                maxWidth: '100%',
                maxHeight: 300,
                objectFit: 'contain',
                border: '1px solid #ddd',
                borderRadius: 1,
              }}
            />
            <Box sx={{ mt: 2 }}>
              <Button
                variant="text"
                color="secondary"
                onClick={removeImage}
                size="small"
              >
                Remove Image
              </Button>
            </Box>
          </Paper>
        </Grid>
      )}

      <Grid item xs={12}>
        <Typography variant="body2" color="text.secondary">
          <strong>Artwork Guidelines:</strong>
          <br />
          • Use high-resolution images for best quality
          <br />
          • Artwork should fit a 626x457 pixel frame
          <br />
          • Consider the card frame when choosing art positioning
          <br />• Ensure you have rights to use the artwork
        </Typography>
      </Grid>
    </Grid>
  );
}
