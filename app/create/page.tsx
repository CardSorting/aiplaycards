'use client';

import React from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StyleIcon from '@mui/icons-material/Style';
import CasinoIcon from '@mui/icons-material/Casino';
import BrushIcon from '@mui/icons-material/Brush';

export default function CreateCardPage() {
  const router = useRouter();

  const cardTypes = [
    {
      id: 'monster',
      title: 'Monster Cards',
      description:
        'Create custom monster trading cards with professional templates and comprehensive customization options.',
      image: '/assets/preview/monster-preview.png', // You may need to add this image
      route: '/creator',
      features: [
        'AI-powered card generation',
        'Professional card template',
        'Custom creature design',
      ],
      color: '#3B82F6', // Blue
      icon: <AutoAwesomeIcon />,
      badge: 'Popular',
    },
    {
      id: 'duel',
      title: 'Duel Cards',
      description:
        'Design authentic duel cards with classic styling, multiple card types, and comprehensive customization options.',
      image: '/assets/preview/duel-preview.png', // You may need to add this image
      route: '/duel-creator',
      features: [
        'Authentic duel card styling',
        'Monster, Spell & Trap cards',
        'Effect and Normal monsters',
        'Custom artwork support',
        'Traditional card layouts',
      ],
      color: '#8B5CF6', // Purple
      icon: <StyleIcon />,
      badge: 'Classic',
    },
    {
      id: 'spell',
      title: 'Spell Cards',
      description:
        'Create professional spell cards with authentic frame designs, comprehensive mana system, and all card types.',
      image: '/assets/preview/spell-preview.png', // You may need to add this image
      route: '/spell-editor',
      features: [
        'Authentic spell card frames',
        'Complete mana cost system',
        'All card types supported',
        'Professional typography',
        'Real-time card preview',
      ],
      color: '#F59E0B', // Orange/Gold
      icon: <CasinoIcon />,
      badge: 'New',
    },
    {
      id: 'atc',
      title: 'Artist Trading Cards',
      description:
        'Create custom Artist Trading Cards with simple image uploads and clean 2.5x3.5 inch design format.',
      image: '/assets/preview/atc-preview.png', // You may need to add this image
      route: '/create/atc',
      features: [
        'Simple image upload',
        'Standard ATC 2.5x3.5 size',
        'Clean rounded corners',
        'Instant preview',
      ],
      color: '#10B981', // Emerald green
      icon: <BrushIcon />,
    },
  ];

  const handleCreateCard = (route: string) => {
    router.push(route);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box textAlign="center">
          <Typography
            variant="h3"
            fontWeight={700}
            gutterBottom
            sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}
          >
            ✨ Create Your Cards
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 500, mx: 'auto', fontSize: '1.1rem' }}
          >
            Choose your card creation experience with professional-quality
            templates and AI-powered tools.
          </Typography>
        </Box>

        {/* Card Type Selection */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {cardTypes.map(cardType => (
            <Grid item xs={12} sm={6} lg={3} key={cardType.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  border: '2px solid transparent',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 40px ${cardType.color}20`,
                    borderColor: cardType.color,
                  },
                }}
                onClick={() => handleCreateCard(cardType.route)}
              >
                {/* Badge */}
                {cardType.badge && (
                  <Chip
                    label={cardType.badge}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      backgroundColor: cardType.color,
                      color: 'white',
                      fontWeight: 600,
                      zIndex: 1,
                    }}
                  />
                )}

                {/* Header with Icon */}
                <Box
                  sx={{
                    background: `linear-gradient(135deg, ${cardType.color}12, ${cardType.color}05)`,
                    p: 2.5,
                    borderBottom: `1px solid ${cardType.color}15`,
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: '10px',
                        backgroundColor: cardType.color,
                        color: 'white',
                        fontSize: '20px',
                        flexShrink: 0,
                      }}
                    >
                      {cardType.icon}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{ fontSize: '1.1rem', lineHeight: 1.3 }}
                      >
                        {cardType.title}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, lineHeight: 1.5, fontSize: '0.9rem' }}
                  >
                    {cardType.description}
                  </Typography>

                  <Stack spacing={0.8}>
                    {cardType.features.slice(0, 3).map((feature, index) => (
                      <Stack
                        key={index}
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <Box
                          sx={{
                            width: 4,
                            height: 4,
                            borderRadius: '50%',
                            backgroundColor: cardType.color,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: '0.85rem' }}
                        >
                          {feature}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>

                <CardActions sx={{ p: 2.5, pt: 0 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="medium"
                    sx={{
                      backgroundColor: cardType.color,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '1rem',
                      py: 1.2,
                      '&:hover': {
                        backgroundColor: cardType.color,
                        filter: 'brightness(0.9)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                    onClick={() => handleCreateCard(cardType.route)}
                  >
                    Start Creating
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Additional Info */}
        <Paper
          sx={{ p: 3, mt: 3, bgcolor: 'background.paper', borderRadius: 2 }}
        >
          <Typography
            variant="h6"
            gutterBottom
            textAlign="center"
            sx={{ fontSize: '1.2rem' }}
          >
            🎯 Which Should You Choose?
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                gutterBottom
                sx={{ fontSize: '0.9rem' }}
              >
                Monster Cards
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: '0.85rem' }}
              >
                Creature-based gameplay, AI generation, professional templates.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                gutterBottom
                sx={{ fontSize: '0.9rem' }}
              >
                Duel Cards
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: '0.85rem' }}
              >
                Classic strategic design, spell/trap mechanics, authentic
                styling.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                gutterBottom
                sx={{ fontSize: '0.9rem' }}
              >
                Spell Cards
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: '0.85rem' }}
              >
                Complex gameplay, mana system, authentic spell card frames.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                gutterBottom
                sx={{ fontSize: '0.9rem' }}
              >
                Artist Trading Cards
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: '0.85rem' }}
              >
                Simple image upload, clean design, standard 2.5x3.5 size.
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Stack>
    </Container>
  );
}
