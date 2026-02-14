import { Box, Button, Stack, Typography } from '@mui/material';
import Routes from '@routes';
import { Link as RouterLink } from 'react-router-dom';
import { FC } from 'react';
import { NavItems } from './styles';

const DesktopHeader: FC = () => {
  return (
    <>
      <NavItems>
        <Button
          component={RouterLink}
          to={Routes.Create}
          variant="contained"
          color="primary"
          sx={{
            textTransform: 'none',
            borderRadius: 999,
            px: 2.5,
            fontWeight: 600,
            boxShadow: 2,
            '&:hover': { boxShadow: 4 },
          }}
        >
          Create Card
        </Button>
        <Stack direction="row" spacing={0} sx={{ ml: 1 }}>
          {/* Other Navigation */}
          <Button
            component={RouterLink}
            to={'/marketplace'}
            color="inherit"
            size="small"
            sx={{
              textTransform: 'none',
              px: 1.5,
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
            }}
          >
            Market
          </Button>
          <Button
            component={RouterLink}
            to={Routes.Community}
            color="inherit"
            size="small"
            sx={{
              textTransform: 'none',
              px: 1.5,
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
            }}
          >
            Community
          </Button>

          {/* Collections Group */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              ml: 2,
              px: 2,
              py: 1,
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                mr: 1.5,
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              Collections
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                component={RouterLink}
                to="/gallery"
                color="inherit"
                size="small"
                sx={{
                  textTransform: 'none',
                  px: 2,
                  py: 0.75,
                  borderRadius: 2,
                  minWidth: 'auto',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backgroundColor: 'rgba(74, 144, 226, 0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background:
                      'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                    transition: 'left 0.5s',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(74, 144, 226, 0.3)',
                    borderColor: 'rgba(74, 144, 226, 0.6)',
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)',
                    '&::before': {
                      left: '100%',
                    },
                  },
                  '&:active': {
                    transform: 'translateY(-1px) scale(1.01)',
                  },
                }}
              >
                Monster
              </Button>
              <Button
                component={RouterLink}
                to="/duel-gallery"
                color="inherit"
                size="small"
                sx={{
                  textTransform: 'none',
                  px: 2,
                  py: 0.75,
                  borderRadius: 2,
                  minWidth: 'auto',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backgroundColor: 'rgba(139, 92, 246, 0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background:
                      'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                    transition: 'left 0.5s',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(139, 92, 246, 0.3)',
                    borderColor: 'rgba(139, 92, 246, 0.6)',
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                    '&::before': {
                      left: '100%',
                    },
                  },
                  '&:active': {
                    transform: 'translateY(-1px) scale(1.01)',
                  },
                }}
              >
                Duel
              </Button>
              <Button
                component={RouterLink}
                to="/spell-gallery"
                color="inherit"
                size="small"
                sx={{
                  textTransform: 'none',
                  px: 2,
                  py: 0.75,
                  borderRadius: 2,
                  minWidth: 'auto',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background:
                      'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                    transition: 'left 0.5s',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(239, 68, 68, 0.3)',
                    borderColor: 'rgba(239, 68, 68, 0.6)',
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                    '&::before': {
                      left: '100%',
                    },
                  },
                  '&:active': {
                    transform: 'translateY(-1px) scale(1.01)',
                  },
                }}
              >
                Spell
              </Button>
              <Button
                component={RouterLink}
                to={'/special-collection'}
                color="inherit"
                size="small"
                sx={{
                  textTransform: 'none',
                  px: 2,
                  py: 0.75,
                  borderRadius: 2,
                  minWidth: 'auto',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background:
                      'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                    transition: 'left 0.5s',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(245, 158, 11, 0.3)',
                    borderColor: 'rgba(245, 158, 11, 0.6)',
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                    '&::before': {
                      left: '100%',
                    },
                  },
                  '&:active': {
                    transform: 'translateY(-1px) scale(1.01)',
                  },
                }}
              >
                PlayMore
              </Button>
              <Button
                component={RouterLink}
                to={'/nano'}
                color="inherit"
                size="small"
                sx={{
                  textTransform: 'none',
                  px: 2,
                  py: 0.75,
                  borderRadius: 2,
                  minWidth: 'auto',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backgroundColor: 'rgba(168, 85, 247, 0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background:
                      'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                    transition: 'left 0.5s',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(168, 85, 247, 0.3)',
                    borderColor: 'rgba(168, 85, 247, 0.6)',
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)',
                    '&::before': {
                      left: '100%',
                    },
                  },
                  '&:active': {
                    transform: 'translateY(-1px) scale(1.01)',
                  },
                }}
              >
                Nano AI
              </Button>
            </Box>
          </Box>
        </Stack>
      </NavItems>
    </>
  );
};

export default DesktopHeader;

