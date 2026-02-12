import { useCardOptions } from '@cardEditor/cardOptions/hooks';
import { AnalyticsEvent, useAnalytics } from '@features/analytics';
import {
  CheckCircle as CheckCircleIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { FC, useCallback, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import useIsMobile from '@hooks/useIsMobile';
import { useType } from '@cardEditor/cardOptions/type/hooks';
import { supertypes } from '@cardEditor/cardOptions/supertype';
import { subtypes } from '@cardEditor/cardOptions/subtype';
import { rarities } from '@cardEditor/cardOptions/rarity';
import findById from '@utils/findById';
import LoadingButton from '../../atoms/LoadingButton';
import { SaveToGalleryButtonProps } from './types';

const SaveToGalleryButton: FC<SaveToGalleryButtonProps> = ({
  cardId: _cardId,
  ...buttonProps
}) => {
  const { isMobile } = useIsMobile();
  const { trackCardCreatorEvent } = useAnalytics();
  const { data: session } = useSession();
  const user = session?.user;
  const cardOptions = useCardOptions();
  const { getTypeById } = useType();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [snackSeverity, setSnackSeverity] = useState<'success' | 'error'>(
    'success',
  );

  const uploadImageToBackblaze = useCallback(
    async (
      imageData: string,
      imageType: 'background' | 'layer',
    ): Promise<string | null> => {
      if (!imageData) return null;

      const formData = new FormData();
      formData.append('imageData', imageData);
      formData.append('cardName', cardOptions.name || 'untitled');
      formData.append('imageType', imageType);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload ${imageType} image`);
      }

      const result = await response.json();
      return result.imageUrl;
    },
    [cardOptions.name],
  );

  const validateCardData = useCallback(() => {
    const errors: string[] = [];

    // Validate required fields
    if (!cardOptions.name?.trim()) {
      errors.push('Card name is required');
    }

    // Enhanced name validation to prevent spam
    if (cardOptions.name?.trim()) {
      const name = cardOptions.name.trim();

      // Check for minimum meaningful length
      if (name.length < 2) {
        errors.push('Card name must be at least 2 characters long');
      }

      // Check for maximum length to prevent abuse
      if (name.length > 50) {
        errors.push('Card name must be 50 characters or less');
      }

      // Check for repetitive characters (spam pattern)
      if (/(.)\1{4,}/.test(name)) {
        errors.push('Card name contains too many repeated characters');
      }

      // Check for suspicious patterns
      const suspiciousPatterns = [
        /^[a-z]+$/i, // All letters (too generic)
        /^[0-9]+$/, // All numbers
        /^(test|spam|fake|dummy|temp|tmp|asdf|qwerty|123|abc)+$/i, // Common spam words
      ];

      if (suspiciousPatterns.some(pattern => pattern.test(name))) {
        errors.push('Card name appears to be a test or spam entry');
      }
    }

    // Validate background image is present
    if (!cardOptions.backgroundImg?.src) {
      errors.push('Background image is required');
    }

    if (cardOptions.supertypeId === 1) {
      // Pokemon cards need HP
      if (
        !cardOptions.hitpoints ||
        String(cardOptions.hitpoints).trim() === '' ||
        Number(cardOptions.hitpoints) === 0
      ) {
        errors.push('Hit points are required for Pokemon cards');
      }

      // Validate HP range to prevent abuse
      const hp = Number(cardOptions.hitpoints);
      if (hp < 10 || hp > 999) {
        errors.push('Hit points must be between 10 and 999');
      }
    }

    // Enhanced description validation
    if (cardOptions.description?.trim()) {
      const description = cardOptions.description.trim();

      // Check for minimum meaningful length
      if (description.length < 10) {
        errors.push('Description must be at least 10 characters long');
      }

      // Check for maximum length
      if (description.length > 1000) {
        errors.push('Description must be 1000 characters or less');
      }

      // Check for repetitive content (spam pattern)
      const words = description.split(/\s+/);
      const uniqueWords = new Set(words.map(w => w.toLowerCase()));
      if (words.length > 5 && uniqueWords.size < words.length * 0.3) {
        errors.push('Description appears to contain repetitive content');
      }

      // Check for suspicious patterns in description
      const suspiciousDescPatterns = [
        /(.)\1{5,}/, // 6+ repeated characters
        /(word|text|description|test|spam|fake|dummy|temp|tmp|asdf|qwerty|123|abc){3,}/i, // Repeated spam words
      ];

      if (suspiciousDescPatterns.some(pattern => pattern.test(description))) {
        errors.push('Description contains suspicious patterns');
      }
    }

    // Enhanced move validation
    const validateMove = (move: any, moveName: string) => {
      if (!move?.name?.trim() || !move?.description?.trim()) {
        return false;
      }

      const name = move.name.trim();
      const description = move.description.trim();

      // Check move name quality
      if (name.length < 2 || name.length > 30) {
        errors.push(`${moveName} name must be between 2 and 30 characters`);
        return false;
      }

      // Check move description quality
      if (description.length < 10 || description.length > 200) {
        errors.push(
          `${moveName} description must be between 10 and 200 characters`,
        );
        return false;
      }

      // Check for spam patterns in move name
      const suspiciousMovePatterns = [
        /^(test|spam|fake|dummy|temp|tmp|asdf|qwerty|123|abc)+$/i,
        /(.)\1{3,}/, // 4+ repeated characters
      ];

      if (suspiciousMovePatterns.some(pattern => pattern.test(name))) {
        errors.push(`${moveName} name appears to be a test or spam entry`);
        return false;
      }

      return true;
    };

    // Check if at least one move is properly filled
    const hasValidMove1 = validateMove(cardOptions.move1, 'Move 1');
    const hasValidMove2 =
      cardOptions.hasMove2 && validateMove(cardOptions.move2, 'Move 2');
    const hasValidAbility =
      cardOptions.hasAbility && validateMove(cardOptions.ability, 'Ability');

    if (!hasValidMove1 && !hasValidMove2 && !hasValidAbility) {
      errors.push(
        'At least one move or ability must be completed (name and description required)',
      );
    }

    // Validate energy costs for moves
    if (
      cardOptions.move1?.energyCost &&
      Array.isArray(cardOptions.move1.energyCost)
    ) {
      if (cardOptions.move1.energyCost.length > 5) {
        errors.push('Move 1 energy cost cannot exceed 5 energy types');
      }
    }

    if (
      cardOptions.hasMove2 &&
      cardOptions.move2?.energyCost &&
      Array.isArray(cardOptions.move2.energyCost)
    ) {
      if (cardOptions.move2.energyCost.length > 5) {
        errors.push('Move 2 energy cost cannot exceed 5 energy types');
      }
    }

    // Validate damage amounts
    if (cardOptions.move1?.damageAmount) {
      const damage = String(cardOptions.move1.damageAmount).trim();
      if (damage && !/^(\d+|\*|\+\d+|\d+\+|\d+\+\d+)$/.test(damage)) {
        errors.push(
          'Move 1 damage amount must be a valid format (e.g., 20, *, +20, 20+, 20+20)',
        );
      }
    }

    if (cardOptions.hasMove2 && cardOptions.move2?.damageAmount) {
      const damage = String(cardOptions.move2.damageAmount).trim();
      if (damage && !/^(\d+|\*|\+\d+|\d+\+|\d+\+\d+)$/.test(damage)) {
        errors.push(
          'Move 2 damage amount must be a valid format (e.g., 20, *, +20, 20+, 20+20)',
        );
      }
    }

    // Validate retreat cost
    if (
      cardOptions.retreatCost !== undefined &&
      cardOptions.retreatCost !== null
    ) {
      const retreat = Number(cardOptions.retreatCost);
      if (retreat < 0 || retreat > 5) {
        errors.push('Retreat cost must be between 0 and 5');
      }
    }

    // Validate weakness and resistance amounts
    if (
      cardOptions.weaknessAmount !== undefined &&
      cardOptions.weaknessAmount !== null
    ) {
      const weakness = Number(cardOptions.weaknessAmount);
      if (weakness < 1 || weakness > 5) {
        errors.push('Weakness amount must be between 1 and 5');
      }
    }

    if (
      cardOptions.resistanceAmount !== undefined &&
      cardOptions.resistanceAmount !== null
    ) {
      const resistance = Number(cardOptions.resistanceAmount);
      if (resistance < 10 || resistance > 100) {
        errors.push('Resistance amount must be between 10 and 100');
      }
    }

    // Validate card number and set info
    if (cardOptions.cardNumber?.trim()) {
      const cardNum = cardOptions.cardNumber.trim();
      if (!/^\d+\/\d+$/.test(cardNum)) {
        errors.push('Card number must be in format "XXX/XXX"');
      }
    }

    if (
      cardOptions.totalInSet !== undefined &&
      cardOptions.totalInSet !== null
    ) {
      const total = Number(cardOptions.totalInSet);
      if (total < 1 || total > 999) {
        errors.push('Total in set must be between 1 and 999');
      }
    }

    // Validate illustrator name
    if (cardOptions.illustrator?.trim()) {
      const illustrator = cardOptions.illustrator.trim();
      if (illustrator.length < 2 || illustrator.length > 50) {
        errors.push('Illustrator name must be between 2 and 50 characters');
      }

      // Check for suspicious illustrator names
      const suspiciousIllustratorPatterns = [
        /^(test|spam|fake|dummy|temp|tmp|asdf|qwerty|123|abc)+$/i,
        /(.)\1{3,}/, // 4+ repeated characters
      ];

      if (
        suspiciousIllustratorPatterns.some(pattern => pattern.test(illustrator))
      ) {
        errors.push('Illustrator name appears to be a test or spam entry');
      }
    }

    // Validate dex stats
    if (cardOptions.dexStats?.trim()) {
      const dexStats = cardOptions.dexStats.trim();
      if (dexStats.length > 200) {
        errors.push('Dex stats must be 200 characters or less');
      }
    }

    return errors;
  }, [cardOptions]);

  const saveToGallery = useCallback(async () => {
    if (!user) {
      throw new Error('You must be logged in to save cards to your gallery');
    }

    // Validate card data before saving
    const validationErrors = validateCardData();
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join('. '));
    }

    // Upload images to Backblaze if they exist
    let backgroundImageUrl: string | null = null;
    let layerImageUrl: string | null = null;

    try {
      // Upload background image if it exists
      if (cardOptions.backgroundImg?.src) {
        backgroundImageUrl = await uploadImageToBackblaze(
          cardOptions.backgroundImg.src,
          'background',
        );
      }

      // Upload layer image if it exists (imgLayer2 is the only layer now)
      if (cardOptions.imgLayer2?.src) {
        layerImageUrl = await uploadImageToBackblaze(
          cardOptions.imgLayer2.src,
          'layer',
        );
      }
    } catch (uploadError) {
      console.error('Image upload failed:', uploadError);
      throw new Error(
        'Failed to upload images to cloud storage. Please try again.',
      );
    }

    // Prepare card data for saving
    const type = getTypeById(cardOptions.typeId);
    const supertype = findById(supertypes, cardOptions.supertypeId);
    const subtype = cardOptions.subtypeId
      ? findById(subtypes, cardOptions.subtypeId)
      : null;
    const rarity = cardOptions.rarityId
      ? findById(rarities, cardOptions.rarityId)
      : null;

    // Build imageData structure that gallery expects
    const imageDataGenerated: string[] = [];
    if (backgroundImageUrl) imageDataGenerated.push(backgroundImageUrl);
    if (layerImageUrl) imageDataGenerated.push(layerImageUrl);

    const cardData = {
      name: cardOptions.name || 'Untitled Card',
      description: cardOptions.description || null,
      type: type?.displayName || 'Normal',
      subtype: subtype?.displayName || null,
      supertype: supertype?.displayName || 'Pokémon',
      rarity: rarity?.displayName || null,
      hitpoints: cardOptions.hitpoints || null,
      cardNumber: cardOptions.cardNumber || null,
      totalInSet: parseInt(cardOptions.totalInSet || '0', 10) || null,
      illustrator: cardOptions.illustrator || null,

      dexStats: cardOptions.dexStats || null,
      moves: {
        move1: cardOptions.move1 || null,
        move2: cardOptions.hasMove2 ? cardOptions.move2 : null,
      },
      ability: cardOptions.hasAbility ? cardOptions.ability : null,
      weakness: cardOptions.weaknessTypeId
        ? {
            typeId: cardOptions.weaknessTypeId,
            amount: cardOptions.weaknessAmount,
          }
        : null,
      resistance: cardOptions.resistanceTypeId
        ? {
            typeId: cardOptions.resistanceTypeId,
            amount: cardOptions.resistanceAmount,
          }
        : null,
      retreatCost: cardOptions.retreatCost || null,
      // Store image data in format gallery expects for animation
      imageData:
        imageDataGenerated.length > 0
          ? {
              generated: imageDataGenerated,
            }
          : null,
      // Store the card editor state with Backblaze URLs instead of base64 data
      cardEditorState: {
        ...cardOptions,
        backgroundImg: backgroundImageUrl
          ? {
              ...cardOptions.backgroundImg,
              src: backgroundImageUrl,
            }
          : cardOptions.backgroundImg,
        imgLayer2: layerImageUrl
          ? {
              ...cardOptions.imgLayer2,
              src: layerImageUrl,
            }
          : cardOptions.imgLayer2,
      },
      // Store image URLs separately for easier access
      backgroundImageUrl,
      layerImageUrl,
      isPublic: true, // Default to public
      userId: user.id,
      source: 'custom', // Mark cards created from creator as custom
    };

    const response = await fetch('/api/cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cardData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save card to gallery');
    }

    return await response.json();
  }, [
    cardOptions,
    user,
    getTypeById,
    uploadImageToBackblaze,
    validateCardData,
  ]);

  const handleSaveToGallery = useCallback(async () => {
    if (!user) {
      setSnackMessage('Please log in to save cards to your gallery');
      setSnackSeverity('error');
      setSnackOpen(true);
      return;
    }

    setLoading(true);
    try {
      await saveToGallery();
      trackCardCreatorEvent(AnalyticsEvent.CardSaveToGallery);

      setSnackMessage(`${cardOptions.name || 'Card'} saved to your gallery!`);
      setSnackSeverity('success');
      setSnackOpen(true);
    } catch (error) {
      console.error('Save to gallery error:', error);
      setSnackMessage(
        error instanceof Error
          ? error.message
          : 'Failed to save card to gallery',
      );
      setSnackSeverity('error');
      setSnackOpen(true);
    } finally {
      setLoading(false);
    }
  }, [saveToGallery, trackCardCreatorEvent, user, cardOptions.name]);

  const handleSnackClose = useCallback(
    (event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') {
        return;
      }
      setSnackOpen(false);
    },
    [],
  );

  // Check if card has validation errors
  const validationErrors = validateCardData();
  const hasValidationErrors = validationErrors.length > 0;

  return (
    <>
      <LoadingButton
        {...buttonProps}
        sx={
          isMobile
            ? {
                paddingLeft: [null, 15],
                paddingRight: [null, 8],
                minWidth: 150,
              }
            : null
        }
        variant={isMobile ? 'outlined' : 'contained'}
        color={isMobile ? 'primary' : 'secondary'}
        fullWidth={!isMobile}
        onClick={handleSaveToGallery}
        isLoading={isLoading}
        startIcon={<SaveIcon />}
        disabled={!user || hasValidationErrors}
        title={hasValidationErrors ? validationErrors.join('; ') : ''}
      >
        {!user
          ? 'Login to Save'
          : hasValidationErrors
          ? 'Complete Required Fields'
          : 'Save to Gallery'}
      </LoadingButton>

      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={handleSnackClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackClose}
          severity={snackSeverity}
          sx={{ width: '100%' }}
          iconMapping={{
            success: <CheckCircleIcon fontSize="inherit" />,
          }}
        >
          {snackMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SaveToGalleryButton;
