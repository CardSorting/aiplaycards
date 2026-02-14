'use client';

import { FC, ReactNode, useCallback, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Container,
  Fade,
  Grid,
  IconButton,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ExpandMore, TrendingUp } from '@mui/icons-material';
import OpenPackButton from '../components/OpenPackButton';

type Cta = { label: string; href?: string; onClick?: () => void };
type Media = { src?: string; alt?: string; width?: number; height?: number };

function track(event: string, payload?: Record<string, unknown>) {
  if (typeof window !== 'undefined') {
    try {
      // GTM dataLayer
      // @ts-ignore
      window.dataLayer?.push({ event, ...payload });
      // GoatCounter basic
      // @ts-ignore
      window.goatcounter?.count({
        path: location.pathname + '#' + event,
        title: document.title,
      });
      // Custom analytics endpoint (non-blocking, ignored if unavailable)
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          event,
          ...payload,
          ts: new Date().toISOString(),
        }),
      }).catch(() => {
        // Intentionally ignore errors in analytics
      });
    } catch (e) {
      // no-op
    }
  }
}

/* ------------------------------ Hero ------------------------------ */

export const Hero: FC<{
  headline: string;
  subhead: string;
  primary: Cta;
  secondary: Cta;
  media?: Media;
  variantId?: string;
}> = ({ headline, subhead, primary, secondary, variantId = 'v1' }) => {
  const theme = useTheme();
  const onPrimary = useCallback(() => {
    track('hero_cta_click', {
      cta: 'primary',
      variantId,
      label: primary.label,
    });
    primary.onClick?.();
  }, [primary, variantId]);
  const onSecondary = useCallback(() => {
    track('hero_cta_click', {
      cta: 'secondary',
      variantId,
      label: secondary.label,
    });
    secondary.onClick?.();
  }, [secondary, variantId]);

  return (
    <Box
      component="section"
      role="banner"
      sx={{
        py: { xs: 6, md: 10 },
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          opacity: 0.3,
        },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography
              component="h1"
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 800,
                lineHeight: 1.1,
                mb: 2,
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              {headline}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                maxWidth: 640,
                color: 'rgba(255,255,255,0.9)',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
              }}
            >
              {subhead}
            </Typography>

            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
              {primary.href ? (
                <Button
                  component={Link}
                  href={primary.href}
                  onClick={onPrimary}
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: 'white',
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.9)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {primary.label}
                </Button>
              ) : (
                <OpenPackButton
                  label={primary.label}
                  variant="contained"
                  size="large"
                  onClick={onPrimary}
                  sx={{
                    bgcolor: 'white',
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.9)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                />
              )}
              <Button
                component={secondary.href ? Link : 'button'}
                href={secondary.href}
                onClick={!secondary.href ? onSecondary : undefined}
                variant="text"
                size="large"
                sx={{
                  color: 'white',
                  fontWeight: 500,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {secondary.label}
              </Button>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative', textAlign: 'center' }}>
              {/* Interactive Card Creation Demo */}
              <Box sx={{ position: 'relative', maxWidth: 500, mx: 'auto' }}>
                {/* Main Demo Container */}
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: 320,
                    borderRadius: 4,
                    overflow: 'hidden',
                    background:
                      'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
                    transform:
                      'perspective(1200px) rotateY(-8deg) rotateX(3deg)',
                    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform:
                        'perspective(1200px) rotateY(-3deg) rotateX(1deg) scale(1.02)',
                      boxShadow: '0 35px 70px rgba(0,0,0,0.5)',
                    },
                  }}
                >
                  {/* Animated Background Pattern */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background:
                        "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                      animation: 'patternMove 20s linear infinite',
                    }}
                  />

                  {/* Live Demo Badge */}
                  <Chip
                    label="✨ Live Demo"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      color: 'white',
                      fontWeight: 700,
                      zIndex: 10,
                      animation: 'glow 2s ease-in-out infinite alternate',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                      '& .MuiChip-label': {
                        px: 2,
                      },
                    }}
                  />

                  {/* Detailed Trading Card Stack */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 200,
                      height: 280,
                    }}
                  >
                    {/* Base Card - Fire/Earth Flip */}
                    <Box
                      sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        transformStyle: 'preserve-3d',
                        animation: 'cardCycle1 12s ease-in-out infinite',
                        '&:hover': {
                          animationPlayState: 'paused',
                        },
                      }}
                    >
                      {/* Front - Fire Card */}
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          background:
                            'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                          borderRadius: 3,
                          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(0deg)',
                        }}
                      >
                        {/* Card Header */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 40,
                            background: 'rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 1.5,
                            zIndex: 2,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                            }}
                          >
                            Fire
                          </Typography>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              background: '#ffd700',
                            }}
                          />
                        </Box>

                        {/* Card Art */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 40,
                            left: 8,
                            right: 8,
                            height: 120,
                            background:
                              'linear-gradient(45deg, #ff8a80, #ff5722)',
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <svg width="60" height="60" viewBox="0 0 100 100">
                            <defs>
                              <radialGradient
                                id="fireGradient"
                                cx="50%"
                                cy="50%"
                                r="50%"
                              >
                                <stop
                                  offset="0%"
                                  style={{
                                    stopColor: '#ffeb3b',
                                    stopOpacity: 1,
                                  }}
                                />
                                <stop
                                  offset="50%"
                                  style={{
                                    stopColor: '#ff9800',
                                    stopOpacity: 1,
                                  }}
                                />
                                <stop
                                  offset="100%"
                                  style={{
                                    stopColor: '#f44336',
                                    stopOpacity: 1,
                                  }}
                                />
                              </radialGradient>
                            </defs>
                            <path
                              d="M50,80 Q30,60 50,40 Q70,60 50,80"
                              fill="url(#fireGradient)"
                            />
                            <path
                              d="M45,75 Q25,55 45,35 Q65,55 45,75"
                              fill="url(#fireGradient)"
                              opacity="0.7"
                            />
                          </svg>
                        </Box>

                        {/* Card Name */}
                        <Typography
                          variant="h6"
                          sx={{
                            position: 'absolute',
                            top: 170,
                            left: 8,
                            right: 8,
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            textAlign: 'center',
                            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                          }}
                        >
                          Blaze Dragon
                        </Typography>

                        {/* Card Stats */}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            left: 8,
                            right: 8,
                            height: 60,
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: 2,
                            p: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              mb: 0.5,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ color: 'white', fontSize: '0.6rem' }}
                            >
                              ATK: 1800
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: 'white', fontSize: '0.6rem' }}
                            >
                              DEF: 1200
                            </Typography>
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'rgba(255,255,255,0.8)',
                              fontSize: '0.5rem',
                              display: 'block',
                              textAlign: 'center',
                            }}
                          >
                            A fierce dragon with burning flames
                          </Typography>
                        </Box>
                      </Box>

                      {/* Back - Earth Card */}
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          background:
                            'linear-gradient(135deg, #8bc34a, #4caf50)',
                          borderRadius: 3,
                          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                        }}
                      >
                        {/* Card Header */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 40,
                            background: 'rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 1.5,
                            zIndex: 2,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                            }}
                          >
                            Earth
                          </Typography>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              background: '#8bc34a',
                            }}
                          />
                        </Box>

                        {/* Card Art */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 40,
                            left: 8,
                            right: 8,
                            height: 120,
                            background:
                              'linear-gradient(45deg, #795548, #8d6e63)',
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <svg width="60" height="60" viewBox="0 0 100 100">
                            <defs>
                              <radialGradient
                                id="earthGradient"
                                cx="50%"
                                cy="50%"
                                r="50%"
                              >
                                <stop
                                  offset="0%"
                                  style={{
                                    stopColor: '#8bc34a',
                                    stopOpacity: 1,
                                  }}
                                />
                                <stop
                                  offset="50%"
                                  style={{
                                    stopColor: '#689f38',
                                    stopOpacity: 1,
                                  }}
                                />
                                <stop
                                  offset="100%"
                                  style={{
                                    stopColor: '#33691e',
                                    stopOpacity: 1,
                                  }}
                                />
                              </radialGradient>
                            </defs>
                            <polygon
                              points="50,20 70,40 60,70 40,70 30,40"
                              fill="url(#earthGradient)"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="15"
                              fill="url(#earthGradient)"
                              opacity="0.7"
                            />
                          </svg>
                        </Box>

                        {/* Card Name */}
                        <Typography
                          variant="h6"
                          sx={{
                            position: 'absolute',
                            top: 170,
                            left: 8,
                            right: 8,
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            textAlign: 'center',
                            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                          }}
                        >
                          Stone Golem
                        </Typography>

                        {/* Card Stats */}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            left: 8,
                            right: 8,
                            height: 60,
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: 2,
                            p: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              mb: 0.5,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ color: 'white', fontSize: '0.6rem' }}
                            >
                              ATK: 1400
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: 'white', fontSize: '0.6rem' }}
                            >
                              DEF: 2000
                            </Typography>
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'rgba(255,255,255,0.8)',
                              fontSize: '0.5rem',
                              display: 'block',
                              textAlign: 'center',
                            }}
                          >
                            Ancient guardian of the mountains
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Middle Card - Water/Ice Flip */}
                    <Box
                      sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        transformStyle: 'preserve-3d',
                        animation: 'cardCycle2 12s ease-in-out infinite 4s',
                        '&:hover': {
                          animationPlayState: 'paused',
                        },
                      }}
                    >
                      {/* Front - Water Card */}
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          background:
                            'linear-gradient(135deg, #4facfe, #00f2fe)',
                          borderRadius: 3,
                          boxShadow: '0 6px 24px rgba(0,0,0,0.25)',
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(0deg)',
                        }}
                      >
                        {/* Card Header */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 40,
                            background: 'rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 1.5,
                            zIndex: 2,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                            }}
                          >
                            Water
                          </Typography>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              background: '#2196f3',
                            }}
                          />
                        </Box>

                        {/* Card Art */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 40,
                            left: 8,
                            right: 8,
                            height: 120,
                            background:
                              'linear-gradient(45deg, #81c784, #4caf50)',
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <svg width="60" height="60" viewBox="0 0 100 100">
                            <defs>
                              <radialGradient
                                id="waterGradient"
                                cx="50%"
                                cy="50%"
                                r="50%"
                              >
                                <stop
                                  offset="0%"
                                  style={{
                                    stopColor: '#81d4fa',
                                    stopOpacity: 1,
                                  }}
                                />
                                <stop
                                  offset="50%"
                                  style={{
                                    stopColor: '#29b6f6',
                                    stopOpacity: 1,
                                  }}
                                />
                                <stop
                                  offset="100%"
                                  style={{
                                    stopColor: '#0277bd',
                                    stopOpacity: 1,
                                  }}
                                />
                              </radialGradient>
                            </defs>
                            <circle
                              cx="50"
                              cy="50"
                              r="30"
                              fill="url(#waterGradient)"
                            />
                            <circle
                              cx="40"
                              cy="40"
                              r="15"
                              fill="url(#waterGradient)"
                              opacity="0.6"
                            />
                            <circle
                              cx="60"
                              cy="60"
                              r="10"
                              fill="url(#waterGradient)"
                              opacity="0.4"
                            />
                          </svg>
                        </Box>

                        {/* Card Name */}
                        <Typography
                          variant="h6"
                          sx={{
                            position: 'absolute',
                            top: 170,
                            left: 8,
                            right: 8,
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            textAlign: 'center',
                            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                          }}
                        >
                          Ocean Serpent
                        </Typography>

                        {/* Card Stats */}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            left: 8,
                            right: 8,
                            height: 60,
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: 2,
                            p: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              mb: 0.5,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ color: 'white', fontSize: '0.6rem' }}
                            >
                              ATK: 1600
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: 'white', fontSize: '0.6rem' }}
                            >
                              DEF: 1400
                            </Typography>
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'rgba(255,255,255,0.8)',
                              fontSize: '0.5rem',
                              display: 'block',
                              textAlign: 'center',
                            }}
                          >
                            Ancient sea creature of legend
                          </Typography>
                        </Box>
                      </Box>

                      {/* Back - Ice Card */}
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          background:
                            'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                          borderRadius: 3,
                          boxShadow: '0 6px 24px rgba(0,0,0,0.25)',
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                        }}
                      >
                        {/* Card Header */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 40,
                            background: 'rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 1.5,
                            zIndex: 2,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                            }}
                          >
                            Ice
                          </Typography>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              background: '#e3f2fd',
                            }}
                          />
                        </Box>

                        {/* Card Art */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 40,
                            left: 8,
                            right: 8,
                            height: 120,
                            background:
                              'linear-gradient(45deg, #f5f5f5, #e0e0e0)',
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <svg width="60" height="60" viewBox="0 0 100 100">
                            <defs>
                              <radialGradient
                                id="iceGradient"
                                cx="50%"
                                cy="50%"
                                r="50%"
                              >
                                <stop
                                  offset="0%"
                                  style={{
                                    stopColor: '#ffffff',
                                    stopOpacity: 1,
                                  }}
                                />
                                <stop
                                  offset="50%"
                                  style={{
                                    stopColor: '#e3f2fd',
                                    stopOpacity: 1,
                                  }}
                                />
                                <stop
                                  offset="100%"
                                  style={{
                                    stopColor: '#bbdefb',
                                    stopOpacity: 1,
                                  }}
                                />
                              </radialGradient>
                            </defs>
                            <polygon
                              points="50,10 60,30 80,35 65,50 70,70 50,60 30,70 35,50 20,35 40,30"
                              fill="url(#iceGradient)"
                            />
                          </svg>
                        </Box>

                        {/* Card Name */}
                        <Typography
                          variant="h6"
                          sx={{
                            position: 'absolute',
                            top: 170,
                            left: 8,
                            right: 8,
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            textAlign: 'center',
                            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                          }}
                        >
                          Frost Phoenix
                        </Typography>

                        {/* Card Stats */}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            left: 8,
                            right: 8,
                            height: 60,
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: 2,
                            p: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              mb: 0.5,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ color: 'white', fontSize: '0.6rem' }}
                            >
                              ATK: 1700
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: 'white', fontSize: '0.6rem' }}
                            >
                              DEF: 1300
                            </Typography>
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'rgba(255,255,255,0.8)',
                              fontSize: '0.5rem',
                              display: 'block',
                              textAlign: 'center',
                            }}
                          >
                            Majestic bird of eternal winter
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Top Card - Electric/Dark Flip */}
                    <Box
                      sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        transformStyle: 'preserve-3d',
                        animation: 'cardCycle3 12s ease-in-out infinite 8s',
                        cursor: 'pointer',
                        '&:hover': {
                          animationPlayState: 'paused',
                        },
                      }}
                    >
                      {/* Front - Electric Card */}
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          background:
                            'linear-gradient(135deg, #667eea, #764ba2)',
                          borderRadius: 3,
                          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(0deg)',
                        }}
                      >
                        {/* Card Header */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 40,
                            background: 'rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 1.5,
                            zIndex: 2,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                            }}
                          >
                            Electric
                          </Typography>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              background: '#ffd700',
                            }}
                          />
                        </Box>

                        {/* Card Art */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 40,
                            left: 8,
                            right: 8,
                            height: 120,
                            background:
                              'linear-gradient(45deg, #ffd54f, #ffb300)',
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <svg width="60" height="60" viewBox="0 0 100 100">
                            <defs>
                              <radialGradient
                                id="electricGradient"
                                cx="50%"
                                cy="50%"
                                r="50%"
                              >
                                <stop
                                  offset="0%"
                                  style={{
                                    stopColor: '#fff59d',
                                    stopOpacity: 1,
                                  }}
                                />
                                <stop
                                  offset="50%"
                                  style={{
                                    stopColor: '#ffd54f',
                                    stopOpacity: 1,
                                  }}
                                />
                                <stop
                                  offset="100%"
                                  style={{
                                    stopColor: '#f57f17',
                                    stopOpacity: 1,
                                  }}
                                />
                              </radialGradient>
                            </defs>
                            <path
                              d="M30,20 L50,40 L40,50 L70,80 L50,60 L60,50 Z"
                              fill="url(#electricGradient)"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="8"
                              fill="url(#electricGradient)"
                              opacity="0.8"
                            />
                          </svg>
                        </Box>

                        {/* Card Name */}
                        <Typography
                          variant="h6"
                          sx={{
                            position: 'absolute',
                            top: 170,
                            left: 8,
                            right: 8,
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            textAlign: 'center',
                            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                          }}
                        >
                          Thunder Wolf
                        </Typography>

                        {/* Card Stats */}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            left: 8,
                            right: 8,
                            height: 60,
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: 2,
                            p: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              mb: 0.5,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ color: 'white', fontSize: '0.6rem' }}
                            >
                              ATK: 2000
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: 'white', fontSize: '0.6rem' }}
                            >
                              DEF: 1000
                            </Typography>
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'rgba(255,255,255,0.8)',
                              fontSize: '0.5rem',
                              display: 'block',
                              textAlign: 'center',
                            }}
                          >
                            Lightning-fast mythical beast
                          </Typography>
                        </Box>
                      </Box>

                      {/* Back - Dark Card */}
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          background:
                            'linear-gradient(135deg, #2c3e50, #34495e)',
                          borderRadius: 3,
                          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                        }}
                      >
                        {/* Card Header */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 40,
                            background: 'rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 1.5,
                            zIndex: 2,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                            }}
                          >
                            Dark
                          </Typography>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              background: '#2c3e50',
                            }}
                          />
                        </Box>

                        {/* Card Art */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 40,
                            left: 8,
                            right: 8,
                            height: 120,
                            background:
                              'linear-gradient(45deg, #424242, #616161)',
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <svg width="60" height="60" viewBox="0 0 100 100">
                            <defs>
                              <radialGradient
                                id="darkGradient"
                                cx="50%"
                                cy="50%"
                                r="50%"
                              >
                                <stop
                                  offset="0%"
                                  style={{
                                    stopColor: '#9e9e9e',
                                    stopOpacity: 1,
                                  }}
                                />
                                <stop
                                  offset="50%"
                                  style={{
                                    stopColor: '#616161',
                                    stopOpacity: 1,
                                  }}
                                />
                                <stop
                                  offset="100%"
                                  style={{
                                    stopColor: '#424242',
                                    stopOpacity: 1,
                                  }}
                                />
                              </radialGradient>
                            </defs>
                            <path
                              d="M30,20 Q50,10 70,20 Q80,40 70,60 Q50,70 30,60 Q20,40 30,20"
                              fill="url(#darkGradient)"
                            />
                            <circle
                              cx="40"
                              cy="35"
                              r="3"
                              fill="#fff"
                              opacity="0.8"
                            />
                            <circle
                              cx="60"
                              cy="35"
                              r="3"
                              fill="#fff"
                              opacity="0.8"
                            />
                          </svg>
                        </Box>

                        {/* Card Name */}
                        <Typography
                          variant="h6"
                          sx={{
                            position: 'absolute',
                            top: 170,
                            left: 8,
                            right: 8,
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            textAlign: 'center',
                            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                          }}
                        >
                          Shadow Demon
                        </Typography>

                        {/* Card Stats */}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            left: 8,
                            right: 8,
                            height: 60,
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: 2,
                            p: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              mb: 0.5,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ color: 'white', fontSize: '0.6rem' }}
                            >
                              ATK: 1900
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: 'white', fontSize: '0.6rem' }}
                            >
                              DEF: 1100
                            </Typography>
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'rgba(255,255,255,0.8)',
                              fontSize: '0.5rem',
                              display: 'block',
                              textAlign: 'center',
                            }}
                          >
                            Malevolent spirit of darkness
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Floating Elements */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '15%',
                      right: '15%',
                      width: 60,
                      height: 60,
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '50%',
                      animation: 'float 3s ease-in-out infinite',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  />

                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: '20%',
                      left: '10%',
                      width: 40,
                      height: 40,
                      background: 'rgba(255,255,255,0.08)',
                      borderRadius: '50%',
                      animation: 'float 4s ease-in-out infinite 1.5s',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                  />

                  {/* Progress Indicator */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      left: 16,
                      right: 16,
                      height: 4,
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        width: '75%',
                        height: '100%',
                        background: 'linear-gradient(90deg, #667eea, #764ba2)',
                        borderRadius: 2,
                        animation: 'progress 3s ease-in-out infinite',
                      }}
                    />
                  </Box>

                  {/* Stats Overlay */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 32,
                      right: 16,
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TrendingUp color="primary" fontSize="small" />
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        sx={{ color: 'text.primary' }}
                      >
                        50K+ Created
                      </Typography>
                    </Stack>
                  </Box>
                </Box>

                {/* Call to Action */}
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255,255,255,0.8)',
                      mb: 2,
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    }}
                  >
                    Click to see it in action
                  </Typography>
                  <Button
                    component={Link}
                    href="/gallery/create-pack"
                    variant="outlined"
                    size="small"
                    sx={{
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.3)',
                      '&:hover': {
                        borderColor: 'white',
                        background: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    Try Demo
                  </Button>
                </Box>
              </Box>

              {/* Enhanced Card Cycling Animations */}
              <style>{`
                @keyframes cardCycle1 {
                  0%,
                  30% {
                    transform: translateY(0px) rotate(-5deg) rotateY(0deg)
                      translateZ(0px);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    z-index: 1;
                  }
                  33%,
                  63% {
                    transform: translateY(-5px) rotate(2deg) rotateY(180deg)
                      translateZ(10px);
                    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
                    z-index: 2;
                  }
                  66%,
                  96% {
                    transform: translateY(-10px) rotate(8deg) rotateY(0deg)
                      translateZ(20px);
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                    z-index: 3;
                  }
                  100% {
                    transform: translateY(0px) rotate(-5deg) rotateY(0deg)
                      translateZ(0px);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    z-index: 1;
                  }
                }

                @keyframes cardCycle2 {
                  0%,
                  30% {
                    transform: translateY(-5px) rotate(2deg) rotateY(180deg)
                      translateZ(10px);
                    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
                    z-index: 2;
                  }
                  33%,
                  63% {
                    transform: translateY(-10px) rotate(8deg) rotateY(0deg)
                      translateZ(20px);
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                    z-index: 3;
                  }
                  66%,
                  96% {
                    transform: translateY(0px) rotate(-5deg) rotateY(0deg)
                      translateZ(0px);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    z-index: 1;
                  }
                  100% {
                    transform: translateY(-5px) rotate(2deg) rotateY(180deg)
                      translateZ(10px);
                    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
                    z-index: 2;
                  }
                }

                @keyframes cardCycle3 {
                  0%,
                  30% {
                    transform: translateY(-10px) rotate(8deg) rotateY(0deg)
                      translateZ(20px);
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                    z-index: 3;
                  }
                  33%,
                  63% {
                    transform: translateY(0px) rotate(-5deg) rotateY(0deg)
                      translateZ(0px);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    z-index: 1;
                  }
                  66%,
                  96% {
                    transform: translateY(-5px) rotate(2deg) rotateY(180deg)
                      translateZ(10px);
                    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
                    z-index: 2;
                  }
                  100% {
                    transform: translateY(-10px) rotate(8deg) rotateY(0deg)
                      translateZ(20px);
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                    z-index: 3;
                  }
                }

                @keyframes float {
                  0%,
                  100% {
                    transform: translateY(0px) scale(1);
                  }
                  50% {
                    transform: translateY(-10px) scale(1.1);
                  }
                }

                @keyframes glow {
                  0% {
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                  }
                  100% {
                    box-shadow: 0 4px 25px rgba(102, 126, 234, 0.6);
                  }
                }

                @keyframes progress {
                  0%,
                  100% {
                    width: 75%;
                  }
                  50% {
                    width: 90%;
                  }
                }

                @keyframes patternMove {
                  0% {
                    transform: translateX(0px) translateY(0px);
                  }
                  100% {
                    transform: translateX(-40px) translateY(-40px);
                  }
                }
              `}</style>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

/* ----------------------------- ProofBar ---------------------------- */

export const ProofBar: FC<{
  logos?: { src: string; alt: string; width?: number; height?: number }[];
  metrics?: { label: string; value: string }[];
}> = ({ logos = [], metrics = [] }) => {
  return (
    <Box
      component="section"
      aria-label="Trusted by"
      sx={{
        py: 3,
        borderTop: '1px solid',
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack
            direction="row"
            spacing={3}
            alignItems="center"
            justifyContent="center"
            sx={{ flexWrap: 'wrap' }}
          >
            {logos.map((l, i) => (
              <Box key={i} sx={{ opacity: 0.8 }}>
                <Image
                  src={l.src}
                  alt={l.alt}
                  width={l.width || 88}
                  height={l.height || 28}
                />
              </Box>
            ))}
          </Stack>
          {metrics.length > 0 && (
            <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
              {metrics.map((m, i) => (
                <Stack key={i} alignItems="center">
                  <Typography variant="h6" fontWeight={700}>
                    {m.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {m.label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

/* --------------------------- FeatureGrid --------------------------- */

export const FeatureGrid: FC<{
  title: string;
  items: { icon?: ReactNode; title: string; description: string }[];
}> = ({ title, items }) => {
  return (
    <Box
      component="section"
      aria-labelledby="features-heading"
      sx={{
        py: { xs: 6, md: 8 },
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          opacity: 0.3,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Typography
          id="features-heading"
          component="h2"
          variant="h2"
          textAlign="center"
          sx={{
            mb: { xs: 4, md: 6 },
            color: 'white',
            fontWeight: 700,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          {title}
        </Typography>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {items.map((f, i) => (
            <Grid item xs={12} sm={6} lg={3} key={i}>
              <Card
                sx={{
                  height: '100%',
                  p: { xs: 3, md: 4 },
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid',
                  borderColor: 'rgba(255,255,255,0.2)',
                  bgcolor: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: 0,
                    '&:last-child': { pb: 0 },
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box
                    sx={{
                      color: 'primary.main',
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 64,
                      height: 64,
                      bgcolor: 'primary.light',
                      borderRadius: 3,
                      opacity: 0.9,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1) rotate(5deg)',
                      },
                    }}
                  >
                    {f.icon}
                  </Box>
                  <Typography
                    component="h3"
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      color: 'text.primary',
                    }}
                  >
                    {f.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.7,
                      flex: 1,
                      fontSize: '1rem',
                    }}
                  >
                    {f.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

/* ------------------------ CreatorSpotlights ------------------------ */

export const CreatorSpotlights: FC<{
  title: string;
  items: {
    avatarUrl?: string;
    byline: string;
    quote: string;
    metric?: string;
    href?: string;
  }[];
}> = ({ title, items }) => {
  return (
    <Box
      component="section"
      aria-labelledby="spotlights-heading"
      sx={{
        py: { xs: 6, md: 8 },
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
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
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23667eea' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          opacity: 0.5,
        },
      }}
    >
      <Container maxWidth="lg">
        <Typography
          id="spotlights-heading"
          component="h2"
          variant="h2"
          textAlign="center"
          sx={{
            mb: 6,
            fontWeight: 700,
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {title}
        </Typography>
        <Grid container spacing={4}>
          {items.map((s, i) => (
            <Grid item xs={12} md={6} key={i}>
              <Card
                sx={{
                  height: '100%',
                  background:
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 100,
                    height: 100,
                    background:
                      'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                    borderRadius: '50%',
                    zIndex: 0,
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -30,
                    left: -30,
                    width: 60,
                    height: 60,
                    background:
                      'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
                    borderRadius: '50%',
                    zIndex: 0,
                  },
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    '&::before': {
                      transform: 'scale(1.2)',
                    },
                    '&::after': {
                      transform: 'scale(1.1)',
                    },
                  },
                }}
              >
                <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                  <Stack
                    direction="row"
                    spacing={3}
                    alignItems="center"
                    sx={{ mb: 3 }}
                  >
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        flex: '0 0 auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '3px solid rgba(255,255,255,0.4)',
                        position: 'relative',
                        background:
                          i === 0
                            ? 'linear-gradient(135deg, #ff6b6b, #ee5a24)'
                            : 'linear-gradient(135deg, #4834d4, #686de0)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background:
                            'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                          borderRadius: '50%',
                        },
                        '&:hover': {
                          transform: 'scale(1.1) rotate(5deg)',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                      aria-label={s.byline}
                      role="img"
                    >
                      {s.avatarUrl ? (
                        <Image
                          src={s.avatarUrl}
                          alt={s.byline}
                          width={60}
                          height={60}
                        />
                      ) : (
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                          {/* SVG Avatar Icon */}
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 32 32"
                            fill="none"
                          >
                            <defs>
                              <linearGradient
                                id="avatarGradient"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                              >
                                <stop
                                  offset="0%"
                                  stopColor="rgba(255,255,255,0.9)"
                                />
                                <stop
                                  offset="100%"
                                  stopColor="rgba(255,255,255,0.7)"
                                />
                              </linearGradient>
                            </defs>
                            {/* Head */}
                            <circle
                              cx="16"
                              cy="12"
                              r="6"
                              fill="url(#avatarGradient)"
                            />
                            {/* Body */}
                            <path
                              d="M 4 28 C 4 22 9 18 16 18 C 23 18 28 22 28 28"
                              fill="url(#avatarGradient)"
                            />
                            {/* Eyes */}
                            <circle
                              cx="13"
                              cy="10"
                              r="1"
                              fill="rgba(0,0,0,0.3)"
                            />
                            <circle
                              cx="19"
                              cy="10"
                              r="1"
                              fill="rgba(0,0,0,0.3)"
                            />
                            {/* Smile */}
                            <path
                              d="M 12 14 Q 16 16 20 14"
                              stroke="rgba(0,0,0,0.3)"
                              strokeWidth="1"
                              fill="none"
                            />
                          </svg>
                          {/* Initial Letter */}
                          <Typography
                            variant="h6"
                            sx={{
                              color: 'white',
                              fontWeight: 700,
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              fontSize: '1.2rem',
                              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                            }}
                          >
                            {s.byline.charAt(0)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{ color: 'white', fontWeight: 600 }}
                    >
                      {s.byline}
                    </Typography>
                  </Stack>
                  <Typography
                    component="blockquote"
                    variant="h6"
                    sx={{
                      mb: 3,
                      color: 'white',
                      fontStyle: 'italic',
                      lineHeight: 1.6,
                      position: 'relative',
                      pl: 3,
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 3,
                        height: '100%',
                        background:
                          'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%)',
                        borderRadius: 2,
                      },
                    }}
                  >
                    &ldquo;{s.quote}&rdquo;
                  </Typography>
                  {s.metric && (
                    <Typography
                      variant="body2"
                      sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}
                    >
                      {s.metric}
                    </Typography>
                  )}
                  {s.href && (
                    <Box sx={{ mt: 3 }}>
                      <Button
                        component={Link}
                        href={s.href}
                        variant="outlined"
                        sx={{
                          color: 'white',
                          borderColor: 'rgba(255,255,255,0.5)',
                          '&:hover': {
                            borderColor: 'white',
                            bgcolor: 'rgba(255,255,255,0.1)',
                          },
                        }}
                        onClick={() =>
                          track('spotlight_profile_click', { byline: s.byline })
                        }
                      >
                        View profile
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

/* -------------------------- FeaturedCreatorsCTA -------------------------- */

export const FeaturedCreatorsCTA: FC<{
  title: string;
}> = ({ title }) => {
  const creators = [
    { name: 'Resonix', theme: 'Futuristic Tech', color: '#667eea' },
    { name: 'Vulkrak', theme: 'Dark Mysteries', color: '#2c3e50' },
    { name: 'Lunaclasm', theme: 'Cosmic Dreams', color: '#1a1a2e' },
    { name: 'Corollith', theme: 'Natural Crystals', color: '#27ae60' },
    { name: 'Brawddle', theme: 'Playful Adventures', color: '#e91e63' },
  ];

  return (
    <Box
      component="section"
      aria-labelledby="featured-creators-heading"
      sx={{ py: { xs: 6, md: 8 } }}
    >
      <Container maxWidth="lg">
        <Typography
          id="featured-creators-heading"
          component="h2"
          variant="h2"
          textAlign="center"
          sx={{ mb: 4 }}
        >
          {title}
        </Typography>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          {creators.map(creator => (
            <Grid item xs={6} sm={4} md={2} key={creator.name}>
              <Card
                component={Link}
                href={`/u/${creator.name.toLowerCase()}`}
                sx={{
                  textDecoration: 'none',
                  height: 120,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  background: `linear-gradient(135deg, ${creator.color} 0%, ${creator.color}dd 100%)`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    transition: 'all 0.3s ease',
                  },
                  '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: 2,
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    textAlign: 'center',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                  }}
                >
                  {creator.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    textAlign: 'center',
                    fontSize: '0.7rem',
                    mt: 0.5,
                  }}
                >
                  {creator.theme}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box textAlign="center">
          <Stack
            spacing={3}
            alignItems="center"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            <Typography
              variant="h5"
              color="text.primary"
              sx={{ fontWeight: 600 }}
            >
              Discover Amazing Card Creators
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ lineHeight: 1.7 }}
            >
              Explore unique card collections from talented creators. Each
              brings their own style and vision to the world of trading cards.
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
            >
              <Button
                component={Link}
                href="/gallery"
                variant="contained"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                }}
              >
                Explore Gallery
              </Button>
              <Button
                component={Link}
                href="/gallery/create-pack"
                variant="outlined"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                }}
              >
                Start Creating
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};


/* -------------------------- HowItWorks ----------------------------- */

export const HowItWorks: FC<{
  title: string;
  steps: { title: string; body: string; icon?: ReactNode }[];
}> = ({ title, steps }) => {
  return (
    <Box
      component="section"
      aria-labelledby="how-heading"
      sx={{ py: { xs: 6, md: 8 } }}
    >
      <Container maxWidth="lg">
        <Typography
          id="how-heading"
          component="h2"
          variant="h2"
          textAlign="center"
          sx={{ mb: 4 }}
        >
          {title}
        </Typography>
        <Grid container spacing={3}>
          {steps.map((s, i) => (
            <Grid item xs={12} md={3} key={i}>
              <Stack spacing={1}>
                <Box sx={{ color: 'primary.main' }}>{s.icon}</Box>
                <Typography component="h3" variant="h6">
                  {s.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {s.body}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

/* -------------------------- PricingPreview ------------------------- */

export const PricingPreview: FC<{
  title: string;
  plans: { name: string; blurb: string; href: string }[];
}> = ({ title, plans }) => {
  return (
    <Box
      component="section"
      aria-labelledby="pricing-heading"
      sx={{ py: { xs: 6, md: 8 } }}
    >
      <Container maxWidth="lg">
        <Typography
          id="pricing-heading"
          component="h2"
          variant="h2"
          textAlign="center"
          sx={{ mb: 4 }}
        >
          {title}
        </Typography>
        <Grid container spacing={3}>
          {plans.map((p, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Card>
                <CardContent>
                  <Typography component="h3" variant="h6" sx={{ mb: 1 }}>
                    {p.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {p.blurb}
                  </Typography>
                  <Button
                    component={Link}
                    href={p.href}
                    variant="contained"
                    onClick={() =>
                      track('pricing_preview_click', { plan: p.name })
                    }
                  >
                    View details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

/* -------------------------------- FAQ ------------------------------ */

export const FAQ: FC<{
  title: string;
  items: { q: string; a: string }[];
}> = ({ title, items }) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const handleExpandClick = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <Box
      component="section"
      aria-labelledby="faq-heading"
      sx={{
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          opacity: 0.3,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Typography
          id="faq-heading"
          component="h2"
          variant="h2"
          textAlign="center"
          sx={{
            mb: 8,
            fontWeight: 800,
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            fontSize: { xs: '2.5rem', md: '3.5rem' },
          }}
        >
          {title}
        </Typography>

        <Grid container spacing={3}>
          {items.map((f, i) => {
            const isExpanded = expandedItems.has(i);
            return (
              <Grid item xs={12} md={6} key={i}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: isExpanded
                      ? 'primary.main'
                      : 'rgba(255,255,255,0.2)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: isExpanded
                        ? 'linear-gradient(90deg, #667eea, #764ba2)'
                        : 'linear-gradient(90deg, #e0e0e0, #f0f0f0)',
                      transition: 'all 0.3s ease',
                    },
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                      transform: 'translateY(-4px) scale(1.02)',
                      '&::before': {
                        background: 'linear-gradient(90deg, #667eea, #764ba2)',
                      },
                    },
                  }}
                >
                  <Box
                    onClick={() => handleExpandClick(i)}
                    sx={{
                      p: 4,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      minHeight: 80,
                      '&:hover': {
                        bgcolor: 'rgba(102, 126, 234, 0.05)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Typography
                      component="h3"
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: isExpanded ? 'primary.main' : 'text.primary',
                        pr: 3,
                        lineHeight: 1.4,
                        fontSize: '1.1rem',
                      }}
                    >
                      {f.q}
                    </Typography>
                    <IconButton
                      size="small"
                      sx={{
                        transform: isExpanded
                          ? 'rotate(180deg)'
                          : 'rotate(0deg)',
                        transition: 'all 0.3s ease',
                        color: isExpanded ? 'primary.main' : 'text.secondary',
                        bgcolor: isExpanded ? 'primary.light' : 'transparent',
                        '&:hover': {
                          bgcolor: 'primary.light',
                          transform: isExpanded
                            ? 'rotate(180deg) scale(1.1)'
                            : 'rotate(0deg) scale(1.1)',
                        },
                      }}
                    >
                      <ExpandMore />
                    </IconButton>
                  </Box>
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box
                      sx={{
                        px: 4,
                        pb: 4,
                        borderTop: isExpanded ? '1px solid' : 'none',
                        borderColor: 'divider',
                        background: 'rgba(102, 126, 234, 0.02)',
                      }}
                    >
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                          mt: 3,
                          lineHeight: 1.7,
                          fontSize: '1rem',
                          fontWeight: 400,
                        }}
                      >
                        {f.a}
                      </Typography>
                    </Box>
                  </Collapse>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

/* ----------------------------- FinalCTA ---------------------------- */

export const FinalCTA: FC<{
  headline: string;
  primary: Cta;
  secondary: Cta;
}> = ({ headline, primary, secondary }) => {
  return (
    <Box
      component="section"
      aria-label="Get started"
      sx={{
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          opacity: 0.3,
        },
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={4} alignItems="center" textAlign="center">
          <Typography
            component="h2"
            variant="h2"
            sx={{
              color: 'white',
              fontWeight: 700,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              fontSize: { xs: '2.5rem', md: '3.5rem' },
            }}
          >
            {headline}
          </Typography>
          <Stack
            direction="row"
            spacing={3}
            sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
          >
            {primary.href ? (
              <Button
                component={Link}
                href={primary.href}
                variant="contained"
                size="large"
                onClick={() =>
                  track('final_cta_primary_click', { label: primary.label })
                }
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  fontWeight: 600,
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {primary.label}
              </Button>
            ) : (
              <OpenPackButton
                label={primary.label}
                variant="contained"
                size="large"
                onClick={() =>
                  track('final_cta_primary_click', { label: primary.label })
                }
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  fontWeight: 600,
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                  },
                  transition: 'all 0.3s ease',
                }}
              />
            )}
            <Button
              component={Link}
              href={secondary.href || '#'}
              variant="text"
              size="large"
              onClick={() =>
                track('final_cta_secondary_click', { label: secondary.label })
              }
              sx={{
                color: 'white',
                fontWeight: 500,
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {secondary.label}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};
