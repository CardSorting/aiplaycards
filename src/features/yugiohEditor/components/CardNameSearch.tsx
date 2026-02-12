'use client';

import React, { useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { YgoProCardData, ygoProService } from '../services/ygoProService';

interface CardNameSearchProps {
  onCardSelect: (cardData: YgoProCardData) => void;
  disabled?: boolean;
}

const CardNameSearch: React.FC<CardNameSearchProps> = ({
  onCardSelect,
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchedCard, setLastSearchedCard] =
    useState<YgoProCardData | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a card name');
      return;
    }

    setIsSearching(true);
    setError(null);
    setLastSearchedCard(null);

    try {
      const cardData = await ygoProService.searchCardByName(searchTerm.trim());

      if (cardData) {
        setLastSearchedCard(cardData);
        onCardSelect(cardData);
        setError(null);
      } else {
        setError(`No card found with name "${searchTerm}"`);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to search for card',
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    }
  };

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Search Yu-Gi-Oh! Card Database
        </Typography>
      </Grid>

      <Grid item xs={12} sm={8}>
        <TextField
          fullWidth
          label="Enter card name (e.g., 'Blue-Eyes White Dragon')"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled || isSearching}
          variant="outlined"
          placeholder="Type exact card name..."
        />
      </Grid>

      <Grid item xs={12} sm={4}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleSearch}
          disabled={disabled || isSearching || !searchTerm.trim()}
          startIcon={isSearching ? <CircularProgress size={16} /> : <Search />}
          sx={{ height: '56px' }}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </Grid>

      {error && (
        <Grid item xs={12}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Grid>
      )}

      {lastSearchedCard && (
        <Grid item xs={12}>
          <Alert severity="success">
            Found: {lastSearchedCard.name} - {lastSearchedCard.type}
            {lastSearchedCard.atk !== undefined &&
              ` (ATK: ${lastSearchedCard.atk})`}
            {lastSearchedCard.def !== undefined &&
              ` (DEF: ${lastSearchedCard.def})`}
          </Alert>
        </Grid>
      )}
    </Grid>
  );
};

export default CardNameSearch;
