'use client';

import { FC, useCallback, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Typography,
  styled,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import ImageIcon from '@mui/icons-material/Image';

interface ATCPreviewProps {
  imageUrl: string | null;
}

// ATC standard size is 2.5" x 3.5"
// Using a scale where 1 inch = 96px for web display
const ATC_WIDTH = 240; // 2.5 * 96
const ATC_HEIGHT = 336; // 3.5 * 96

const CardContainer = styled(Box)(({ theme }) => ({
  width: ATC_WIDTH,
  height: ATC_HEIGHT,
  borderRadius: theme.spacing(1.5),
  overflow: 'hidden',
  backgroundColor: '#ffffff',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)',
  border: 'none',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const PreviewImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
});

const PlaceholderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: theme.palette.grey[400],
  backgroundColor: theme.palette.grey[50],
}));

const PlaceholderIcon = styled(ImageIcon)(({ theme }) => ({
  fontSize: 48,
  marginBottom: theme.spacing(1),
  color: theme.palette.grey[300],
}));

const ATCPreview: FC<ATCPreviewProps> = ({ imageUrl }) => {
  const { data: session } = useSession();
  const user = session?.user;
  const [isSaving, setIsSaving] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [snackSeverity, setSnackSeverity] = useState<'success' | 'error'>(
    'success',
  );

  const uploadImageToBackblaze = useCallback(
    async (imageData: string): Promise<string | null> => {
      if (!imageData) return null;

      const formData = new FormData();
      formData.append('imageData', imageData);
      formData.append('cardName', `ATC-${Date.now()}`);
      formData.append('imageType', 'atc');

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload ATC image');
      }

      const result = await response.json();
      return result.imageUrl;
    },
    [],
  );

  const saveATC = useCallback(async () => {
    if (!user) {
      setSnackMessage('Please log in to save your ATC card');
      setSnackSeverity('error');
      setSnackOpen(true);
      return;
    }

    if (!imageUrl) {
      setSnackMessage('Please upload an image first');
      setSnackSeverity('error');
      setSnackOpen(true);
      return;
    }

    setIsSaving(true);
    try {
      // Upload image to Backblaze
      const uploadedImageUrl = await uploadImageToBackblaze(imageUrl);
      if (!uploadedImageUrl) {
        throw new Error('Failed to upload image');
      }

      // Save ATC to special collection
      const response = await fetch('/api/special-collection/atc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: uploadedImageUrl,
          cardName: `ATC Card ${new Date().toLocaleDateString()}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save ATC card');
      }

      await response.json();
      setSnackMessage('ATC card saved to your collection!');
      setSnackSeverity('success');
      setSnackOpen(true);
    } catch (error) {
      console.error('ATC save error:', error);
      setSnackMessage(
        error instanceof Error ? error.message : 'Failed to save ATC card',
      );
      setSnackSeverity('error');
      setSnackOpen(true);
    } finally {
      setIsSaving(false);
    }
  }, [user, imageUrl, uploadImageToBackblaze]);

  const handleSnackClose = useCallback(() => {
    setSnackOpen(false);
  }, []);

  return (
    <>
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        <CardContainer>
          {imageUrl ? (
            <PreviewImage src={imageUrl} alt="ATC Preview" />
          ) : (
            <PlaceholderContainer>
              <PlaceholderIcon />
              <Typography
                variant="caption"
                color="text.secondary"
                textAlign="center"
              >
                Upload an image to preview your Artist Trading Card
              </Typography>
            </PlaceholderContainer>
          )}
        </CardContainer>

        <Typography variant="caption" color="text.secondary" textAlign="center">
          Standard ATC Size: 2.5&quot; × 3.5&quot;
        </Typography>

        {imageUrl && (
          <Button
            variant="contained"
            startIcon={
              isSaving ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            onClick={saveATC}
            disabled={isSaving || !user}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5,
            }}
          >
            {!user
              ? 'Login to Save'
              : isSaving
              ? 'Saving...'
              : 'Save to Collection'}
          </Button>
        )}
      </Box>

      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={handleSnackClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackClose}
          severity={snackSeverity}
          sx={{ width: '100%' }}
        >
          {snackMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ATCPreview;
