'use client';

import React, { useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import {
  ScryfallCardData,
  scryfallService,
} from '../../services/scryfallService';

interface MTGCardNameSearchProps {
  onCardSelect: (cardData: ScryfallCardData) => void;
  disabled?: boolean;
}

const MTGCardNameSearch: React.FC<MTGCardNameSearchProps> = ({
  onCardSelect,
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [setCode, setSetCode] = useState('');
  const [exactMatch, setExactMatch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchedCard, setLastSearchedCard] =
    useState<ScryfallCardData | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a card name');
      return;
    }

    setIsSearching(true);
    setError(null);
    setLastSearchedCard(null);

    try {
      let cardData: ScryfallCardData | null;

      if (setCode.trim()) {
        cardData = await scryfallService.searchCardByNameInSet(
          searchTerm.trim(),
          setCode.trim(),
          exactMatch,
        );
      } else {
        cardData = await scryfallService.searchCardByName(
          searchTerm.trim(),
          exactMatch,
        );
      }

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
          Search Magic: The Gathering Database
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Powered by Scryfall API
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Card Name"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled || isSearching}
          variant="outlined"
          placeholder="e.g., Lightning Bolt, Black Lotus"
          helperText={
            exactMatch
              ? 'Exact match: card name must be precise'
              : 'Fuzzy search: handles misspellings and partial names'
          }
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Set Code (Optional)"
          value={setCode}
          onChange={e => setSetCode(e.target.value.toUpperCase())}
          onKeyPress={handleKeyPress}
          disabled={disabled || isSearching}
          variant="outlined"
          placeholder="e.g., NEO, MID, VOW"
          helperText="3-letter set code to search specific set"
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControlLabel
          control={
            <Checkbox
              checked={exactMatch}
              onChange={e => setExactMatch(e.target.checked)}
              disabled={disabled || isSearching}
            />
          }
          label="Exact match only"
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleSearch}
          disabled={disabled || isSearching || !searchTerm.trim()}
          startIcon={isSearching ? <CircularProgress size={16} /> : <Search />}
          sx={{ height: '56px' }}
        >
          {isSearching ? 'Searching...' : 'Search Card'}
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
            <strong>Found:</strong> {lastSearchedCard.name} (
            {lastSearchedCard.set_name})
            <br />
            <strong>Type:</strong> {lastSearchedCard.type_line}
            {lastSearchedCard.mana_cost && (
              <>
                <br />
                <strong>Mana Cost:</strong> {lastSearchedCard.mana_cost}
              </>
            )}
            {lastSearchedCard.power && lastSearchedCard.toughness && (
              <>
                <br />
                <strong>Power/Toughness:</strong> {lastSearchedCard.power}/
                {lastSearchedCard.toughness}
              </>
            )}
          </Alert>
        </Grid>
      )}
    </Grid>
  );
};

export default MTGCardNameSearch;
