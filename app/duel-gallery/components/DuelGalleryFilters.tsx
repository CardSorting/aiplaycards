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

interface DuelGalleryFiltersProps {
  showFilters: boolean;
  showEditMenu: boolean;
  filterType: string;
  setFilterType: (value: string) => void;
  uniqueTypes: string[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  totalPublic: number;
}

export const DuelGalleryFilters = ({
  showFilters,
  showEditMenu,
  filterType,
  setFilterType,
  uniqueTypes,
  searchQuery,
  setSearchQuery,
  totalPublic,
}: DuelGalleryFiltersProps) => {
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

            {(filterType !== 'all' || searchQuery) && (
              <Box
                sx={{ pt: { xs: 0, sm: 3 }, width: { xs: '100%', sm: 'auto' } }}
              >
                <Button
                  variant="outlined"
                  onClick={() => {
                    setFilterType('all');
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
              href="/duel-creator"
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
                background: 'linear-gradient(135deg, #8A2BE2 0%, #4B0082 100%)',
                '&:hover': {
                  background:
                    'linear-gradient(135deg, #7B68EE 0%, #663399 100%)',
                },
              }}
            >
              Create New Duel Card
            </Button>
          </Stack>
        </Box>
      </Collapse>

      {(searchQuery || filterType !== 'all') && (
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
