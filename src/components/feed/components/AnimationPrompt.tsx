'use client';

import { FC, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

interface AnimationPromptProps {
  prompt?: string;
}

const AnimationPrompt: FC<AnimationPromptProps> = ({ prompt }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showFullPrompt, setShowFullPrompt] = useState(false);

  const truncatedPrompt = useMemo(() => {
    if (!prompt) return '';
    const maxLength = isMobile ? 80 : 120;
    return prompt.length > maxLength
      ? prompt.substring(0, maxLength) + '...'
      : prompt;
  }, [prompt, isMobile]);

  if (!prompt) return null;

  const handleToggle = () => {
    setShowFullPrompt(!showFullPrompt);
  };

  return (
    <Box sx={{ mb: { xs: 2, sm: 2.5 } }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          p: { xs: 1.5, sm: 2 },
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          borderRadius: 1,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            borderColor: alpha(theme.palette.primary.main, 0.3),
          },
        }}
      >
        <AutoAwesomeIcon
          sx={{
            color: theme.palette.primary.main,
            fontSize: { xs: '1.1rem', sm: '1.2rem' },
            mt: 0.2,
            flexShrink: 0,
          }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '0.8rem', sm: '0.85rem' },
              color: theme.palette.primary.main,
              mb: 0.5,
            }}
          >
            Animation Prompt
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.8rem' },
              color: theme.palette.text.secondary,
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {showFullPrompt ? prompt : truncatedPrompt}
          </Typography>
          {prompt.length > (isMobile ? 80 : 120) && (
            <Button
              size="small"
              onClick={handleToggle}
              sx={{
                mt: 1,
                p: 0,
                minWidth: 'auto',
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                color: theme.palette.primary.main,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: 'transparent',
                  textDecoration: 'underline',
                },
              }}
              aria-label={showFullPrompt ? 'Show less' : 'Show more'}
            >
              {showFullPrompt ? 'Show less' : 'Show more'}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AnimationPrompt;
