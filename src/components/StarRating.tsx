import React from 'react';
import { Box, Rating, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

interface StarRatingProps {
  rating: number;
  count?: number;
  readOnly?: boolean;
  onChange?: (rating: number) => void;
  size?: 'small' | 'medium' | 'large';
}

export default function StarRating({
  rating,
  count,
  readOnly = true,
  onChange,
  size = 'small',
}: StarRatingProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Rating
        value={rating}
        readOnly={readOnly}
        onChange={
          onChange ? (_, newValue) => onChange(newValue || 0) : undefined
        }
        precision={0.5} // Allow half-star ratings
        size={size}
        icon={<StarIcon fontSize="inherit" />}
        emptyIcon={<StarBorderIcon fontSize="inherit" />}
        sx={{
          '& .MuiRating-iconFilled': {
            color: '#FFD700',
          },
          '& .MuiRating-iconEmpty': {
            color: '#DDD',
          },
        }}
      />
      {count !== undefined && (
        <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
          ({count})
        </Typography>
      )}
    </Box>
  );
}
