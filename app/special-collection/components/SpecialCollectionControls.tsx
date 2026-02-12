'use client';

import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

interface SpecialCollectionControlsProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  sortBy: 'name' | 'date' | 'rarity' | 'category';
  setSortBy: (value: 'name' | 'date' | 'rarity' | 'category') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (value: 'asc' | 'desc') => void;
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
  showViewOptions: boolean;
  setShowViewOptions: (value: boolean) => void;
}

export const SpecialCollectionControls = ({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  showFilters,
  setShowFilters,
  showViewOptions,
  setShowViewOptions,
}: SpecialCollectionControlsProps) => {
  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 2, md: 2 }}
        alignItems={{ xs: 'stretch', md: 'flex-start' }}
      >
        <Box sx={{ flex: 1, maxWidth: { md: 400 }, width: '100%' }}>
          <Typography
            variant="body2"
            sx={{ mb: 1, fontWeight: 600, color: 'text.secondary', height: 20 }}
          >
            Search Special Cards
          </Typography>
          <TextField
            placeholder="Search by name, rarity, or category..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            fullWidth
            size="small"
            sx={{
              height: 40,
              '& .MuiOutlinedInput-root': {
                height: 40,
                borderRadius: 2,
                bgcolor: 'grey.50',
              },
            }}
          />
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            minWidth: { sm: 'fit-content' },
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          <Box sx={{ minWidth: { xs: '100%', sm: 160 } }}>
            <Typography
              variant="body2"
              sx={{
                mb: 1,
                fontWeight: 600,
                color: 'text.secondary',
                height: 20,
              }}
            >
              Sort
            </Typography>
            <FormControl size="small" fullWidth>
              <Select
                value={`${sortBy}-${sortOrder}`}
                onChange={e => {
                  const [sort, order] = e.target.value.split('-');
                  setSortBy(sort as any);
                  setSortOrder(order as any);
                }}
                displayEmpty
                sx={{
                  height: 40,
                  borderRadius: 2,
                  bgcolor: 'grey.50',
                  '& .MuiSelect-select': {
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                  },
                }}
              >
                <MenuItem value="date-desc">Newest First</MenuItem>
                <MenuItem value="date-asc">Oldest First</MenuItem>
                <MenuItem value="name-asc">Name A-Z</MenuItem>
                <MenuItem value="name-desc">Name Z-A</MenuItem>
                <MenuItem value="rarity-desc">Rarity (High-Low)</MenuItem>
                <MenuItem value="rarity-asc">Rarity (Low-High)</MenuItem>
                <MenuItem value="category-asc">Category A-Z</MenuItem>
                <MenuItem value="category-desc">Category Z-A</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Stack>
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ width: '100%' }}
      >
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant={showFilters ? 'contained' : 'outlined'}
          size="small"
          sx={{
            height: 40,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            flex: { xs: 1, sm: 'none' },
            minWidth: { sm: 100 },
          }}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </Stack>
    </Stack>
  );
};
