import { useCardOptions } from '@cardEditor/cardOptions/hooks';
import { AnalyticsEvent, useAnalytics } from '@features/analytics';
import { Share as ShareIcon } from '@mui/icons-material';
import { FC, useCallback, useState } from 'react';
import useIsMobile from '@hooks/useIsMobile';
import LoadingButton from '../../atoms/LoadingButton';
import { ShareButtonProps } from './types';

const ShareButton: FC<ShareButtonProps> = ({
  cardId: _cardId,
  ...buttonProps
}) => {
  const { isMobile } = useIsMobile();
  const { trackCardCreatorEvent } = useAnalytics();
  const cardOptions = useCardOptions();
  const [isLoading, setLoading] = useState<boolean>(false);

  const handleShare = useCallback(async () => {
    setLoading(true);

    try {
      // Share card data as JSON instead of rendered image
      const cardData = {
        name: cardOptions.name || 'Untitled Card',
        cardOptions,
        timestamp: new Date().toISOString(),
        version: '2.0',
      };

      const jsonString = JSON.stringify(cardData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const file = new File(
        [blob],
        `${cardOptions.name || 'PlayMoreTCG-Card'}.json`,
        {
          type: 'application/json',
        },
      );

      const shareData: ShareData = {
        title: 'PlayMoreTCG.com - Custom Card',
        files: [file],
        text: `Check out this custom ${
          cardOptions.name ? `'${cardOptions.name}'` : 'Pokémon'
        } card that I made! Import this file to view it.`,
        url: 'https://playmoretcg.com',
      };

      if (!navigator.share) return;
      if (!!navigator.canShare && !navigator.canShare(shareData)) return;

      await navigator.share(shareData);
      trackCardCreatorEvent(AnalyticsEvent.CardShare, {
        sharePlatform: 'native',
      });
    } catch (e) {
      console.error('Share failed:', e);
    } finally {
      setLoading(false);
    }
  }, [cardOptions, trackCardCreatorEvent]);

  if (
    !isMobile ||
    typeof navigator === 'undefined' ||
    (typeof navigator !== 'undefined' && !navigator.share)
  )
    return null;

  return (
    <LoadingButton
      {...buttonProps}
      fullWidth
      variant="contained"
      onClick={handleShare}
      isLoading={isLoading}
      startIcon={<ShareIcon />}
    >
      Share
    </LoadingButton>
  );
};

export default ShareButton;
