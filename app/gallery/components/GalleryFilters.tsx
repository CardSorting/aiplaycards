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
import Link from 'next/link';
import { Add as AddIcon } from '@mui/icons-material';
import Routes from '@routes';

interface GalleryFiltersProps {
  showFilters: boolean;
  showEditMenu: boolean;
  filterType: string;
  setFilterType: (value: string) => void;
  filterRarity: string;
  setFilterRarity: (value: string) => void;
  uniqueTypes: string[];
  uniqueRarities: string[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  totalPublic: number;
}

export const GalleryFilters = ({
  showFilters,
  showEditMenu,
  filterType,
  setFilterType,
  filterRarity,
  setFilterRarity,
  uniqueTypes,
  uniqueRarities,
  searchQuery,
  setSearchQuery,
  totalPublic,
}: GalleryFiltersProps) => {
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
                Card Type
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
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
                  <MenuItem value="all">All Types</MenuItem>
                  {uniqueTypes.map(type => (
                    <MenuItem key={type} value={type}>
                      {type}
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

            {(filterType !== 'all' ||
              filterRarity !== 'all' ||
              searchQuery) && (
              <Box
                sx={{ pt: { xs: 0, sm: 3 }, width: { xs: '100%', sm: 'auto' } }}
              >
                <Button
                  variant="outlined"
                  onClick={() => {
                    setFilterType('all');
                    setFilterRarity('all');
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

      <Collapse in={showEditMenu}>
        <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography
            variant="body2"
            sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}
          >
            Collection Actions
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="flex-start"
          >
            <Button
              component={Link}
              href={Routes.Creator}
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              sx={{
                height: 40,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                width: { xs: '100%', sm: 'auto' },
                minWidth: { sm: 150 },
                background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
                '&:hover': {
                  background:
                    'linear-gradient(135deg, #1976D2 0%, #0288D1 100%)',
                },
              }}
            >
              Create New Card
            </Button>
          </Stack>
        </Box>
      </Collapse>

      {(searchQuery || filterType !== 'all' || filterRarity !== 'all') && (
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
              {filterType !== 'all' && (
                <Chip
                  label={filterType}
                  size="small"
                  onDelete={() => setFilterType('all')}
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
            </Stack>
            <Typography
              variant="body2"
              color="primary"
              sx={{ fontWeight: 700 }}
            >
              {totalPublic} result{totalPublic !== 1 ? 's' : ''}
            </Typography>
          </Stack>
        </Box>
      )}
    </>
  );
};
