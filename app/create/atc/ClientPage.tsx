'use client';

import { FC, useState } from 'react';
import { Box, Container, Grid, Paper, Typography, styled } from '@mui/material';
import { SEO } from '@layout';
import { siteDescription } from 'src/constants';
import ATCImageUploader from '@features/atc/components/ATCImageUploader';
import ATCPreview from '@features/atc/components/ATCPreview';

const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const EditorSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '600px',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#fafafa',
  border: '1px solid #e0e0e0',
}));

const PreviewSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '600px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f5f5f5',
  border: '1px solid #e0e0e0',
}));

const ATCCreatorClient: FC = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
  };

  return (
    <>
      <SEO
        title="ATC Creator - Artist Trading Cards"
        description={`${siteDescription} - Create custom Artist Trading Cards with simple image uploads.`}
      />
      <StyledContainer maxWidth="xl">
        <Box mb={4}>
          <Typography
            variant="h3"
            component="h1"
            textAlign="center"
            fontWeight={700}
            gutterBottom
          >
            Artist Trading Cards Creator
          </Typography>
          <Typography
            variant="h6"
            component="h2"
            textAlign="center"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            Upload your artwork and create professional 2.5x3.5 inch Artist
            Trading Cards
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <EditorSection elevation={2}>
              <Typography
                variant="h5"
                component="h3"
                gutterBottom
                fontWeight={600}
              >
                Upload Your Artwork
              </Typography>
              <ATCImageUploader onImageUpload={handleImageUpload} />
            </EditorSection>
          </Grid>

          <Grid item xs={12} md={6}>
            <PreviewSection elevation={2}>
              <Typography
                variant="h5"
                component="h3"
                gutterBottom
                fontWeight={600}
              >
                Card Preview
              </Typography>
              <ATCPreview imageUrl={uploadedImage} />
            </PreviewSection>
          </Grid>
        </Grid>
      </StyledContainer>
    </>
  );
};

export default ATCCreatorClient;
