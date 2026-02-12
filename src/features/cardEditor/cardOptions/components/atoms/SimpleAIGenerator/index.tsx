import useCardOptions from '@cardEditor/cardOptions/hooks/useCardOptions';
import { FC, useCallback, useEffect, useState } from 'react';
import TextInput from '@components/inputs/TextInput';
import AccordionForm from '@components/AccordionForm';
import LoadingButton from '../CardDownloader/atoms/LoadingButton';
import { SimpleAIGeneratorProps } from './types';
import { populateCardFromAI } from './utils';
import { Alert, Box, Button, Typography } from '@mui/material';

const SimpleAIGenerator: FC<SimpleAIGeneratorProps> = ({ onGenerated }) => {
  const [pokemonName, setPokemonName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [creditError, setCreditError] = useState<string | null>(null);

  const { data: session } = useSession();
  const user = session?.user;

  const cardOptions = useCardOptions();

  // Fetch user credits when component mounts
  useEffect(() => {
    const fetchUserCredits = async () => {
      if (user?.id) {
        try {
          const response = await fetch('/api/user/credits');
          if (response.ok) {
            const data = await response.json();
            setUserCredits(data.credits);
          }
        } catch (error) {
          console.error('Failed to fetch user credits:', error);
        }
      }
    };

    fetchUserCredits();
  }, [user?.id]);

  const handleGenerate = useCallback(async () => {
    if (!pokemonName.trim()) return;

    setIsGenerating(true);
    setError(undefined);
    setSuccess(false);
    setCreditError(null);

    try {
      const response = await fetch('/api/generate-simple-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pokemonName: pokemonName.trim(),
        }),
      });

      const errorData = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          // Credit-specific error - use enhanced message from API
          const message =
            errorData.message ||
            errorData.error ||
            'Insufficient credits for AI card generation';
          setCreditError(message);
          setIsGenerating(false);
          return;
        } else if (response.status === 401) {
          setCreditError('Please sign in to generate AI cards');
          setIsGenerating(false);
          return;
        } else {
          throw new Error(errorData.error || 'Failed to generate card');
        }
      }

      const cardData = errorData;

      // Update user credits after successful generation (assuming 25 credits cost)
      if (userCredits !== null) {
        setUserCredits(userCredits - 25);
      }

      // Populate ALL card fields at once
      populateCardFromAI(cardData, cardOptions);

      setSuccess(true);
      onGenerated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, [pokemonName, cardOptions, onGenerated, userCredits]);

  const handleReset = useCallback(() => {
    setPokemonName('');
    setError(undefined);
    setSuccess(false);
    setCreditError(null);
  }, []);

  return (
    <AccordionForm slug="simpleAI" header="🤖 AI Card Generator">
      <TextInput
        label="Pokemon Name"
        slug="pokemon-name"
        value={pokemonName}
        onChange={setPokemonName}
        tooltipProps={{
          title: 'Pokemon Name',
          children:
            'Enter the exact name of the Pokemon you want to create a card for',
        }}
      />

      <LoadingButton
        variant="contained"
        onClick={handleGenerate}
        isLoading={isGenerating}
        startIcon={null}
        disabled={
          !pokemonName.trim() || (userCredits !== null && userCredits < 2)
        }
        fullWidth
        sx={{ mt: 2 }}
      >
        {isGenerating
          ? 'Generating Complete Card...'
          : userCredits !== null && userCredits < 25
          ? 'Need 25 Credits'
          : 'Generate Complete Card (25 credits)'}
      </LoadingButton>

      {/* Credit status */}
      {user && userCredits !== null && (
        <Box sx={{ mt: 1, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Your credits: {userCredits}
          </Typography>
        </Box>
      )}

      {/* Credit error display */}
      {creditError && (
        <Alert severity="warning" sx={{ mt: 1, fontSize: '14px' }}>
          {creditError}
          {userCredits !== null && userCredits < 2 && (
            <Box sx={{ mt: 1 }}>
              <Button
                href="/credits"
                size="small"
                variant="text"
                color="inherit"
                component="a"
              >
                Get more credits
              </Button>
            </Box>
          )}
        </Alert>
      )}

      {success && (
        <div
          style={{
            color: 'green',
            marginTop: '8px',
            padding: '8px',
            backgroundColor: '#f0f8f0',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          ✅ Card generated successfully! Check the preview and adjust any
          fields as needed.
          <LoadingButton
            variant="outlined"
            onClick={handleReset}
            isLoading={false}
            startIcon={null}
            sx={{ mt: 1, fontSize: '12px' }}
            size="small"
          >
            Generate Another Card
          </LoadingButton>
        </div>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 1, fontSize: '14px' }}>
          {error}
          <LoadingButton
            variant="outlined"
            onClick={handleGenerate}
            isLoading={false}
            startIcon={null}
            sx={{ mt: 1, fontSize: '12px' }}
            size="small"
            disabled={
              !pokemonName.trim() || (userCredits !== null && userCredits < 2)
            }
          >
            Try Again
          </LoadingButton>
        </Alert>
      )}
    </AccordionForm>
  );
};

export default SimpleAIGenerator;
