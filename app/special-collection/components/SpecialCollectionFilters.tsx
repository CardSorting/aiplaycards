'use client';

import {
  Box,
  Button,
  Chip,
  Collapse,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';

interface SpecialCollectionFiltersProps {
  showFilters: boolean;
  showViewOptions: boolean;
  filterRarity: string;
  setFilterRarity: (value: string) => void;
  filterCategory: string;
  setFilterCategory: (value: string) => void;
  viewMode: 'packs' | 'cards';
  setViewMode: (value: 'packs' | 'cards') => void;
  uniqueRarities: string[];
  uniqueCategories: string[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  totalResults: number;
}

export const SpecialCollectionFilters = ({
  showFilters,
  showViewOptions,
  filterRarity,
  setFilterRarity,
  filterCategory,
  setFilterCategory,
  viewMode,
  setViewMode,
  uniqueRarities,
  uniqueCategories,
  searchQuery,
  setSearchQuery,
  totalResults,
}: SpecialCollectionFiltersProps) => {
  return (
    <>
      <Collapse in={showFilters}>
        <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography
            variant="body2"
            sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}
          >
            Advanced Filters
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="flex-start"
            sx={{ width: '100%' }}
          >
            <Box sx={{ width: { xs: '100%', sm: 200 } }}>
              <Typography
                variant="body2"
                sx={{
                  mb: 1,
                  fontWeight: 600,
                  color: 'text.secondary',
                  height: 20,
                }}
              >
                Rarity
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={filterRarity}
                  onChange={e => setFilterRarity(e.target.value)}
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
                  <MenuItem value="all">All Rarities</MenuItem>
                  {uniqueRarities.map(rarity => (
                    <MenuItem key={rarity} value={rarity}>
                      {rarity}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ width: { xs: '100%', sm: 200 } }}>
              <Typography
                variant="body2"
                sx={{
                  mb: 1,
                  fontWeight: 600,
                  color: 'text.secondary',
                  height: 20,
                }}
              >
                Category
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
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
                  <MenuItem value="all">All Categories</MenuItem>
                  {uniqueCategories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {(filterRarity !== 'all' ||
              filterCategory !== 'all' ||
              searchQuery) && (
              <Box
                sx={{ pt: { xs: 0, sm: 3 }, width: { xs: '100%', sm: 'auto' } }}
              >
                <Button
                  variant="outlined"
                  onClick={() => {
                    setFilterRarity('all');
                    setFilterCategory('all');
                    setSearchQuery('');
                  }}
                  sx={{
                    whiteSpace: 'nowrap',
                    height: 40,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    width: { xs: '100%', sm: 'auto' },
                    minWidth: { sm: 100 },
                  }}
                >
                  Clear All
                </Button>
              </Box>
            )}
          </Stack>
        </Box>
      </Collapse>

      {(searchQuery || filterRarity !== 'all' || filterCategory !== 'all') && (
        <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            flexWrap="wrap"
            sx={{ gap: 1 }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: 'text.secondary' }}
            >
              Active:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
              {searchQuery && (
                <Chip
                  label={`"${searchQuery}"`}
                  size="small"
                  onDelete={() => setSearchQuery('')}
                  sx={{ borderRadius: 2 }}
                />
              )}
              {filterRarity !== 'all' && (
                <Chip
                  label={filterRarity}
                  size="small"
                  onDelete={() => setFilterRarity('all')}
                  sx={{ borderRadius: 2 }}
                />
              )}
              {filterCategory !== 'all' && (
                <Chip
                  label={filterCategory}
                  size="small"
                  onDelete={() => setFilterCategory('all')}
                  sx={{ borderRadius: 2 }}
                />
              )}
            </Stack>
            <Typography
              variant="body2"
              color="primary"
              sx={{ fontWeight: 700 }}
            >
              {totalResults} result{totalResults !== 1 ? 's' : ''}
            </Typography>
          </Stack>
        </Box>
      )}
    </>
  );
};
