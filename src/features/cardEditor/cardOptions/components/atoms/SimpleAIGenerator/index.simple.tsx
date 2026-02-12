import { FC, useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Fade,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AccountBalanceWallet,
  AutoAwesome,
  Casino,
  DataObject,
  Palette,
  Psychology,
  Refresh,
  Send,
} from '@mui/icons-material';
import AccordionForm from '@components/AccordionForm';
import TextInput from '@components/inputs/TextInput';
import { useCardOptions } from '@cardEditor/cardOptions/hooks';
import { populateCardFromAI } from './utils';
import { getRandomPokemonName } from '../../../../../../utils/pokemon-pool-client';

// Generation steps for progress tracking
const GENERATION_STEPS = [
  { id: 'auth', label: 'Authenticating', icon: Send },
  { id: 'credits', label: 'Processing Credits', icon: AccountBalanceWallet },
  { id: 'ai', label: 'AI Analyzing Pokemon', icon: Psychology },
  { id: 'data', label: 'Generating Card Data', icon: DataObject },
  { id: 'populate', label: 'Applying to Card', icon: Palette },
];

const SimpleAIGenerator: FC = () => {
  const [pokemonName, setPokemonName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingRandomName, setIsLoadingRandomName] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoadingCredits, setIsLoadingCredits] = useState(true);
  // const [currentStep, setCurrentStep] = useState(-1);
  // const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  // const [generationStartTime, setGenerationStartTime] = useState<number | null>(
  //   null,
  // );

  const cardOptions = useCardOptions();

  // Helper functions for step management
  const advanceToStep = useCallback((_stepId: string) => {
    // const stepIndex = GENERATION_STEPS.findIndex(s => s.id === stepId);
    // setCurrentStep(stepIndex);
  }, []);

  const completeStep = useCallback((stepId: string) => {
    // setCompletedSteps(prev => [...prev, stepId]);
    setTimeout(() => {
      const stepIndex = GENERATION_STEPS.findIndex(s => s.id === stepId);
      if (stepIndex < GENERATION_STEPS.length - 1) {
        // setCurrentStep(stepIndex + 1);
      }
    }, 500);
  }, []);

  const resetSteps = useCallback(() => {
    // setCurrentStep(-1);
    // setCompletedSteps([]);
    // setGenerationStartTime(null);
  }, []);

  // Fetch user credits
  const fetchCredits = useCallback(async () => {
    try {
      const response = await fetch('/api/credits');
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error);
    } finally {
      setIsLoadingCredits(false);
    }
  }, []);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const handleRandomName = useCallback(async () => {
    setIsLoadingRandomName(true);
    try {
      const randomName = await getRandomPokemonName();
      setPokemonName(randomName);
    } catch (error) {
      console.error('Failed to get random Pokemon name:', error);
    } finally {
      setIsLoadingRandomName(false);
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!pokemonName.trim()) return;

    setIsGenerating(true);
    setError(undefined);
    setSuccess(false);
    // setGenerationStartTime(Date.now());
    resetSteps();

    try {
      // Step 1: Authentication
      advanceToStep('auth');
      await new Promise(resolve => setTimeout(resolve, 300));
      completeStep('auth');

      // Step 2: Credits processing
      advanceToStep('credits');
      await new Promise(resolve => setTimeout(resolve, 400));
      completeStep('credits');

      // Step 3: AI Analysis
      advanceToStep('ai');
      await new Promise(resolve => setTimeout(resolve, 600));
      completeStep('ai');

      // Step 4: Generate card data
      advanceToStep('data');
      const response = await fetch('/api/generate-simple-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pokemonName: pokemonName.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate card');
      }

      const cardData = await response.json();
      completeStep('data');

      // Step 5: Apply to card
      advanceToStep('populate');
      await new Promise(resolve => setTimeout(resolve, 400));
      populateCardFromAI(cardData, cardOptions);
      completeStep('populate');

      setSuccess(true);
      // Refresh credits after successful generation
      fetchCredits();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      resetSteps();
    } finally {
      setIsGenerating(false);
    }
  }, [
    pokemonName,
    cardOptions,
    advanceToStep,
    completeStep,
    resetSteps,
    fetchCredits,
  ]);

  const hasInsufficientCredits = credits !== null && credits < 25;
  const canGenerate =
    pokemonName.trim() && !isGenerating && !hasInsufficientCredits;
  // const generationProgress = isGenerating
  //   ? ((currentStep + 1) / GENERATION_STEPS.length) * 100
  //   : 0;

  return (
    <AccordionForm slug="simpleAI" header="🤖 AI Card Generator">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Credit Balance - Inline Design */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1,
            backgroundColor: 'action.hover',
            borderRadius: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBalanceWallet
              sx={{ fontSize: 20, color: 'primary.main' }}
            />
            <Typography variant="body2" fontWeight={500}>
              Credits:
            </Typography>
            {isLoadingCredits ? (
              <CircularProgress size={16} />
            ) : (
              <Chip
                label={credits ?? 0}
                color={hasInsufficientCredits ? 'error' : 'success'}
                size="small"
                variant="filled"
                sx={{ fontWeight: 600, fontSize: '0.75rem' }}
              />
            )}
          </Box>
          <Tooltip title="Refresh Balance">
            <span>
              <IconButton
                size="small"
                onClick={fetchCredits}
                disabled={isLoadingCredits}
                sx={{ p: 0.5 }}
              >
                <Refresh sx={{ fontSize: 16 }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {/* Pokemon Input Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <TextInput
              label="Pokemon Name"
              slug="pokemon-name"
              value={pokemonName}
              onChange={setPokemonName}
            />
          </Box>
          <Tooltip
            title={isLoadingRandomName ? 'Loading...' : 'Random Pokemon'}
          >
            <IconButton
              onClick={handleRandomName}
              disabled={isLoadingRandomName || isGenerating}
              sx={{
                width: 40,
                height: 40,
                backgroundColor: 'secondary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'secondary.dark',
                },
                '&:disabled': {
                  backgroundColor: 'action.disabledBackground',
                },
              }}
            >
              {isLoadingRandomName ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <Casino />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Generate Button */}
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={!canGenerate}
          fullWidth
          startIcon={
            isGenerating ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <AutoAwesome />
            )
          }
          sx={{
            py: 1.25,
            fontSize: '0.9rem',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 1.5,
            background: hasInsufficientCredits
              ? 'error.main'
              : isGenerating
              ? 'success.main'
              : 'primary.main',
            '&:hover': {
              background: hasInsufficientCredits
                ? 'error.dark'
                : isGenerating
                ? 'success.dark'
                : 'primary.dark',
            },
            '&:disabled': {
              background: 'action.disabledBackground',
              color: 'action.disabled',
            },
          }}
        >
          {isGenerating
            ? 'Generating Card...'
            : hasInsufficientCredits
            ? 'Need More Credits (25 required)'
            : 'Generate Card (25 Credits)'}
        </Button>

        {/* Success Message */}
        <Fade in={success}>
          <Alert
            severity="success"
            variant="filled"
            sx={{
              fontSize: '0.8rem',
              borderRadius: 1,
              py: 0.5,
            }}
            onClose={() => setSuccess(false)}
          >
            Card generated successfully! Check the preview.
          </Alert>
        </Fade>

        <Fade in={!!error}>
          <Alert
            severity="error"
            variant="filled"
            sx={{
              fontSize: '0.8rem',
              borderRadius: 1,
              py: 0.5,
            }}
            onClose={() => setError(undefined)}
          >
            Generation failed: {error}
          </Alert>
        </Fade>

        <Fade in={hasInsufficientCredits && !error}>
          <Alert
            severity="warning"
            variant="outlined"
            sx={{
              fontSize: '0.8rem',
              borderRadius: 1,
              py: 1,
            }}
            action={
              <Button
                variant="contained"
                size="small"
                onClick={() => window.open('/credits', '_blank')}
                sx={{ borderRadius: 1 }}
              >
                Buy Credits
              </Button>
            }
          >
            Need 25 credits to generate cards. You have {credits ?? 0}.
          </Alert>
        </Fade>
      </Box>
    </AccordionForm>
  );
};

export default SimpleAIGenerator;
