import { useCallback, useState } from 'react';

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = useCallback(
    async (imageData: string, cardName = 'untitled'): Promise<UploadResult> => {
      if (!imageData) {
        return { success: false, error: 'No image data provided' };
      }

      try {
        setIsUploading(true);

        const formData = new FormData();
        formData.append('imageData', imageData);
        formData.append('cardName', cardName);
        formData.append('imageType', 'mtg-card');

        const response = await fetch('/api/upload/mtg-image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to upload image');
        }

        const result = await response.json();

        return {
          success: true,
          url: result.imageUrl,
        };
      } catch (error) {
        console.error('Image upload error:', error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Unknown upload error',
        };
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  return {
    uploadImage,
    isUploading,
  };
}
