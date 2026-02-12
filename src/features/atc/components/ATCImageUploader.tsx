'use client';

import { FC, useCallback } from 'react';
import { Box, Button, Typography, alpha, styled } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';

interface ATCImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
}

const DropzoneContainer = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.grey[300]}`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  minHeight: '400px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    transform: 'translateY(-2px)',
  },
  '&.active': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}));

const UploadIcon = styled(CloudUploadIcon)(({ theme }) => ({
  fontSize: 64,
  color: theme.palette.grey[400],
  marginBottom: theme.spacing(2),
}));

const ATCImageUploader: FC<ATCImageUploaderProps> = ({ onImageUpload }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          const result = e.target?.result as string;
          onImageUpload(result);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    multiple: false,
  });

  return (
    <DropzoneContainer
      {...getRootProps()}
      className={isDragActive ? 'active' : ''}
    >
      <input {...getInputProps()} />

      <UploadIcon />

      <Typography variant="h6" gutterBottom fontWeight={600}>
        {isDragActive ? 'Drop your image here' : 'Upload Your Artwork'}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 3, maxWidth: 300 }}
      >
        Drag and drop an image file, or click to browse and select from your
        computer
      </Typography>

      <Button
        variant="contained"
        startIcon={<ImageIcon />}
        size="large"
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 600,
          px: 4,
          py: 1.5,
        }}
      >
        Choose Image
      </Button>

      <Box mt={3}>
        <Typography variant="caption" color="text.secondary">
          Supported formats: JPG, PNG, GIF, WebP
        </Typography>
      </Box>
    </DropzoneContainer>
  );
};

export default ATCImageUploader;
