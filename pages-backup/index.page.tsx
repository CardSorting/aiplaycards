import { FC, useEffect, useState } from 'react';
import { SEO } from '@layout';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Fade,
  Grid,
  Slide,
  Stack,
  Typography,
  alpha,
  useScrollTrigger,
  useTheme,
} from '@mui/material';
import {
  ArrowForward,
  AutoAwesome,
  Check,
  CloudUpload,
  EmojiEvents,
  Group,
  Layers,
  Palette,
  PhoneIphone,
  PlayArrow,
  Share,
  Speed,
  Star,
} from '@mui/icons-material';
import Image from 'next/image';
import NextLink from 'next/link';
import Routes from '@routes';
import { useType } from '@cardEditor/cardOptions/type';
import banner from '@assets/images/banner.png';
import cardImgPaths from '@utils/cardImgPaths';
import { keyframes, styled } from '@mui/material/styles';

// Modern animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const parallaxFloat = keyframes`
  0%, 100% { transform: translateY(0px) translateX(0px); }
  25% { transform: translateY(-15px) translateX(5px); }
  50% { transform: translateY(-10px) translateX(-3px); }
  75% { transform: translateY(-20px) translateX(8px); }
`;

const morphGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(0, 122, 255, 0.3), 0 0 40px rgba(0, 122, 255, 0.1);
    border-radius: 20px;
  }
  50% { 
    box-shadow: 0 0 30px rgba(0, 122, 255, 0.4), 0 0 60px rgba(0, 122, 255, 0.2);
    border-radius: 24px;
  }
`;

const heroParticles = keyframes`
  0% { 
    transform: translateY(0px) rotate(0deg) scale(1);
    opacity: 0.7;
  }
  33% { 
    transform: translateY(-20px) rotate(120deg) scale(1.1);
    opacity: 1;
  }
  66% { 
    transform: translateY(-10px) rotate(240deg) scale(0.9);
    opacity: 0.8;
  }
  100% { 
    transform: translateY(0px) rotate(360deg) scale(1);
    opacity: 0.7;
  }
`;

const gradientShift = keyframes`
  0%, 100% { 
    background-position: 0% 50%;
  }
  50% { 
    background-position: 100% 50%;
  }
`;

const textGlow = keyframes`
  0%, 100% { 
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
  }
  50% { 
    text-shadow: 0 0 30px rgba(255, 255, 255, 0.8), 0 0 40px rgba(0, 122, 255, 0.3);
  }
`;

// Premium Hero Section
const HeroSection = styled(Box)(({ theme }) => ({
  background: `
    linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%),
    linear-gradient(45deg, rgba(0, 122, 255, 0.1) 0%, rgba(0, 122, 255, 0.05) 100%)
  `,
  backgroundSize: '400% 400%, 100% 100%',
  animation: `${gradientShift} 15s ease infinite`,
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(0, 122, 255, 0.1) 0%, transparent 50%)
    `,
    zIndex: 0,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="1.5"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    zIndex: 0,
  },
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background:
    theme.custom?.apple?.surfaces?.glass || 'rgba(255, 255, 255, 0.85)',
  backdropFilter: theme.custom?.apple?.blur?.glass || 'blur(20px)',
  border: '1px solid rgba(0, 0, 0, 0.06)',
  borderRadius: 20,
  transition: `all 0.4s ${
    theme.custom?.apple?.motion?.smooth || 'cubic-bezier(0.4, 0, 0.2, 1)'
  }`,
  cursor: 'pointer',
  boxShadow:
    theme.custom?.apple?.shadows?.card ||
    '0 2px 16px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background:
      'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
    transition: `left 0.8s ${
      theme.custom?.apple?.motion?.smooth || 'cubic-bezier(0.4, 0, 0.2, 1)'
    }`,
  },
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow:
      theme.custom?.apple?.shadows?.hard ||
      '0 12px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
    background:
      theme.custom?.apple?.surfaces?.elevated || 'rgba(255, 255, 255, 0.95)',
    '&::before': {
      left: '100%',
    },
  },
  '&:active': {
    transform: 'translateY(-4px) scale(1.01)',
    transition: `all 0.15s ${
      theme.custom?.apple?.motion?.quick ||
      'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }`,
  },
}));

const StatsCard = styled(Box)(({ theme }) => ({
  background:
    theme.custom?.apple?.surfaces?.glass || 'rgba(255, 255, 255, 0.85)',
  backdropFilter: theme.custom?.apple?.blur?.glass || 'blur(20px)',
  border: '1px solid rgba(0, 0, 0, 0.06)',
  borderRadius: 20,
  padding: theme.spacing(4),
  textAlign: 'center',
  transition: `all 0.4s ${
    theme.custom?.apple?.motion?.smooth || 'cubic-bezier(0.4, 0, 0.2, 1)'
  }`,
  boxShadow:
    theme.custom?.apple?.shadows?.card ||
    '0 2px 16px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}, transparent)`,
    opacity: 0,
    transition: `opacity 0.4s ${
      theme.custom?.apple?.motion?.smooth || 'cubic-bezier(0.4, 0, 0.2, 1)'
    }`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '0',
    height: '0',
    background: `radial-gradient(circle, ${alpha(
      theme.palette.primary.main,
      0.1,
    )}, transparent)`,
    transform: 'translate(-50%, -50%)',
    transition: `all 0.6s ${
      theme.custom?.apple?.motion?.smooth || 'cubic-bezier(0.4, 0, 0.2, 1)'
    }`,
    borderRadius: '50%',
    zIndex: 0,
  },
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow:
      theme.custom?.apple?.shadows?.hard ||
      '0 15px 45px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)',
    background:
      theme.custom?.apple?.surfaces?.elevated || 'rgba(255, 255, 255, 0.95)',
    animation: `${morphGlow} 2s ease-in-out infinite`,
    '&::before': {
      opacity: 1,
    },
    '&::after': {
      width: '200%',
      height: '200%',
    },
  },
  '& > *': {
    position: 'relative',
    zIndex: 1,
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
  border: 0,
  borderRadius: 50, // Apple's pill-shaped buttons
  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.25)}`,
  color: 'white',
  height: 56,
  padding: '0 32px',
  fontSize: '1.1rem',
  fontWeight: 600,
  textTransform: 'none',
  position: 'relative',
  overflow: 'hidden',
  transition: `all 0.3s ${
    theme.custom?.apple?.motion?.smooth || 'cubic-bezier(0.4, 0, 0.2, 1)'
  }`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background:
      'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: `left 0.6s ${
      theme.custom?.apple?.motion?.smooth || 'cubic-bezier(0.4, 0, 0.2, 1)'
    }`,
  },
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
    transform: 'translateY(-2px) scale(1.02)',
    boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.35)}`,
    '&::before': {
      left: '100%',
    },
  },
  '&:active': {
    transform: 'translateY(-1px) scale(1.01)',
    transition: `all 0.1s ${
      theme.custom?.apple?.motion?.quick ||
      'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }`,
  },
}));

const AnimatedChip = styled(Chip)(({ theme }) => ({
  background: alpha(theme.palette.primary.main, 0.08),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
  color: theme.palette.primary.main,
  fontWeight: 600,
  borderRadius: 50,
  backdropFilter: theme.custom?.apple?.blur?.subtle || 'blur(10px)',
  animation: `${float} 4s ease-in-out infinite`,
  boxShadow:
    theme.custom?.apple?.shadows?.soft ||
    '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.08)',
  transition: `all 0.3s ${
    theme.custom?.apple?.motion?.smooth || 'cubic-bezier(0.4, 0, 0.2, 1)'
  }`,
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.12),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
    transform: 'scale(1.05)',
    boxShadow:
      theme.custom?.apple?.shadows?.medium ||
      '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.12)',
  },
}));

const ShimmerBox = styled(Box)(() => ({
  background:
    'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)',
  backgroundSize: '200px 100%',
  animation: `${shimmer} 2s infinite`,
}));

const ProcessStep = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: theme.spacing(3),
  position: 'relative',
  background:
    theme.custom?.apple?.surfaces?.glass || 'rgba(255, 255, 255, 0.85)',
  borderRadius: 24,
  border: '1px solid rgba(0, 0, 0, 0.06)',
  boxShadow:
    theme.custom?.apple?.shadows?.soft ||
    '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.08)',
  transition: `all 0.3s ${
    theme.custom?.apple?.motion?.smooth || 'cubic-bezier(0.4, 0, 0.2, 1)'
  }`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow:
      theme.custom?.apple?.shadows?.medium ||
      '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.12)',
    background:
      theme.custom?.apple?.surfaces?.elevated || 'rgba(255, 255, 255, 0.95)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    right: '-25%',
    top: '50%',
    width: '50%',
    height: '2px',
    background: `linear-gradient(90deg, ${alpha(
      theme.palette.primary.main,
      0.6,
    )}, transparent)`,
    transform: 'translateY(-50%)',
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
  '&:last-child::after': {
    display: 'none',
  },
  // Mobile-first responsive design
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    borderRadius: 20,
    '&:not(:last-child)': {
      marginBottom: theme.spacing(2),
    },
  },
}));

const Home: FC = () => {
  const theme = useTheme();
  const { pokemonTypes } = useType();
  const [animationTrigger, setAnimationTrigger] = useState(false);

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  useEffect(() => {
    setAnimationTrigger(true);
  }, []);

  const features = [
    {
      icon: <AutoAwesome sx={{ fontSize: 40 }} />,
      title: 'AI-Powered Creation',
      description:
        'Generate complete Pokémon cards instantly with advanced AI. Just upload an image and name your Pokémon.',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: 'Lightning Fast',
      description:
        'Create professional cards in seconds, not hours. Streamlined workflow for maximum efficiency.',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      icon: <Palette sx={{ fontSize: 40 }} />,
      title: 'Studio Quality',
      description:
        'Professional templates with authentic Sword & Shield styling. Export in high resolution.',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      icon: <PhoneIphone sx={{ fontSize: 40 }} />,
      title: 'Mobile Optimized',
      description:
        'Perfect experience on any device. Create and share cards on the go with native mobile features.',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
  ];

  const stats = [
    {
      number: cardImgPaths.length.toLocaleString(),
      label: 'Card Templates',
      icon: <Layers />,
    },
    {
      number: pokemonTypes.length.toString(),
      label: 'Pokémon Types',
      icon: <Star />,
    },
    { number: '100K+', label: 'Cards Created', icon: <Group /> },
    { number: '4.9★', label: 'User Rating', icon: <EmojiEvents /> },
  ];

  const process = [
    {
      step: '01',
      title: 'Upload Image',
      description: 'Drop your Pokémon artwork or photo',
      icon: <CloudUpload sx={{ fontSize: 30 }} />,
    },
    {
      step: '02',
      title: 'AI Generation',
      description: 'AI creates authentic stats and moves',
      icon: <AutoAwesome sx={{ fontSize: 30 }} />,
    },
    {
      step: '03',
      title: 'Customize',
      description: 'Fine-tune details to perfection',
      icon: <Palette sx={{ fontSize: 30 }} />,
    },
    {
      step: '04',
      title: 'Export & Share',
      description: 'Download HD card or share instantly',
      icon: <Share sx={{ fontSize: 30 }} />,
    },
  ];

  return (
    <>
      <SEO
        fullTitle="PlayMoreTCG.com | AI-Powered Pokémon Card Creator"
        description="Create stunning custom Pokémon cards in seconds with AI. Professional templates, authentic styling, and instant generation. Try the future of card creation."
      />
      {/* Hero Section */}
      <HeroSection>
        {/* Advanced Floating Particles */}
        {[...Array(12)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              top: `${15 + Math.random() * 70}%`,
              left: `${5 + Math.random() * 90}%`,
              width: `${20 + Math.random() * 40}px`,
              height: `${20 + Math.random() * 40}px`,
              background: `rgba(255, 255, 255, ${0.05 + Math.random() * 0.1})`,
              borderRadius: Math.random() > 0.5 ? '50%' : '20%',
              animation: `${heroParticles} ${
                8 + Math.random() * 8
              }s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              zIndex: 1,
              backdropFilter: 'blur(1px)',
            }}
          />
        ))}

        {/* Premium Gradient Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(ellipse at center top, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              linear-gradient(180deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.1) 100%)
            `,
            zIndex: 1,
          }}
        />

        {/* Cinematic Light Rays */}
        <Box
          sx={{
            position: 'absolute',
            top: '-50%',
            left: '30%',
            width: '200px',
            height: '200%',
            background:
              'linear-gradient(0deg, transparent 0%, rgba(255, 255, 255, 0.03) 20%, rgba(255, 255, 255, 0.06) 50%, rgba(255, 255, 255, 0.03) 80%, transparent 100%)',
            transform: 'rotate(15deg)',
            animation: `${parallaxFloat} 20s ease-in-out infinite`,
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '-50%',
            right: '25%',
            width: '150px',
            height: '200%',
            background:
              'linear-gradient(0deg, transparent 0%, rgba(255, 255, 255, 0.02) 30%, rgba(255, 255, 255, 0.04) 70%, transparent 100%)',
            transform: 'rotate(-10deg)',
            animation: `${parallaxFloat} 25s ease-in-out infinite reverse`,
            zIndex: 1,
          }}
        />
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid
            container
            spacing={8}
            alignItems="center"
            sx={{ minHeight: '100vh', py: { xs: 4, md: 0 } }}
          >
            <Grid item xs={12} lg={6}>
              <Fade in={animationTrigger} timeout={1000}>
                <Box>
                  <AnimatedChip
                    label="✨ AI-Powered Card Creation"
                    size="medium"
                    sx={{
                      mb: 4,
                      animation: `${float} 3s ease-in-out infinite`,
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#fff',
                      fontSize: '1rem',
                      px: 3,
                      py: 1.5,
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    }}
                  />

                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: {
                        xs: '2.8rem',
                        md: '4rem',
                        lg: '5rem',
                        xl: '5.5rem',
                      },
                      fontWeight: 800,
                      lineHeight: { xs: 1.1, md: 1.05 },
                      mb: 4,
                      background: `
                        linear-gradient(135deg, 
                          rgba(255, 255, 255, 1) 0%, 
                          rgba(255, 255, 255, 0.9) 25%,
                          rgba(255, 255, 255, 1) 50%,
                          rgba(255, 255, 255, 0.9) 75%,
                          rgba(255, 255, 255, 1) 100%
                        )
                      `,
                      backgroundSize: '400% 400%',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      animation: `${fadeInUp} 1s ease-out, ${gradientShift} 8s ease infinite`,
                      textShadow: '0 0 40px rgba(255, 255, 255, 0.3)',
                      letterSpacing: { xs: '-0.02em', md: '-0.03em' },
                    }}
                  >
                    Create Epic Pokémon Cards
                    <br />
                    <Box
                      component="span"
                      sx={{
                        background: `
                        linear-gradient(135deg, 
                          #FFD700 0%, 
                          #FFA500 25%, 
                          #FF6B35 50%, 
                          #F7931E 75%, 
                          #FFD700 100%
                        )
                      `,
                        backgroundSize: '400% 400%',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        animation: `${pulse} 3s ease-in-out infinite, ${gradientShift} 6s ease infinite`,
                        position: 'relative',
                        display: 'inline-block',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background:
                            'linear-gradient(90deg, transparent, #FFD700, transparent)',
                          animation: `${shimmer} 2s infinite`,
                        },
                      }}
                    >
                      in Seconds
                    </Box>
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      mb: 5,
                      color: 'rgba(255, 255, 255, 0.95)',
                      fontWeight: 400,
                      lineHeight: 1.7,
                      maxWidth: 600,
                      fontSize: { xs: '1.1rem', md: '1.3rem', lg: '1.4rem' },
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      padding: '1.5rem 2rem',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background:
                          'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
                        borderRadius: '16px',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                      },
                      '&:hover::before': {
                        opacity: 1,
                      },
                    }}
                  >
                    <Box
                      component="span"
                      sx={{ fontWeight: 600, color: '#FFD700' }}
                    >
                      The world's most advanced
                    </Box>{' '}
                    AI-powered Pokémon card creator. Upload an image, name your
                    Pokémon, and watch the magic unfold with professional
                    results in seconds.
                  </Typography>

                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={3}
                    sx={{ mb: 6 }}
                  >
                    <NextLink href={Routes.Creator} passHref legacyBehavior>
                      <Button
                        size="large"
                        endIcon={<PlayArrow />}
                        sx={{
                          minWidth: { xs: 280, sm: 220 },
                          fontSize: { xs: '1.1rem', md: '1.2rem' },
                          fontWeight: 600,
                          py: { xs: 2, md: 2.5 },
                          px: { xs: 4, md: 5 },
                          borderRadius: 50,
                          background: `
                            linear-gradient(135deg, 
                              rgba(255, 255, 255, 0.2) 0%, 
                              rgba(255, 255, 255, 0.1) 100%
                            )
                          `,
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#fff',
                          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background:
                              'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                            transition: 'left 0.6s ease',
                          },
                          '&:hover': {
                            background: `
                              linear-gradient(135deg, 
                                rgba(255, 255, 255, 0.3) 0%, 
                                rgba(255, 255, 255, 0.2) 100%
                              )
                            `,
                            transform: 'translateY(-3px) scale(1.02)',
                            boxShadow:
                              '0 15px 40px rgba(0, 0, 0, 0.2), 0 0 20px rgba(255, 255, 255, 0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.5)',
                            '&::before': {
                              left: '100%',
                            },
                          },
                          '&:active': {
                            transform: 'translateY(-1px) scale(1.01)',
                          },
                        }}
                      >
                        Start Creating Now
                      </Button>
                    </NextLink>

                    <Button
                      variant="outlined"
                      size="large"
                      sx={{
                        borderColor: 'rgba(255, 255, 255, 0.4)',
                        color: '#fff',
                        borderRadius: 50,
                        minWidth: { xs: 220, sm: 180 },
                        fontSize: { xs: '1rem', md: '1.1rem' },
                        fontWeight: 500,
                        py: { xs: 2, md: 2.5 },
                        px: { xs: 3, md: 4 },
                        backdropFilter: 'blur(15px)',
                        background: 'rgba(255, 255, 255, 0.08)',
                        position: 'relative',
                        overflow: 'hidden',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background:
                            'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                        },
                        '&:hover': {
                          borderColor: 'rgba(255, 255, 255, 0.7)',
                          background: 'rgba(255, 255, 255, 0.15)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 30px rgba(255, 255, 255, 0.15)',
                          '&::before': {
                            opacity: 1,
                          },
                        },
                      }}
                    >
                      View Examples
                    </Button>
                  </Stack>

                  <Stack direction="row" spacing={3} alignItems="center">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Star sx={{ color: '#FFD700', mr: 0.5 }} />
                      <Typography
                        variant="body2"
                        sx={{ color: alpha('#fff', 0.9) }}
                      >
                        4.9/5 rating
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Group sx={{ color: alpha('#fff', 0.7), mr: 0.5 }} />
                      <Typography
                        variant="body2"
                        sx={{ color: alpha('#fff', 0.9) }}
                      >
                        100K+ creators
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Fade>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Slide direction="left" in={animationTrigger} timeout={1200}>
                <Box
                  sx={{
                    position: 'relative',
                    animation: `${float} 6s ease-in-out infinite`,
                    perspective: '1200px',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '-15%',
                      left: '-15%',
                      right: '-15%',
                      bottom: '-15%',
                      background: `
                        radial-gradient(circle at 30% 30%, rgba(0, 122, 255, 0.2) 0%, transparent 50%),
                        radial-gradient(circle at 70% 70%, rgba(255, 215, 0, 0.15) 0%, transparent 50%)
                      `,
                      borderRadius: '50%',
                      filter: 'blur(60px)',
                      zIndex: -1,
                      animation: `${heroParticles} 10s ease-in-out infinite`,
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '10%',
                      right: '-5%',
                      width: '30px',
                      height: '30px',
                      background: 'rgba(255, 255, 255, 0.3)',
                      borderRadius: '50%',
                      animation: `${parallaxFloat} 8s ease-in-out infinite`,
                      filter: 'blur(1px)',
                      zIndex: 2,
                    },
                  }}
                >
                  {/* Floating decorator elements */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '20%',
                      left: '-8%',
                      width: '20px',
                      height: '20px',
                      background: 'rgba(255, 215, 0, 0.4)',
                      borderRadius: '50%',
                      animation: `${heroParticles} 12s ease-in-out infinite`,
                      zIndex: 2,
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: '15%',
                      right: '-5%',
                      width: '15px',
                      height: '15px',
                      background: 'rgba(255, 255, 255, 0.5)',
                      borderRadius: '20%',
                      animation: `${heroParticles} 9s ease-in-out infinite reverse`,
                      zIndex: 2,
                    }}
                  />

                  <Box
                    sx={{
                      transform: 'rotateY(-8deg) rotateX(3deg)',
                      transformStyle: 'preserve-3d',
                      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '5%',
                        left: '5%',
                        right: '5%',
                        bottom: '5%',
                        background:
                          'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
                        borderRadius: '24px',
                        zIndex: 2,
                        opacity: 0,
                        transition: 'opacity 0.6s ease',
                      },
                      '&:hover': {
                        transform: 'rotateY(0deg) rotateX(0deg) scale(1.05)',
                        '&::before': {
                          opacity: 1,
                        },
                      },
                    }}
                  >
                    <Image
                      src={banner}
                      alt="Pokémon Card Examples"
                      style={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: '24px',
                        boxShadow: `
                          0 50px 100px ${alpha('#000', 0.3)}, 
                          0 0 0 1px rgba(255,255,255,0.15), 
                          inset 0 1px 0 rgba(255,255,255,0.1)
                        `,
                        filter: 'brightness(1.05) contrast(1.1)',
                      }}
                    />
                    <ShimmerBox
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: '24px',
                        background:
                          'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                        backgroundSize: '200% 200%',
                        animation: `${shimmer} 4s infinite`,
                      }}
                    />
                  </Box>
                </Box>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>
      {/* Premium Stats Section */}
      <Box
        sx={{
          background: `
            linear-gradient(135deg, rgba(248, 249, 250, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%),
            radial-gradient(circle at 25% 25%, rgba(0, 122, 255, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255, 215, 0, 0.03) 0%, transparent 50%)
          `,
          py: { xs: 12, md: 20 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23007AFF" fill-opacity="0.02"%3E%3Ccircle cx="50" cy="50" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            zIndex: 0,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: '300px',
            height: '300px',
            background:
              'radial-gradient(circle, rgba(0, 122, 255, 0.03) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(80px)',
            animation: `${parallaxFloat} 15s ease-in-out infinite`,
            zIndex: 0,
          },
        }}
      >
        {/* Floating Stats Decorators */}
        {[...Array(8)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              top: `${20 + Math.random() * 60}%`,
              left: `${10 + Math.random() * 80}%`,
              width: `${15 + Math.random() * 25}px`,
              height: `${15 + Math.random() * 25}px`,
              background: `rgba(0, 122, 255, ${0.05 + Math.random() * 0.1})`,
              borderRadius: Math.random() > 0.6 ? '50%' : '30%',
              animation: `${heroParticles} ${
                12 + Math.random() * 10
              }s ease-in-out infinite`,
              animationDelay: `${Math.random() * 8}s`,
              zIndex: 0,
            }}
          />
        ))}

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={{ xs: 4, md: 8 }}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Fade in={trigger} timeout={1000 + index * 300}>
                  <StatsCard>
                    <Box sx={{ color: 'primary.main', mb: { xs: 1, md: 2 } }}>
                      {stat.icon}
                    </Box>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        mb: 1,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: { xs: '1.75rem', md: '2.5rem' },
                      }}
                    >
                      {stat.number}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: '0.75rem', md: '0.875rem' },
                        fontWeight: 500,
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </StatsCard>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      {/* Premium Features Section */}
      <Box
        sx={{
          background: `
            linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%),
            linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)
          `,
          backgroundSize: '100% 100%, 400% 400%',
          animation: `${gradientShift} 20s ease infinite`,
          py: { xs: 16, md: 24 },
          position: 'relative',
          overflow: 'hidden',
          minHeight: { xs: '80vh', md: '90vh' },
          display: 'flex',
          alignItems: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 40%),
              radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 40%),
              radial-gradient(circle at 50% 50%, rgba(0, 122, 255, 0.1) 0%, transparent 60%)
            `,
            zIndex: 0,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '-20%',
            left: '60%',
            width: '800px',
            height: '800px',
            background:
              'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(120px)',
            animation: `${parallaxFloat} 25s ease-in-out infinite`,
            zIndex: 0,
          },
        }}
      >
        {/* Premium Floating Elements */}
        {[...Array(15)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              top: `${10 + Math.random() * 80}%`,
              left: `${5 + Math.random() * 90}%`,
              width: `${20 + Math.random() * 50}px`,
              height: `${20 + Math.random() * 50}px`,
              background: `rgba(255, 255, 255, ${0.03 + Math.random() * 0.07})`,
              borderRadius:
                Math.random() > 0.5 ? '50%' : `${Math.random() * 30}%`,
              animation: `${heroParticles} ${
                10 + Math.random() * 15
              }s ease-in-out infinite`,
              animationDelay: `${Math.random() * 10}s`,
              zIndex: 1,
              backdropFilter: 'blur(2px)',
            }}
          />
        ))}

        {/* Cinematic Light Beams */}
        <Box
          sx={{
            position: 'absolute',
            top: '-100%',
            left: '20%',
            width: '200px',
            height: '300%',
            background:
              'linear-gradient(0deg, transparent 0%, rgba(255, 255, 255, 0.04) 30%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.04) 70%, transparent 100%)',
            transform: 'rotate(20deg)',
            animation: `${parallaxFloat} 30s ease-in-out infinite`,
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '-100%',
            right: '30%',
            width: '150px',
            height: '300%',
            background:
              'linear-gradient(0deg, transparent 0%, rgba(255, 255, 255, 0.03) 40%, rgba(255, 255, 255, 0.06) 60%, transparent 100%)',
            transform: 'rotate(-15deg)',
            animation: `${parallaxFloat} 35s ease-in-out infinite reverse`,
            zIndex: 1,
          }}
        />
        <Container
          maxWidth="xl"
          sx={{ position: 'relative', zIndex: 2, width: '100%' }}
        >
          <Box textAlign="center" sx={{ mb: { xs: 10, md: 12 } }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                fontWeight: 800,
                mb: 4,
                background: `
                  linear-gradient(135deg, 
                    rgba(255, 255, 255, 1) 0%, 
                    rgba(255, 255, 255, 0.9) 25%,
                    rgba(255, 255, 255, 1) 50%,
                    rgba(255, 255, 255, 0.9) 75%,
                    rgba(255, 255, 255, 1) 100%
                  )
                `,
                backgroundSize: '400% 400%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: `${gradientShift} 10s ease infinite`,
                textAlign: 'center',
                textShadow: '0 0 40px rgba(255, 255, 255, 0.3)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              Why Choose
              <Box
                component="span"
                sx={{
                  background: `
                  linear-gradient(135deg, 
                    #FFD700 0%, 
                    #FFA500 25%, 
                    #FF6B35 50%, 
                    #F7931E 75%, 
                    #FFD700 100%
                  )
                `,
                  backgroundSize: '400% 400%',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: `${gradientShift} 8s ease infinite`,
                }}
              >
                {' '}
                PlayMoreTCG?
              </Box>
            </Typography>

            <Typography
              variant="h5"
              sx={{
                maxWidth: 800,
                mx: 'auto',
                px: { xs: 3, sm: 2 },
                lineHeight: 1.7,
                fontSize: { xs: '1.2rem', md: '1.4rem' },
                color: 'rgba(255, 255, 255, 0.95)',
                fontWeight: 400,
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(15px)',
                padding: '2rem 2.5rem',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
                  borderRadius: '20px',
                  opacity: 0,
                  transition: 'opacity 0.4s ease',
                },
                '&:hover::before': {
                  opacity: 1,
                },
              }}
            >
              Experience the{' '}
              <Box component="span" sx={{ color: '#FFD700', fontWeight: 600 }}>
                future of card creation
              </Box>{' '}
              with cutting-edge AI technology and professional-grade design
              tools that deliver studio-quality results.
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 4, md: 6 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <Fade in={trigger} timeout={1200 + index * 300}>
                  <Box
                    sx={{
                      height: '100%',
                      background: 'rgba(255, 255, 255, 0.12)',
                      backdropFilter: 'blur(25px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '24px',
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background:
                          'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                        transition: 'left 1s ease',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '0',
                        height: '0',
                        background: `radial-gradient(circle, ${alpha(
                          '#fff',
                          0.1,
                        )}, transparent)`,
                        transform: 'translate(-50%, -50%)',
                        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        borderRadius: '50%',
                        zIndex: 0,
                      },
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.03)',
                        background: 'rgba(255, 255, 255, 0.18)',
                        border: '1px solid rgba(255, 255, 255, 0.35)',
                        boxShadow:
                          '0 25px 60px rgba(0, 0, 0, 0.2), 0 0 30px rgba(255, 255, 255, 0.1)',
                        '&::before': {
                          left: '100%',
                        },
                        '&::after': {
                          width: '300%',
                          height: '300%',
                        },
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: { xs: 4, md: 5 },
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      <Box>
                        <Avatar
                          sx={{
                            width: { xs: 70, md: 90 },
                            height: { xs: 70, md: 90 },
                            margin: '0 auto 32px',
                            background: `${feature.gradient}, rgba(255, 255, 255, 0.1)`,
                            backgroundBlendMode: 'overlay',
                            color: '#fff',
                            boxShadow:
                              '0 15px 35px rgba(0, 0, 0, 0.15), 0 0 20px rgba(255, 255, 255, 0.1)',
                            border: '2px solid rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            fontSize: { xs: '2rem', md: '2.5rem' },
                            transition: 'all 0.4s ease',
                            '&:hover': {
                              transform: 'scale(1.1) rotate(5deg)',
                              boxShadow:
                                '0 20px 40px rgba(0, 0, 0, 0.2), 0 0 30px rgba(255, 255, 255, 0.2)',
                            },
                          }}
                        >
                          {feature.icon}
                        </Avatar>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            mb: 3,
                            fontSize: { xs: '1.3rem', md: '1.5rem' },
                            color: '#fff',
                            textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                            lineHeight: 1.3,
                          }}
                        >
                          {feature.title}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body1"
                        sx={{
                          lineHeight: 1.7,
                          fontSize: { xs: '1rem', md: '1.1rem' },
                          color: 'rgba(255, 255, 255, 0.9)',
                          textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
                          fontWeight: 400,
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      {/* Premium Process Section */}
      <Box
        sx={{
          py: { xs: 16, md: 24 },
          position: 'relative',
          background: `
            linear-gradient(180deg, rgba(248, 249, 250, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%),
            radial-gradient(circle at 30% 40%, rgba(0, 122, 255, 0.08) 0%, transparent 60%),
            radial-gradient(circle at 70% 60%, rgba(255, 215, 0, 0.05) 0%, transparent 60%)
          `,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'url("data:image/svg+xml,%3Csvg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23007AFF" fill-opacity="0.015"%3E%3Ccircle cx="60" cy="60" r="3"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            zIndex: 0,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '10%',
            right: '15%',
            width: '400px',
            height: '400px',
            background:
              'radial-gradient(circle, rgba(0, 122, 255, 0.04) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(100px)',
            animation: `${parallaxFloat} 18s ease-in-out infinite`,
            zIndex: 0,
          },
        }}
      >
        {/* Process Floating Elements */}
        {[...Array(10)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              top: `${15 + Math.random() * 70}%`,
              left: `${8 + Math.random() * 84}%`,
              width: `${12 + Math.random() * 20}px`,
              height: `${12 + Math.random() * 20}px`,
              background: `rgba(0, 122, 255, ${0.08 + Math.random() * 0.12})`,
              borderRadius: Math.random() > 0.7 ? '50%' : '25%',
              animation: `${heroParticles} ${
                15 + Math.random() * 12
              }s ease-in-out infinite`,
              animationDelay: `${Math.random() * 10}s`,
              zIndex: 0,
            }}
          />
        ))}

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Box textAlign="center" sx={{ mb: { xs: 10, md: 14 } }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                fontWeight: 800,
                mb: 4,
                background: `
                linear-gradient(135deg, 
                  ${theme.palette.primary.main} 0%, 
                  ${theme.palette.primary.light} 50%,
                  ${theme.palette.primary.main} 100%
                )
              `,
                backgroundSize: '400% 400%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: `${gradientShift} 12s ease infinite`,
                px: { xs: 2, sm: 0 },
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '100px',
                  height: '4px',
                  background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}, transparent)`,
                  borderRadius: '2px',
                },
              }}
            >
              How It Works
            </Typography>
            <Typography
              variant="h5"
              sx={{
                maxWidth: 700,
                mx: 'auto',
                px: { xs: 3, sm: 2 },
                lineHeight: 1.7,
                fontSize: { xs: '1.2rem', md: '1.4rem' },
                color: theme.palette.text.primary,
                fontWeight: 400,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                padding: '2rem 2.5rem',
                borderRadius: '20px',
                border: '1px solid rgba(0, 122, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    'linear-gradient(135deg, rgba(0, 122, 255, 0.05) 0%, transparent 50%)',
                  borderRadius: '20px',
                  opacity: 0,
                  transition: 'opacity 0.4s ease',
                },
                '&:hover::before': {
                  opacity: 1,
                },
              }}
            >
              From{' '}
              <Box
                component="span"
                sx={{ color: theme.palette.primary.main, fontWeight: 600 }}
              >
                concept to creation
              </Box>{' '}
              in four simple steps. No design experience required - just your
              imagination.
            </Typography>
          </Box>

          <Grid
            container
            spacing={{ xs: 4, md: 8 }}
            sx={{ mb: { xs: 8, md: 12 } }}
          >
            {process.map((step, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <Fade in={trigger} timeout={1500 + index * 300}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      p: { xs: 4, md: 5 },
                      position: 'relative',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '28px',
                      border: '1px solid rgba(0, 122, 255, 0.1)',
                      boxShadow:
                        '0 15px 40px rgba(0, 0, 0, 0.08), 0 0 20px rgba(0, 122, 255, 0.05)',
                      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      height: '100%',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background:
                          'linear-gradient(90deg, transparent, rgba(0, 122, 255, 0.1), transparent)',
                        transition: 'left 1.2s ease',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        right: '-25%',
                        top: '50%',
                        width: index < 3 ? '50%' : '0',
                        height: '3px',
                        background: `linear-gradient(90deg, ${alpha(
                          theme.palette.primary.main,
                          0.8,
                        )}, transparent)`,
                        transform: 'translateY(-50%)',
                        borderRadius: '2px',
                        [theme.breakpoints.down('lg')]: {
                          display: 'none',
                        },
                      },
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        background: 'rgba(255, 255, 255, 0.95)',
                        boxShadow:
                          '0 25px 60px rgba(0, 0, 0, 0.12), 0 0 30px rgba(0, 122, 255, 0.1)',
                        border: '1px solid rgba(0, 122, 255, 0.2)',
                        '&::before': {
                          left: '100%',
                        },
                      },
                      [theme.breakpoints.down('sm')]: {
                        p: 3,
                        borderRadius: '24px',
                        '&:not(:last-child)': {
                          mb: 3,
                        },
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: { xs: 60, md: 80 },
                        height: { xs: 60, md: 80 },
                        mb: 3,
                        background: `
                        linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light}),
                        rgba(255, 255, 255, 0.1)
                      `,
                        backgroundBlendMode: 'overlay',
                        color: '#fff',
                        fontSize: { xs: '1.2rem', md: '1.5rem' },
                        fontWeight: 800,
                        boxShadow:
                          '0 12px 30px rgba(0, 122, 255, 0.25), 0 0 20px rgba(0, 122, 255, 0.1)',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.4s ease',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '-2px',
                          left: '-2px',
                          right: '-2px',
                          bottom: '-2px',
                          background: `conic-gradient(from 0deg, ${theme.palette.primary.main}, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                          borderRadius: '50%',
                          zIndex: -1,
                          opacity: 0,
                          transition: 'opacity 0.4s ease',
                        },
                        '&:hover': {
                          transform: 'scale(1.1) rotate(10deg)',
                          boxShadow:
                            '0 20px 40px rgba(0, 122, 255, 0.3), 0 0 30px rgba(0, 122, 255, 0.2)',
                          '&::before': {
                            opacity: 1,
                          },
                        },
                      }}
                    >
                      {step.step}
                    </Avatar>
                    <Box
                      sx={{
                        mb: 3,
                        color: 'primary.main',
                        fontSize: { xs: '2rem', md: '2.5rem' },
                      }}
                    >
                      {step.icon}
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        fontSize: { xs: '1.2rem', md: '1.4rem' },
                        color: theme.palette.text.primary,
                        lineHeight: 1.3,
                      }}
                    >
                      {step.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '1rem', md: '1.1rem' },
                        lineHeight: 1.6,
                        color: theme.palette.text.secondary,
                        fontWeight: 400,
                      }}
                    >
                      {step.description}
                    </Typography>
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      {/* Premium CTA Section */}
      <Box
        sx={{
          background: `
            linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%),
            linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)
          `,
          backgroundSize: '100% 100%, 600% 600%',
          animation: `${gradientShift} 25s ease infinite`,
          py: { xs: 16, md: 28 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          minHeight: { xs: '80vh', md: '100vh' },
          display: 'flex',
          alignItems: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(0, 122, 255, 0.1) 0%, transparent 70%)
            `,
            zIndex: 0,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '-30%',
            right: '-20%',
            width: '800px',
            height: '800px',
            background:
              'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(150px)',
            animation: `${parallaxFloat} 40s ease-in-out infinite`,
            zIndex: 0,
          },
        }}
      >
        {/* Ultimate Floating Elements */}
        {[...Array(20)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              top: `${5 + Math.random() * 90}%`,
              left: `${3 + Math.random() * 94}%`,
              width: `${15 + Math.random() * 35}px`,
              height: `${15 + Math.random() * 35}px`,
              background: `rgba(255, 255, 255, ${0.02 + Math.random() * 0.08})`,
              borderRadius:
                Math.random() > 0.4 ? '50%' : `${Math.random() * 40}%`,
              animation: `${heroParticles} ${
                8 + Math.random() * 20
              }s ease-in-out infinite`,
              animationDelay: `${Math.random() * 15}s`,
              zIndex: 1,
              backdropFilter: 'blur(1px)',
            }}
          />
        ))}

        {/* Cinematic Light Shows */}
        <Box
          sx={{
            position: 'absolute',
            top: '-150%',
            left: '15%',
            width: '300px',
            height: '400%',
            background:
              'linear-gradient(0deg, transparent 0%, rgba(255, 255, 255, 0.06) 20%, rgba(255, 255, 255, 0.12) 40%, rgba(255, 255, 255, 0.06) 60%, transparent 100%)',
            transform: 'rotate(25deg)',
            animation: `${parallaxFloat} 45s ease-in-out infinite`,
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '-150%',
            right: '20%',
            width: '250px',
            height: '400%',
            background:
              'linear-gradient(0deg, transparent 0%, rgba(255, 255, 255, 0.04) 30%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.04) 70%, transparent 100%)',
            transform: 'rotate(-20deg)',
            animation: `${parallaxFloat} 50s ease-in-out infinite reverse`,
            zIndex: 1,
          }}
        />
        <Container
          maxWidth="xl"
          sx={{ position: 'relative', zIndex: 2, width: '100%' }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: {
                xs: '2.5rem',
                sm: '3.5rem',
                md: '4.5rem',
                lg: '5.5rem',
              },
              fontWeight: 900,
              color: '#fff',
              mb: 5,
              px: { xs: 2, sm: 0 },
              lineHeight: { xs: 1.1, md: 1.05 },
              background: `
                linear-gradient(135deg, 
                  rgba(255, 255, 255, 1) 0%, 
                  rgba(255, 255, 255, 0.9) 25%,
                  rgba(255, 255, 255, 1) 50%,
                  rgba(255, 255, 255, 0.9) 75%,
                  rgba(255, 255, 255, 1) 100%
                )
              `,
              backgroundSize: '400% 400%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: `${gradientShift} 8s ease infinite`,
              textShadow: '0 0 60px rgba(255, 255, 255, 0.4)',
              letterSpacing: '-0.03em',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-15px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '200px',
                height: '6px',
                background: `
                  linear-gradient(90deg, 
                    transparent, 
                    #FFD700 20%, 
                    #FFA500 50%, 
                    #FFD700 80%, 
                    transparent
                  )
                `,
                borderRadius: '3px',
                animation: `${shimmer} 3s infinite`,
              },
            }}
          >
            Ready to Create
            <br />
            <Box
              component="span"
              sx={{
                background: `
                linear-gradient(135deg, 
                  #FFD700 0%, 
                  #FFA500 25%, 
                  #FF6B35 50%, 
                  #F7931E 75%, 
                  #FFD700 100%
                )
              `,
                backgroundSize: '400% 400%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: `${gradientShift} 6s ease infinite`,
              }}
            >
              Amazing Cards?
            </Box>
          </Typography>

          <Typography
            variant="h4"
            sx={{
              color: 'rgba(255, 255, 255, 0.95)',
              mb: 6,
              lineHeight: 1.7,
              px: { xs: 3, sm: 2 },
              fontSize: { xs: '1.3rem', md: '1.6rem', lg: '1.8rem' },
              maxWidth: 900,
              mx: 'auto',
              fontWeight: 400,
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              padding: '2.5rem 3rem',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
                borderRadius: '24px',
                opacity: 0,
                transition: 'opacity 0.5s ease',
              },
              '&:hover::before': {
                opacity: 1,
              },
            }}
          >
            Join{' '}
            <Box component="span" sx={{ color: '#FFD700', fontWeight: 600 }}>
              thousands of creators
            </Box>{' '}
            who've already discovered the magic of AI-powered card creation.
            Start your journey today – it's completely free!
          </Typography>

          <NextLink href={Routes.Creator} passHref legacyBehavior>
            <Button
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                fontSize: { xs: '1.2rem', md: '1.4rem', lg: '1.5rem' },
                fontWeight: 700,
                py: { xs: 2.5, md: 3.5 },
                px: { xs: 5, md: 7 },
                mb: 6,
                background: `
                  linear-gradient(135deg, 
                    rgba(255, 255, 255, 0.25) 0%, 
                    rgba(255, 255, 255, 0.15) 100%
                  )
                `,
                backdropFilter: 'blur(30px)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 60,
                minWidth: { xs: 280, md: 350 },
                color: '#fff',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background:
                    'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  transition: 'left 0.8s ease',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: '-2px',
                  left: '-2px',
                  right: '-2px',
                  bottom: '-2px',
                  background: `conic-gradient(from 0deg, #FFD700, #FFA500, #FF6B35, #F7931E, #FFD700)`,
                  borderRadius: 60,
                  zIndex: -1,
                  opacity: 0,
                  transition: 'opacity 0.6s ease',
                },
                '&:hover': {
                  background: `
                    linear-gradient(135deg, 
                      rgba(255, 255, 255, 0.35) 0%, 
                      rgba(255, 255, 255, 0.25) 100%
                    )
                  `,
                  transform: 'translateY(-4px) scale(1.02)',
                  boxShadow:
                    '0 20px 60px rgba(0, 0, 0, 0.25), 0 0 40px rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.5)',
                  '&::before': {
                    left: '100%',
                  },
                  '&::after': {
                    opacity: 1,
                  },
                },
                '&:active': {
                  transform: 'translateY(-2px) scale(1.01)',
                },
              }}
            >
              Start Creating Now - Free
            </Button>
          </NextLink>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="center"
            spacing={{ xs: 2, sm: 4 }}
            sx={{ mt: 4 }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: { xs: 'center', sm: 'flex-start' },
                color: alpha('#fff', 0.9),
              }}
            >
              <Check sx={{ mr: 1, fontSize: { xs: 18, md: 20 } }} />
              <Typography
                variant="body2"
                sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
              >
                No signup required
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: { xs: 'center', sm: 'flex-start' },
                color: alpha('#fff', 0.9),
              }}
            >
              <Check sx={{ mr: 1, fontSize: { xs: 18, md: 20 } }} />
              <Typography
                variant="body2"
                sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
              >
                Instant results
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: { xs: 'center', sm: 'flex-start' },
                color: alpha('#fff', 0.9),
              }}
            >
              <Check sx={{ mr: 1, fontSize: { xs: 18, md: 20 } }} />
              <Typography
                variant="body2"
                sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
              >
                HD downloads
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default Home;
